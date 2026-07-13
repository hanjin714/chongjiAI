import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/sync/status', async (req: AuthRequest, res, next) => {
  try {
    const storeId = req.user?.storeId;

    if (!storeId) {
      return res.json({
        success: true,
        data: {
          connected: false,
          autoSync: false,
          petCount: 0,
          petSynced: 0,
          customerCount: 0,
          customerSynced: 0,
          orderCount: 0,
          orderSynced: 0,
          taskCount: 0,
          taskSynced: 0,
          lastSyncTime: null,
        },
      });
    }

    const [petCount, customerCount, orderCount, taskCount] = await Promise.all([
      prisma.pet.count({ where: { storeId } }),
      prisma.customer.count({ where: { storeId } }),
      prisma.salesOrder.count({ where: { storeId } }),
      prisma.task.count({ where: { storeId } }),
    ]);

    const [petSynced, customerSynced, orderSynced, taskSynced] = await Promise.all([
      prisma.pet.count({ where: { storeId, feishuSyncStatus: 'SUCCESS' } }),
      prisma.customer.count({ where: { storeId, feishuSyncStatus: 'SUCCESS' } }),
      prisma.salesOrder.count({ where: { storeId, feishuSyncStatus: 'SUCCESS' } }),
      prisma.task.count({ where: { storeId, feishuSyncStatus: 'SUCCESS' } }),
    ]);

    const lastLog = await prisma.syncLog.findFirst({
      where: {
        tenantId: req.user!.tenantId,
        target: 'FEISHU',
      },
      orderBy: { startedAt: 'desc' },
    });

    res.json({
      success: true,
      data: {
        connected: !!process.env.FEISHU_APP_ID,
        autoSync: true,
        petCount,
        petSynced,
        customerCount,
        customerSynced,
        orderCount,
        orderSynced,
        taskCount,
        taskSynced,
        lastSyncTime: lastLog?.startedAt || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/sync/logs', async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const logs = await prisma.syncLog.findMany({
      where: {
        tenantId: req.user!.tenantId,
        target: 'FEISHU',
      },
      orderBy: { startedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const total = await prisma.syncLog.count({
      where: {
        tenantId: req.user!.tenantId,
        target: 'FEISHU',
      },
    });

    res.json({
      success: true,
      data: {
        items: logs.map((log) => ({
          id: log.id,
          module: log.bizObject === 'ALL' ? 'FULL' : log.bizObject,
          status: log.status === 'SUCCESS' ? 'SUCCESS' : log.status === 'PARTIAL' ? 'PARTIAL' : 'FAILED',
          recordsSynced: 0,
          recordsTotal: 0,
          errorCount: log.status === 'FAILED' ? 1 : 0,
          errorMessage: log.errorMessage,
          createdAt: log.startedAt,
        })),
        total,
        page,
        pageSize,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/sync/trigger', async (req: AuthRequest, res, next) => {
  try {
    const syncEvent = await prisma.syncEvent.create({
      data: {
        tenantId: req.user!.tenantId,
        bizObject: 'ALL',
        bizId: req.user!.storeId || req.user!.tenantId,
        action: 'SYNC',
        target: 'FEISHU',
        status: 'PENDING',
      },
    });

    res.json({
      success: true,
      data: {
        syncEventId: syncEvent.id,
        message: '同步任务已启动',
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
