import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
} from 'react-native';
import dayjs from 'dayjs';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
};

export default function OrderFilter({ visible, onClose, onApply }: Props) {
  const [dateRangeMode, setDateRangeMode] = useState('today');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);
  
  const [orderStatus, setOrderStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');

  const dateOptions = [
    { label: 'All', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'this-week' },
    { label: 'This Month', value: 'this-month' },
    { label: 'Last 7 Days', value: 'last-7' },
    { label: 'Last 14 Days', value: 'last-14' },
    { label: 'Last 30 Days', value: 'last-30' },
    { label: 'Last Month', value: 'last-month' },
  ];

  const statusOptions = [
    { label: 'All Orders', value: 'all', icon: 'grid-outline' },
    { label: 'Pending', value: 'pending', icon: 'time-outline' },
    { label: 'Confirmed', value: 'confirmed', icon: 'checkmark-circle-outline' },
    { label: 'Processing', value: 'processing', icon: 'sync-outline' },
    { label: 'Shipped', value: 'shipped', icon: 'bicycle-outline' },
    { label: 'Delivered', value: 'delivered', icon: 'checkbox-outline' },
    { label: 'Cancelled', value: 'cancelled', icon: 'close-circle-outline' },
  ];

  const paymentStatusOptions = [
    { label: 'All', value: 'all', icon: 'wallet-outline' },
    { label: 'Paid', value: 'paid', icon: 'cash-outline' },
    { label: 'Unpaid', value: 'unpaid', icon: 'alert-circle-outline' },
    { label: 'Pending', value: 'pending', icon: 'time-outline' },
  ];

  const paymentMethodOptions = [
    { label: 'All', value: 'all', icon: 'card-outline' },
    { label: 'COD', value: 'cod', icon: 'hand-left-outline' },
    { label: 'Online', value: 'online', icon: 'globe-outline' },
  ];

  const applyFilters = () => {
    let finalStart: dayjs.Dayjs | null = dayjs(startDate).startOf('day');
    let finalEnd: dayjs.Dayjs | null = dayjs(endDate).endOf('day');

    if (dateRangeMode !== 'custom') {
      const now = dayjs();
      finalEnd = now.endOf('day');

      switch (dateRangeMode) {
        case 'all':
          finalStart = null;
          finalEnd = null;
          break;
        case 'today':
          finalStart = now.startOf('day');
          break;
        case 'yesterday':
          finalStart = now.subtract(1, 'day').startOf('day');
          finalEnd = now.subtract(1, 'day').endOf('day');
          break;
        case 'this-week':
          finalStart = now.startOf('week');
          break;
        case 'this-month':
          finalStart = now.startOf('month');
          break;
        case 'last-7':
          finalStart = now.subtract(7, 'days').startOf('day');
          break;
        case 'last-14':
          finalStart = now.subtract(14, 'days').startOf('day');
          break;
        case 'last-30':
          finalStart = now.subtract(30, 'days').startOf('day');
          break;
        case 'last-month':
          finalStart = now.subtract(1, 'month').startOf('month');
          finalEnd = now.subtract(1, 'month').endOf('month');
          break;
      }
    }

    onApply({
      dateRangeMode,
      startDate: finalStart ? finalStart.toISOString() : undefined,
      endDate: finalEnd ? finalEnd.toISOString() : undefined,
      orderStatus,
      paymentStatus,
      paymentMethod,
    });
    onClose();
  };

  const resetFilters = () => {
    const defaults = {
      dateRangeMode: 'all',
      startDate: '',
      endDate: '',
      orderStatus: 'all',
      paymentStatus: 'all',
      paymentMethod: 'all',
    };
    
    // Reset local UI state
    setDateRangeMode('all');
    setOrderStatus('all');
    setPaymentStatus('all');
    setPaymentMethod('all');
    setStartDate(new Date());
    setEndDate(new Date());
    
    // Apply defaults to refresh list
    onApply(defaults);
    onClose();
  };

  const DateOption = ({ label, value }: { label: string, value: string }) => (
    <TouchableOpacity
      style={[
        styles.dateOptionBtn,
        dateRangeMode === value && styles.activeDateOption,
      ]}
      onPress={() => setDateRangeMode(value)}
    >
      <Text style={[styles.dateOptionText, dateRangeMode === value && styles.activeDateOptionText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* DRAG HANDLE */}
          <View style={styles.dragHandle} />

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.filterIconContainer}>
                <Ionicons name="options-outline" size={24} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.title}>Filter Orders</Text>
                <Text style={styles.subtitle}>Customize your order view</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* DATE RANGE SECTION */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
              </View>
              <Text style={styles.sectionTitle}>Date Range</Text>
            </View>

            <View style={styles.dateGrid}>
              {dateOptions.map((opt) => (
                <DateOption key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </View>

            {/* CUSTOM DATE RANGE ROW */}
            <TouchableOpacity 
              style={styles.customDateRow}
              onPress={() => setShowPicker('start')}
            >
              <View style={styles.customDateIcon}>
                <Ionicons name="calendar" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.customDateLabel}>Custom Date Range</Text>
                <Text style={styles.customDateValue}>
                  {dayjs(startDate).format('DD MMM YYYY')} - {dayjs(endDate).format('DD MMM YYYY')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>

            {/* ORDER STATUS SECTION */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="clipboard-outline" size={20} color={COLORS.textSecondary} />
              </View>
              <Text style={styles.sectionTitle}>Order Status</Text>
            </View>

            <View style={styles.statusList}>
              {statusOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.statusItem,
                    orderStatus === opt.value && styles.activeStatusItem
                  ]}
                  onPress={() => setOrderStatus(opt.value)}
                >
                  <View style={[styles.statusIconContainer, orderStatus === opt.value && styles.activeStatusIconContainer]}>
                    <Ionicons name={opt.icon as any} size={20} color={orderStatus === opt.value ? COLORS.primary : COLORS.textSecondary} />
                  </View>
                  <Text style={[styles.statusText, orderStatus === opt.value && styles.activeStatusText]}>
                    {opt.label}
                  </Text>
                  {orderStatus === opt.value && (
                    <View style={styles.checkCircle}>
                      <Ionicons name="checkmark" size={14} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* PAYMENT STATUS SECTION */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="wallet-outline" size={20} color={COLORS.textSecondary} />
              </View>
              <Text style={styles.sectionTitle}>Payment Status</Text>
            </View>

            <View style={styles.statusList}>
              {paymentStatusOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.statusItem,
                    paymentStatus === opt.value && styles.activeStatusItem
                  ]}
                  onPress={() => setPaymentStatus(opt.value)}
                >
                  <View style={[styles.statusIconContainer, paymentStatus === opt.value && styles.activeStatusIconContainer]}>
                    <Ionicons name={opt.icon as any} size={20} color={paymentStatus === opt.value ? COLORS.primary : COLORS.textSecondary} />
                  </View>
                  <Text style={[styles.statusText, paymentStatus === opt.value && styles.activeStatusText]}>
                    {opt.label}
                  </Text>
                  {paymentStatus === opt.value && (
                    <View style={styles.checkCircle}>
                      <Ionicons name="checkmark" size={14} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* PAYMENT METHOD SECTION */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="card-outline" size={20} color={COLORS.textSecondary} />
              </View>
              <Text style={styles.sectionTitle}>Payment Method</Text>
            </View>

            <View style={styles.statusList}>
              {paymentMethodOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.statusItem,
                    paymentMethod === opt.value && styles.activeStatusItem
                  ]}
                  onPress={() => setPaymentMethod(opt.value)}
                >
                  <View style={[styles.statusIconContainer, paymentMethod === opt.value && styles.activeStatusIconContainer]}>
                    <Ionicons name={opt.icon as any} size={20} color={paymentMethod === opt.value ? COLORS.primary : COLORS.textSecondary} />
                  </View>
                  <Text style={[styles.statusText, paymentMethod === opt.value && styles.activeStatusText]}>
                    {opt.label}
                  </Text>
                  {paymentMethod === opt.value && (
                    <View style={styles.checkCircle}>
                      <Ionicons name="checkmark" size={14} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* FOOTER */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
              <Text style={styles.applyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>

          {/* DATE PICKERS */}
          {showPicker === 'start' && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={(e, date) => {
                if (date) setStartDate(date);
                setShowPicker('end');
              }}
            />
          )}
          {showPicker === 'end' && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={(e, date) => {
                setShowPicker(null);
                if (date) setEndDate(date);
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    padding: SPACING.lg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '92%',
  },
  dragHandle: {
    width: 60,
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  filterIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    marginBottom: 15,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  dateOptionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceVariant,
    minWidth: '22%',
    alignItems: 'center',
  },
  activeDateOption: {
    backgroundColor: COLORS.primaryLight + '50',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  dateOptionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeDateOptionText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  customDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 25,
    backgroundColor: COLORS.surface,
  },
  customDateIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  customDateLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  customDateValue: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statusList: {
    gap: 10,
    paddingBottom: 20,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeStatusItem: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '10',
  },
  statusIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activeStatusIconContainer: {
    backgroundColor: COLORS.primaryLight + '30',
  },
  statusText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    flex: 1,
  },
  activeStatusText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  resetBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  applyBtn: {
    flex: 2,
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  applyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
