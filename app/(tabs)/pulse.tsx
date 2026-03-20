import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@/src/constants/theme';
import OrderFilter from '@/src/components/common/Filter';

export default function PulseScreen() {

  const today = new Date();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>(null);

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleApplyFilter = (filters: any) => {
    setActiveFilters(filters);
    if (filters.startDate) setStartDate(new Date(filters.startDate));
    if (filters.endDate) setEndDate(new Date(filters.endDate));
    // Here we would normally refetch the pulse data based on filters
  };

  const formatDate = (date: any) => {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const metrics = [
    { title: 'Orders Completed', value: '4,291', icon: 'checkmark-done' },
    { title: 'Total Sales', value: '₹92,540', icon: 'cash' },
    { title: 'Active Users', value: '1,245', icon: 'people' },
    { title: 'Delivery Cost', value: '₹8,200', icon: 'car' },
    { title: 'Canceled Sales', value: '₹1,120', icon: 'close-circle' },
    { title: 'Last Order', value: '2 mins ago', icon: 'time' },
    { title: 'Avg Rating', value: '4.6', icon: 'star' },
    { title: 'Distance Range', value: '0-15 km', icon: 'map' },
  ];

  return (
    <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
    >

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.heading}>Pulse</Text>

        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
          <Text style={styles.dateText}>
            {formatDate(startDate)} - {formatDate(endDate)}
          </Text>
        </TouchableOpacity>
      </View>

      <OrderFilter 
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={handleApplyFilter}
      />

      {/* INFO CARD */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={26} color={COLORS.primary} />
        <Text style={styles.infoText}>
          Metrics are collected for all stores in the selected date/time range
        </Text>
      </View>

      {/* RANGE CARD */}
      <View style={styles.rangeCard}>
        <Ionicons name="calendar" size={26} color={COLORS.primary} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.rangeTitle}>Selected Date Range</Text>
          <Text style={styles.rangeValue}>
            {formatDate(startDate)} - {formatDate(endDate)}
          </Text>
        </View>
      </View>

      {/* METRICS */}
      <View style={styles.grid}>
        {metrics.map((item, index) => (
          <View key={index} style={styles.metricCard}>

            <Ionicons
              name={item.icon as any}
              size={26}
              color={COLORS.primary}
            />

            <View style={styles.metricText}>
              <Text style={styles.metricTitle}>{item.title}</Text>
              <Text style={styles.metricValue}>{item.value}</Text>
            </View>

          </View>
        ))}
      </View>

      {/* VISITORS */}
      <View style={styles.visitorCard}>

        <Ionicons name="eye" size={26} color={COLORS.primary} />

        <View style={{ marginLeft: 10 }}>
          <Text style={styles.visitorTitle}>App Visitors</Text>
          <Text style={styles.visitorValue}>5,420</Text>
          <Text style={styles.visitorSub}>
            Total visitors in selected period
          </Text>
        </View>

      </View>

    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'center',
  },

  heading: {
    fontSize: 22,
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  dateBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },

  dateText: {
    color: COLORS.text,
    marginLeft: 6,
  },

  infoCard: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  infoText: {
    color: COLORS.textSecondary,
    marginLeft: 10,
    flex: 1,
  },

  rangeCard: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  rangeTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },

  rangeValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  metricCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  metricText: {
    marginLeft: 10,
  },

  metricTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },

  metricValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },

  visitorCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  visitorTitle: {
    color: COLORS.textSecondary,
  },

  visitorValue: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: 'bold',
  },

  visitorSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },

});