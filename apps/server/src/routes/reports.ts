import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth.js';
import { PetStatus, Role, TaskStatus } from '../constants/enums.js';

const router = Router();

router.use(authMiddleware);

router.get('/daily-report', requireRole(Role.TENANT_OWNER, Role.STORE_MANAGER), async (req: AuthRequest, res) => {
  try {
    const { storeId } = req.query as { storeId?: string };

    const storeWhere: any = { tenantId: req.user!.tenantId };
    if (storeId) {
      storeWhere.storeId = storeId;
    } else if (req.user!.storeId) {
      storeWhere.storeId = req.user!.storeId;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      inStockPets,
      reservedPets,
      soldPets,
      todayOrders,
      weekOrders,
      todoTasks,
      todayCompletedTasks,
      highPriorityTasks,
      highRiskCustomers,
      sickPets,
      failedSyncPets,
      employees,
    ] = await Promise.all([
      prisma.pet.count({ where: { ...storeWhere, status: PetStatus.IN_STOCK, deletedAt: null } }),
      prisma.pet.count({ where: { ...storeWhere, status: PetStatus.RESERVED, deletedAt: null } }),
      prisma.pet.count({ where: { ...storeWhere, status: PetStatus.SOLD, deletedAt: null } }),
      prisma.salesOrder.count({ where: { ...storeWhere, createdAt: { gte: today, lt: tomorrow } } }),
      prisma.salesOrder.count({ where: { ...storeWhere, createdAt: { gte: sevenDaysAgo } } }),
      prisma.task.count({ where: { ...storeWhere, status: TaskStatus.TODO } }),
      prisma.task.count({ where: { ...storeWhere, status: TaskStatus.DONE, completedAt: { gte: today, lt: tomorrow } } }),
      prisma.task.count({ where: { ...storeWhere, status: TaskStatus.TODO, priority: 'HIGH' } }),
      prisma.customer.count({ where: { ...storeWhere, riskLevel: 'HIGH' } }),
      prisma.pet.count({ where: { ...storeWhere, healthStatus: { in: ['SICK', 'OBSERVATION'] }, deletedAt: null } }),
      prisma.pet.count({ where: { ...storeWhere, feishuSyncStatus: 'FAILED', deletedAt: null } }),
      prisma.user.count({ where: { ...storeWhere, active: true, role: { in: [Role.SALES, Role.KEEPER, Role.STORE_MANAGER] } } }),
    ]);

    const risks = [];
    const opportunities = [];

    if (highRiskCustomers > 0) {
      risks.push({
        type: 'HIGH_RISK_CUSTOMERS',
        title: `${highRiskCustomers} 位高风险客户`,
        description: '需要及时跟进处理，防止投诉或流失',
        priority: 'HIGH',
        action: '查看高风险客户',
      });
    }

    if (sickPets > 0) {
      risks.push({
        type: 'SICK_PETS',
        title: `${sickPets} 只健康异常宠物`,
        description: '需要饲养员持续关注和护理',
        priority: 'HIGH',
        action: '查看健康异常宠物',
      });
    }

    if (highPriorityTasks > 0) {
      risks.push({
        type: 'HIGH_PRIORITY_TASKS',
        title: `${highPriorityTasks} 个高优先级任务未完成`,
        description: '建议今日优先处理',
        priority: 'MEDIUM',
        action: '查看待办任务',
      });
    }

    if (failedSyncPets > 0) {
      risks.push({
        type: 'FAILED_SYNC',
        title: `${failedSyncPets} 条飞书同步失败`,
        description: '请检查同步状态并重试',
        priority: 'LOW',
        action: '查看同步日志',
      });
    }

    if (inStockPets > 0 && weekOrders < 5) {
      opportunities.push({
        type: 'INVENTORY_OPPORTUNITY',
        title: `有 ${inStockPets} 只在售宠物`,
        description: '建议加大推广力度，促进成交',
        action: '查看在售宠物',
      });
    }

    if (reservedPets > 0) {
      opportunities.push({
        type: 'RESERVED_PETS',
        title: `${reservedPets} 只已预定宠物`,
        description: '跟进预定客户，促进成交转化',
        action: '查看预定宠物',
      });
    }

    const summary = `今天建议优先处理 ${Math.min(3, risks.length)} 件事：\n` +
      risks.slice(0, 3).map((r, i) => `${i + 1}. ${r.title}${r.description ? '，' + r.description : ''}`).join('\n');

    return successResponse(res, {
      summary,
      date: today.toISOString().split('T')[0],
      stats: {
        inStockPets,
        reservedPets,
        soldPets,
        todayOrders,
        weekOrders,
        todoTasks,
        todayCompletedTasks,
        highPriorityTasks,
        highRiskCustomers,
        sickPets,
        failedSyncPets,
        employees,
      },
      risks,
      opportunities,
    });
  } catch (error) {
    console.error('Get daily report error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '获取日报失败', 500);
  }
});

router.get('/dashboard', requireRole(Role.TENANT_OWNER, Role.STORE_MANAGER), async (req: AuthRequest, res) => {
  try {
    const { storeId } = req.query as { storeId?: string };

    const storeWhere: any = { tenantId: req.user!.tenantId };
    if (storeId) {
      storeWhere.storeId = storeId;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalPets,
      inStockPets,
      totalCustomers,
      totalOrders,
      ordersThisMonth,
      tasksTotal,
      tasksCompleted,
      salesByDate,
    ] = await Promise.all([
      prisma.pet.count({ where: { ...storeWhere, deletedAt: null } }),
      prisma.pet.count({ where: { ...storeWhere, status: PetStatus.IN_STOCK, deletedAt: null } }),
      prisma.customer.count(storeWhere),
      prisma.salesOrder.count(storeWhere),
      prisma.salesOrder.count({ where: { ...storeWhere, createdAt: { gte: thirtyDaysAgo } } }),
      prisma.task.count(storeWhere),
      prisma.task.count({ where: { ...storeWhere, status: TaskStatus.DONE } }),
      prisma.salesOrder.findMany({
        where: { ...storeWhere, createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, soldPrice: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const totalSales = ordersThisMonth > 0 ? '统计中' : '0';
    const taskCompletionRate = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

    return successResponse(res, {
      totalPets,
      inStockPets,
      totalCustomers,
      totalOrders,
      ordersThisMonth,
      totalSales,
      tasksTotal,
      tasksCompleted,
      taskCompletionRate,
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    return errorResponse(res, 'INTERNAL_ERROR', '获取看板数据失败', 500);
  }
});

export default router;
