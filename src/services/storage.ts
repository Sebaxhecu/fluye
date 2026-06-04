import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, SaleEntry } from '../types';

// Storage keys
const KEYS = {
  USERS: 'fluye_users',
  CURRENT_USER: 'fluye_current_user',
  SALES: 'fluye_sales',
} as const;

// Generic helpers
async function getItem<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return null;
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Storage setItem error for key ${key}:`, error);
    throw error;
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Storage removeItem error for key ${key}:`, error);
    throw error;
  }
}

// User operations
export async function getUsers(): Promise<User[]> {
  return (await getItem<User[]>(KEYS.USERS)) ?? [];
}

export async function saveUsers(users: User[]): Promise<void> {
  await setItem(KEYS.USERS, users);
}

export async function getCurrentUser(): Promise<User | null> {
  return getItem<User>(KEYS.CURRENT_USER);
}

export async function saveCurrentUser(user: User | null): Promise<void> {
  if (user === null) {
    await removeItem(KEYS.CURRENT_USER);
  } else {
    await setItem(KEYS.CURRENT_USER, user);
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function createUser(user: User): Promise<void> {
  const users = await getUsers();
  users.push(user);
  await saveUsers(users);
}

export async function updateUserById(id: string, updates: Partial<User>): Promise<User | null> {
  const users = await getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...updates };
  await saveUsers(users);

  // Also update current user if it's the same
  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.id === id) {
    const updatedUser = users[index];
    await saveCurrentUser(updatedUser);
    return updatedUser;
  }
  return users[index];
}

// Sales operations
export async function getSales(): Promise<SaleEntry[]> {
  return (await getItem<SaleEntry[]>(KEYS.SALES)) ?? [];
}

export async function saveSales(sales: SaleEntry[]): Promise<void> {
  await setItem(KEYS.SALES, sales);
}

export async function getSalesByUserId(userId: string): Promise<SaleEntry[]> {
  const all = await getSales();
  return all.filter((s) => s.userId === userId);
}

export async function getSaleByDateAndUser(
  userId: string,
  date: string
): Promise<SaleEntry | null> {
  const all = await getSales();
  return all.find((s) => s.userId === userId && s.date === date) ?? null;
}

export async function upsertSaleEntry(sale: SaleEntry): Promise<void> {
  const all = await getSales();
  const index = all.findIndex((s) => s.id === sale.id);
  if (index === -1) {
    all.push(sale);
  } else {
    all[index] = sale;
  }
  await saveSales(all);
}

export async function deleteSaleById(id: string): Promise<void> {
  const all = await getSales();
  const filtered = all.filter((s) => s.id !== id);
  await saveSales(filtered);
}

// Utility: generate a simple unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
