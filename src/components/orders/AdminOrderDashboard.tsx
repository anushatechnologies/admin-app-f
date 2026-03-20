import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { 
  useGetAdminOrdersQuery,
  useGetAdminOrderByIdQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
} from '../../api/orderApi';
import { AdminOrderSummaryDto, AdminOrderDetailDto } from '../../types/order';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import dayjs from 'dayjs';

const AdminOrderDashboard: React.FC = () => {
    const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetailDto | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const { data: orders, isLoading, isError, refetch } = useGetAdminOrdersQuery();
    const { data: orderDetail, isFetching: isDetailFetching } = useGetAdminOrderByIdQuery(selectedOrder?.id || 0, {
      skip: !selectedOrder?.id
    });
    
    const [acceptOrder, { isLoading: isAccepting }] = useAcceptOrderMutation();
    const [rejectOrder, { isLoading: isRejecting }] = useRejectOrderMutation();

    const router = useRouter();

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

    const renderOrderItem = ({ item }: { item: AdminOrderSummaryDto }) => (
        <TouchableOpacity 
            style={styles.orderCard}
            onPress={() => {
                setSelectedOrder(item as any);
                setDetailModalOpen(true);
            }}
        >
            <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.orderStatus) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.orderStatus) }]}>
                        {item.orderStatus.toUpperCase()}
                    </Text>
                </View>
            </View>
            
            <View style={styles.orderBody}>
                <Text style={styles.customerName}>{item.customerName}</Text>
                <Text style={styles.orderDate}>{dayjs(item.placedAt).format('DD MMM, hh:mm A')}</Text>
                <View style={styles.orderFooter}>
                    <Text style={styles.orderTotal}>₹{item.grandTotal.toFixed(2)}</Text>
                    <View style={styles.actionButtons}>
                        {item.orderStatus === 'PENDING' && (
                            <>
                                <TouchableOpacity 
                                    onPress={() => handleAcceptOrder(item.id)}
                                    style={[styles.iconButton, { backgroundColor: COLORS.successLight }]}
                                >
                                    <Ionicons name="checkmark" size={20} color={COLORS.success} />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => {
                                        setSelectedOrder(item as any);
                                        setRejectModalOpen(true);
                                    }}
                                    style={[styles.iconButton, { backgroundColor: COLORS.errorLight }]}
                                >
                                    <Ionicons name="close" size={20} color={COLORS.error} />
                                </TouchableOpacity>
                            </>
                        )}
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Failed to load orders. Please try again.</Text>
                <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Order Management</Text>
            
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderOrderItem}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={64} color={COLORS.textTertiary} />
                        <Text style={styles.emptyText}>No orders found.</Text>
                    </View>
                }
                refreshing={isLoading}
                onRefresh={refetch}
            />

            {/* Detail Modal */}
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
                                {orderDetail.customerEmail && <Text style={styles.infoText}><Text style={styles.bold}>Email:</Text> {orderDetail.customerEmail}</Text>}
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Delivery Address</Text>
                                <Text style={styles.addressText}>{orderDetail.address.addressLine1}</Text>
                                {orderDetail.address.addressLine2 && <Text style={styles.addressText}>{orderDetail.address.addressLine2}</Text>}
                                <Text style={styles.addressText}>{orderDetail.address.city}, {orderDetail.address.state} - {orderDetail.address.postalCode}</Text>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Order Items</Text>
                                {orderDetail.items.map((item, index) => (
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
                                    <Text style={styles.totalValue}>₹{orderDetail.grandTotal.toFixed(2)}</Text>
                                </View>
                            </View>
                        </ScrollView>
                    ) : (
                        <Text style={styles.errorText}>Failed to load order details</Text>
                    )}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: TYPOGRAPHY.size.xxl,
        fontWeight: TYPOGRAPHY.weight.bold,
        padding: SPACING.md,
        color: COLORS.text,
    },
    listContainer: {
        padding: SPACING.md,
    },
    orderCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    orderNumber: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.bold,
        color: COLORS.primary,
    },
    statusBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    statusText: {
        fontSize: TYPOGRAPHY.size.xs,
        fontWeight: TYPOGRAPHY.weight.bold,
    },
    orderBody: {
        marginTop: SPACING.sm,
    },
    customerName: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.semibold,
        color: COLORS.text,
    },
    orderDate: {
        fontSize: TYPOGRAPHY.size.xs,
        color: COLORS.textSecondary,
        marginVertical: 4,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING.sm,
    },
    orderTotal: {
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: TYPOGRAPHY.weight.bold,
        color: COLORS.text,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    iconButton: {
        padding: 6,
        borderRadius: BORDER_RADIUS.sm,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: TYPOGRAPHY.size.md,
        color: COLORS.textTertiary,
        marginTop: SPACING.md,
    },
    errorText: {
        color: COLORS.error,
        fontSize: TYPOGRAPHY.size.md,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: SPACING.md,
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
    },
    retryText: {
        color: COLORS.white,
        fontWeight: TYPOGRAPHY.weight.bold,
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
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: TYPOGRAPHY.weight.bold,
    },
    modalContent: {
        padding: SPACING.md,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.bold,
        marginBottom: SPACING.sm,
        color: COLORS.primary,
    },
    infoText: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.text,
        marginBottom: 4,
    },
    addressText: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.text,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
    },
    itemName: {
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: TYPOGRAPHY.weight.semibold,
    },
    itemVariant: {
        fontSize: TYPOGRAPHY.size.xs,
        color: COLORS.textSecondary,
    },
    itemQty: {
        fontSize: TYPOGRAPHY.size.sm,
        marginHorizontal: SPACING.md,
    },
    itemPrice: {
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: TYPOGRAPHY.weight.bold,
        width: 60,
        textAlign: 'right',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SPACING.md,
        paddingTop: SPACING.sm,
        borderTopWidth: 2,
        borderTopColor: COLORS.border,
    },
    totalLabel: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.bold,
    },
    totalValue: {
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: TYPOGRAPHY.weight.bold,
        color: COLORS.primary,
    },
    bold: {
        fontWeight: TYPOGRAPHY.weight.bold,
    },
});

export default AdminOrderDashboard;
