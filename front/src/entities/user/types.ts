export interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  deliveredOrders: number;
}

export interface UserAnalytics {
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  statusStats: Record<string, number>;
  monthlyStats: Record<string, { count: number; spent: number }>;
  topProducts: Array<[string, { count: number; spent: number }]>;
}
