# Regional Museum Visitor Experience Platform

## Overview


A museum website for visitors to explore exhibitions, book tickets, and manage memberships, with an admin interface for staff to manage museum content.

博物馆游客服务平台，支持展览浏览、门票预订、会员管理和员工后台管理。

## Technology

- Frontend: React + Vite
- Backend: Node.js + Express.js (planned)
- Language: TypeScript
- Database: MongoDB (planned)

## Commands

> React 基础项目已创建，业务功能待开发。以下 npm 命令在 `frontend` 目录执行。

### Initial setup

```bash
git clone https://github.com/lich472/Museum-Website
cd Museum-Website/frontend
npm ci
```

### Local Development

```bash
npm install
npm run dev -- --port 5173 --strictPort --open
```

Local URL: [http://localhost:5173](http://localhost:5173)

### Checks

```bash
npm run                  # 查看可用命令
npm run dev              # 本地预览
npm run lint             # 代码规范检查
npm run typecheck        # TypeScript 类型检查
npm run build            # 生产构建检查
```

### Build and local preview

```bash
npm run build
npm run preview -- --port 5173 --strictPort --open
```

Preview URL: [http://localhost:5173](http://localhost:5173)

构建输出：`frontend/dist/`。`Ctrl+C` 停止本地服务。

公网部署和后端启动命令待 P3 配置后补充；`preview` 仅用于本地查看构建效果。

### Pull Request

```bash
git pull origin main       # pull main branch
git add .
git commit -m""            # like "fix:"
git push origin your-branch-name
```

## Project Structure

```bash 
Museum-Website/
├── README.md
├── api-contract.md
├── frontend/                 # 团队共用的 React 项目
│   └── src/
│       ├── features/
│       │   ├── bookings/     # 门票预订
│       │   └── memberships/  # 会员管理
│       ├── components/       # 共用导航、按钮等
│       └── App.tsx           # 共用页面入口
└── backend/                  # P3 负责

```




## Main integration (2026-10-11)

Integrated main commit 9860a26 into the current working tree, preserving local membership and booking changes. No merge commit or push was created.

- Main Home, Exhibitions, ExhibitionDetail, Collections, CollectionDetail and Visit content is retained.
- All pages use main's original Navbar and Footer (only router imports adapt to v8). Main content and colours are unchanged. No membership/booking links are added to main; use /membership and /booking directly. Feature styles, providers and test controls are confined to feature routes so they do not affect main pages.
- Frontend stays on react-router 8.3.1 and existing React/Vite/TypeScript versions. Axios was added for main's existing requests.
- Main backend source and its root package manifests are included, but backend setup and membership/booking API integration are deferred.
- Home and exhibition pages still request /api/exhibitions through the development proxy at localhost:6000. Without that backend, featured exhibitions remain empty and exhibition details cannot load. Collections use main's local data.
- Existing mock account, payment, booking and membership behavior remains unchanged. Free Entry copy and visual differences are intentionally retained.
- Run frontend commands in frontend/: npm ci, npm run dev, npm run build, npm run lint, node --test tests/*.test.mjs.
- Original working files are backed up outside the repository at F:/IRP/integration-backup-20261011.
