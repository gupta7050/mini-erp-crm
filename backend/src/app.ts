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

// Healthcheck & Docs Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    app: 'Mini ERP + CRM Operations Portal API',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
    documentation: '/api/docs',
    healthDocx: '/api/health/docx'
  });
});

app.get(['/api/health/docx', '/api/docs'], (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Mini ERP + CRM API Documentation</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 2rem; }
        .container { max-width: 900px; margin: 0 auto; background: #1e293b; padding: 2rem; border-radius: 1rem; border: 1px solid #334155; }
        h1 { color: #818cf8; border-b: 1px solid #334155; padding-bottom: 0.5rem; }
        h2 { color: #38bdf8; margin-top: 1.5rem; }
        code { background: #0f172a; color: #f43f5e; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: monospace; }
        .badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 0.375rem; font-weight: bold; font-size: 0.75rem; }
        .post { background: #10b98122; color: #34d399; }
        .get { background: #3b82f622; color: #60a5fa; }
        .put { background: #f59e0b22; color: #fbbf24; }
        .patch { background: #8b5cf622; color: #c084fc; }
        table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #334155; font-size: 0.875rem; }
        th { background: #0f172a; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Mini ERP + CRM Operations Portal API Documentation</h1>
        <p>System Status: <strong style="color:#34d399">ONLINE (200 OK)</strong></p>
        
        <h2>🔑 Demo Credentials</h2>
        <table>
          <tr><th>Role</th><th>Email</th><th>Password</th></tr>
          <tr><td>Admin</td><td><code>admin@minierp.com</code></td><td><code>Password@123</code></td></tr>
          <tr><td>Sales</td><td><code>sales@minierp.com</code></td><td><code>Password@123</code></td></tr>
          <tr><td>Warehouse</td><td><code>warehouse@minierp.com</code></td><td><code>Password@123</code></td></tr>
          <tr><td>Accounts</td><td><code>accounts@minierp.com</code></td><td><code>Password@123</code></td></tr>
        </table>

        <h2>📡 REST Endpoints Specification</h2>
        <table>
          <tr><th>Method</th><th>Endpoint</th><th>Description</th></tr>
          <tr><td><span class="badge post">POST</span></td><td><code>/api/auth/login</code></td><td>Authenticate user & return JWT token</td></tr>
          <tr><td><span class="badge get">GET</span></td><td><code>/api/auth/me</code></td><td>Get current active user profile</td></tr>
          <tr><td><span class="badge get">GET</span></td><td><code>/api/customers</code></td><td>List customers with search, status & type filter</td></tr>
          <tr><td><span class="badge post">POST</span></td><td><code>/api/customers</code></td><td>Create new CRM customer</td></tr>
          <tr><td><span class="badge post">POST</span></td><td><code>/api/customers/:id/followups</code></td><td>Add follow-up timeline note</td></tr>
          <tr><td><span class="badge get">GET</span></td><td><code>/api/products</code></td><td>List products & inventory stock alerts</td></tr>
          <tr><td><span class="badge post">POST</span></td><td><code>/api/products</code></td><td>Create new product item</td></tr>
          <tr><td><span class="badge post">POST</span></td><td><code>/api/products/:id/adjust-stock</code></td><td>Adjust Stock IN / OUT with reason</td></tr>
          <tr><td><span class="badge get">GET</span></td><td><code>/api/products/movements</code></td><td>Get stock audit logs</td></tr>
          <tr><td><span class="badge get">GET</span></td><td><code>/api/challans</code></td><td>List sales challans</td></tr>
          <tr><td><span class="badge post">POST</span></td><td><code>/api/challans</code></td><td>Create sales challan & atomic stock reduction</td></tr>
          <tr><td><span class="badge patch">PATCH</span></td><td><code>/api/challans/:id/status</code></td><td>Confirm or cancel sales challan</td></tr>
          <tr><td><span class="badge get">GET</span></td><td><code>/api/dashboard/stats</code></td><td>Get operational metrics & revenue stats</td></tr>
        </table>
      </div>
    </body>
    </html>
  `);
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
