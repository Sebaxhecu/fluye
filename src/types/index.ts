export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  defaultProfitPercentage: number;
  createdAt: string;
}

export interface SaleEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  salesAmount: number;
  profitPercentage: number;
  profitAmount: number; // salesAmount * profitPercentage / 100
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

export interface SalesContextType {
  sales: SaleEntry[];
  isLoading: boolean;
  getSaleByDate: (date: string) => SaleEntry | undefined;
  upsertSale: (
    date: string,
    salesAmount: number,
    profitPercentage: number
  ) => Promise<SaleEntry>;
  deleteSale: (id: string) => Promise<void>;
  getTodaySales: () => SaleEntry | undefined;
  getMonthSales: (year: number, month: number) => SaleEntry[];
}

// Navigation param lists
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Profile: undefined;
};
