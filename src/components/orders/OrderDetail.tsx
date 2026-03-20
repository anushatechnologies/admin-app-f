import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
    useGetAdminOrderByIdQuery, 
    useGetOrderByIdQuery,
    useAcceptOrderMutation, 
    useRejectOrderMutation 
} from '../../api/orderApi';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import dayjs from 'dayjs';

const OrderDetail: React.FC = () => {
    const { orderId } = useLocalSearchParams<{ orderId: string }>();
    const navigate = useRouter();
    
    // In a real app, you'd get this from a Redux auth slice or AsyncStorage
    // For now, let's assume we check the API response or have a way to know.
    // In this context, we'll try admin first or use a flag.
    const isAdmin = true; // Placeholder: logic should determine if user is admin
    
    const { data: adminOrder, isLoading: isAdminLoading, isError: isAdminError, refetch: refetchAdmin } = useGetAdminOrderByIdQuery(Number(orderId), { skip: !isAdmin });
    const { data: customerOrder, isLoading: isCustomerLoading, isError: isCustomerError, refetch: refetchCustomer } = useGetOrderByIdQuery(Number(orderId), { skip: isAdmin });

    const order = isAdmin ? adminOrder : customerOrder;
    const isLoading = isAdmin ? isAdminLoading : isCustomerLoading;
    const isError = isAdmin ? isAdminError : isCustomerError;
    const refetch = isAdmin ? refetchAdmin : refetchCustomer;

    const [acceptOrder, { isLoading: isAccepting }] = useAcceptOrderMutation();
    const [rejectOrder, { isLoading: isRejecting }] = useRejectOrderMutation();

    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const handleAccept = async () => {
        try {
            await acceptOrder(Number(orderId)).unwrap();
            Alert.alert('Success', 'Order accepted successfully');
            refetch(); 
        } catch (error: any) {
            Alert.alert('Error', error?.data?.message || 'Failed to accept order');
        }
    };

    const handleRejectConfirm = async () => {
        if (!rejectReason.trim()) {
            Alert.alert('Error', 'Please provide a reason for rejection');
            return;
        }

        try {
            await rejectOrder({ 
                orderId: Number(orderId), 
                data: { reason: rejectReason } as any
            }).unwrap();
            
            Alert.alert('Success', 'Order rejected successfully');
            setRejectModalOpen(false);
            refetch(); 
        } catch (error: any) {
            Alert.alert('Error', error?.data?.message || 'Failed to reject order');
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

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (isError || !order) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Order not found or error loading details.</Text>
                <TouchableOpacity onPress={() => navigate.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header Area */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigate.back()} style={styles.headerIcon}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.orderNumberTitle}>Order #{order.orderNumber}</Text>
                    <View style={[styles.statusHeaderBadge, { backgroundColor: getStatusColor(order.orderStatus) + '20' }]}>
                        <Text style={[styles.statusHeaderText, { color: getStatusColor(order.orderStatus) }]}>
                            {order.orderStatus.toUpperCase()}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Admin Actions */}
            {isAdmin && order.orderStatus?.toLowerCase() === 'pending' && (
                <View style={styles.adminActions}>
                    <TouchableOpacity 
                        style={[styles.actionBtn, styles.acceptBtn]} 
                        onPress={handleAccept}
                        disabled={isAccepting}
                    >
                        {isAccepting ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnText}>Accept Order</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.actionBtn, styles.rejectBtn]} 
                        onPress={() => setRejectModalOpen(true)}
                        disabled={isRejecting}
                    >
                        <Text style={styles.btnText}>Reject Order</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Content Sections */}
            <View style={styles.content}>
                {/* Information Cards */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Customer Information</Text>
                    <View style={styles.cardBody}>
                        <Text style={styles.infoRow}><Text style={styles.label}>Name:</Text> {isAdmin ? (adminOrder as any).customerName : 'Me'}</Text>
                        <Text style={styles.infoRow}><Text style={styles.label}>Phone:</Text> {isAdmin ? (adminOrder as any).customerPhone : 'N/A'}</Text>
                        <Text style={styles.infoRow}><Text style={styles.label}>Placed On:</Text> {dayjs(order.placedAt).format('DD MMM YYYY, hh:mm A')}</Text>
                    </View>
                </View>

                {(() => {
                    const address = (order as any).address || (order as any).customer?.address;
                    if (!address) return null;
                    return (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Delivery Address</Text>
                            <View style={styles.cardBody}>
                                <Text style={styles.addressLine}>{address.addressLine1}</Text>
                                {address.addressLine2 && <Text style={styles.addressLine}>{address.addressLine2}</Text>}
                                <Text style={styles.addressLine}>{address.city}, {address.state} - {address.postalCode}</Text>
                            </View>
                        </View>
                    );
                })()}

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Order Items</Text>
                    <View style={styles.cardBody}>
                        {order.items.map((item, index) => (
                            <View key={index} style={styles.itemRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemName}>{item.productName}</Text>
                                    <Text style={styles.itemVariant}>{item.variantName}</Text>
                                    <Text style={styles.itemSku}>SKU: {item.sku}</Text>
                                </View>
                                <View style={styles.itemPricing}>
                                    <Text style={styles.itemQty}>{item.quantity} x ₹{item.unitPrice}</Text>
                                    <Text style={styles.itemTotal}>₹{item.totalPrice}</Text>
                                </View>
                            </View>
                        ))}
                        <View style={styles.grandTotalRow}>
                            <Text style={styles.grandTotalLabel}>Grand Total</Text>
                            <Text style={styles.grandTotalValue}>₹{order.grandTotal.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Payment Details</Text>
                    <View style={styles.cardBody}>
                        <View style={styles.paymentRow}>
                            <Text style={styles.label}>Method:</Text>
                            <Text style={styles.paymentValue}>{order.paymentMethod || 'COD'}</Text>
                        </View>
                        <View style={styles.paymentRow}>
                            <Text style={styles.label}>Status:</Text>
                            <View style={[styles.statusBadge, { backgroundColor: order.paymentStatus?.toLowerCase() === 'paid' ? COLORS.successLight : COLORS.warningLight }]}>
                                <Text style={[styles.statusText, { color: order.paymentStatus?.toLowerCase() === 'paid' ? COLORS.success : COLORS.warning }]}>
                                    {order.paymentStatus?.toUpperCase() || 'UNPAID'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Reject Modal */}
            <Modal
                visible={rejectModalOpen}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setRejectModalOpen(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalDialog}>
                        <Text style={styles.modalTitle}>Reject Order</Text>
                        <Text style={styles.modalText}>Please provide a reason for rejecting this order.</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Rejection Reason"
                            multiline
                            numberOfLines={4}
                            value={rejectReason}
                            onChangeText={setRejectReason}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setRejectModalOpen(false)} style={styles.modalBtn}>
                                <Text style={styles.modalBtnCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleRejectConfirm} style={[styles.modalBtn, styles.modalBtnConfirm]}>
                                <Text style={styles.modalBtnConfirmText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.surfaceVariant,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerIcon: {
        marginRight: SPACING.md,
    },
    orderNumberTitle: {
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: TYPOGRAPHY.weight.bold,
        color: COLORS.text,
    },
    statusHeaderBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
    },
    statusHeaderText: {
        fontSize: 10,
        fontWeight: '700',
    },
    adminActions: {
        flexDirection: 'row',
        padding: SPACING.md,
        gap: SPACING.md,
        backgroundColor: COLORS.white,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: SPACING.sm + 4,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    acceptBtn: {
        backgroundColor: COLORS.success,
    },
    rejectBtn: {
        backgroundColor: COLORS.error,
    },
    btnText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    content: {
        padding: SPACING.md,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
    },
    cardTitle: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.bold,
        color: COLORS.primary,
        marginBottom: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
        paddingBottom: 4,
    },
    cardBody: {},
    infoRow: {
        fontSize: TYPOGRAPHY.size.sm,
        marginBottom: 6,
        color: COLORS.text,
    },
    label: {
        fontWeight: 'bold',
        color: COLORS.textSecondary,
    },
    addressLine: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.text,
        lineHeight: 20,
    },
    itemRow: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.divider,
        paddingBottom: SPACING.sm,
    },
    itemName: {
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    itemVariant: {
        fontSize: TYPOGRAPHY.size.xs,
        color: COLORS.textSecondary,
    },
    itemSku: {
        fontSize: 10,
        color: COLORS.textTertiary,
    },
    itemPricing: {
        alignItems: 'flex-end',
    },
    itemQty: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    itemTotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING.sm,
    },
    grandTotalLabel: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: 'bold',
    },
    grandTotalValue: {
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: '900',
        color: COLORS.primary,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    paymentValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: SPACING.lg,
    },
    modalDialog: {
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        ...SHADOWS.lg,
    },
    modalTitle: {
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    modalText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
    },
    textInput: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
        height: 100,
        textAlignVertical: 'top',
        marginBottom: SPACING.lg,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: SPACING.md,
    },
    modalBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    modalBtnCancel: {
        color: COLORS.textSecondary,
        fontWeight: 'bold',
    },
    modalBtnConfirm: {
        backgroundColor: COLORS.error,
        borderRadius: 8,
    },
    modalBtnConfirmText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: 16,
        color: COLORS.error,
        textAlign: 'center',
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    backButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default OrderDetail;
