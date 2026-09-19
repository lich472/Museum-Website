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


const events = [
  {
    id: 1,
    title: 'Pottery Workshop',
    description: 'Hands-on workshop for beginners. Learn traditional hand-building techniques and take home your own piece.',
    date: '2026-09-20',
    time: '14:00',
    capacity: 20,
    spotsRemaining: 8,
    location: 'Workshop Room 1',
  },
  {
    id: 2,
    title: 'Curator Talk: Ancient Civilisations',
    description: 'Join our senior curator for an in-depth discussion of the museum\'s Mediterranean collection.',
    date: '2026-09-25',
    time: '18:30',
    capacity: 50,
    spotsRemaining: 32,
    location: 'Lecture Theatre',
  },
  {
    id: 3,
    title: 'Family Tour: Stories in Stone',
    description: 'A guided, interactive tour designed for families with children aged 6–12.',
    date: '2026-10-03',
    time: '11:00',
    capacity: 15,
    spotsRemaining: 0,
    location: 'Main Hall',
  },
  {
    id: 4,
    title: 'Evening Lecture: Modern Australian Art',
    description: 'A lecture exploring the evolution of Australian art from 1960 to 2000.',
    date: '2026-10-10',
    time: '19:00',
    capacity: 40,
    spotsRemaining: 25,
    location: 'Lecture Theatre',
  },
];


// ---------- Visitor Info (contract: one object, museum-wide) ----------
const visitorInfo = {
  openingHours: {
    monday: '10:00–17:00',
    tuesday: '10:00–17:00',
    wednesday: '10:00–17:00',
    thursday: '10:00–17:00',
    friday: '10:00–17:00',
    saturday: '10:00–17:00',
    sunday: 'Closed',
    closedDates: ['2026-12-25'],
  },
  location: {
    address: '123 Main St, Adelaide SA',
    lat: -34.9285,
    lng: 138.6007,
  },
  accessibility: {
    wheelchairAccess: true,
    parking: 'Free onsite parking, 2 accessible bays',
    sensoryFriendlyHours: 'First Tuesday of the month, 9:00–10:00',
  },
  facilities: ['Café', 'Gift Shop', 'Restrooms', 'Cloakroom'],
  // 可选扩展（P3 若采纳契约变更后由后端提供）
  facilityLocations: [
    { name: 'Café',      mapX: 160, mapY: 300, icon: 'cafe'  },
    { name: 'Gift Shop', mapX: 160, mapY: 420, icon: 'shop'  },
    { name: 'Restrooms', mapX: 600, mapY: 300, icon: 'wc'    },
    { name: 'Cloakroom', mapX: 640, mapY: 420, icon: 'cloak' },
  ],
  accessibilityPoints: [
{
    id: 'accessible-entrance',
    name: 'Accessible Entrance',
    mapX: 400, mapY: 440,
    icon: 'entrance',
    description: 'Step-free entry at the main entrance. Automatic doors with a level threshold.',
  },
  {
    id: 'elevator',
    name: 'Elevator',
    mapX: 330, mapY: 140,
    icon: 'elevator',
    description: 'Serves all public floors. Located in the central lobby.',
  },
  {
    id: 'wheelchair-loan',
    name: 'Wheelchair Loan',
    mapX: 480, mapY: 140,
    icon: 'wheelchair',
    description: 'Complimentary wheelchairs available at the front desk.',
  },
  {
    id: 'quiet-room',
    name: 'Quiet Room',
    mapX: 400, mapY: 300,
    icon: 'quiet',
    description: 'Low-stimulation space with dimmed lighting for sensory breaks.',
  },
  {
    id: 'accessible-restroom',
    name: 'Accessible Restroom',
    mapX: 660, mapY: 300,
    icon: 'wheelchair',
    description: 'Wheelchair-accessible restroom on the ground floor.',
  },
  ],
};


// 用于模拟注册记录自增ID
let nextRegistrationId = 501;



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

// ---------- GET /api/visitor-info ----------
app.get('/api/visitor-info', (req, res) => {
  setTimeout(() => ok(res, visitorInfo), 200);
});

// ---------- PUT /api/visitor-info (staff only, used by P4) ----------
app.put('/api/visitor-info', (req, res) => {
  Object.assign(visitorInfo, req.body);
  ok(res, visitorInfo);
});

// ---------- Events API ----------

// 获取所有活动
app.get('/api/events', (req, res) => {
  setTimeout(() => {
    res.json(events);
  }, 300);
});

// 获取单个活动详情
app.get('/api/events/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const event = events.find((e) => e.id === id);

  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  setTimeout(() => {
    res.json(event);
  }, 200);
});

// 活动注册
app.post('/api/events/:id/register', (req, res) => {
  const id = parseInt(req.params.id);
  const event = events.find((e) => e.id === id);

  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  const { visitorName, email, numGuests } = req.body;

  // 服务端校验
  if (!visitorName || !email || !numGuests) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  if (numGuests < 1) {
    return res.status(400).json({ success: false, message: 'At least 1 guest required' });
  }

  if (numGuests > event.spotsRemaining) {
    return res.status(400).json({
      success: false,
      message: `Only ${event.spotsRemaining} spot(s) remaining`,
    });
  }

  // 扣减名额（内存模拟）
  event.spotsRemaining -= numGuests;

  const registrationId = nextRegistrationId++;

  setTimeout(() => {
    res.json({ success: true, registrationId });
  }, 400);

  ////Resend · Email for developers


  
});

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`✅ Backend server running at http://localhost:${PORT}`);
  console.log(`📋 Exhibitions:  http://localhost:${PORT}/api/exhibitions`);
  console.log(`🧪 Test sample:  http://localhost:${PORT}/api/exhibitions/3`);
  console.log(`💡 Recommend:    http://localhost:${PORT}/api/recommendations?exhibitionId=1`);
});