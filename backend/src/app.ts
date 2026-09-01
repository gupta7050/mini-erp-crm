import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import productRoutes from './routes/product.routes';
import challanRoutes from './routes/challan.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Healthcheck Route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    app: 'Mini ERP + CRM Operations Portal API',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv
  });
});

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server if not imported by test runner
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`🚀 Mini ERP Backend running on http://localhost:${config.port}`);
    console.log(`📡 Healthcheck API: http://localhost:${config.port}/api/health`);
  });
}

export default app;
