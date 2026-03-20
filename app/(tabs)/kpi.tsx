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

type Metric = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  categories: string;
};

export default function PulseScreen() {

  const today = new Date();

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
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
    // Here we would normally refetch the KPI data based on filters
  };

  const formatDate = (date: any) => {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const metrics: Metric[] = [
    {
      title: 'Top Products',
      icon: 'cube-outline',
      description: 'Sri Lalitha Brand Rice',
      categories: 'Atta, Rice, Oil & Dals...',
    },
    {
      title: 'Top Location',
      icon: 'location-outline',
      description: 'Hyderabad Market',
      categories: 'Atta, Rice, Oil & Dals...',
    },
    {
      title: 'Operations',
      icon: 'settings-outline',
      description: 'Store Operations',
      categories: 'Orders, Inventory...',
    },
    {
      title: 'Delivery Stats',
      icon: 'car-outline',
      description: 'Fast Delivery',
      categories: '0-15km coverage',
    },
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
        <Text style={styles.heading}>Key Performance Index</Text>

        <TouchableOpacity style={styles.dateBtn} onPress={() => setFilterVisible(true)}>
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
        <Ionicons name="information-circle" size={26} color="#ffd33d" />
        <Text style={styles.infoText}>
          Metrics are collected for all stores in the selected date/time range
        </Text>
      </View>

      {/* RANGE CARD */}
      <View style={styles.rangeCard}>
        <Ionicons name="calendar" size={26} color="#ffd33d" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.rangeTitle}>Selected Date Range</Text>
          <Text style={styles.rangeValue}>
            {formatDate(startDate)} - {formatDate(endDate)}
          </Text>
        </View>
      </View>

      {/* BUSINESS HEALTH CARD */}
      <View style={styles.sectionCard}>

        <View style={styles.sectionHeader}>
          <Ionicons name="pulse-outline" size={24} color="#ffd33d" />
          <Text style={styles.sectionTitle}>Business Health</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Total Orders</Text>
          <Text style={styles.value}>4,291</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Total Revenue</Text>
          <Text style={styles.value}>₹92,540</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Cancelled Orders</Text>
          <Text style={styles.value}>₹1,120</Text>
        </View>

      </View>


      {/* CUSTOMER INSIGHTS CARD */}
      <View style={styles.sectionCard}>

        <View style={styles.sectionHeader}>
          <Ionicons name="people-outline" size={24} color="#ffd33d" />
          <Text style={styles.sectionTitle}>Customer Insights</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Active Customers</Text>
          <Text style={styles.value}>1,245</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>New Customers</Text>
          <Text style={styles.value}>210</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Returning Customers</Text>
          <Text style={styles.value}>780</Text>
        </View>

      </View>

      {/* METRICS GRID */}
      <View style={styles.grid}>
        {metrics.map((item, index) => (
          <View key={index} style={styles.metricCard}>

            <Ionicons name={item.icon} size={26} color="#ffd33d" />

            <View style={styles.metricText}>
              <Text style={styles.metricTitle}>{item.title}</Text>
              <Text style={styles.metricDescription}>{item.description}</Text>
              <Text style={styles.metricCategories}>{item.categories}</Text>
            </View>

          </View>
        ))}
      </View>

      {/* VISITORS */}
      <View style={styles.visitorCard}>

        <Ionicons name="eye-outline" size={26} color="#ffd33d" />

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
    fontSize: 20,
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
    fontSize: 12,
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
    fontSize: 12,
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
  },

  metricText: {
    marginLeft: 10,
    flex: 1,
  },

  metricTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },

  metricDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },

  metricCategories: {
    color: COLORS.primary,
    fontSize: 11,
    marginTop: 2,
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
  sectionCard: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  value: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },

});