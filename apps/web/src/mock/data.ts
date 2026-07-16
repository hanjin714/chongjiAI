// 宠迹AI 演示数据 — 纯前端 Mock

const IMG = (seed: string) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(seed)}&image_size=square`;

// ─── 用户 ───
export const mockUsers = [
  { id: 'u1', name: '张老板', phone: '13800000000', role: 'TENANT_OWNER' as const, tenantId: 't1', storeId: 's1', tenantName: '宠爱有家', storeName: '静安旗舰店' },
  { id: 'u2', name: '李小花', phone: '13800000001', role: 'SALES' as const, tenantId: 't1', storeId: 's1', tenantName: '宠爱有家', storeName: '静安旗舰店' },
  { id: 'u3', name: '王饲养', phone: '13800000002', role: 'KEEPER' as const, tenantId: 't1', storeId: 's1', tenantName: '宠爱有家', storeName: '静安旗舰店' },
  { id: 'u4', name: '赵店长', phone: '13800000003', role: 'STORE_MANAGER' as const, tenantId: 't1', storeId: 's1', tenantName: '宠爱有家', storeName: '静安旗舰店' },
  { id: 'u5', name: '陈销售', phone: '13800000004', role: 'SALES' as const, tenantId: 't1', storeId: 's1', tenantName: '宠爱有家', storeName: '静安旗舰店' },
];

// ─── 宠物 ───
export const mockPets = [
  { id: 'p1', name: '团团', species: '猫', breed: '英短蓝猫', gender: '公', birthDate: '2024-03-15', weight: 4.2, color: '蓝灰色', photoUrl: IMG('cute british shorthair blue cat sitting, studio photo, pet photography'), status: 'AVAILABLE', storeId: 's1', customerId: null, price: 3800, description: '性格温顺，已做两针疫苗', microchip: 'CN20240315001', source: '自家繁育', entryDate: '2024-06-01' },
  { id: 'p2', name: '小橘', species: '猫', breed: '橘猫', gender: '公', birthDate: '2024-01-20', weight: 5.8, color: '橘色', photoUrl: IMG('cute orange tabby cat playing, studio photo, pet photography'), status: 'AVAILABLE', storeId: 's1', customerId: null, price: 1200, description: '能吃能睡，活泼好动', microchip: 'CN20240120002', source: '客户寄养', entryDate: '2024-05-15' },
  { id: 'p3', name: '贝贝', species: '狗', breed: '柯基', gender: '母', birthDate: '2024-05-08', weight: 6.5, color: '黄白双色', photoUrl: IMG('cute corgi puppy sitting, studio photo, pet photography'), status: 'SOLD', storeId: 's1', customerId: 'c1', price: 6800, description: '小短腿，萌萌的蜜桃臀', microchip: 'CN20240508003', source: '正规犬舍', entryDate: '2024-07-10' },
  { id: 'p4', name: '雪球', species: '猫', breed: '布偶猫', gender: '母', birthDate: '2024-02-14', weight: 3.8, color: '白手套', photoUrl: IMG('beautiful ragdoll cat with blue eyes, studio photo, pet photography'), status: 'AVAILABLE', storeId: 's1', customerId: null, price: 8800, description: '仙女猫，性格粘人', microchip: 'CN20240214004', source: '自家繁育', entryDate: '2024-06-20', reservedBy: { salesId: 'u5', salesName: '陈销售', customerName: '王女士', customerPhone: '13900001111', reservedAt: '2025-01-15T10:00:00Z' } },
  { id: 'p5', name: '旺财', species: '狗', breed: '金毛', gender: '公', birthDate: '2023-12-01', weight: 15.2, color: '金色', photoUrl: IMG('golden retriever dog smiling, studio photo, pet photography'), status: 'AVAILABLE', storeId: 's1', customerId: null, price: 4500, description: '暖男一枚，已做完所有疫苗', microchip: 'CN20231201005', source: '正规犬舍', entryDate: '2024-04-01', reservedBy: { salesId: 'u2', salesName: '李小花', customerName: '刘同学', customerPhone: '13555559999', reservedAt: '2025-01-15T11:30:00Z' } },
  { id: 'p6', name: '芒果', species: '猫', breed: '美短虎斑', gender: '公', birthDate: '2024-04-22', weight: 3.6, color: '银虎斑', photoUrl: IMG('american shorthair silver tabby cat, studio photo, pet photography'), status: 'AVAILABLE', storeId: 's1', customerId: null, price: 2800, description: '花纹清晰，活泼可爱', microchip: 'CN20240422006', source: '自家繁育', entryDate: '2024-08-01' },
  { id: 'p7', name: '豆豆', species: '狗', breed: '泰迪', gender: '母', birthDate: '2024-06-10', weight: 2.8, color: '棕色', photoUrl: IMG('cute brown toy poodle puppy, studio photo, pet photography'), status: 'SOLD', storeId: 's1', customerId: 'c2', price: 3500, description: '不掉毛，已做两针疫苗', microchip: 'CN20240610007', source: '正规犬舍', entryDate: '2024-09-01' },
  { id: 'p8', name: '棉花', species: '兔', breed: '垂耳兔', gender: '母', birthDate: '2024-07-05', weight: 1.5, color: '白色', photoUrl: IMG('cute white lop eared rabbit, studio photo, pet photography'), status: 'AVAILABLE', storeId: 's1', customerId: null, price: 580, description: '软萌可爱，适合新手', microchip: '', source: '合作养殖场', entryDate: '2024-10-01' },
];

// ─── 客户 ───
export const mockCustomers = [
  { id: 'c1', name: '林小姐', phone: '13912345678', riskLevel: 'LOW', tenantId: 't1', storeId: 's1', tag: 'VIP', petIds: ['p3'], totalSpent: 12800, lastContactAt: '2025-01-10', remark: '对布偶猫感兴趣，预算1万以内' },
  { id: 'c2', name: '陈先生', phone: '13898765432', riskLevel: 'MEDIUM', tenantId: 't1', storeId: 's1', tag: '新客户', petIds: ['p7'], totalSpent: 4500, lastContactAt: '2025-01-08', remark: '第一次买宠物，需要多引导' },
  { id: 'c3', name: '王太太', phone: '13666668888', riskLevel: 'HIGH', tenantId: 't1', storeId: 's1', tag: '流失预警', petIds: [], totalSpent: 2300, lastContactAt: '2024-11-20', remark: '上次咨询后未回复，需要主动跟进' },
  { id: 'c4', name: '刘同学', phone: '13555559999', riskLevel: 'LOW', tenantId: 't1', storeId: 's1', tag: '学生优惠', petIds: [], totalSpent: 800, lastContactAt: '2025-01-12', remark: '想领养一只猫，预算有限' },
  { id: 'c5', name: '张总', phone: '13777776666', riskLevel: 'LOW', tenantId: 't1', storeId: 's1', tag: 'VIP', petIds: [], totalSpent: 35000, lastContactAt: '2025-01-13', remark: '多次购买，正在考虑再入一只布偶' },
];

// ─── 套餐 ───
export const mockPackages = [
  { id: 'pk1', name: '新手养猫套餐', description: '适合第一次养猫的客户，包含疫苗、驱虫、猫粮和猫砂', price: 1280, originalPrice: 1580, stock: 15, sold: 32, imageUrl: IMG('cat care starter package with food and toys, product photography, clean white background'), category: '猫', isActive: true, storeId: 's1' },
  { id: 'pk2', name: '精品美容洗护套餐', description: '专业宠物美容师，含洗澡、修毛、指甲修剪、耳道清洁', price: 298, originalPrice: 398, stock: 50, sold: 87, imageUrl: IMG('pet grooming service package, dog getting bath, professional pet salon, product photography'), category: '通用', isActive: true, storeId: 's1' },
  { id: 'pk3', name: '年度健康守护卡', description: '全年不限次数体检，含4次疫苗和12次驱虫', price: 3680, originalPrice: 5200, stock: 30, sold: 18, imageUrl: IMG('pet health annual checkup card, veterinarian examining pet, professional medical care, product photography'), category: '通用', isActive: true, storeId: 's1' },
  { id: 'pk4', name: '寄养安心包', description: '7天寄养+每日视频汇报+回家洗护一次', price: 1580, originalPrice: 2100, stock: 20, sold: 45, imageUrl: IMG('pet boarding hotel service, comfortable cat and dog hotel room, professional pet care, product photography'), category: '通用', isActive: true, storeId: 's1' },
  { id: 'pk5', name: '狗狗基础训练课', description: '10节课，含坐下、握手、随行、不扑人等基础指令', price: 1980, originalPrice: 2500, stock: 8, sold: 12, imageUrl: IMG('dog training class, golden retriever learning to sit, professional dog trainer, product photography'), category: '狗', isActive: true, storeId: 's1' },
  { id: 'pk6', name: '猫咪绝育安心套餐', description: '含术前检查+手术+术后护理+7天住院', price: 1280, originalPrice: 1800, stock: 25, sold: 56, imageUrl: IMG('cat neutering surgery care package, veterinary clinic, professional pet surgery, product photography'), category: '猫', isActive: true, storeId: 's1' },
];

// ─── 任务 ───
export const mockTasks = [
  { id: 't1', title: '回访林小姐', description: '布偶猫到货后第一时间通知，她一直在等', priority: 'HIGH', status: 'PENDING', assigneeId: 'u2', assigneeName: '李小花', dueDate: '2025-01-14', type: 'FOLLOW_UP', petId: 'p4', customerId: 'c1' },
  { id: 't2', title: '陈先生7天回访', description: '豆豆卖出7天了，打电话问一下适应情况', priority: 'MEDIUM', status: 'PENDING', assigneeId: 'u2', assigneeName: '李小花', dueDate: '2025-01-15', type: 'FOLLOW_UP', petId: 'p7', customerId: 'c2' },
  { id: 't3', title: '王太太流失挽回', description: '超过45天未消费，需要主动联系推荐新品', priority: 'HIGH', status: 'PENDING', assigneeId: 'u5', assigneeName: '陈销售', dueDate: '2025-01-13', type: 'FOLLOW_UP', customerId: 'c3' },
  { id: 't4', title: '团团疫苗接种', description: '第三针疫苗需要今天打', priority: 'HIGH', status: 'COMPLETED', assigneeId: 'u3', assigneeName: '王饲养', dueDate: '2025-01-10', type: 'HEALTH', petId: 'p1' },
  { id: 't5', title: '门店消毒', description: '每周一次全店消毒，重点猫舍区域', priority: 'LOW', status: 'COMPLETED', assigneeId: 'u3', assigneeName: '王饲养', dueDate: '2025-01-12', type: 'DAILY' },
  { id: 't6', title: '补货猫粮', description: '皇家K36猫粮库存不足，需要补货', priority: 'MEDIUM', status: 'PENDING', assigneeId: 'u4', assigneeName: '赵店长', dueDate: '2025-01-16', type: 'INVENTORY' },
  { id: 't7', title: '朋友圈内容发布', description: '拍雪球的新照片，配文推布偶猫', priority: 'LOW', status: 'PENDING', assigneeId: 'u2', assigneeName: '李小花', dueDate: '2025-01-14', type: 'MARKETING', petId: 'p4' },
  { id: 't8', title: '小红书种草文', description: '新手养猫套餐推广笔记', priority: 'MEDIUM', status: 'COMPLETED', assigneeId: 'u5', assigneeName: '陈销售', dueDate: '2025-01-11', type: 'MARKETING' },
];

// ─── 门店 ───
export const mockStores = [
  { id: 's1', name: '静安旗舰店', address: '上海市静安区南京西路1268号', phone: '021-62881234', tenantId: 't1', petCount: 6, employeeCount: 5, monthlyRevenue: 128000, status: 'ACTIVE' },
  { id: 's2', name: '浦东分店', address: '上海市浦东新区陆家嘴环路1000号', phone: '021-58885678', tenantId: 't1', petCount: 4, employeeCount: 3, monthlyRevenue: 86000, status: 'ACTIVE' },
];

// ─── 日报 ───
export const mockDailyReport = {
  date: '2025-01-13',
  totalRevenue: 12680,
  orderCount: 8,
  newCustomerCount: 3,
  petSold: 2,
  pendingTasks: 5,
  weeklyRevenue: [8600, 10200, 9800, 12300, 11500, 10800, 12680],
  weekLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  topSelling: [
    { name: '精品美容洗护套餐', count: 5 },
    { name: '新手养猫套餐', count: 3 },
    { name: '年度健康守护卡', count: 2 },
  ],
  recentOrders: [
    { id: 'so1', customerName: '林小姐', amount: 6800, items: '贝贝(柯基)', time: '14:30' },
    { id: 'so2', customerName: '陈先生', amount: 3500, items: '豆豆(泰迪)', time: '11:20' },
    { id: 'so3', customerName: '张总', amount: 3680, items: '年度健康守护卡', time: '09:45' },
  ],
  riskAlerts: [
    { customerId: 'c3', customerName: '王太太', reason: '45天未到店消费', riskLevel: 'HIGH' },
  ],
};

// ─── 飞书同步 ───
export const mockFeishuStatus = {
  connected: true,
  lastSyncAt: '2025-01-13 14:30:00',
  syncCount: 156,
  bitableUrl: 'https://example.feishu.cn/base/basencxxx',
};

export const mockFeishuLogs = [
  { id: 'fl1', type: 'PET_SYNC', status: 'SUCCESS', message: '同步8只宠物信息', createdAt: '2025-01-13 14:30:00' },
  { id: 'fl2', type: 'ORDER_SYNC', status: 'SUCCESS', message: '同步3笔销售订单', createdAt: '2025-01-13 14:30:00' },
  { id: 'fl3', type: 'CUSTOMER_SYNC', status: 'SUCCESS', message: '同步5位客户信息', createdAt: '2025-01-13 14:29:00' },
  { id: 'fl4', type: 'TASK_SYNC', status: 'SUCCESS', message: '同步8条任务记录', createdAt: '2025-01-13 14:29:00' },
  { id: 'fl5', type: 'PET_SYNC', status: 'FAILED', message: '上次同步超时，已自动重试', createdAt: '2025-01-12 09:00:00' },
];

// ─── 宠物健康日志 ───
export const mockHealthLogs = [
  { id: 'hl1', petId: 'p1', type: 'VACCINE', content: '第三针妙三多疫苗', operatorName: '王饲养', createdAt: '2025-01-10 10:30' },
  { id: 'hl2', petId: 'p1', type: 'DEWORM', content: '体内外驱虫（大宠爱）', operatorName: '王饲养', createdAt: '2025-01-05 14:00' },
  { id: 'hl3', petId: 'p1', type: 'GROOMING', content: '洗澡+梳毛', operatorName: '王饲养', createdAt: '2025-01-08 09:00' },
  { id: 'hl4', petId: 'p2', type: 'VACCINE', content: '第二针妙三多疫苗', operatorName: '王饲养', createdAt: '2025-01-06 11:00' },
  { id: 'hl5', petId: 'p2', type: 'FEED', content: '皇家K36猫粮 80g', operatorName: '王饲养', createdAt: '2025-01-13 08:30' },
  { id: 'hl6', petId: 'p4', type: 'CHECKUP', content: '体检：体重3.8kg，体温38.5℃，精神良好', operatorName: '王饲养', createdAt: '2025-01-12 15:00' },
  { id: 'hl7', petId: 'p5', type: 'GROOMING', content: '洗澡+修毛+剪指甲', operatorName: '王饲养', createdAt: '2025-01-11 10:00' },
  { id: 'hl8', petId: 'p5', type: 'VACCINE', content: '狂犬疫苗', operatorName: '王饲养', createdAt: '2025-01-03 09:30' },
];

// ─── AI 对话预设 ───
const aiResponses: Record<string, string[]> = {
  default: [
    '根据当前数据分析，门店经营状况良好。本周营收环比增长12%，主要驱动力来自美容洗护套餐的销售提升。',
    '建议关注以下几点：\n1. 王太太已45天未到店，建议本周主动电话回访\n2. 布偶猫"雪球"咨询量最高，可以加大推广\n3. 新手养猫套餐复购率不错，可以考虑推出升级版',
    '当前库存中有6只待售宠物，其中猫咪4只、狗狗2只。建议本周末推出"猫咪节"活动，带动猫咪销售。',
  ],
  宠物: [
    '目前店内有8只宠物，其中待售6只（猫4只、狗1只、兔1只），已售2只。\n\n热门品种分析：\n- 布偶猫咨询量最高，建议重点推广\n- 柯基和泰迪近期成交快，可考虑增加库存\n- 垂耳兔作为差异化品种，适合小红书种草',
  ],
  客户: [
    '客户画像分析：\n\n• VIP客户2位（林小姐、张总），贡献了65%的营收\n• 流失预警1位（王太太），45天未到店\n• 新客户1位（陈先生），需要加强引导\n\n建议：\n1. 对VIP客户推送新品到货提醒\n2. 本周主动联系王太太，推荐猫咪节优惠\n3. 给陈先生发送新手养宠指南',
  ],
  套餐: [
    '套餐销售分析：\n\n🔥 爆款：精品美容洗护套餐 — 已售87份\n📈 增长最快：年度健康守护卡 — 复购率40%\n⭐ 好评最高：新手养猫套餐 — 好评率98%\n\n建议：\n1. 美容洗护套餐可搭配寄养安心包做组合优惠\n2. 猫咪绝育安心套餐需求旺盛，可加大推广\n3. 考虑推出"狗狗生日派对"新套餐',
  ],
  业绩: [
    '📊 本月销售业绩排行：\n\n🥇 张销售 — ¥48,200（18只）\n🥈 李销售 — ¥42,800（15只）\n🥉 王销售 — ¥37,560（14只）\n\n💡 张销售表现突出，她的客户复购率也最高，可以总结下经验分享给团队～',
  ],
  文案: [
    '📱 朋友圈推广文案：\n\n🐾 新来的小可爱们报到啦！\n\n本月新到8只超萌小宝贝\n英短/布偶/柯基/金毛全都有\n疫苗全 · 健康保障 · 售后无忧\n\n📍 宠爱有家·静安旗舰店\n📞 私信了解详情\n\n来店即送新手大礼包哦～\n\n#宠物店 #猫咪 #狗狗 #萌宠',
    '📱 小红书种草文案：\n\n标题：这家宠物店的布偶猫也太仙了吧！🥺\n\n今天去看了闺蜜推荐的宠物店，被这只布偶猫美哭了！蓝眼睛白手套，性格还超粘人～\n\n店主说所有宠物都有疫苗证和健康档案，售后还送新手套餐，太贴心了！\n\n📍 宠爱有家·静安区\n💰 布偶猫 ¥8,800起\n\n#布偶猫 #宠物店推荐 #上海宠物店 #新手养猫',
  ],
  库存: [
    '📦 当前库存分析：\n\n在售宠物6只：\n  🐱 猫咪4只 — 英短/橘猫/布偶/美短\n  🐶 狗狗1只 — 金毛\n  🐰 兔子1只 — 垂耳兔\n\n已售2只：柯基贝贝、泰迪豆豆\n\n💡 建议：\n1. 布偶猫咨询量最高，可重点推广\n2. 狗狗品类较少，可考虑补货\n3. 垂耳兔适合做差异化营销',
  ],
  分析: [
    '📈 本月经营分析：\n\n总营收：¥128,560（环比+23.5%）\n订单数：47单\n新客户：12位\n复购率：38.2%\n\n🔍 关键发现：\n1. 猫咪类销售占比65%，是主力品类\n2. 美容洗护套餐复购率最高（40%）\n3. 周末客流量是工作日的2.3倍\n\n💡 建议：\n• 周末增加人手\n• 推出猫咪主题日活动\n• 对老客户推送复购优惠',
  ],
  任务: [
    '今日待办任务5项：\n\n🔴 高优先级：\n- 回访林小姐（布偶猫到货通知）\n- 王太太流失挽回\n\n🟡 中优先级：\n- 陈先生7天回访\n- 补货猫粮\n\n🟢 低优先级：\n- 朋友圈内容发布\n\n建议优先处理高优先级的客户回访任务。',
  ],
};

export function getAiResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('宠物') || lower.includes('猫') || lower.includes('狗')) {
    return aiResponses['宠物'][Math.floor(Math.random() * aiResponses['宠物'].length)];
  }
  if (lower.includes('客户') || lower.includes('回访') || lower.includes('vip')) {
    return aiResponses['客户'][Math.floor(Math.random() * aiResponses['客户'].length)];
  }
  if (lower.includes('套餐') || lower.includes('卖') || lower.includes('库存')) {
    return aiResponses['套餐'][Math.floor(Math.random() * aiResponses['套餐'].length)];
  }
  if (lower.includes('业绩') || lower.includes('销售排行') || lower.includes('谁卖')) {
    return aiResponses['业绩'][0];
  }
  if (lower.includes('文案') || lower.includes('朋友圈') || lower.includes('小红书') || lower.includes('推广')) {
    return aiResponses['文案'][Math.floor(Math.random() * aiResponses['文案'].length)];
  }
  if (lower.includes('库存') || lower.includes('剩多少') || lower.includes('几只')) {
    return aiResponses['库存'][0];
  }
  if (lower.includes('分析') || lower.includes('报表') || lower.includes('经营') || lower.includes('数据')) {
    return aiResponses['分析'][0];
  }
  if (lower.includes('任务') || lower.includes('待办') || lower.includes('提醒')) {
    return aiResponses['任务'][Math.floor(Math.random() * aiResponses['任务'].length)];
  }
  return aiResponses['default'][Math.floor(Math.random() * aiResponses['default'].length)];
}

// ─── 销售订单 ───
export const mockSalesOrders = [
  { id: 'so1', petId: 'p3', petName: '贝贝', customerId: 'c1', customerName: '林小姐', packageId: 'pk3', packageName: '年度健康守护卡', totalAmount: 10480, status: 'COMPLETED', createdAt: '2025-01-13 14:30', salesId: 'u2', salesName: '李小花' },
  { id: 'so2', petId: 'p7', petName: '豆豆', customerId: 'c2', customerName: '陈先生', packageId: 'pk1', packageName: '新手养猫套餐', totalAmount: 4780, status: 'COMPLETED', createdAt: '2025-01-13 11:20', salesId: 'u5', salesName: '陈销售' },
];

// ─── 每日朋友圈海报 ───
// 3 张海报对应 3 只在售宠物（status='AVAILABLE' → IN_STOCK）
export const mockPosters = [
  {
    id: 'po1',
    petId: 'p4',
    petName: '雪球',
    breed: '布偶猫',
    color: '白手套',
    gender: '母',
    salePrice: 8800,
    photoUrl: mockPets.find(p => p.id === 'p4')!.photoUrl,
    caption: '🐾 仙气飘飘的布偶妹妹找新家啦！\n💎 蓝宝石般的大眼睛 + 白手套\n🎀 性格超温柔，是个粘人小公主\n💉 疫苗齐全 · 健康档案完整\n✨ 二胎家庭首选～有想看小可爱本人的吗？评论区留言哦～',
    hashtags: ['#布偶猫', '#仙女猫', '#宠物店', '#上海宠物店'],
    storeName: '静安旗舰店',
    generatedAt: '2025-01-14 09:00',
    published: false,
  },
  {
    id: 'po2',
    petId: 'p5',
    petName: '旺财',
    breed: '金毛',
    color: '金色',
    gender: '公',
    salePrice: 4500,
    photoUrl: mockPets.find(p => p.id === 'p5')!.photoUrl,
    caption: '🐕 暖男金毛弟弟等你带回家！\n🦮 金色毛发 + 阳光笑容，治愈系代表\n🤗 已完成全部疫苗，性格亲人\n🎯 适合家庭饲养，孩子的好伙伴\n🚗 支持上门看狗，先到先得哦～私信我预约吧！',
    hashtags: ['#金毛', '#暖男狗狗', '#宠物店', '#萌宠'],
    storeName: '静安旗舰店',
    generatedAt: '2025-01-14 09:00',
    published: false,
  },
  {
    id: 'po3',
    petId: 'p1',
    petName: '团团',
    breed: '英短蓝猫',
    color: '蓝灰色',
    gender: '公',
    salePrice: 3800,
    photoUrl: mockPets.find(p => p.id === 'p1')!.photoUrl,
    caption: '🐱 圆脸蓝灰弟弟求带走～\n💆 蓝灰色绒毛 + 圆嘟嘟包子脸\n💤 性格温顺，已做两针疫苗\n✨ 英短经典款，新手友好\n💕 喜欢就私信我了解详情吧～来店有惊喜哦！',
    hashtags: ['#英短蓝猫', '#宠物店', '#萌宠', '#新手养猫'],
    storeName: '静安旗舰店',
    generatedAt: '2025-01-14 09:00',
    published: false,
  },
];

// ─── 销售每日日报模板 ───
export const mockDailyReportTemplate = (salesId: string) => ({
  date: new Date().toISOString().slice(0, 10),
  salesId,
  soldPets: [
    { id: 'p1', name: '雪球', breed: '布偶猫', salePrice: 8000, customerName: '张先生' },
    { id: 'p3', name: '团团', breed: '英短蓝猫', salePrice: 3500, customerName: '李女士' },
  ],
  reservedPets: [
    { id: 'p2', name: '旺财', breed: '金毛', salePrice: 12000, customerName: '王女士', customerPhone: '13900001111' },
  ],
  submittedReport: null as string | null,
});
