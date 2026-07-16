// 宠迹AI Mock API — 纯前端演示，无需后端
import {
  mockUsers, mockPets, mockCustomers, mockPackages, mockTasks,
  mockStores, mockDailyReport, mockFeishuStatus, mockFeishuLogs,
  mockHealthLogs, mockSalesOrders, mockPosters, getAiResponse,
} from '../mock/data';

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));
const ok = (data: any) => ({ success: true, data });

function buildQuery(params?: Record<string, any>) {
  if (!params) return '';
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') sp.set(k, String(v)); });
  const q = sp.toString();
  return q ? `?${q}` : '';
}

// ─── 路由匹配 + Mock 数据返回 ───
async function mockRequest(method: string, url: string, data?: any, params?: any) {
  await delay(200 + Math.random() * 400);
  const fullUrl = url + buildQuery(params);

  // 状态映射
  const petStatusMap: Record<string, string> = { AVAILABLE: 'IN_STOCK', SOLD: 'SOLD', RESERVED: 'RESERVED', TRANSIT: 'TRANSIT' };
  const speciesMap: Record<string, string> = { CAT: '猫', DOG: '狗', OTHER: '兔' };
  const taskStatusMap: Record<string, string> = { PENDING: 'TODO', COMPLETED: 'DONE' };

  // POST /auth/login
  if (url === '/auth/login') {
    const { phone } = data || {};
    const user = mockUsers.find(u => u.phone === phone);
    if (user) return ok({ token: `demo-token-${user.id}`, user });
    return Promise.reject({ message: '手机号或密码错误' });
  }

  // POST /auth/register-boss
  if (url === '/auth/register-boss') {
    const user = { id: 'u_new', name: data?.name || '新老板', phone: data?.phone, role: 'TENANT_OWNER', tenantId: 't1', storeId: 's1', tenantName: data?.tenantName, storeName: data?.storeName };
    return ok({ token: 'demo-token-new', user });
  }

  // GET /reports/daily-report
  if (url.startsWith('/reports/daily-report')) {
    return ok({
      date: mockDailyReport.date,
      summary: '今日门店经营状况良好，营收¥12,680，环比增长12%。布偶猫"雪球"咨询量最高，建议重点推广。王太太45天未到店，需主动回访。新手养猫套餐复购率优秀，可推出升级版。',
      stats: {
        inStockPets: 6,
        reservedPets: 0,
        soldPets: 2,
        todayOrders: mockDailyReport.orderCount,
        weekOrders: 47,
        todoTasks: mockDailyReport.pendingTasks,
        todayCompletedTasks: 3,
        highPriorityTasks: 2,
        highRiskCustomers: 1,
        sickPets: 0,
        failedSyncPets: 0,
        employees: 5,
      },
      risks: [
        { type: 'HIGH_RISK_CUSTOMERS', title: '王太太 45天未消费', description: '高风险客户，上次联系2024-11-20，建议本周主动回访', priority: 'HIGH', action: '立即回访' },
      ],
      opportunities: [
        { type: 'INVENTORY_OPPORTUNITY', title: '布偶猫"雪球"热度高', description: '近7天收到5次咨询，建议加大朋友圈推广力度', action: '发布推广' },
        { type: 'RESERVED_PETS', title: '新手养猫套餐复购好', description: '复购率40%，可考虑推出进阶版套餐', action: '创建套餐' },
      ],
    });
  }

  // GET /pets
  if (url === '/pets' && method === 'GET') {
    const p = new URLSearchParams(fullUrl.split('?')[1] || '');
    let pets = [...mockPets];
    const species = p.get('species');
    const status = p.get('status');
    const breed = p.get('breed');
    if (species && species !== 'ALL') pets = pets.filter(pt => pt.species === (speciesMap[species] || species));
    if (status && status !== 'ALL') pets = pets.filter(pt => (petStatusMap[pt.status] || pt.status) === status);
    if (breed) pets = pets.filter(pt => pt.breed.includes(breed) || pt.name.includes(breed));

    const items = pets.map(pt => ({
      id: pt.id,
      publicId: `PET-${pt.id.toUpperCase()}`,
      name: pt.name,
      species: pt.species,
      breed: pt.breed,
      gender: pt.gender === '公' ? 'MALE' : 'FEMALE',
      status: petStatusMap[pt.status] || pt.status,
      healthStatus: 'HEALTHY',
      salePrice: pt.price,
      photoUrl: pt.photoUrl,
      color: pt.color,
      store: { name: pt.storeId === 's1' ? '静安旗舰店' : '浦东分店' },
    }));
    return ok({ items, total: items.length });
  }

  // GET /pets/:id
  const petMatch = url.match(/^\/pets\/([^/?]+)$/);
  if (petMatch && method === 'GET') {
    const pt = mockPets.find(p => p.id === petMatch[1]);
    if (!pt) return ok(null);
    const logs = mockHealthLogs.filter(l => l.petId === pt.id).map(l => ({
      id: l.id, type: l.type, content: l.content, operatorName: l.operatorName, occurredAt: l.createdAt,
    }));
    return ok({
      id: pt.id,
      publicId: `PET-${pt.id.toUpperCase()}`,
      name: pt.name,
      species: pt.species,
      breed: pt.breed,
      gender: pt.gender === '公' ? 'MALE' : 'FEMALE',
      status: petStatusMap[pt.status] || pt.status,
      healthStatus: 'HEALTHY',
      salePrice: pt.price,
      photoUrl: pt.photoUrl,
      photos: pt.photoUrl ? [{ url: pt.photoUrl }] : [],
      color: pt.color,
      birthday: pt.birthDate,
      vaccineStatus: '已接种',
      source: pt.source,
      purchasePrice: Math.round(pt.price * 0.5),
      store: { name: pt.storeId === 's1' ? '静安旗舰店' : '浦东分店' },
      logs,
    });
  }

  // POST /pets
  if (url === '/pets' && method === 'POST') {
    return ok({ pet: { id: 'p_new', ...data, status: 'AVAILABLE' } });
  }

  // POST /pets/:id/confirm-arrival
  if (url.match(/^\/pets\/[^/]+\/confirm-arrival$/)) {
    return ok({ success: true });
  }

  // GET /users
  if (url === '/users' && method === 'GET') {
    const p = new URLSearchParams(fullUrl.split('?')[1] || '');
    let users = [...mockUsers];
    const role = p.get('role');
    if (role) users = users.filter(u => u.role === role);
    const items = users.map(u => ({
      id: u.id, name: u.name, phone: u.phone, role: u.role, active: true,
      storeName: u.storeName, workWechatId: null, lastLoginAt: '2025-01-13T10:30:00Z',
    }));
    return ok(items);
  }

  // POST /users
  if (url === '/users' && method === 'POST') {
    return ok({ user: { id: 'u_new', ...data } });
  }
  // POST /users/:id/activate
  if (url.match(/^\/users\/[^/]+\/activate$/) && method === 'POST') return ok({});
  // POST /users/:id/deactivate
  if (url.match(/^\/users\/[^/]+\/deactivate$/) && method === 'POST') return ok({});

  // GET /stores
  if (url.startsWith('/stores') && method === 'GET') {
    const items = mockStores.map(s => ({
      ...s,
      city: s.address.match(/市(\w+)区/)?.[1] || '',
      _count: { users: s.employeeCount, pets: s.petCount },
    }));
    return ok(items);
  }
  // POST /stores
  if (url === '/stores' && method === 'POST') return ok({});

  // GET /customers
  if (url === '/customers' && method === 'GET') {
    const p = new URLSearchParams(fullUrl.split('?')[1] || '');
    let customers = [...mockCustomers];
    const riskLevel = p.get('riskLevel');
    if (riskLevel) customers = customers.filter(c => c.riskLevel === riskLevel);
    const items = customers.map(c => ({
      id: c.id, name: c.name, phone: c.phone, riskLevel: c.riskLevel,
      source: '门店', customerPets: c.petIds.map(pid => ({ pet: mockPets.find(p => p.id === pid) })),
      assignedSalesName: c.tag === 'VIP' ? '李小花' : '陈销售',
    }));
    return ok({ items, total: items.length });
  }

  // GET /customers/:id
  const customerMatch = url.match(/^\/customers\/([^/?]+)$/);
  if (customerMatch && method === 'GET') {
    const c = mockCustomers.find(cu => cu.id === customerMatch[1]);
    if (!c) return ok(null);
    const pets = c.petIds.map(pid => mockPets.find(p => p.id === pid)).filter(Boolean);
    const orders = mockSalesOrders.filter(o => o.customerId === c.id);
    return ok({
      id: c.id, name: c.name, phone: c.phone, riskLevel: c.riskLevel,
      tag: c.tag, totalSpent: c.totalSpent, lastContactAt: c.lastContactAt,
      remark: c.remark, pets, orders,
      assignedSalesName: c.tag === 'VIP' ? '李小花' : '陈销售',
    });
  }

  // GET /packages
  if (url.startsWith('/packages') && method === 'GET') {
    return ok({ items: mockPackages, total: mockPackages.length });
  }

  // PUT /packages/:id
  if (url.match(/^\/packages\/[^/]+$/) && method === 'PUT') {
    return ok({ ...data, id: url.split('/').pop() });
  }

  // DELETE /packages/:id
  if (url.match(/^\/packages\/[^/]+$/) && method === 'DELETE') {
    return ok({ success: true });
  }

  // GET /tasks
  if (url === '/tasks' && method === 'GET') {
    const p = new URLSearchParams(fullUrl.split('?')[1] || '');
    let tasks = [...mockTasks];
    const status = p.get('status');
    if (status && status !== 'ALL') tasks = tasks.filter(t => (taskStatusMap[t.status] || t.status) === status);
    const items = tasks.map(t => ({
      id: t.id, title: t.title, description: t.description, reason: t.description,
      priority: t.priority, status: taskStatusMap[t.status] || t.status,
      assigneeId: t.assigneeId, assigneeName: t.assigneeName, dueDate: t.dueDate, type: t.type,
      petId: t.petId, customerId: t.customerId,
      suggestedContent: t.type === 'FOLLOW_UP' ? `您好，我是宠爱有家的店员，想跟您确认一下最近宠物的状况，方便回访吗？` : undefined,
      relatedCustomer: t.customerId ? mockCustomers.find(c => c.id === t.customerId) : undefined,
      result: t.status === 'COMPLETED' ? 'SENT' : undefined,
    }));
    return ok({ items, total: items.length });
  }

  // POST /tasks/:id/complete
  if (url.match(/^\/tasks\/[^/]+\/complete$/)) return ok({});

  // POST /ai/chat
  if (url === '/ai/chat') {
    const answer = getAiResponse(data?.message || '');
    return ok({ answer, cards: [] });
  }

  // GET /feishu/sync/status
  if (url === '/feishu/sync/status') {
    return ok({
      connected: mockFeishuStatus.connected,
      lastSyncTime: mockFeishuStatus.lastSyncAt,
      autoSync: true,
      petCount: 8, petSynced: 8,
      customerCount: 5, customerSynced: 5,
      orderCount: 3, orderSynced: 3,
      taskCount: 8, taskSynced: 8,
    });
  }

  // GET /feishu/sync/logs
  if (url === '/feishu/sync/logs') {
    const items = mockFeishuLogs.map(l => ({
      id: l.id, module: l.type === 'PET_SYNC' ? 'PETS' : l.type === 'ORDER_SYNC' ? 'ORDERS' : l.type === 'CUSTOMER_SYNC' ? 'CUSTOMERS' : 'TASKS',
      status: l.status, recordsSynced: 3, recordsTotal: 3, errorCount: 0,
      errorMessage: l.status === 'FAILED' ? '同步超时' : null,
      createdAt: l.createdAt,
    }));
    return ok({ items, total: items.length });
  }

  // POST /feishu/sync/trigger
  if (url === '/feishu/sync/trigger') return ok({});

  // GET /pet-logs/health/pets
  if (url.startsWith('/pet-logs/health/pets')) {
    const items = mockPets.map(pt => ({
      id: pt.id,
      publicId: `PET-${pt.id.toUpperCase()}`,
      name: pt.name,
      species: pt.species,
      breed: pt.breed,
      gender: pt.gender === '公' ? 'MALE' : 'FEMALE',
      status: petStatusMap[pt.status] || pt.status,
      healthStatus: 'HEALTHY',
      salePrice: pt.price,
      photoUrl: pt.photoUrl,
      photos: pt.photoUrl ? [{ url: pt.photoUrl }] : [],
      color: pt.color,
      store: { name: pt.storeId === 's1' ? '静安旗舰店' : '浦东分店' },
      healthLogs: mockHealthLogs.filter(l => l.petId === pt.id),
      lastLog: mockHealthLogs.filter(l => l.petId === pt.id)[0] || null,
    }));
    return ok(items);
  }

  // POST /pet-logs/:id/care
  if (url.match(/^\/pet-logs\/[^/]+\/care$/)) {
    return ok({ log: { id: 'hl_new', ...data, createdAt: new Date().toISOString() } });
  }

  // POST /sales-orders
  if (url === '/sales-orders') {
    return ok({ order: { id: 'so_new', ...data, status: 'COMPLETED', createdAt: new Date().toISOString() } });
  }

  // POST /upload
  if (url === '/upload') {
    return ok({
      url: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent('uploaded pet photo, cute pet, studio photo')}&image_size=square`,
      filename: 'demo-upload.jpg', size: 102400, mimetype: 'image/jpeg',
    });
  }

  // GET /public/pets/:id/profile
  const publicPetMatch = url.match(/^\/public\/pets\/([^/]+)\/profile$/);
  if (publicPetMatch) {
    const pet = mockPets.find(p => p.id === publicPetMatch[1]);
    if (!pet) return ok(null);
    const customer = pet.customerId ? mockCustomers.find(c => c.id === pet.customerId) : null;
    const store = mockStores.find(s => s.id === pet.storeId);
    const logs = mockHealthLogs.filter(l => l.petId === pet.id);
    const timeline = logs.map(l => ({
      title: l.type === 'VACCINE' ? '疫苗接种' : l.type === 'DEWORM' ? '驱虫' : l.type === 'GROOMING' ? '美容护理' : l.type === 'FEED' ? '日常喂养' : l.type === 'CHECKUP' ? '健康体检' : '护理记录',
      date: l.createdAt,
      content: l.content,
    }));
    const nextReminders = [
      { title: '下次疫苗', date: '2025-02-10' },
      { title: '下次驱虫', date: '2025-02-05' },
    ];
    return ok({
      pet: {
        id: pet.id, name: pet.name, breed: pet.breed, gender: pet.gender === '公' ? 'MALE' : 'FEMALE',
        birthday: pet.birthDate, color: pet.color, photoUrl: pet.photoUrl,
        vaccineStatus: '已接种', publicId: `PET-${pet.id.toUpperCase()}`,
      },
      customer: customer ? { name: customer.name, phone: customer.phone } : null,
      store: store ? { name: store.name, phone: store.phone, address: store.address } : null,
      timeline,
      nextReminders,
    });
  }

  // GET /posters/daily — 今日朋友圈海报（3张）
  if (url === '/posters/daily' && method === 'GET') {
    const today = new Date().toISOString().slice(0, 10);
    return ok({
      date: today,
      items: mockPosters.map(p => ({ ...p })),
      total: mockPosters.length,
    });
  }

  // POST /posters/:id/publish — 标记海报已发布到朋友圈
  const posterPublishMatch = url.match(/^\/posters\/([^/]+)\/publish$/);
  if (posterPublishMatch && method === 'POST') {
    const poster = mockPosters.find(p => p.id === posterPublishMatch[1]);
    if (poster) poster.published = true;
    return ok({ ...(poster || {}), published: true });
  }

  // fallback
  return ok({});
}

// ─── 对外接口：兼容原有 axios 调用方式 ───
// api.get(url, { params }) / api.post(url, data, config)
const api = {
  get: (url: string, config?: { params?: Record<string, any> }) => mockRequest('GET', url, undefined, config?.params),
  post: (url: string, data?: any, _config?: any) => mockRequest('POST', url, data),
  put: (url: string, data?: any, _config?: any) => mockRequest('PUT', url, data),
  delete: (url: string) => mockRequest('DELETE', url),
};

export default api;
