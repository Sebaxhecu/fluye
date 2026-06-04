import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { format, isToday, parseISO, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { useSales } from '../hooks/useSales';
import { SummaryCard } from '../components/SummaryCard';
import { SaleEntryModal } from '../components/SaleEntryModal';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { SaleEntry } from '../types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export function HomeScreen() {
  const { user } = useAuth();
  const { sales, isLoading, getTodaySales, getMonthSales, getSaleByDate, upsertSale, refresh } =
    useSales();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [refreshing, setRefreshing] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todaySale = getTodaySales();
  const now = new Date();
  const monthSales = getMonthSales(now.getFullYear(), now.getMonth() + 1);

  const todayTotal = todaySale?.salesAmount ?? 0;
  const todayProfit = todaySale?.profitAmount ?? 0;
  const monthTotal = monthSales.reduce((sum, s) => sum + s.salesAmount, 0);
  const monthProfit = monthSales.reduce((sum, s) => sum + s.profitAmount, 0);

  // Last 7 days for recent entries
  const recentDays: Array<{ date: string; sale: SaleEntry | undefined }> = [];
  for (let i = 0; i < 7; i++) {
    const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
    recentDays.push({ date: d, sale: getSaleByDate(d) });
  }
  const recentWithData = recentDays.filter((r) => r.sale != null).slice(0, 5);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    refresh();
    setRefreshing(false);
  }, [refresh]);

  const openModalForToday = () => {
    setSelectedDate(today);
    setModalVisible(true);
  };

  const openModalForDate = (date: string) => {
    setSelectedDate(date);
    setModalVisible(true);
  };

  const handleSave = async (salesAmount: number, profitPercentage: number) => {
    await upsertSale(selectedDate, salesAmount, profitPercentage);
    setModalVisible(false);
  };

  const formattedDate = format(new Date(), "EEEE d 'de' MMMM", { locale: es });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}, {user?.name?.split(' ')[0] ?? 'Usuario'} 👋
            </Text>
            <Text style={styles.dateText}>{capitalizedDate}</Text>
          </View>
          <View style={styles.headerAvatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Summary cards */}
          <Text style={styles.sectionTitle}>Resumen de hoy</Text>
          <View style={styles.cardsRow}>
            <SummaryCard
              title="Ventas hoy"
              amount={formatCurrency(todayTotal)}
              variant="gradient"
              icon="🛍️"
              style={styles.cardHalf}
            />
            <SummaryCard
              title="Ganancia hoy"
              amount={formatCurrency(todayProfit)}
              variant="success"
              icon="💰"
              style={styles.cardHalf}
            />
          </View>

          <Text style={styles.sectionTitle}>Este mes</Text>
          <View style={styles.cardsRow}>
            <SummaryCard
              title="Ventas mes"
              amount={formatCurrency(monthTotal)}
              subtitle={`${monthSales.length} días registrados`}
              icon="📊"
              style={styles.cardHalf}
            />
            <SummaryCard
              title="Ganancia mes"
              amount={formatCurrency(monthProfit)}
              subtitle={
                monthTotal > 0
                  ? `${((monthProfit / monthTotal) * 100).toFixed(1)}% margen`
                  : 'Sin datos'
              }
              icon="📈"
              style={styles.cardHalf}
            />
          </View>

          {/* Quick action */}
          <TouchableOpacity onPress={openModalForToday} activeOpacity={0.85}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.quickAction}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.quickActionIcon}>
                {todaySale ? '✏️' : '➕'}
              </Text>
              <View style={styles.quickActionText}>
                <Text style={styles.quickActionTitle}>
                  {todaySale ? 'Editar venta de hoy' : 'Registrar venta de hoy'}
                </Text>
                <Text style={styles.quickActionSubtitle}>
                  {todaySale
                    ? `${formatCurrency(todaySale.salesAmount)} registrado`
                    : 'Toca para agregar las ventas del día'}
                </Text>
              </View>
              <Text style={styles.quickActionChevron}>›</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Recent entries */}
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Entradas recientes</Text>
          </View>

          {recentWithData.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>Sin registros aún</Text>
              <Text style={styles.emptySubtitle}>
                Empieza registrando las ventas de hoy para ver tu historial aquí.
              </Text>
            </View>
          ) : (
            <View style={styles.recentList}>
              {recentWithData.map(({ date, sale }) => {
                if (!sale) return null;
                const parsedDate = parseISO(date);
                const dayLabel = isToday(parsedDate)
                  ? 'Hoy'
                  : format(parsedDate, "EEE d MMM", { locale: es });
                const capitalDay = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1);

                return (
                  <TouchableOpacity
                    key={date}
                    style={styles.recentItem}
                    onPress={() => openModalForDate(date)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.recentLeft}>
                      <View
                        style={[
                          styles.recentDot,
                          isToday(parsedDate) && styles.recentDotToday,
                        ]}
                      />
                      <View>
                        <Text style={styles.recentDate}>{capitalDay}</Text>
                        <Text style={styles.recentProfit}>
                          Ganancia: {formatCurrency(sale.profitAmount)}
                          {'  '}
                          <Text style={styles.recentPercentage}>
                            ({sale.profitPercentage}%)
                          </Text>
                        </Text>
                      </View>
                    </View>
                    <View style={styles.recentRight}>
                      <Text style={styles.recentAmount}>{formatCurrency(sale.salesAmount)}</Text>
                      <Text style={styles.recentEdit}>Editar ›</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <SaleEntryModal
        visible={modalVisible}
        date={selectedDate}
        existingEntry={getSaleByDate(selectedDate)}
        defaultProfitPercentage={user?.defaultProfitPercentage ?? 30}
        onSave={handleSave}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '400',
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  cardHalf: {
    flex: 1,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  quickActionIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  quickActionChevron: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '300',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    ...Typography.h4,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  recentList: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
    marginRight: 12,
  },
  recentDotToday: {
    backgroundColor: Colors.primary,
  },
  recentDate: {
    ...Typography.labelLarge,
    marginBottom: 2,
  },
  recentProfit: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
  },
  recentPercentage: {
    color: Colors.textMuted,
  },
  recentRight: {
    alignItems: 'flex-end',
  },
  recentAmount: {
    ...Typography.amountSmall,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  recentEdit: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
});
