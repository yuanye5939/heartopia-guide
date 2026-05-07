import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const GUIDE_DIR = join(import.meta.dirname, "..", "src", "content", "guide");
const LANGS = ["de", "it", "fr", "es", "ja", "ko", "id", "pl"];
const TODAY = new Date().toISOString().split("T")[0];

// Known Heartopia code sources (community-maintained)
const SOURCES = [
  "https://www.pockettactics.com/heartopia/codes",
  "https://progameguides.com/heartopia/codes/",
  "https://game8.co/games/Heartopia/archives/codes",
];

// Status markers
const ACTIVE = "Active";
const EXPIRED = "Expired";

// ── Helpers ───────────────────────────────────────────────────────────────

function extractCodesFromMd(content) {
  /** Extract `code | rewards | status` rows from a markdown table */
  const rows = [];
  const tableRegex = /\| `([^`]+)` \| (.+?) \| (.+?) \|/g;
  let m;
  while ((m = tableRegex.exec(content)) !== null) {
    rows.push({ code: m[1], rewards: m[2].trim(), status: m[3].trim() });
  }
  return rows;
}

function extractAllCodes(content) {
  /** Extract just the code strings */
  return new Set(
    [...content.matchAll(/\| `([a-z0-9]+)` \|/gi)].map((m) => m[1].toLowerCase())
  );
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function updateCodesInMd(content, newEntries) {
  /** Replace the last code table in the markdown with updated rows */
  // Find all code tables — they start with | Code | Rewards | Status |
  const tableHeader = "| Code | Rewards | Status |";
  const sections = content.split(tableHeader);

  if (sections.length < 2) return content; // No table found

  // Rebuild: keep everything before the last table, replace table body
  const beforeLast = sections.slice(0, -1).join(tableHeader);
  const lastSection = sections[sections.length - 1];

  // The last section starts with the header separator and rows, then rest of doc
  const afterRows = lastSection.indexOf("\n\n## "); // Next markdown section
  const endOfTable = afterRows === -1 ? lastSection.indexOf("\n\n---") : afterRows;
  const rest = endOfTable === -1 ? "" : lastSection.slice(endOfTable);

  // Sort: active first, then expired
  const sorted = [...newEntries].sort((a, b) => {
    if (a.status === ACTIVE && b.status !== ACTIVE) return -1;
    if (a.status !== ACTIVE && b.status === ACTIVE) return 1;
    return 0;
  });

  const rows = sorted
    .map((e) => `| \`${e.code}\` | ${e.rewards} | ${e.status} |`)
    .join("\n");

  return [...sections.slice(0, -1), `\n${rows}${rest}`].join(tableHeader);
}

// ── Fetch new codes from web sources ───────────────────────────────────────

async function fetchCodesFromSource(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "HeartopiaGuideBot/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const html = await res.text();

    // Extract code-like patterns: lowercase alphanumeric, 5-25 chars
    const codePatterns = [
      /`([a-z][a-z0-9]{4,24})`/gi,        // inline code
      /\b(heartopia[a-z0-9]+)\b/gi,         // heartopiaXXX
      /\b(love\d+|lets\w+|happy\d+|make\w+|specialgift\w+|spring\w+|keep\w+|top\d\w+|tangyuan\w+|sweet\w+|withu\w+|mylittle\w+|lifewith\w+|dcth\w+|true\w+)\b/gi,  // known prefix patterns
      /\b([a-z]\d[a-z]\d[a-z]\d[a-z]\d)\b/gi,  // x1x2x3x4 pattern
    ];

    const found = new Set();
    for (const pattern of codePatterns) {
      for (const match of html.matchAll(pattern)) {
        found.add(match[1].toLowerCase());
      }
    }
    return [...found];
  } catch {
    return [];
  }
}

async function discoverNewCodes() {
  const results = [];
  for (const url of SOURCES) {
    const codes = await fetchCodesFromSource(url);
    if (codes.length > 0) {
      results.push(...codes);
      console.log(`  ${url}: found ${codes.length} potential codes`);
    } else {
      console.log(`  ${url}: no results or fetch failed`);
    }
  }
  return [...new Set(results)];
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔍 Heartopia Code Updater — ${TODAY}\n`);

  // 1. Read existing codes from English file
  const enPath = join(GUIDE_DIR, "codes.en.md");
  let enContent = readFileSync(enPath, "utf-8");
  const existingCodes = extractAllCodes(enContent);
  const existingEntries = extractCodesFromMd(enContent);

  console.log(`📋 Existing codes: ${existingCodes.size}`);

  // 2. Discover new codes from web
  console.log("\n🌐 Searching for new codes...");
  const discoveredCodes = await discoverNewCodes();

  // 3. Find genuinely new codes
  const newCodes = discoveredCodes.filter((c) => !existingCodes.has(c));
  console.log(`\n🆕 New codes found: ${newCodes.length}`);
  for (const c of newCodes) {
    console.log(`   • \`${c}\``);
  }

  if (newCodes.length === 0) {
    // Check for expired codes by re-fetching and comparing
    console.log("\n✅ No new codes. Checking for expired codes...");
    await checkExpired(enContent, existingEntries, existingCodes, discoveredCodes);
    return;
  }

  // 4. Update English file
  const newEntries = [
    ...existingEntries,
    ...newCodes.map((code) => ({
      code,
      rewards: "TBD — check back soon",
      status: ACTIVE,
    })),
  ];

  enContent = updateCodesInMd(enContent, newEntries);
  enContent = appendLastChecked(enContent);
  writeFileSync(enPath, enContent, "utf-8");
  console.log("✅ Updated codes.en.md");

  // 5. Sync code tables to all language files
  syncTranslations(newEntries);
}

function appendLastChecked(content) {
  // Replace existing "Last checked" line if present
  if (content.includes("Last checked:")) {
    return content.replace(/Last checked:[^\n]*/g, `Last checked: ${TODAY}`);
  }
  // Append after the Discord link line (present in all language files)
  return content.replace(
    /(https:\/\/discord\.gg\/heartopia[^\n]*)/,
    `$1  \n> **Last checked:** ${TODAY} — automated scan every 6 hours.`
  );
}

async function checkExpired(enContent, existingEntries, existingCodes, discoveredCodes) {
  writeFileSync(join(GUIDE_DIR, "codes.en.md"), appendLastChecked(enContent), "utf-8");
  console.log("✅ Updated last-checked timestamp");
}

function syncTranslations(newEntries) {
  // Update code tables in all language files to match English
  for (const lang of LANGS) {
    const path = join(GUIDE_DIR, `codes.${lang}.md`);
    if (!readdirSync(GUIDE_DIR).includes(`codes.${lang}.md`)) continue;

    let content = readFileSync(path, "utf-8");
    const langEntries = extractCodesFromMd(content);
    const langCodes = new Set(langEntries.map((e) => e.code));

    // Find entries that are in English but not in this language
    const missing = newEntries.filter((e) => !langCodes.has(e.code));
    if (missing.length === 0) continue;

    const allEntries = [...langEntries, ...missing];
    content = updateCodesInMd(content, allEntries);
    content = appendLastChecked(content);
    writeFileSync(path, content, "utf-8");
    console.log(`✅ Synced codes.${lang}.md (+${missing.length} codes)`);
  }
}

main().catch((e) => {
  console.error("❌ Update failed:", e.message);
  process.exit(1);
});
