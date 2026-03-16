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
  RefreshControl,
} from 'react-native';

import OrderFilter from '@/src/components/common/Filter';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '@/src/constants/theme';

export default function Home() {

  const [search, setSearch] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

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
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />

          <TextInput
            placeholder="Search orders..."
            placeholderTextColor={COLORS.textSecondary}
            value={search}
            onChangeText={setSearch}
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="filter" size={20} color={COLORS.primary} />
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
            color={COLORS.primary}
          />
        </TouchableOpacity>

      </View>

      {/* ORDERS OR EMPTY STATE */}

      {filteredOrders.length > 0 ? (

        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
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
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },

  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.sm,
  },

  input: {
    flex: 1,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.size.sm,
  },

  filterBtn: {
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.surfaceVariant,
    padding: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },

  /* SUMMARY ROW */
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },

  summaryText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weight.semibold,
    fontSize: TYPOGRAPHY.size.sm,
  },

  notificationBtn: {
    backgroundColor: COLORS.surfaceVariant,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },

  /* ORDER CARD */
  orderCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  orderName: {
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.weight.bold,
    fontSize: TYPOGRAPHY.size.md,
  },

  orderStatus: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.size.xs,
    marginTop: SPACING.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
  },

  /* EMPTY STATE */
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },

  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: SPACING.lg,
    opacity: 0.8,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
  },

  emptySubtitle: {
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
    fontSize: TYPOGRAPHY.size.sm,
  },
});