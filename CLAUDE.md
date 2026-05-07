# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概述

Heartopia 游戏攻略站。Astro v5 + Markdown + Tailwind CSS v3 静态站，GitHub → Vercel 自动部署。

## 基本命令

```bash
npm run dev       # 开发服务器
npm run build     # 生产构建
npm run preview   # 预览生产构建
```

## 架构

```
src/
├── pages/          # 路由页面（.astro 文件 = 一个路由）
├── layouts/        # 页面布局（Layout.astro 是全局壳）
├── components/     # 可复用 Astro 组件
├── content/        # Markdown 攻略内容（待建设）
├── styles/         # 全局 CSS
public/             # 静态资源（favicon、图片等）
```

## 国际化 (i18n)

9 种语言：`en`(默认)、`de`、`it`、`fr`、`es`、`ja`、`ko`、`id`、`pl`

内容采用 Astro i18n 路由策略。页面路径约定：
- 默认语言(EN): `src/pages/xxx.astro` → `/xxx`
- 其他语言: `src/pages/[lang]/xxx.astro` → `/de/xxx` 等

## 内容策略

攻略内容用 Markdown 文件管理，放在 `src/content/` 下。每个游戏主题（角色、任务、道具等）作为独立 .md 文件，通过 Astro Content Collections 加载。

站点定位：游戏攻略、任务指南、角色资料、道具说明、新手入门。

## 设计

- 深色主题（`bg-gray-950` + `text-gray-100`）
- Tailwind utility-first，布局最大宽度 `max-w-4xl`
- 目标用户：海外玩家，非中文市场
