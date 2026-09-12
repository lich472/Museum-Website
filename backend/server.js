const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());

// ---------- Hardcoded data (aligned with API Contract) ----------
const exhibitions = [
  {
    id: 1,
    title: 'Ancient Pottery of the Mediterranean',
    description:
      'Explore the rich history of ceramic art from ancient Greek and Roman civilizations, featuring over 200 rare pieces. This exhibition showcases the evolution of pottery techniques and their cultural significance across the Mediterranean basin.',
    imageUrl: 'https://picsum.photos/seed/pottery/600/400',
    startDate: '2026-09-01',
    endDate: '2026-12-15',
    room: 'Gallery A',
    tags: ['ancient', 'ceramics', 'mediterranean'],
  },
  {
    id: 2,
    title: 'Modern Australian Art: 1960–2000',
    description:
      'A comprehensive survey of Australian contemporary art movements, from abstract expressionism to indigenous modernism. Featuring works from renowned Australian artists.',
    imageUrl: 'https://picsum.photos/seed/australian/600/400',
    startDate: '2026-10-01',
    endDate: '2027-02-28',
    room: 'Gallery B',
    tags: ['modern', 'australian', 'painting'],
  },
  {
    id: 3,
    title: 'Test Exhibition Sample (Focus Item)',
    description:
      'This is the single test sample exhibition you requested. It demonstrates the detail page with all fields populated. Use this to verify your frontend routing and rendering.',
    imageUrl: 'https://picsum.photos/seed/test/600/400',
    startDate: '2026-11-01',
    endDate: '2027-01-15',
    room: 'Gallery C',
    tags: ['test', 'demo'],
  },
  {
    id: 4,
    title: 'Roman Glassware',
    description:
      'A rare collection of Roman glass vessels, spanning from the 1st century BC to the 4th century AD. Discover how glassmaking techniques spread across the empire.',
    imageUrl: 'https://picsum.photos/seed/roman/600/400',
    startDate: '2026-09-15',
    endDate: '2026-12-31',
    room: 'Gallery A',
    tags: ['ancient', 'glass', 'mediterranean'],
  },
  {
    id: 5,
    title: 'Contemporary Indigenous Art',
    description:
      'Featuring contemporary works by Indigenous Australian artists, exploring identity, connection to Country, and modern storytelling through diverse media.',
    imageUrl: 'https://picsum.photos/seed/indigenous/600/400',
    startDate: '2026-10-10',
    endDate: '2027-03-15',
    room: 'Gallery B',
    tags: ['modern', 'australian', 'indigenous'],
  },
  {
    id: 6,
    title: 'Greek Sculpture Collection',
    description:
      'Marble and bronze sculptures from classical Greece, including reconstructions and original fragments. A journey through the evolution of Greek artistic form.',
    imageUrl: 'https://picsum.photos/seed/greek/600/400',
    startDate: '2026-08-20',
    endDate: '2026-11-30',
    room: 'Gallery A',
    tags: ['ancient', 'sculpture', 'mediterranean'],
  },
  {
    id: 7,
    title: 'Asian Ceramics: A Thousand Years',
    description:
      'From Tang dynasty porcelain to Japanese raku ware, this exhibition traces the remarkable ceramic traditions of East and Southeast Asia.',
    imageUrl: 'https://picsum.photos/seed/asian/600/400',
    startDate: '2026-09-05',
    endDate: '2026-12-20',
    room: 'Gallery D',
    tags: ['ceramics', 'asian', 'ancient'],
  },
  {
    id: 8,
    title: 'Photography in Australia',
    description:
      'A survey of Australian photography from the 20th century to today, featuring landscapes, portraiture, and documentary work.',
    imageUrl: 'https://picsum.photos/seed/photo/600/400',
    startDate: '2026-11-10',
    endDate: '2027-02-28',
    room: 'Gallery B',
    tags: ['modern', 'australian', 'photography'],
  },
];

// ---------- Unified response helpers ----------
const ok = (res, data, extra = {}) => res.json({ success: true, data, ...extra });
const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

// ---------- GET /api/exhibitions ----------
app.get('/api/exhibitions', (req, res) => {
  setTimeout(() => {
    ok(res, exhibitions, {
      pagination: {
        page: 1,
        limit: 20,
        total: exhibitions.length,
        totalPages: 1,
      },
    });
  }, 300);
});

// ---------- GET /api/exhibitions/:id ----------
app.get('/api/exhibitions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const exhibition = exhibitions.find((item) => item.id === id);
  if (!exhibition) return fail(res, 404, 'Exhibition not found');
  setTimeout(() => ok(res, exhibition), 200);
});

// ---------- GET /api/recommendations?exhibitionId=1 ----------
app.get('/api/recommendations', (req, res) => {
  const exhibitionId = parseInt(req.query.exhibitionId);
  if (!exhibitionId) return fail(res, 400, 'exhibitionId query param required');

  const current = exhibitions.find((e) => e.id === exhibitionId);
  if (!current) return fail(res, 404, 'Exhibition not found');

  const recommendations = exhibitions
    .filter((e) => e.id !== current.id)
    .map((e) => {
      const shared = e.tags.filter((t) => current.tags.includes(t));
      return { exhibition: e, sharedCount: shared.length, sharedTags: shared };
    })
    .filter((item) => item.sharedCount > 0)
    .sort((a, b) => b.sharedCount - a.sharedCount)
    .slice(0, 3)
    .map((item) => ({
      id: item.exhibition.id,
      title: item.exhibition.title,
      imageUrl: item.exhibition.imageUrl,
      tags: item.exhibition.tags,
      reason: `Shares ${item.sharedCount} topic${item.sharedCount > 1 ? 's' : ''} with this exhibition`,
    }));

  ok(res, recommendations);
});

// ---------- GET /api/health ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
  console.log(`📋 Exhibitions:  http://localhost:${PORT}/api/exhibitions`);
  console.log(`🧪 Test sample:  http://localhost:${PORT}/api/exhibitions/3`);
  console.log(`💡 Recommend:    http://localhost:${PORT}/api/recommendations?exhibitionId=1`);
});