import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import storeRoutes from './routes/stores.js';
import userRoutes from './routes/users.js';
import petRoutes from './routes/pets.js';
import petLogRoutes from './routes/pet-logs.js';
import salesOrderRoutes from './routes/sales-orders.js';
import customerRoutes from './routes/customers.js';
import taskRoutes from './routes/tasks.js';
import aiRoutes from './routes/ai.js';
import reportRoutes from './routes/reports.js';
import publicRoutes from './routes/public.js';
import feishuRoutes from './routes/feishu.js';
import uploadRoutes from './routes/upload.js';
import packageRoutes from './routes/packages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      app: '宠迹 AI',
      version: '1.0.0',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/pet-logs', petLogRoutes);
app.use('/api/sales-orders', salesOrderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/feishu', feishuRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/packages', packageRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    data: null,
    error: {
      code: 'INTERNAL_ERROR',
      message: '服务器内部错误',
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 宠迹 AI 服务器已启动`);
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`📋 健康检查: http://localhost:${PORT}/api/health`);
});
