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
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
  Vibration,
} from 'react-native';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
// Notifications are now required conditionally to avoid Expo Go errors

dayjs.extend(relativeTime);
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';

import { 
  useGetAdminOrdersQuery,
  useGetAdminOrderByIdQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  useAssignDeliveryMutation,
  useGetDeliveryPersonsQuery,
} from '../../src/api/orderApi';
import { AdminOrderSummaryDto, AdminOrderDetailDto, DeliveryPersonDto } from '../../src/types/order';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '../../src/constants/theme';
import OrderFilter from '../../src/components/common/Filter';
import { useNotification } from '../../src/context/NotificationContext';

export default function Home() {
  const [search, setSearch] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetailDto | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [deliveryBoyId, setDeliveryBoyId] = useState<number | null>(null);
  const [activeFilters, setActiveFilters] = useState<any>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const { showToast } = useNotification();
  const lastOrderIdRef = React.useRef<number | null>(null);

  const queryParams = {
    orderStatus: (activeFilters?.orderStatus && activeFilters.orderStatus !== 'all') ? activeFilters.orderStatus.toUpperCase() : undefined,
    paymentStatus: (activeFilters?.paymentStatus && activeFilters.paymentStatus !== 'all') ? activeFilters.paymentStatus.toUpperCase() : undefined,
    paymentMethod: (activeFilters?.paymentMethod && activeFilters.paymentMethod !== 'all') ? activeFilters.paymentMethod.toUpperCase() : undefined,
    startDate: activeFilters?.startDate ? dayjs(activeFilters.startDate).format('YYYY-MM-DD') : undefined,
    endDate: activeFilters?.endDate ? dayjs(activeFilters.endDate).format('YYYY-MM-DD') : undefined,
    search: search || undefined,
  };

  React.useEffect(() => {
    console.log('Fetching Orders with Params:', queryParams);
  }, [activeFilters, search]);

  const { data: orders, isLoading, isFetching, isError, refetch } = useGetAdminOrdersQuery(queryParams, {
    pollingInterval: 30000,
  });
  const { data: orderDetail, isFetching: isDetailFetching } = useGetAdminOrderByIdQuery(selectedOrder?.id || 0, {
    skip: !selectedOrder?.id
  });
  const { data: deliveryBoys } = useGetDeliveryPersonsQuery();

  const [acceptOrder] = useAcceptOrderMutation();
  const [rejectOrder] = useRejectOrderMutation();
  const [assignDelivery] = useAssignDeliveryMutation();
  const router = useRouter();

  // Notification Configuration
  React.useEffect(() => {
    // Check if running in Expo Go - Some features (like push token registration) 
    // are not supported and trigger errors/warnings in SDK 54+
    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
    
    if (isExpoGo) {
      console.log('Running in Expo Go: Notification setup skipped to avoid library errors.');
      return;
    }

    // Lazy require to avoid top-level side effects
    const Notifications = require('expo-notifications');

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    async function registerForNotifications() {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
      }
    }
    registerForNotifications();
  }, []);

  // Monitor for new orders
  React.useEffect(() => {
    if (orders && orders.length > 0) {
      const latestOrder = orders[0]; // Assuming API returns sorted by date DESC
      
      if (lastOrderIdRef.current !== null && latestOrder.id > lastOrderIdRef.current) {
        // NEW ORDER DETECTED
        handleNewOrderNotification(latestOrder);
      }
      
      lastOrderIdRef.current = latestOrder.id;
    }
  }, [orders]);

  // Load filters on mount
  React.useEffect(() => {
    const loadFilters = async () => {
      try {
        const savedFilters = await AsyncStorage.getItem('admin_order_filters');
        if (savedFilters) {
          setActiveFilters(JSON.parse(savedFilters));
        }
      } catch (e) {
        console.error('Failed to load filters', e);
      }
    };
    loadFilters();
  }, []);

  const handleUpdateFilters = async (filters: any) => {
    setActiveFilters(filters);
    try {
      await AsyncStorage.setItem('admin_order_filters', JSON.stringify(filters));
    } catch (e) {
      console.error('Failed to save filters', e);
    }
  };

  const handleNewOrderNotification = async (order: AdminOrderSummaryDto) => {
    setNotificationCount(prev => prev + 1);
    
    // Show Premium In-App Toast
    showToast({
      title: "New Order Received! 🍕",
      body: `Order #${order.orderNumber} from ${order.customerName} for ₹${order.grandTotal.toFixed(2)}`,
      onPress: () => {
        setSelectedOrder(order as any);
        setDetailModalOpen(true);
      }
    });

    // Vibration still works in Expo Go
    Vibration.vibrate([0, 500, 200, 500]);

    // Show System Notification if NOT in Expo Go (Production/Dev Build)
    if (Constants.executionEnvironment !== ExecutionEnvironment.StoreClient) {
      try {
        const Notifications = require('expo-notifications');
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "New Order Received! 🍕",
            body: `Order #${order.orderNumber} from ${order.customerName} for ₹${order.grandTotal.toFixed(2)}`,
            data: { orderId: order.id },
          },
          trigger: null,
        });
      } catch (err) {
        console.warn('Failed to show system notification:', err);
      }
    }

    // Save to local notification history
    try {
      const historyStr = await AsyncStorage.getItem('notification_history');
      const history = historyStr ? JSON.parse(historyStr) : [];
      const newEntry = {
        id: Date.now(),
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        total: order.grandTotal,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      await AsyncStorage.setItem('notification_history', JSON.stringify([newEntry, ...history].slice(0, 50)));
    } catch (e) {
      console.error("Failed to save notification history", e);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return COLORS.warning;
      case 'confirmed': return COLORS.info;
      case 'processing': return COLORS.info;
      case 'shipped': return COLORS.primary;
      case 'delivered': return COLORS.success;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textTertiary;
    }
  };

  const handleAcceptOrder = async (orderId: number) => {
    try {
      await acceptOrder({ orderId }).unwrap();
      Alert.alert('Success', 'Order accepted successfully!');
      refetch();
    } catch (error) {
      Alert.alert('Error', 'Failed to accept order');
    }
  };

  const handleRejectOrder = async () => {
    if (selectedOrder && rejectReason.trim()) {
      try {
        await rejectOrder({ 
          orderId: selectedOrder.id, 
          reason: rejectReason 
        }).unwrap();
        Alert.alert('Success', 'Order rejected successfully!');
        setRejectModalOpen(false);
        setRejectReason('');
        refetch();
      } catch (error) {
        Alert.alert('Error', 'Failed to reject order');
      }
    }
  };

  const handleAssignDelivery = async () => {
    if (selectedOrder && deliveryBoyId) {
      try {
        await assignDelivery({ 
          orderId: selectedOrder.id, 
          deliveryPersonId: deliveryBoyId 
        }).unwrap();
        Alert.alert('Success', 'Delivery person assigned!');
        setAssignModalOpen(false);
        setDeliveryBoyId(null);
        refetch();
      } catch (error) {
        Alert.alert('Error', 'Failed to assign delivery person');
      }
    }
  };

  /* ADVANCED FILTERING - API DRIVEN WITH LOCAL FALLBACK */
  const filteredOrders = (orders || []).filter(order => {
    if (!activeFilters) {
      // If no active filters, only apply search
      if (search) {
        const s = search.toLowerCase();
        return order.orderNumber?.toLowerCase().includes(s) || 
               order.customerName?.toLowerCase().includes(s);
      }
      return true;
    }
    
    // Order Status
    if (activeFilters.orderStatus && activeFilters.orderStatus !== 'all') {
      if (order.orderStatus?.toLowerCase() !== activeFilters.orderStatus.toLowerCase()) return false;
    }
    
    // Payment Status
    if (activeFilters.paymentStatus && activeFilters.paymentStatus !== 'all') {
      if (order.paymentStatus?.toLowerCase() !== activeFilters.paymentStatus.toLowerCase()) return false;
    }

    // Date Range
    if (activeFilters.startDate) {
      const orderDate = dayjs(order.placedAt);
      const start = dayjs(activeFilters.startDate).startOf('day');
      if (orderDate.isBefore(start)) return false;
    }
    if (activeFilters.endDate) {
      const orderDate = dayjs(order.placedAt);
      const end = dayjs(activeFilters.endDate).endOf('day');
      if (orderDate.isAfter(end)) return false;
    }

    // Search
    if (search) {
      const s = search.toLowerCase();
      const matchesSearch = order.orderNumber?.toLowerCase().includes(s) || 
                           order.customerName?.toLowerCase().includes(s);
      if (!matchesSearch) return false;
    }

    return true;
  });

  const completedOrdersCount = filteredOrders.filter(o => o.orderStatus?.toLowerCase() === 'delivered').length;

  const renderOrderItem = ({ item }: { item: AdminOrderSummaryDto }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => {
        setSelectedOrder(item as any);
        setDetailModalOpen(true);
      }}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumberTitle}>#{item.orderNumber}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.orderStatus) + '20' }]}>
            <Text style={[styles.statusBadgeText, { color: getStatusColor(item.orderStatus) }]}>
              {(item.orderStatus || 'PENDING').toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => {
              setSelectedOrder(item as any);
              setActionMenuVisible(true);
            }}
            style={styles.moreButton}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.orderBody}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <Text style={styles.orderDate}>{dayjs(item.placedAt).format('DD MMM, hh:mm A')}</Text>
        <View style={styles.orderFooter}>
          <Text style={styles.orderTotal}>₹{(item.grandTotal || 0).toFixed(2)}</Text>
          <View style={styles.actionButtons}>
            {item.orderStatus === 'CONFIRMED' && (
              <TouchableOpacity 
                onPress={() => {
                  setSelectedOrder(item as any);
                  setAssignModalOpen(true);
                }}
                style={[styles.assignButton]}
              >
                <Text style={styles.assignButtonText}>Assign</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            placeholder="Search order or customer..."
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
          Orders: {completedOrdersCount} Delivered
        </Text>
        <TouchableOpacity 
          style={styles.notificationBtn} 
          onPress={() => {
            setNotificationCount(0);
            router.push('/notifications');
          }}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={COLORS.primary}
          />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* LIST OR STATE */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load orders.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={Array.isArray(filteredOrders) ? filteredOrders : []}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          renderItem={renderOrderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4076/4076549.png' }}
                style={styles.emptyImage}
              />
              <Text style={styles.emptyTitle}>No Orders Found</Text>
              <Text style={styles.emptySubtitle}>There are no orders matching your criteria.</Text>
            </View>
          }
        />
      )}

      {/* MODALS & FILTERS */}
      <OrderFilter
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={(filters) => {
          handleUpdateFilters(filters);
        }}
      />

      <Modal
        visible={detailModalOpen}
        animationType="slide"
        onRequestClose={() => setDetailModalOpen(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setDetailModalOpen(false)}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Order Details</Text>
            <View style={{ width: 28 }} />
          </View>

          {isDetailFetching ? (
            <ActivityIndicator style={{ marginTop: 50 }} color={COLORS.primary} />
          ) : orderDetail ? (
            <ScrollView style={styles.modalContent}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Customer Info</Text>
                <Text style={styles.infoText}><Text style={styles.bold}>Name:</Text> {orderDetail.customerName}</Text>
                <Text style={styles.infoText}><Text style={styles.bold}>Phone:</Text> {orderDetail.customerPhone}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                {(() => {
                  const addr = (orderDetail as any).address || (orderDetail as any).customer?.address;
                  if (!addr) return <Text style={styles.addressText}>No address provided</Text>;
                  return (
                    <>
                      <Text style={styles.addressText}>{addr.addressLine1}</Text>
                      {addr.addressLine2 && <Text style={styles.addressText}>{addr.addressLine2}</Text>}
                      <Text style={styles.addressText}>{addr.city}, {addr.state} - {addr.postalCode}</Text>
                    </>
                  );
                })()}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Items</Text>
                {(Array.isArray(orderDetail.items) ? orderDetail.items : []).map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.productName}</Text>
                      <Text style={styles.itemVariant}>{item.variantName}</Text>
                    </View>
                    <Text style={styles.itemQty}>x{item.quantity}</Text>
                    <Text style={styles.itemPrice}>₹{item.totalPrice}</Text>
                  </View>
                ))}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Grand Total</Text>
                  <Text style={styles.totalValue}>₹{(orderDetail.grandTotal || 0).toFixed(2)}</Text>
                </View>
              </View>

              <View style={[styles.section, { marginTop: 20 }]}>
                <Text style={styles.sectionTitle}>Actions</Text>
                <View style={styles.detailActions}>
                  {(orderDetail.orderStatus?.toLowerCase() === 'pending' || orderDetail.orderStatus?.toLowerCase() === 'placed') && (
                    <>
                      <TouchableOpacity 
                        style={[styles.primaryAction, { backgroundColor: COLORS.success }]}
                        onPress={() => {
                          setDetailModalOpen(false);
                          handleAcceptOrder(orderDetail.id);
                        }}
                      >
                        <Ionicons name="checkmark-circle" size={20} color="white" />
                        <Text style={styles.actionText}>Accept Order</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.primaryAction, { backgroundColor: COLORS.error }]}
                        onPress={() => {
                          setDetailModalOpen(false);
                          setRejectModalOpen(true);
                        }}
                      >
                        <Ionicons name="close-circle" size={20} color="white" />
                        <Text style={styles.actionText}>Reject Order</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {(orderDetail.orderStatus?.toLowerCase() === 'confirmed' || orderDetail.orderStatus?.toLowerCase() === 'processing') && (
                    <TouchableOpacity 
                      style={[styles.primaryAction, { backgroundColor: COLORS.primary }]}
                      onPress={() => {
                        setDetailModalOpen(false);
                        setAssignModalOpen(true);
                      }}
                    >
                      <Ionicons name="bicycle" size={20} color="white" />
                      <Text style={styles.actionText}>Assign Delivery</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </ScrollView>
          ) : (
            <Text style={styles.errorText}>Failed to load order details</Text>
          )}
        </View>
      </Modal>

      {/* Assign Delivery Modal */}
      <Modal
        visible={assignModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAssignModalOpen(false)}
      >
        <View style={styles.rejectOverlay}>
          <View style={styles.rejectModal}>
            <Text style={styles.modalTitle}>Assign Delivery Boy</Text>
            <Text style={styles.modalText}>Select a delivery person for Order #{selectedOrder?.orderNumber}</Text>
            
            <ScrollView style={{ maxHeight: 300, marginVertical: 10 }}>
              {(Array.isArray(deliveryBoys) ? deliveryBoys : []).map((boy) => (
                <TouchableOpacity 
                  key={boy.id}
                  style={[
                    styles.boyItem,
                    deliveryBoyId === boy.id && styles.activeBoyItem
                  ]}
                  onPress={() => setDeliveryBoyId(boy.id)}
                >
                  <View>
                    <Text style={[styles.boyName, deliveryBoyId === boy.id && styles.activeBoyText]}>{boy.name}</Text>
                    <Text style={styles.boyInfo}>{boy.phoneNumber} • {boy.currentLoad} active orders</Text>
                  </View>
                  {deliveryBoyId === boy.id && <Ionicons name="checkmark-circle" size={20} color="white" />}
                </TouchableOpacity>
              ))}
              {(!deliveryBoys || deliveryBoys.length === 0) && (
                <Text style={styles.emptyText}>No delivery personnel available</Text>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setAssignModalOpen(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleAssignDelivery} 
                style={[styles.modalConfirmBtn, { backgroundColor: COLORS.primary }]}
                disabled={!deliveryBoyId}
              >
                <Text style={styles.modalConfirmText}>Assign Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Action Menu Modal */}
      <Modal
        visible={actionMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActionMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay} 
          activeOpacity={1} 
          onPress={() => setActionMenuVisible(false)}
        >
          <View style={styles.menuContent}>
            <Text style={styles.menuOrderTitle}>Order #{selectedOrder?.orderNumber}</Text>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setActionMenuVisible(false);
                setDetailModalOpen(true);
              }}
            >
              <Ionicons name="eye-outline" size={20} color={COLORS.text} />
              <Text style={styles.menuItemText}>View Details</Text>
            </TouchableOpacity>

            {(selectedOrder?.orderStatus?.toLowerCase() === 'pending' || selectedOrder?.orderStatus?.toLowerCase() === 'placed') && (
              <>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setActionMenuVisible(false);
                    handleAcceptOrder(selectedOrder.id);
                  }}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} />
                  <Text style={[styles.menuItemText, { color: COLORS.success }]}>Accept Order</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setActionMenuVisible(false);
                    setRejectModalOpen(true);
                  }}
                >
                  <Ionicons name="close-circle-outline" size={20} color={COLORS.error} />
                  <Text style={[styles.menuItemText, { color: COLORS.error }]}>Reject Order</Text>
                </TouchableOpacity>
              </>
            )}

            {(selectedOrder?.orderStatus?.toLowerCase() === 'confirmed' || selectedOrder?.orderStatus?.toLowerCase() === 'processing') && (
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setActionMenuVisible(false);
                  setAssignModalOpen(true);
                }}
              >
                <Ionicons name="bicycle-outline" size={20} color={COLORS.primary} />
                <Text style={[styles.menuItemText, { color: COLORS.primary }]}>Assign Delivery</Text>
              </TouchableOpacity>
            )}

            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => setActionMenuVisible(false)}
            >
              <Text style={[styles.menuItemText, { color: COLORS.textTertiary, textAlign: 'center', width: '100%' }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Reject Modal */}
      <Modal
        visible={rejectModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRejectModalOpen(false)}
      >
        <View style={styles.rejectOverlay}>
          <View style={styles.rejectModal}>
            <Text style={styles.modalTitle}>Reject Order</Text>
            <Text style={styles.modalText}>Please provide a reason for rejecting this order.</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Reason for rejection"
              multiline
              numberOfLines={3}
              value={rejectReason}
              onChangeText={setRejectReason}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setRejectModalOpen(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRejectOrder} style={styles.modalConfirmBtn}>
                <Text style={styles.modalConfirmText}>Confirm Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  orderCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  orderNumberTitle: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  orderBody: {},
  customerName: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 6,
    borderRadius: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyImage: {
    width: 150,
    height: 150,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemVariant: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  itemQty: {
    fontSize: 14,
    marginHorizontal: 10,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 60,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  rejectOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  rejectModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
  },
  modalText: {
    marginBottom: 15,
    color: COLORS.textSecondary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
  },
  modalCancelBtn: {
    padding: 10,
  },
  modalConfirmBtn: {
    backgroundColor: COLORS.error,
    padding: 10,
    borderRadius: 8,
  },
  modalConfirmText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalCancelText: {
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  bold: {
    fontWeight: 'bold',
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    color: COLORS.error,
    marginBottom: 10,
  },
  assignButton: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  assignButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  boyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceVariant,
    marginBottom: 8,
  },
  activeBoyItem: {
    backgroundColor: COLORS.primary,
  },
  boyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  activeBoyText: {
    color: 'white',
  },
  boyInfo: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginVertical: 20,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.surfaceVariant,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  moreButton: {
    padding: 4,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    ...SHADOWS.lg,
  },
  menuOrderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  detailActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    flex: 1,
    minWidth: '45%',
    justifyContent: 'center',
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});