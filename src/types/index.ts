// DSV Flow - Core Type Definitions

export type OrderStatus = 'Draft' | 'Pending' | 'Approved' | 'Production' | 'Completed' | 'Delivered';

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  productType: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountPercentage: number;
  subtotal: number;
  vat: number;
  vatAmount: number;
  total: number;
  profitMargin: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  totalOrders: number;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minStock: number;
  unitCost: number;
  category: string;
  lastUpdated: string;
}

export interface SalesMetrics {
  totalSales: number;
  averageOrderValue: number;
  totalOrders: number;
  ordersThisMonth: number;
  pendingOrders: number;
  completedOrders: number;
}

// Product types offered by DSV Enterprise
export const PRODUCT_TYPES = [
  'T-Shirts',
  'Polo Shirts',
  'Caps & Hats',
  'Mugs',
  'Banners',
  'Business Cards',
  'Flyers',
  'Stickers',
  'Notebooks',
  'Bags',
  'Pens',
  'Lanyards',
  'Keychains',
  'Umbrellas',
  'USB Drives',
  'Other',
] as const;

export type ProductType = typeof PRODUCT_TYPES[number];

// Quantity discount tiers
export const DISCOUNT_TIERS = [
  { minQuantity: 1000, percentage: 20, label: 'Maximum (1000+ units)' },
  { minQuantity: 500, percentage: 15, label: 'Higher (500+ units)' },
  { minQuantity: 200, percentage: 10, label: 'Medium (200+ units)' },
  { minQuantity: 100, percentage: 5, label: 'Small (100+ units)' },
  { minQuantity: 0, percentage: 0, label: 'No discount' },
] as const;

export const VAT_RATE = 0.15; // Ghana standard VAT rate

// Order status flow
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'Draft',
  'Pending',
  'Approved',
  'Production',
  'Completed',
  'Delivered',
];

// Status color mapping
export const STATUS_COLORS: Record<OrderStatus, string> = {
  Draft: 'bg-status-draft',
  Pending: 'bg-status-pending',
  Approved: 'bg-status-approved',
  Production: 'bg-status-production',
  Completed: 'bg-status-completed',
  Delivered: 'bg-status-delivered',
};
