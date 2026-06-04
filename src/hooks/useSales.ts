import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import {
  getSalesByUserId,
  upsertSaleEntry,
  deleteSaleById,
  generateId,
} from '../services/storage';
import { SaleEntry } from '../types';
import { useAuth } from '../context/AuthContext';

export function useSales() {
  const { user } = useAuth();
  const [sales, setSales] = useState<SaleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSales = useCallback(async () => {
    if (!user) {
      setSales([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await getSalesByUserId(user.id);
      // Sort descending by date
      data.sort((a, b) => b.date.localeCompare(a.date));
      setSales(data);
    } catch (e) {
      console.error('Error loading sales:', e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const getSaleByDate = useCallback(
    (date: string): SaleEntry | undefined => {
      return sales.find((s) => s.date === date);
    },
    [sales]
  );

  const upsertSale = useCallback(
    async (
      date: string,
      salesAmount: number,
      profitPercentage: number
    ): Promise<SaleEntry> => {
      if (!user) throw new Error('Usuario no autenticado');

      const existing = sales.find((s) => s.date === date);
      const profitAmount = (salesAmount * profitPercentage) / 100;
      const now = new Date().toISOString();

      const entry: SaleEntry = existing
        ? {
            ...existing,
            salesAmount,
            profitPercentage,
            profitAmount,
            updatedAt: now,
          }
        : {
            id: generateId(),
            userId: user.id,
            date,
            salesAmount,
            profitPercentage,
            profitAmount,
            createdAt: now,
            updatedAt: now,
          };

      await upsertSaleEntry(entry);

      setSales((prev) => {
        const filtered = prev.filter((s) => s.date !== date);
        const updated = [...filtered, entry].sort((a, b) => b.date.localeCompare(a.date));
        return updated;
      });

      return entry;
    },
    [user, sales]
  );

  const deleteSale = useCallback(async (id: string) => {
    await deleteSaleById(id);
    setSales((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const getTodaySales = useCallback((): SaleEntry | undefined => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return sales.find((s) => s.date === today);
  }, [sales]);

  const getMonthSales = useCallback(
    (year: number, month: number): SaleEntry[] => {
      // month is 1-indexed
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      return sales.filter((s) => s.date.startsWith(prefix));
    },
    [sales]
  );

  const refresh = useCallback(() => {
    loadSales();
  }, [loadSales]);

  return {
    sales,
    isLoading,
    getSaleByDate,
    upsertSale,
    deleteSale,
    getTodaySales,
    getMonthSales,
    refresh,
  };
}
