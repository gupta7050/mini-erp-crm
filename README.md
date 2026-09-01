# Mini ERP + CRM Operations Portal

A distribution and wholesale Operations Portal featuring Role-Based Access Control (RBAC), Customer Relationship Management (CRM), Inventory Management with low stock alerts, Sales Challan workflow with atomic database stock deduction, PDF Invoice generation, and real-time operational dashboard analytics.

---

## 🔑 Demo Test Login Credentials

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@minierp.com` | `Password@123` | Full access across all CRM, Products, Challans & Admin settings |
| **Sales** | `sales@minierp.com` | `Password@123` | Customer management, Add Follow-ups, Create & Confirm Sales Challans |
| **Warehouse** | `warehouse@minierp.com` | `Password@123` | Product catalog, Stock Adjustments (IN/OUT), Audit Movement Logs |
| **Accounts** | `accounts@minierp.com` | `Password@123` | Revenue dashboard, Customer view, Challan/Invoice PDF download |

> **Note**: The UI features a **"1-Click Demo Quick Switch"** widget on the login page and left sidebar so evaluators can instantly test role permissions without typing.

---

## 🛠️ Required Tech Stack

### Backend
- **Node.js & TypeScript**: Type-safe REST API server architecture.
- **Express.js**: Modular route controllers and custom middleware.
- **Prisma ORM**: Cross-database ORM supporting zero-config SQLite locally and PostgreSQL in cloud production.
- **JWT & Bcrypt**: Token-based authentication and hashed passwords.
- **Zod & Express Validator**: Request payload validation.

### Frontend
- **React 18 & TypeScript**: Single-Page Application (SPA) built with Vite.
- **Tailwind CSS & Lucide Icons**: Ultra-sleek glassmorphic dark interface.
- **jspdf & jspdf-autotable**: Client-side B2B Tax Invoice PDF generation.
- **React Router v6**: Client-side navigation & route authentication guards.

---

## 🏗️ Core Modules & Requirements Implemented

### 1. Authentication & Role-Based Access Control (RBAC)
- Role definitions for `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`.
- Endpoint security using JWT authentication middleware (`/api/auth/me`, `/api/auth/login`).
- Client-side role-gated UI elements and navigation tabs.

### 2. Customer CRM Module
- Complete Customer profiles (`Customer Name`, `Mobile`, `Email`, `Business Name`, `GST Number`, `Type`: `RETAIL` / `WHOLESALE` / `DISTRIBUTOR`, `Address`, `Status`: `LEAD` / `ACTIVE` / `INACTIVE`, `Follow-Up Date`, `Notes`).
- Interactive Follow-Up timeline notes log.
- Customer search by name, business, mobile, or email.

### 3. Product & Inventory Module
- Product fields (`Name`, `SKU`, `Category`, `Unit Price`, `Current Stock`, `Minimum Stock Alert Quantity`, `Location/Warehouse`).
- Low stock warning banners and status badges (`Low Stock` vs `In Stock`).
- Quick Stock Adjustment modal (Restock `IN` / Dispatched `OUT`).
- Stock Movement Audit Log tracking product, quantity changed, movement type, reason, created by user, and timestamp.

### 4. Sales Challan & Invoicing Flow
- Select customer and add multiple product lines with live stock availability indicators.
- Auto-generated unique Challan Numbers (`CH-YYYYMMDD-XXXX`).
- Save as `DRAFT` or `CONFIRMED`.
- **Atomic Transaction Logic**:
  - Confirming a challan executes a database transaction reducing product stock and creating an `OUT` stock movement.
  - Stock validation prevents stock from going negative.
  - If stock is insufficient, API returns an explicit `400 Bad Request` specifying available vs requested units.
  - Snapshot storage: Challan items retain product name, SKU, and unit price at time of order creation.
  - Printable & downloadable B2B Tax Invoice PDF.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18 or v20+)
- npm or yarn

### 1. Clone & Setup Backend
```bash
cd backend
npm install
```

Configure environment variables in `backend/.env`:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="mini_erp_crm_super_secret_jwt_key_2026"
NODE_ENV="development"
```

Initialize & Seed Database:
```bash
npx prisma generate
npx prisma db push
npm run seed
```

Start Backend API Server:
```bash
npm run dev
# Server running at http://localhost:5000
```

### 2. Setup & Start Frontend
Open a new terminal window:
```bash
cd frontend
npm install --ignore-scripts
npm run dev
# App running at http://localhost:3000
```

---

## 🐳 Docker Deployment

To spin up the full stack (Backend + Frontend) via Docker Compose:

```bash
docker-compose up --build
```
- Frontend UI will be accessible at: `http://localhost:3000`
- Backend REST API will be accessible at: `http://localhost:5000`

---

## 🌐 Free Cloud Deployment Instructions

### Option 1: Backend & Database Deployment (Render / Neon / Supabase)
1. **Database**: Create a free PostgreSQL database instance on [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com) and copy the `DATABASE_URL`.
2. **Backend**:
   - Create a Web Service on [Render](https://render.com) connected to the `backend/` folder.
   - Set Build Command: `npm install && npx prisma generate && npx prisma db push && npm run build`
   - Set Start Command: `npm start`
   - In `backend/prisma/schema.prisma`, update provider to `postgresql`:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   - Add Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `PORT=5000`.

### Option 2: Frontend Deployment (Vercel / Netlify)
1. Connect repository to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Set Root Directory: `frontend`
3. Set Build Command: `npm run build`
4. Set Output Directory: `dist`
5. Add Environment Variable: `VITE_API_URL=https://your-backend-render-url.onrender.com/api`

---

## 📄 Postman API Collection

The repository includes `Postman_Collection.json`.

### How to Import:
1. Open Postman.
2. Click **Import** -> Select `Postman_Collection.json`.
3. Set variable `baseUrl` to `http://localhost:5000`.
4. Execute `Login - Admin` or `Login - Sales` to automatically copy the returned JWT token into requests.

---

## 📌 Architectural Assumptions & Known Limitations
1. **Cross-Database Support**: Prisma schema utilizes string representation for role and status fields to allow zero-configuration local runs on SQLite while maintaining full compatibility with PostgreSQL for production cloud deployment.
2. **Stock Snapshots**: Sales Challan item rows lock in product name, SKU, and unit price at the exact moment of order creation to preserve invoice integrity even if product catalog prices change later.
3. **Cancellation Reversal**: Cancelling a confirmed challan restores product stock quantities and records a stock `IN` movement log for full auditability.
