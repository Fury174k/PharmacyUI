export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface Product {
  id: number;
  user: number;
  sku: string;
  name: string;
  description: string;
  unit_price: string;
  unit: string;
  stock: number;
  reorder_level: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  product: number;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

export interface Sale {
  id: number;
  sold_by: number;
  total_amount: string;
  timestamp: string;
  items: SaleItem[];
}

export interface TrendData {
  date: string;
  total_sales: number;
  total_amount: string;
  count: number;
}

export interface Alert {
  id: number;
  product: {
    id: number;
    name: string;
    sku: string;
    stock: number;
    reorder_level: number;
  };
  severity: 'critical' | 'warning' | 'info';
  triggered_at: string;
  acknowledged: boolean;
  days_low_stock: number;
  message: string;
}

export interface AlertsResponse {
  alerts: Alert[];
  unread_count: number;
  critical_count: number;
}

export type StockMovement = {
  id: number;
  timestamp: string;
  product: number;
  product_name: string;
  delta: number;
  resulting_stock: number;
  movement_type: 'Sale' | 'Restock' | 'Adjustment';
  performed_by: string;
  reason: string;
};