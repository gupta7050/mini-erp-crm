export type UserRole = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string | null;
  type: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdById: string;
  createdBy?: { name: string; role: UserRole };
  createdAt: string;
  updatedAt: string;
  followUps?: FollowUp[];
  challans?: SalesChallan[];
  _count?: { followUps: number; challans: number };
}

export interface FollowUp {
  id: string;
  customerId: string;
  note: string;
  followUpDate?: string | null;
  createdById: string;
  createdBy?: { name: string; role: UserRole };
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location: string;
  createdById: string;
  createdBy?: { name: string; role: UserRole };
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'IN' | 'OUT';

export interface StockMovement {
  id: string;
  productId: string;
  product?: { id: string; name: string; sku: string };
  quantity: number;
  type: MovementType;
  reason: string;
  createdById: string;
  createdBy?: { name: string; role: UserRole };
  createdAt: string;
}

export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface SalesChallanItem {
  id?: string;
  productId: string;
  productName: string;
  productSku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customer?: {
    id: string;
    name: string;
    businessName: string;
    email: string;
    mobile: string;
    gstNumber?: string | null;
    address: string;
  };
  status: ChallanStatus;
  totalQuantity: number;
  totalAmount: number;
  createdById: string;
  createdBy?: { name: string; role?: UserRole };
  createdAt: string;
  updatedAt: string;
  items: SalesChallanItem[];
}

export interface DashboardStats {
  customers: {
    total: number;
    leads: number;
    active: number;
  };
  inventory: {
    totalProducts: number;
    lowStockCount: number;
    totalStockValue: number;
    lowStockProducts: Array<{
      id: string;
      name: string;
      sku: string;
      currentStock: number;
      minStockAlert: number;
      location: string;
    }>;
  };
  challans: {
    total: number;
    confirmedCount: number;
    totalRevenue: number;
    recent: SalesChallan[];
  };
  followUps: {
    upcoming: Array<{
      id: string;
      name: string;
      businessName: string;
      mobile: string;
      status: CustomerStatus;
      followUpDate?: string;
      notes?: string;
    }>;
  };
}
