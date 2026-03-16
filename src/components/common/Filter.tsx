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
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@/src/constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
};

export default function OrderFilter({ visible, onClose, onApply }: Props) {
  const [dateRange, setDateRange] = useState('today');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDate, setCustomDate] = useState(new Date());

  const [orderStatus, setOrderStatus] = useState('all');
  const [assignmentStatus, setAssignmentStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('latest');

  const applyFilters = () => {
    onApply({
      dateRange,
      orderStatus,
      assignmentStatus,
      sortOrder,
      customDate,
    });
    onClose();
  };

  const resetFilters = () => {
    setDateRange('today');
    setOrderStatus('all');
    setAssignmentStatus('all');
    setSortOrder('latest');
  };

  const Option = ({
    label,
    value,
    state,
    setState,
  }: any) => (
    <TouchableOpacity
      style={[
        styles.optionBtn,
        state === value && styles.activeOption,
      ]}
      onPress={() => setState(value)}
    >
      <Text style={styles.optionText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Filter Orders</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={26} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Customize your order view
          </Text>

          {/* DATE RANGE */}
          <Text style={styles.section}>Date Range</Text>

          <View style={styles.row}>
            <Option label="Today" value="today" state={dateRange} setState={setDateRange} />
            <Option label="Yesterday" value="yesterday" state={dateRange} setState={setDateRange} />
          </View>

          <View style={styles.row}>
            <Option label="This Week" value="week" state={dateRange} setState={setDateRange} />
            <Option label="This Month" value="month" state={dateRange} setState={setDateRange} />
          </View>

          <TouchableOpacity
            style={styles.customBtn}
            onPress={() => {
              setDateRange('custom');
              setShowDatePicker(true);
            }}
          >
            <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
            <Text style={styles.customText}>Custom Date</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={customDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setCustomDate(date);
              }}
            />
          )}

          {/* ORDER STATUS */}
          <Text style={styles.section}>Order Status</Text>

          <View style={styles.row}>
            <Option label="All" value="all" state={orderStatus} setState={setOrderStatus} />
            <Option label="Completed" value="completed" state={orderStatus} setState={setOrderStatus} />
          </View>

          <View style={styles.row}>
            <Option label="Cancelled" value="cancelled" state={orderStatus} setState={setOrderStatus} />
            <Option label="Pending" value="pending" state={orderStatus} setState={setOrderStatus} />
          </View>

          {/* ASSIGNMENT STATUS */}
          <Text style={styles.section}>Assignment Status</Text>

          <View style={styles.row}>
            <Option label="Assigned" value="assigned" state={assignmentStatus} setState={setAssignmentStatus} />
            <Option label="Unassigned" value="unassigned" state={assignmentStatus} setState={setAssignmentStatus} />
          </View>

          {/* SORT */}
          <Text style={styles.section}>Sort Orders</Text>

          <View style={styles.row}>
            <Option label="Latest" value="latest" state={sortOrder} setState={setSortOrder} />
            <Option label="Oldest" value="oldest" state={sortOrder} setState={setSortOrder} />
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
              <Text style={styles.applyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'flex-end',
  },

  container: {
    backgroundColor: COLORS.background,
    padding: SPACING.lg - 4,
    borderTopLeftRadius: BORDER_RADIUS.lg + 8,
    borderTopRightRadius: BORDER_RADIUS.lg + 8,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  title: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },

  subtitle: {
    color: COLORS.textSecondary,
    marginVertical: SPACING.md - 6,
  },

  section: {
    color: COLORS.textSecondary,
    marginTop: SPACING.md - 1,
  },

  row: {
    flexDirection: 'row',
    marginTop: SPACING.sm + 2,
  },

  optionBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.sm + 2,
    marginRight: SPACING.sm,
    alignItems: 'center',
  },

  activeOption: {
    backgroundColor: COLORS.primary,
  },

  optionText: {
    color: COLORS.white,
  },

  customBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm + 2,
  },

  customText: {
    color: COLORS.primary,
    marginLeft: SPACING.sm - 3,
  },

  footer: {
    flexDirection: 'row',
    marginTop: SPACING.lg + 1,
  },

  resetBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    padding: SPACING.md - 4,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm + 2,
    alignItems: 'center',
  },

  resetText: {
    color: COLORS.textSecondary,
  },

  applyBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: SPACING.md - 4,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },

  applyText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },

});
