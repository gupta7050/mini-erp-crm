# 🏭 Mini ERP + CRM Operations Portal

> Full-stack B2B wholesale operations management system built for a **Full Stack Developer Case Study** submission.

[![Live Frontend](https://img.shields.io/badge/Live%20Frontend-Vercel-black?logo=vercel)](https://mini-erp-crm.vercel.app)
[![Live API](https://img.shields.io/badge/Live%20API-Render-46E3B7?logo=render)](https://mini-erp-crm-api.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?logo=github)](https://github.com/gupta7050/mini-erp-crm)

---

## 📋 Submission Details

| # | Requirement | Details |
|---|-------------|---------|
| 1 | **GitHub Repository** | https://github.com/gupta7050/mini-erp-crm |
| 2 | **Live Frontend URL** | https://mini-erp-crm.vercel.app |
| 3 | **Live Backend API URL** | https://mini-erp-crm-api.onrender.com |
| 4 | **Test Login Credentials** | See table below |
| 5 | **Postman Collection** | `Postman_Collection.json` in repository root |
| 6 | **README & Setup Instructions** | This file |
| 7 | **Architecture Explanation** | See Architecture section below |
| 8 | **Known Limitations** | See Known Limitations section below |

---

## 🔑 Test Login Credentials

| Role | Email | Password | Access Scope |
|:-----|:------|:---------|:-------------|
| **Admin** | `admin@minierp.com` | `Password@123` | Full access — CRM, Products, Challans, Admin settings |
| **Sales** | `sales@minierp.com` | `Password@123` | Customer management, Follow-ups, Create & Confirm Sales Challans |
| **Warehouse** | `warehouse@minierp.com` | `Password@123` | Product catalog, Stock Adjustments (IN/OUT), Audit Movement Logs |
| **Accounts** | `accounts@minierp.com` | `Password@123` | Revenue dashboard, Customer view, Challan/Invoice PDF download |

> 💡 The UI features a **"1-Click Demo Quick Switch"** widget on the login page and sidebar — evaluators can instantly test all 4 roles without typing credentials.

---

## 🚀 Live Demo

- **Frontend**: https://mini-erp-crm.vercel.app
- **Backend API**: https://mini-erp-crm-api.onrender.com
- **API Health Check**: https://mini-erp-crm-api.onrender.com/api/health
- **API Documentation**: https://mini-erp-crm-api.onrender.com/api/docs

---

## 🏗️ Architecture

### System Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                     CLIENT BROWSER                        │
│          React 18 + Vite SPA (Vercel CDN)                │
│  ┌──────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │  Auth Guard  │  │  Role RBAC │  │  PDF Generator   │  │
│  │  (JWT token) │  │  (4 roles) │  │  (jsPDF client)  │  │
│  └──────────────┘  └────────────┘  └──────────────────┘  │
└──────────────────────────┬───────────────────────────────┘
                           │ HTTPS REST API calls
                           ▼
┌──────────────────────────────────────────────────────────┐
│                   BACKEND API SERVER                      │
│       Node.js + TypeScript + Express.js (Render)         │
│  ┌──────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │  JWT Auth    │  │  Zod       │  │  Route           │  │
│  │  Middleware  │  │  Validate  │  │  Controllers     │  │
│  └──────────────┘  └────────────┘  └──────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │               Prisma ORM Layer                       │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────┘
                           │ SQL Queries
                           ▼
┌──────────────────────────────────────────────────────────┐
│             PostgreSQL Database (Render / Neon)           │
│   Users │ Customers │ Products │ StockMovements │ Challans│
└──────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology |
|:------|:-----------|
| **Frontend Framework** | React 18 + TypeScript + Vite |
| **UI Styling** | Tailwind CSS + Lucide Icons |
| **PDF Generation** | jsPDF + jsPDF-AutoTable (client-side) |
| **Client Routing** | React Router v6 with protected routes |
| **Backend Framework** | Node.js + TypeScript + Express.js |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs |
| **Validation** | Zod schema validation |
| **ORM** | Prisma ORM |
| **Database (Local)** | SQLite (zero-config dev) |
| **Database (Production)** | PostgreSQL (Render / Neon) |
| **Frontend Hosting** | Vercel (CDN global edge) |
| **Backend Hosting** | Render (Node.js Web Service) |
| **Containerization** | Docker + Docker Compose |

### Key Design Decisions

1. **Prisma ORM with dual DB support** — SQLite for zero-config local dev, PostgreSQL for production. Only a single env var change needed.
2. **Atomic stock transactions** — Confirming a Sales Challan uses a Prisma `$transaction()` block to atomically deduct stock AND create audit log entries, preventing partial writes.
3. **Snapshot pricing** — Challan items store `productName`, `productSku`, and `unitPrice` at order time so invoice accuracy is preserved even if catalog prices change later.
4. **Client-side PDF** — Tax Invoice PDF generation happens entirely in the browser using jsPDF (no server-side rendering needed, reducing backend complexity).
5. **Role-based middleware** — Each API route specifies an array of allowed roles. The `requireRole(roles[])` middleware rejects unauthorized requests with `403 Forbidden`.

### Folder Structure

```
mini-erp-crm/
├── backend/                    # Node.js + Express API
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (all 6 models)
│   │   └── seed.ts             # Demo users + sample data seeder
│   ├── src/
│   │   ├── app.ts              # Express app setup, middleware
│   │   ├── routes/             # auth, customers, products, challans, dashboard
│   │   ├── middleware/         # JWT auth, role RBAC, error handler
│   │   └── lib/                # Prisma client singleton
│   ├── .env                    # PORT, DATABASE_URL, JWT_SECRET
│   └── package.json
├── frontend/                   # React 18 + Vite SPA
│   ├── src/
│   │   ├── context/            # AuthContext (JWT state management)
│   │   ├── pages/              # Login, Dashboard, Customers, Products, Challans
│   │   ├── components/         # InvoicePDFModal, StockAdjustModal, etc.
│   │   ├── services/           # api.ts (Axios with interceptors)
│   │   └── types/              # TypeScript type definitions
│   ├── .env                    # VITE_API_URL
│   └── package.json
├── docker-compose.yml          # Full stack Docker deployment
├── Postman_Collection.json     # All API endpoints with auth
└── README.md
```

---

## 🔧 Local Setup Instructions

### Prerequisites
- **Node.js** v18 or v20+
- **npm** v8+
- **Git**

### Step 1 — Clone Repository
```bash
git clone https://github.com/gupta7050/mini-erp-crm.git
cd mini-erp-crm
```

### Step 2 — Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="mini_erp_crm_super_secret_jwt_key_2026"
NODE_ENV="development"
```

Initialize database & seed demo data:
```bash
npx prisma generate
npx prisma db push
npm run seed
```

Start backend API server:
```bash
npm run dev
# ✅ API running at http://localhost:5000
```

### Step 3 — Frontend Setup
Open a **new terminal**:
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend dev server:
```bash
npm run dev
# ✅ UI running at http://localhost:3000
```

---

## 🐳 Docker Deployment

Run the full stack with a single command:
```bash
docker-compose up --build
```
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## ☁️ Cloud Deployment Instructions

### Backend — Render.com (Free Tier)

1. **Database**: Create a free PostgreSQL DB on [Neon.tech](https://neon.tech) or [Render PostgreSQL](https://render.com).  
   Copy the `DATABASE_URL` connection string.

2. **Update Prisma schema** `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Create Web Service** on Render → Connect GitHub repo → Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push && npm run seed && npm run build`
   - **Start Command**: `node dist/app.js`
   - **Environment Variables**: `DATABASE_URL`, `JWT_SECRET`, `PORT=5000`, `NODE_ENV=production`

### Frontend — Vercel (Free Tier)

1. Import GitHub repo on [Vercel](https://vercel.com/new)
2. Set **Framework Preset**: Vite
3. Set **Root Directory**: `frontend`
4. Set **Environment Variable**: `VITE_API_URL=https://your-render-backend-url.onrender.com/api`
5. Click **Deploy**

---

## 📮 Postman API Collection

The file `Postman_Collection.json` in the repo root contains all API endpoints.

### Import Steps:
1. Open Postman → Click **Import** → Select `Postman_Collection.json`
2. Set the collection variable `baseUrl` = `http://localhost:5000` (or your live API URL)
3. Run **"Login - Admin"** — the JWT token is auto-saved to the collection variable
4. All subsequent requests will use the token automatically

### API Endpoints Summary

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/auth/login` | Login and get JWT token |
| `GET` | `/api/auth/me` | Get current user profile |
| `GET` | `/api/customers` | List all customers (with search) |
| `POST` | `/api/customers` | Create new customer |
| `GET` | `/api/customers/:id` | Get customer + follow-ups |
| `PUT` | `/api/customers/:id` | Update customer |
| `DELETE` | `/api/customers/:id` | Delete customer (ADMIN only) |
| `POST` | `/api/customers/:id/followups` | Add follow-up note |
| `GET` | `/api/products` | List all products |
| `POST` | `/api/products` | Create product |
| `PUT` | `/api/products/:id` | Update product |
| `POST` | `/api/products/:id/stock` | Adjust stock (IN/OUT) |
| `GET` | `/api/stock-movements` | Get stock movement audit log |
| `GET` | `/api/challans` | List all challans |
| `POST` | `/api/challans` | Create new challan (DRAFT) |
| `PUT` | `/api/challans/:id/confirm` | Confirm challan (deducts stock) |
| `PUT` | `/api/challans/:id/cancel` | Cancel challan (restores stock) |
| `GET` | `/api/dashboard` | Revenue + stats summary |
| `GET` | `/api/health` | Health check (JSON) |
| `GET` | `/api/docs` | Interactive API documentation |

---

## ⚠️ Known Limitations & Incomplete Parts

### Known Limitations

1. **No Email Notifications** — The system does not send email alerts for low stock, follow-up reminders, or challan confirmations. A real production system would integrate SendGrid or Nodemailer.

2. **No File/Image Uploads** — Products do not support image uploads. A production version would integrate AWS S3 or Cloudinary.

3. **No Pagination on Large Lists** — Customer and product lists load all records. For large datasets (10,000+ records), server-side pagination with cursor-based pagination would be needed.

4. **Single-Warehouse Model** — Stock tracking is single-location only. A multi-warehouse system would require a separate `Warehouse` model and per-location inventory tracking.

5. **Basic Purchase Order** — Purchase Order (PO) / Inward GRN module is not implemented. Stock can be adjusted manually via the Stock Adjustment modal, but there is no formal PO creation and approval workflow.

6. **No Real-Time Updates** — The dashboard and lists do not auto-refresh using WebSockets or Server-Sent Events. Users must manually refresh to see changes made by other users.

7. **SQLite in Local Dev** — The local development uses SQLite which does not support all PostgreSQL features (e.g., concurrent writes under heavy load). This is mitigated by using Prisma ORM which abstracts both.

8. **Free Tier Cold Starts** — The Render.com free tier backend may have ~30-60 second cold start times after periods of inactivity. The first API request after idle will be slow.

### What Could Be Extended

- Vendor / Supplier management module
- Purchase Orders & GRN (Goods Receipt Notes) workflow
- GST Tax Reports (GSTR-1 format)
- WhatsApp / SMS follow-up reminders
- Multi-currency support
- Role management from Admin UI (add/edit user roles)
- Audit log for all create/update/delete operations across all modules

---

## 📊 Core Business Modules

| Module | Features |
|:-------|:---------|
| **🔐 Authentication** | JWT login, 4-role RBAC, protected routes, 1-click demo login |
| **👥 CRM Customers** | Full profile CRUD, business type, GST, follow-up timeline notes |
| **📦 Products** | SKU catalog, pricing, stock levels, low-stock alerts |
| **📊 Stock Control** | Manual IN/OUT adjustments with reason, immutable audit log |
| **📄 Sales Challans** | Multi-line order creation, draft/confirm/cancel, atomic stock deduction |
| **🧾 Tax Invoices** | Client-side B2B PDF with tax breakdown, downloadable |
| **📈 Dashboard** | Revenue totals, customer count, low stock alerts, recent activity |

---

*Built with ❤️ — Mini ERP + CRM Operations Portal — Full Stack Developer Case Study 2026*
