# Regional Museum Visitor Experience Platform

## Overview


A museum website for visitors to explore exhibitions, book tickets, and manage memberships, with an admin interface for staff to manage museum content.

博物馆游客服务平台，支持展览浏览、门票预订、会员管理和员工后台管理。

## Technology

- Frontend: React + Vite
- Backend: Node.js + Express.js (planned)
- Language: TypeScript and JavaScipt
- Database: MongoDB (planned)

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
npm ci                   # 环境检查
npm run                  # 查看可用命令
npm run dev              # 本地预览
npm run lint             # 代码规范检查
npm run typecheck        # TypeScript 类型检查
npm run build            # 生产构建检查
git pull origin main       # pull main branch
```

