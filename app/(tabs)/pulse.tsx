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

export default function PulseScreen() {

  const today = new Date();

  const [showPicker, setShowPicker] = useState(false);
  const [selectingStart, setSelectingStart] = useState(true);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

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
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.heading}>Pulse</Text>

        <TouchableOpacity
          style={styles.dateBtn}
          onPress={openPicker}
        >
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

      {/* METRICS */}
      <View style={styles.grid}>
        {metrics.map((item, index) => (
          <View key={index} style={styles.metricCard}>

            <Ionicons
              name={item.icon as any}
              size={26}
              color="#ffd33d"
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

        <Ionicons name="eye" size={26} color="#ffd33d" />

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
    fontSize: 22,
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
    alignItems: 'center',
  },

  metricText: {
    marginLeft: 10,
  },

  metricTitle: {
    color: '#aaa',
    fontSize: 12,
  },

  metricValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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

});