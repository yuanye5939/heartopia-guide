import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const GUIDE_DIR = join(import.meta.dirname, "..", "src", "content", "guide");
const LANGS = ["de", "it", "fr", "es", "ja", "ko", "id", "pl"];
const TODAY = new Date().toISOString().split("T")[0];

// ── Primary source: community wiki, updated daily, no Cloudflare ──────────
const SOURCE_URL = "https://www.heartopia.live/en/codes/";

// ── Parsing ────────────────────────────────────────────────────────────────

function decodeHTMLEntities(text) {
  return text
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)));
}

function parseCodesFromHTML(html) {
  /** Parse Heartopia.live HTML into [{ code, rewards, status }] */
  const seen = new Set();
  const cards = [];
  const cardRegex = /<code class="text-xl font-mono[^>]*>([^<]+)<\/code>[\s\S]*?(badge-(active|expired))[\s\S]*?Rewards<!-- -->:<\/span> <!-- -->([^<]+)/g;
  let m;
  while ((m = cardRegex.exec(html)) !== null) {
    const code = m[1].trim();
    if (code.length < 4 || code.includes(" ")) continue;
    // Deduplicate
    if (seen.has(code.toLowerCase())) continue;
    seen.add(code.toLowerCase());
    // Filter known false positives (common English words that appear in <code> but aren't redeem codes)
    const noise = new Set(["crystals"]);
    if (noise.has(code.toLowerCase())) continue;
    const rewards = decodeHTMLEntities(m[4].trim().replace(/\s+/g, " "));
    // Skip entries with no real reward data
    if (rewards.toLowerCase() === "unknown") continue;
    cards.push({
      code,
      rewards,
      status: m[3] === "active" ? "Active" : "Expired",
    });
  }
  return cards;
}

function extractExistingCodes(mdContent) {
  const codes = new Map();
  const rowRegex = /\| `([^`]+)` \| (.+?) \| (.+?) \|/g;
  let m;
  while ((m = rowRegex.exec(mdContent)) !== null) {
    codes.set(m[1].toLowerCase(), { code: m[1], rewards: m[2].trim(), status: m[3].trim() });
  }
  return codes;
}

// ── Markdown generation ────────────────────────────────────────────────────

function categorizeEntry(entry) {
  /** Return section key based on reward text */
  const r = entry.rewards.toLowerCase();
  if (r.includes("moonlight crystal")) return "moonlight";
  if (r.includes("wishing star")) return "wishing";
  // Material / crafting keywords
  if (/repair kit|timber|stone|fluorite|fertilizer|growth booster|egg|perfume|fish attractor|branches|milk|salad|gold/i.test(r)) return "material";
  // Everything else → seasonal / event
  return "seasonal";
}

function buildSectionTable(heading, desc, entries) {
  /** Build a markdown section with a code table */
  const active = entries.filter((e) => e.status === "Active");
  const expired = entries.filter((e) => e.status !== "Active");
  if (active.length === 0 && expired.length === 0) return "";

  let md = `## ${heading}\n\n`;
  if (desc) md += `${desc}\n\n`;
  md += "| Code | Rewards | Status |\n| --- | --- | --- |\n";
  for (const e of [...active, ...expired]) {
    md += `| \`${e.code}\` | ${e.rewards} | ${e.status} |\n`;
  }
  return md;
}

function findTableRegions(md) {
  /** Return [{ headerLine, sepStart, rowsStart, rowsEnd }] for each 3-col table */
  const tables = [];
  const sepRe = /\n\| --- \| --- \| --- \|/g;
  let m;
  while ((m = sepRe.exec(md)) !== null) {
    const sepStart = m.index + 1; // start of "| --- | --- | --- |"
    // Header is the line before the separator
    const beforeSep = md.slice(0, m.index);
    const headerStart = beforeSep.lastIndexOf("\n");
    const headerLine = beforeSep.slice(headerStart + 1);
    // Rows are everything from after \n to the next double-newline (section boundary)
    const rowsStart = sepStart + m[0].length;
    const afterSep = md.slice(rowsStart);
    const boundary = afterSep.search(/\n\n## |\n\n---|\n\n> |$/);
    const rowsEnd = rowsStart + (boundary === -1 ? afterSep.length : boundary);
    tables.push({ headerLine, sepStart, rowsStart, rowsEnd });
  }
  return tables;
}

const STATUS_I18N = {
  Active:  { de: "Aktiv", it: "Attivo", fr: "Actif", es: "Activo", ja: "有効", ko: "활성", id: "Aktif", pl: "Aktywny", en: "Active" },
  Expired: { de: "Abgelaufen", it: "Scaduto", fr: "Expiré", es: "Caducado", ja: "期限切れ", ko: "만료됨", id: "Kedaluwarsa", pl: "Wygasły", en: "Expired" },
};

function detectLangFromHeaders(md) {
  /** Guess the language from table column headers */
  const headerLine = md.match(/\| ([^|]+) \| ([^|]+) \| ([^|]+) \|/);
  if (!headerLine) return "en";
  const secondCol = headerLine[2].trim();
  const map = { "Belohnungen": "de", "Ricompense": "it", "Récompenses": "fr", "Recompensas": "es", "報酬": "ja", "보상": "ko", "Hadiah": "id", "Nagrody": "pl", "Rewards": "en" };
  return map[secondCol] || "en";
}

function rebuildSimple(md, entries, langOverride) {
  /** Replace code-section tables with freshly categorized entries.
   *  Preserves the original section structure (headers, column names, status labels). */
  let cleaned = md.replace(/\n> \*\*Last checked:\*\*[^\n]*/g, "");

  // Find all 3-column tables
  const tables = findTableRegions(cleaned);
  if (tables.length === 0) return cleaned;

  // Categorize entries
  const cats = { moonlight: [], wishing: [], material: [], seasonal: [] };
  for (const e of entries) {
    cats[categorizeEntry(e)].push(e);
  }
  const catKeys = ["moonlight", "wishing", "material", "seasonal"];

  // Determine language: use override, or detect from column headers
  const lang = langOverride || detectLangFromHeaders(cleaned);
  const statusMap = {
    Active: STATUS_I18N.Active[lang] || "Active",
    Expired: STATUS_I18N.Expired[lang] || "Expired",
  };

  function makeRows(entryList) {
    const active = entryList.filter((e) => e.status === "Active");
    const expired = entryList.filter((e) => e.status !== "Active");
    return [...active, ...expired]
      .map((e) => `| \`${e.code}\` | ${e.rewards} | ${statusMap[e.status] || e.status} |`)
      .join("\n");
  }

  // Assign categories to tables: match by existing content or use order
  // If we have exactly 4 tables, use the canonical order
  if (tables.length === 4) {
    const parts = [];
    let prevEnd = 0;
    for (let i = 0; i < 4; i++) {
      const t = tables[i];
      const cat = cats[catKeys[i]];
      parts.push(cleaned.slice(prevEnd, t.rowsStart));
      parts.push(makeRows(cat) + "\n");
      prevEnd = t.rowsEnd;
    }
    parts.push(cleaned.slice(prevEnd));
    return parts.join("");
  }

  // Fallback for non-standard table count: determine category from existing entries
  const tableCats = tables.map((t) => {
    const rows = cleaned.slice(t.rowsStart, t.rowsEnd);
    const codes = [...rows.matchAll(/\| `([^`]+)` \|/g)].map((m) => m[1].toLowerCase());
    // Find which category most of these codes fall into
    const scores = { moonlight: 0, wishing: 0, material: 0, seasonal: 0 };
    for (const code of codes) {
      const entry = entries.find((e) => e.code.toLowerCase() === code);
      if (entry) scores[categorizeEntry(entry)]++;
    }
    return catKeys.reduce((a, b) => (scores[a] >= scores[b] ? a : b));
  });

  const parts = [];
  let prevEnd = 0;
  for (let i = 0; i < tables.length; i++) {
    const t = tables[i];
    const cat = cats[tableCats[i]];
    parts.push(cleaned.slice(prevEnd, t.rowsStart));
    parts.push(makeRows(cat) + "\n");
    prevEnd = t.rowsEnd;
  }
  parts.push(cleaned.slice(prevEnd));
  return parts.join("");
}

function appendLastChecked(md) {
  if (md.includes("Last checked:")) {
    return md.replace(/Last checked:[^\n]*/g, `Last checked: ${TODAY}`);
  }
  return md.replace(
    /(https:\/\/discord\.gg\/heartopia[^\n]*)/,
    `$1  \n> **Last checked:** ${TODAY} — synced from heartopia.live every 6 hours.`
  );
}

// ── Sync translations ──────────────────────────────────────────────────────

function syncTranslation(enEntries, lang) {
  const path = join(GUIDE_DIR, `codes.${lang}.md`);
  if (!readdirSync(GUIDE_DIR).includes(`codes.${lang}.md`)) return;

  let content = readFileSync(path, "utf-8");
  const langEntries = extractExistingCodes(content);
  const langEntryMap = new Map(langEntries);

  // Merge: update existing entries, add new ones
  for (const e of enEntries) {
    langEntryMap.set(e.code.toLowerCase(), e);
  }
  const merged = [...langEntryMap.values()];

  content = rebuildSimple(content, merged, lang);
  content = appendLastChecked(content);
  writeFileSync(path, content, "utf-8");
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔍 Heartopia Code Updater — ${TODAY}`);
  console.log(`   Source: ${SOURCE_URL}\n`);

  // 1. Fetch latest codes from heartopia.live
  console.log("📡 Fetching latest codes...");
  let html;
  try {
    const res = await fetch(SOURCE_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; HeartopiaGuideBot/1.0)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
    console.log(`   ✅ Got ${(html.length / 1024).toFixed(0)}KB response`);
  } catch (e) {
    console.error(`   ❌ Fetch failed: ${e.message}`);
    process.exit(1);
  }

  // 2. Parse codes
  const sourceCodes = parseCodesFromHTML(html);
  console.log(`\n📋 Codes found on source: ${sourceCodes.length}`);
  for (const c of sourceCodes) {
    console.log(`   \`${c.code}\` → ${c.rewards} [${c.status}]`);
  }

  // 3. Read current English file
  const enPath = join(GUIDE_DIR, "codes.en.md");
  let enContent = readFileSync(enPath, "utf-8");
  const existingCodes = extractExistingCodes(enContent);
  console.log(`\n📋 Existing codes on our site: ${existingCodes.size}`);

  // 4. Compare
  const sourceCodeMap = new Map(sourceCodes.map((c) => [c.code.toLowerCase(), c]));
  const newCodes = sourceCodes.filter((c) => !existingCodes.has(c.code.toLowerCase()));
  const changedCodes = sourceCodes.filter((c) => {
    const existing = existingCodes.get(c.code.toLowerCase());
    return existing && (existing.status !== c.status || existing.rewards !== c.rewards);
  });
  const removedCodes = [...existingCodes.keys()].filter((c) => !sourceCodeMap.has(c));

  console.log(`\n🆕 New: ${newCodes.length}  |  🔄 Changed: ${changedCodes.length}  |  ❌ Gone from source: ${removedCodes.length}`);

  if (newCodes.length > 0) {
    console.log("\n🆕 New codes:");
    for (const c of newCodes) console.log(`   + \`${c.code}\` → ${c.rewards} [${c.status}]`);
  }
  if (changedCodes.length > 0) {
    console.log("\n🔄 Status/rewards changed:");
    for (const c of changedCodes) {
      const old = existingCodes.get(c.code.toLowerCase());
      console.log(`   ~ \`${c.code}\`: "${old.status}"→"${c.status}" / "${old.rewards}"→"${c.rewards}"`);
    }
  }

  if (newCodes.length === 0 && changedCodes.length === 0) {
    console.log("\n✅ Already up to date.");
    enContent = appendLastChecked(enContent);
    writeFileSync(enPath, enContent, "utf-8");
    return;
  }

  // 5. Build updated entry list
  const mergedEntries = new Map();
  for (const c of sourceCodes) mergedEntries.set(c.code.toLowerCase(), c);
  // Keep any codes we have that the source doesn't (they may have been removed from source but still active)
  for (const [code, entry] of existingCodes) {
    if (!mergedEntries.has(code)) mergedEntries.set(code, entry);
  }
  const allEntries = [...mergedEntries.values()];

  // 6. Update English markdown
  enContent = rebuildSimple(enContent, allEntries);
  enContent = appendLastChecked(enContent);
  writeFileSync(enPath, enContent, "utf-8");
  console.log("\n✅ Updated codes.en.md");

  // 7. Sync all translation files
  for (const lang of LANGS) {
    syncTranslation(allEntries, lang);
  }
  console.log("✅ Synced all 8 translations");
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
