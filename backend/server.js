const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// 中间件
app.use(cors());
app.use(express.json());

// ---------- 硬编码测试数据（一个测试样品 + 额外几个便于展示） ----------
const exhibitions = [
  {
    id: 1,
    title: 'Ancient Pottery of the Mediterranean',
    description: 'Explore the rich history of ceramic art from ancient Greek and Roman civilizations, featuring over 200 rare pieces. This exhibition showcases the evolution of pottery techniques and their cultural significance across the Mediterranean basin.',
    imageUrl: 'https://picsum.photos/seed/pottery/600/400',
    startDate: '2026-09-01',
    endDate: '2026-12-15',
    location: 'Gallery A, Level 1',
    category: ['Ancient History', 'Ceramics'],
    isFeatured: true,
  },
  {
    id: 2,
    title: 'Modern Australian Art: 1960–2000',
    description: 'A comprehensive survey of Australian contemporary art movements, from abstract expressionism to indigenous modernism. Featuring works from renowned Australian artists.',
    imageUrl: 'https://picsum.photos/seed/australian/600/400',
    startDate: '2026-10-01',
    endDate: '2027-02-28',
    location: 'Gallery B, Level 2',
    category: ['Modern Art', 'Australian'],
    isFeatured: false,
  },
  {
    id: 3,
    title: 'Test Exhibition Sample (Focus Item)',
    description: 'This is the **single test sample** exhibition you requested. It demonstrates the detail page with all fields populated. Use this to verify your frontend routing and rendering.',
    imageUrl: 'https://picsum.photos/seed/test/600/400',
    startDate: '2026-11-01',
    endDate: '2027-01-15',
    location: 'Gallery C, Level 3',
    category: ['Test', 'Demo'],
    isFeatured: false,
  },
];

// ---------- API 路由 ----------

// 获取所有展览（列表页用）
app.get('/api/exhibitions', (req, res) => {
  // 模拟网络延迟，展示加载状态
  setTimeout(() => {
    res.json({
      success: true,
      data: exhibitions,
      pagination: {
        page: 1,
        limit: 10,
        total: exhibitions.length,
        totalPages: 1,
      },
    });
  }, 300);
});

// 根据 ID 获取单个展览（详情页用）
app.get('/api/exhibitions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const exhibition = exhibitions.find((item) => item.id === id);

  if (!exhibition) {
    return res.status(404).json({
      success: false,
      message: 'Exhibition not found',
    });
  }

  setTimeout(() => {
    res.json({
      success: true,
      data: exhibition,
    });
  }, 200);
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
  console.log(`📋 Test exhibition ID: 3 (http://localhost:5000/api/exhibitions/3)`);
});