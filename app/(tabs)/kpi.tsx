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
} from 'react-native';

type Metric = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  categories: string;
};

export default function PulseScreen() {

  const today = new Date();

  const [showPicker, setShowPicker] = useState(false);
  const [selectingStart, setSelectingStart] = useState(true);

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  const openPicker = () => {
    setSelectingStart(true);
    setShowPicker(true);
  };

  const onChange = (event: any, selectedDate: any) => {

    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }

    if (selectedDate) {

      if (selectingStart) {
        setStartDate(selectedDate);
        setSelectingStart(false);

        // open end date picker
        setTimeout(() => {
          setShowPicker(true);
        }, 200);

      } else {
        setEndDate(selectedDate);
        setShowPicker(false);
        setSelectingStart(true);
      }

    }
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
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.heading}>Key Performance Index</Text>

        <TouchableOpacity style={styles.dateBtn} onPress={openPicker}>
          <Ionicons name="calendar-outline" size={18} color="#fff" />
          <Text style={styles.dateText}>
            {formatDate(startDate)} - {formatDate(endDate)}
          </Text>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={selectingStart ? startDate : endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={today}
          minimumDate={selectingStart ? undefined : startDate}
          onChange={onChange}
        />
      )}

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
    backgroundColor: '#25292e',
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
    color: '#ffd33d',
    fontWeight: 'bold',
  },

  dateBtn: {
    flexDirection: 'row',
    backgroundColor: '#3a3f47',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },

  dateText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 12,
  },

  infoCard: {
    backgroundColor: '#3a3f47',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  infoText: {
    color: '#aaa',
    marginLeft: 10,
    flex: 1,
    fontSize: 12,
  },

  rangeCard: {
    backgroundColor: '#3a3f47',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  rangeTitle: {
    color: '#aaa',
    fontSize: 12,
  },

  rangeValue: {
    color: '#fff',
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
    backgroundColor: '#3a3f47',
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
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  metricDescription: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 3,
  },

  metricCategories: {
    color: '#ffd33d',
    fontSize: 11,
    marginTop: 2,
  },

  visitorCard: {
    backgroundColor: '#3a3f47',
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  visitorTitle: {
    color: '#aaa',
  },

  visitorValue: {
    color: '#ffd33d',
    fontSize: 22,
    fontWeight: 'bold',
  },

  visitorSub: {
    color: '#aaa',
    fontSize: 12,
  },
  sectionCard: {
    backgroundColor: '#3a3f47',
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
    color: '#fff',
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
    color: '#aaa',
    fontSize: 13,
  },

  value: {
    color: '#ffd33d',
    fontWeight: 'bold',
    fontSize: 14,
  },

});