import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetOrderByIdQuery } from '../../api/orderApi';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import dayjs from 'dayjs';

interface OrderStep {
  label: string;
  status: string;
  completed: boolean;
  icon: keyof typeof Ionicons.prototype.props.name;
  timestamp?: string;
}

const CustomerOrderTracking: React.FC = () => {
    const { orderId } = useLocalSearchParams<{ orderId: string }>();
    const router = useRouter();
    const { data: order, isLoading, isError, refetch } = useGetOrderByIdQuery(Number(orderId));

    const [orderSteps, setOrderSteps] = useState<OrderStep[]>([]);

    useEffect(() => {
        if (order) {
            const steps: OrderStep[] = [
                {
                    label: 'Order Placed',
                    status: 'PENDING',
                    completed: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.orderStatus),
                    icon: 'time-outline',
                    timestamp: order.placedAt
                },
                {
                    label: 'Order Confirmed',
                    status: 'CONFIRMED',
                    completed: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.orderStatus),
                    icon: 'checkmark-circle-outline'
                },
                {
                    label: 'Preparing',
                    status: 'PROCESSING',
                    completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.orderStatus),
                    icon: 'restaurant-outline'
                },
                {
                    label: 'Out for Delivery',
                    status: 'SHIPPED',
                    completed: ['SHIPPED', 'DELIVERED'].includes(order.orderStatus),
                    icon: 'bicycle-outline'
                },
                {
                    label: 'Delivered',
                    status: 'DELIVERED',
                    completed: order.orderStatus === 'DELIVERED',
                    icon: 'home-outline'
                }
            ];
            setOrderSteps(steps);
        }
    }, [order]);

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
                <Text style={styles.errorText}>Order not found.</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Tracking</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
                <Text style={styles.orderDate}>
                    Placed on {dayjs(order.placedAt).format('DD MMM, YYYY')}
                </Text>
                {order.estimatedDeliveryTime && (
                    <Text style={styles.estTime}>
                        Estimated delivery: {dayjs(order.estimatedDeliveryTime).format('hh:mm A')}
                    </Text>
                )}
            </View>

            <View style={styles.trackingCard}>
                <Text style={styles.sectionTitle}>Status Timeline</Text>
                {order.orderStatus === 'CANCELLED' ? (
                    <View style={styles.cancelledBox}>
                        <Ionicons name="close-circle" size={24} color={COLORS.error} />
                        <Text style={styles.cancelledText}>This order has been cancelled.</Text>
                    </View>
                ) : (
                    <View style={styles.timeline}>
                        {orderSteps.map((step, index) => (
                            <View key={index} style={styles.stepRow}>
                                <View style={styles.stepIndicator}>
                                    <View style={[
                                        styles.stepCircle, 
                                        { backgroundColor: step.completed ? COLORS.success : COLORS.border }
                                    ]}>
                                        <Ionicons 
                                            name={step.icon as any} 
                                            size={16} 
                                            color={step.completed ? COLORS.white : COLORS.textTertiary} 
                                        />
                                    </View>
                                    {index < orderSteps.length - 1 && (
                                        <View style={[
                                            styles.stepLine, 
                                            { backgroundColor: orderSteps[index+1].completed ? COLORS.success : COLORS.border }
                                        ]} />
                                    )}
                                </View>
                                <View style={styles.stepInfo}>
                                    <Text style={[
                                        styles.stepLabel, 
                                        { color: step.completed ? COLORS.text : COLORS.textTertiary }
                                    ]}>
                                        {step.label}
                                    </Text>
                                    {step.timestamp && (
                                        <Text style={styles.stepTime}>{dayjs(step.timestamp).format('hh:mm A')}</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            <View style={styles.itemsCard}>
                <Text style={styles.sectionTitle}>Order Items</Text>
                {order.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemName}>{item.productName}</Text>
                            <Text style={styles.itemVariant}>{item.variantName}</Text>
                        </View>
                        <Text style={styles.itemQty}>x{item.quantity}</Text>
                        <Text style={styles.itemPrice}>₹{item.totalPrice}</Text>
                    </View>
                ))}
                <View style={styles.divider} />
                <View style={[styles.itemRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.totalLabel}>Total Paid</Text>
                    <Text style={styles.totalValue}>₹{order.grandTotal.toFixed(2)}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.helpBtn} onPress={() => Alert.alert('Support', 'Contacting support...')}>
                    <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.helpText}>Need Help?</Text>
                </TouchableOpacity>
            </View>
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
        padding: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        backgroundColor: COLORS.white,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: 'bold',
    },
    summaryCard: {
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    orderNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    orderDate: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    estTime: {
        fontSize: 14,
        color: COLORS.success,
        fontWeight: 'bold',
        marginTop: 8,
    },
    trackingCard: {
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        marginHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        ...SHADOWS.sm,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
    },
    timeline: {
        paddingLeft: 10,
    },
    stepRow: {
        flexDirection: 'row',
        height: 60,
    },
    stepIndicator: {
        alignItems: 'center',
        width: 30,
    },
    stepCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    stepLine: {
        width: 2,
        flex: 1,
        marginTop: -2,
        marginBottom: -2,
    },
    stepInfo: {
        marginLeft: SPACING.md,
        justifyContent: 'flex-start',
        paddingTop: 4,
    },
    stepLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    stepTime: {
        fontSize: 12,
        color: COLORS.textTertiary,
    },
    cancelledBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.errorLight,
        padding: 12,
        borderRadius: 8,
        gap: 10,
    },
    cancelledText: {
        color: COLORS.error,
        fontWeight: 'bold',
    },
    itemsCard: {
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        marginHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        ...SHADOWS.sm,
        marginBottom: SPACING.xl,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '500',
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
        width: 70,
        textAlign: 'right',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.primary,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.divider,
        marginVertical: SPACING.sm,
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    helpBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    helpText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: 16,
        color: COLORS.error,
        marginBottom: 20,
    },
    backBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    backBtnText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default CustomerOrderTracking;
