# Heartopia 攻略站实施计划

## 项目信息

- **游戏**: Heartopia（心动小镇国际版）
- **类型**: 免费多人生活模拟（类似动物森友会）
- **发行**: XD Entertainment，2026-01-17
- **目标用户**: 海外玩家（不含中国大陆）
- **技术栈**: Astro v5 + Markdown + Tailwind CSS v3
- **部署**: GitHub → Vercel

## 国际化

默认英语，另支持 8 种语言：`de` `it` `fr` `es` `ja` `ko` `id` `pl`

路由策略:
- EN: `src/pages/xxx.astro` → `/xxx`
- 其他: `src/pages/[lang]/xxx.astro` → `/de/xxx` 等

内容先用英文撰写，后续按需翻译。

## 内容模块

| 优先级 | 模块 | 内容 | 路由 |
| --- | --- | --- | --- |
| P0 | 首页 | 导航入口 + 推荐攻略 | `/` |
| P0 | 新手入门 | 角色创建、DG 等级、第一天做什么、基础货币 | `/beginner-guide` |
| P0 | 兑换码 | 有效码列表 + 兑换教程 + 更新日志 | `/codes` |
| P0 | 主线攻略 | Astralis 四区域任务链 | `/walkthrough` |
| P1 | NPC 资料 | 16+ NPC 按功能分类，每个有独立页 | `/characters` |
| P1 | 资源图鉴 | 木材/矿石/食材/稀有材料及获取途径 | `/resources` |
| P2 | 爱好系统 | 钓鱼/园艺/烹饪/捉虫/观鸟/宠物 | `/hobbies` |
| P2 | 制作系统 | 配方表 + 材料来源 | `/crafting` |
| P3 | 建造装修 | 蓝图、共建、DIY 技巧 | `/building` |
| P3 | 限时活动 | 冬霜季、建造赛等（需持续更新） | `/events` |
| P3 | 多人联机 | 好友系统、咖啡伞、跨平台 | `/multiplayer` |

## 页面结构

```
src/
├── pages/
│   ├── index.astro                 # 首页
│   ├── beginner-guide.astro        # 新手入门（或 content 转 .md）
│   ├── codes.astro                 # 兑换码
│   ├── walkthrough.astro           # 主线攻略
│   ├── characters.astro            # NPC 一览
│   ├── characters/[slug].astro     # 单个 NPC 详情
│   ├── resources.astro             # 资源图鉴
│   ├── hobbies.astro               # 爱好系统
│   ├── crafting.astro              # 制作系统
│   ├── building.astro              # 建造装修
│   ├── events.astro                # 限时活动
│   ├── multiplayer.astro           # 多人联机
│   └── [lang]/                     # 各语言的对应页面
│       ├── index.astro
│       └── ...
├── content/
│   └── guide/                      # Markdown 攻略内容（Content Collection）
│       ├── beginner-guide.en.md
│       ├── codes.en.md
│       └── ...
├── layouts/
│   └── Layout.astro                # 全局布局（已有）
└── components/
    ├── Header.astro                # 全局导航
    ├── Footer.astro
    ├── CodeTable.astro             # 兑换码表格组件
    ├── ResourceCard.astro          # 资源卡片
    └── ...
```

## 设计方向

- 深色主题: `bg-gray-950` + `text-gray-100`
- 主色调: 可选用暖粉色（cozy life-sim 风格）
- 布局: `max-w-4xl` 居中，响应式
- 移动优先: 国际服大量手机用户

## 实施步骤

### 阶段一: 基础建设
1. 完善 Layout（导航、Footer、SEO meta）
2. 首页框架 + 模块导航入口
3. Content Collection 配置（Markdown 内容管道）
4. i18n 路由骨架搭建

### 阶段二: P0 内容填充
5. 新手入门页
6. 兑换码页（含教程 + 表格 + 过期标记）
7. 主线攻略页

### 阶段三: P1 内容填充
8. NPC 一览页 + 详情页
9. 资源图鉴页

### 阶段四: P2-P3 内容填充
10. 制作系统、爱好系统
11. 建造装修、多人联机
12. 限时活动（预留框架，活动期间填充）

### 阶段五: 上线
13. GitHub 仓库配置
14. Vercel 部署 + 自定义域名
15. SEO 优化（sitemap、meta、结构化数据）

## 关键依赖

- 兑换码数据需定期人工更新（时效性）
- 活动攻略跟随官方更新节奏
- 多语言翻译按需推进（初期集中英语）
