import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import OrderFilter from '@/components/Filter';

export default function Home() {

  const [search, setSearch] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  /* SAMPLE ORDERS */

  const orders = [
    { id: '1', name: 'Order #1023', status: 'Pending' },
    { id: '2', name: 'Order #1024', status: 'Completed' },
    { id: '3', name: 'Order #1025', status: 'Cancelled' },
    { id: '4', name: 'Order #1026', status: 'Completed' },
  ];

  /* COMPLETED COUNT */

  const completedOrders = orders.filter(
    (order) => order.status === 'Completed'
  ).length;

  /* SEARCH FILTER */

  const filteredOrders = orders.filter((order) =>
    order.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#aaa" />

          <TextInput
            placeholder="Search orders..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="filter" size={20} color="#fff" />
        </TouchableOpacity>

      </View>

      {/* SUMMARY ROW */}

      <View style={styles.summaryRow}>

        <Text style={styles.summaryText}>
          Orders: {completedOrders} Completed
        </Text>

        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons
            name="notifications-outline"
            size={22}
            color="#fff"
          />
        </TouchableOpacity>

      </View>

      {/* ORDERS OR EMPTY STATE */}

      {filteredOrders.length > 0 ? (

        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (

            <View style={styles.orderCard}>

              <View>
                <Text style={styles.orderName}>
                  {item.name}
                </Text>

                <Text style={styles.orderStatus}>
                  {item.status}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#aaa"
              />

            </View>

          )}
        />

      ) : (

        <View style={styles.emptyContainer}>

          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/4076/4076549.png',
            }}
            style={styles.emptyImage}
          />

          <Text style={styles.emptyTitle}>
            No Orders Found
          </Text>

          <Text style={styles.emptySubtitle}>
            Try adjusting your search or filters.
          </Text>

        </View>

      )}

      {/* FILTER MODAL */}

      <OrderFilter
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={(filters) => {
          console.log(filters);
        }}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 15,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    marginBottom: 10,
  },

  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a3f47',
    borderRadius: 8,
    paddingHorizontal: 10,
  },

  input: {
    flex: 1,
    color: '#fff',
    marginLeft: 8,
  },

  filterBtn: {
    marginLeft: 10,
    backgroundColor: '#3a3f47',
    padding: 10,
    borderRadius: 8,
  },

  /* SUMMARY ROW */

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  summaryText: {
    color: '#ffd33d',
    fontWeight: '600',
    fontSize: 14,
  },

  notificationBtn: {
    backgroundColor: '#3a3f47',
    padding: 8,
    borderRadius: 8,
  },

  /* ORDER CARD */

  orderCard: {
    backgroundColor: '#3a3f47',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  orderName: {
    color: '#fff',
    fontWeight: 'bold',
  },

  orderStatus: {
    color: '#aaa',
    marginTop: 4,
  },

  /* EMPTY STATE */

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 15,
    opacity: 0.7,
  },

  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  emptySubtitle: {
    color: '#aaa',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 40,
  },

});