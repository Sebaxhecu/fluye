import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { format, parseISO, getDaysInMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';
import { useSales } from '../hooks/useSales';
import { SaleEntryModal } from '../components/SaleEntryModal';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useAuth } from '../context/AuthContext';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CalendarScreen() {
  const { user } = useAuth();
  const { sales, getSaleByDate, upsertSale, getMonthSales } = useSales();
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [modalVisible, setModalVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  // Build marked dates for calendar
  const markedDates = useMemo(() => {
    const result: Record<string, any> = {};
    for (const sale of sales) {
      const isSelected = sale.date === selectedDate;
      result[sale.date] = {
        marked: true,
        dotColor: Colors.primary,
        selected: isSelected,
        selectedColor: isSelected ? Colors.primary : undefined,
      };
    }
    // Mark selected date even if no sale
    if (!result[selectedDate]) {
      result[selectedDate] = {
        selected: true,
        selectedColor: Colors.primaryLight,
      };
    } else {
      result[selectedDate] = {
        ...result[selectedDate],
        selected: true,
        selectedColor: Colors.primary,
      };
    }
    return result;
  }, [sales, selectedDate]);

  const selectedSale = getSaleByDate(selectedDate);
  const monthSales = getMonthSales(currentMonth.year, currentMonth.month);
  const monthTotal = monthSales.reduce((sum, s) => sum + s.salesAmount, 0);
  const monthProfit = monthSales.reduce((sum, s) => sum + s.profitAmount, 0);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleSave = async (salesAmount: number, profitPercentage: number) => {
    await upsertSale(selectedDate, salesAmount, profitPercentage);
    setModalVisible(false);
  };

  const formattedSelected = (() => {
    try {
      const parsed = parseISO(selectedDate);
      const label = format(parsed, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
      return label.charAt(0).toUpperCase() + label.slice(1);
    } catch {
      return selectedDate;
    }
  })();

  const currentMonthLabel = (() => {
    const d = new Date(currentMonth.year, currentMonth.month - 1, 1);
    const label = format(d, "MMMM yyyy", { locale: es });
    return label.charAt(0).toUpperCase() + label.slice(1);
  })();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>📅 Calendario</Text>
          <Text style={styles.headerSubtitle}>{currentMonthLabel}</Text>
          <View style={styles.monthStats}>
            <View style={styles.monthStatItem}>
              <Text style={styles.monthStatLabel}>Ventas del mes</Text>
              <Text style={styles.monthStatValue}>{formatCurrency(monthTotal)}</Text>
            </View>
            <View style={styles.monthStatDivider} />
            <View style={styles.monthStatItem}>
              <Text style={styles.monthStatLabel}>Ganancia</Text>
              <Text style={styles.monthStatValue}>{formatCurrency(monthProfit)}</Text>
            </View>
            <View style={styles.monthStatDivider} />
            <View style={styles.monthStatItem}>
              <Text style={styles.monthStatLabel}>Días</Text>
              <Text style={styles.monthStatValue}>{monthSales.length}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Calendar */}
        <View style={styles.calendarWrapper}>
          <Calendar
            current={selectedDate}
            onDayPress={handleDayPress}
            onMonthChange={(month) => {
              setCurrentMonth({ year: month.year, month: month.month });
            }}
            markedDates={markedDates}
            theme={{
              backgroundColor: Colors.cardBackground,
              calendarBackground: Colors.cardBackground,
              textSectionTitleColor: Colors.textSecondary,
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: Colors.primary,
              todayBackgroundColor: Colors.primaryVeryLight,
              dayTextColor: Colors.textPrimary,
              textDisabledColor: Colors.textMuted,
              dotColor: Colors.primary,
              selectedDotColor: '#FFFFFF',
              arrowColor: Colors.primary,
              monthTextColor: Colors.textPrimary,
              indicatorColor: Colors.primary,
              textDayFontWeight: '500',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12,
            }}
            style={styles.calendar}
          />
        </View>

        {/* Selected day detail */}
        <View style={styles.detailSection}>
          <Text style={styles.detailDateLabel}>{formattedSelected}</Text>

          {selectedSale ? (
            <View style={styles.detailCard}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Ventas del día</Text>
                  <Text style={styles.detailAmount}>
                    {formatCurrency(selectedSale.salesAmount)}
                  </Text>
                </View>
                <View style={styles.detailDivider} />
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Ganancia</Text>
                  <Text style={[styles.detailAmount, { color: Colors.success }]}>
                    {formatCurrency(selectedSale.profitAmount)}
                  </Text>
                </View>
              </View>
              <View style={styles.profitBadge}>
                <Text style={styles.profitBadgeText}>
                  📊 Margen de ganancia: {selectedSale.profitPercentage}%
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleOpenModal}
                activeOpacity={0.8}
              >
                <Text style={styles.editButtonText}>✏️ Editar entrada</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyDayCard}>
              <Text style={styles.emptyDayIcon}>📊</Text>
              <Text style={styles.emptyDayTitle}>Sin registro este día</Text>
              <Text style={styles.emptyDaySubtitle}>
                No hay ventas registradas para esta fecha.
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleOpenModal}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[Colors.gradientStart, Colors.gradientEnd]}
                  style={styles.addButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.addButtonText}>➕ Agregar venta</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <SaleEntryModal
        visible={modalVisible}
        date={selectedDate}
        existingEntry={selectedSale}
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  monthStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
  },
  monthStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  monthStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  monthStatValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  monthStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 4,
  },
  calendarWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  calendar: {
    borderRadius: 20,
  },
  detailSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  detailDateLabel: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  detailCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
    marginBottom: 6,
    textAlign: 'center',
  },
  detailAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  detailDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  profitBadge: {
    backgroundColor: Colors.primaryVeryLight,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  profitBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  editButton: {
    backgroundColor: Colors.divider,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptyDayCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyDayIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyDayTitle: {
    ...Typography.h4,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDaySubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  addButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
