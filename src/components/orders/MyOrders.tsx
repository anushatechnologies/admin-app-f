import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useGetMyOrdersQuery } from '../../api/orderApi';
import { OrderResponse } from '../../types/order';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import dayjs from 'dayjs';

const MyOrders: React.FC = () => {
    const { data: orders, isLoading, isError, refetch } = useGetMyOrdersQuery();
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

    const renderOrderItem = ({ item }: { item: OrderResponse }) => (
        <TouchableOpacity 
            style={styles.orderCard}
            onPress={() => router.push(`/orders/${item.id}` as any)}
        >
            <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.orderStatus) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.orderStatus) }]}>
                        {item.orderStatus.toUpperCase()}
                    </Text>
                </View>
            </View>
            
            <Text style={styles.orderDate}>
                Placed on {dayjs(item.placedAt).format('DD MMM YYYY, hh:mm A')}
            </Text>

            <View style={styles.divider} />
            
            <View style={styles.itemsPreview}>
                {item.items.slice(0, 2).map((item, index) => (
                    <Text key={index} style={styles.itemText} numberOfLines={1}>
                        • {item.productName} ({item.quantity})
                    </Text>
                ))}
                {item.items.length > 2 && (
                    <Text style={styles.moreItemsText}>+{item.items.length - 2} more items</Text>
                )}
            </View>

            <View style={styles.orderFooter}>
                <View>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.orderTotal}>₹{item.grandTotal.toFixed(2)}</Text>
                </View>
                <View style={styles.viewDetailsBtn}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
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
                <Text style={styles.errorText}>Failed to load orders.</Text>
                <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Orders</Text>
            
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderOrderItem}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={64} color={COLORS.textTertiary} />
                        <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
                        <TouchableOpacity 
                            style={styles.shopButton}
                            onPress={() => router.push('/(tabs)/home')}
                        >
                            <Text style={styles.shopButtonText}>Start Shopping</Text>
                        </TouchableOpacity>
                    </View>
                }
                refreshing={isLoading}
                onRefresh={refetch}
            />
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
        marginBottom: 4,
    },
    orderNumber: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.bold,
        color: COLORS.text,
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
    orderDate: {
        fontSize: TYPOGRAPHY.size.xs,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.divider,
        marginVertical: SPACING.sm,
    },
    itemsPreview: {
        marginBottom: SPACING.md,
    },
    itemText: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    moreItemsText: {
        fontSize: TYPOGRAPHY.size.xs,
        color: COLORS.primary,
        fontWeight: TYPOGRAPHY.weight.semibold,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    totalLabel: {
        fontSize: TYPOGRAPHY.size.xs,
        color: COLORS.textTertiary,
    },
    orderTotal: {
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: TYPOGRAPHY.weight.bold,
        color: COLORS.text,
    },
    viewDetailsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewDetailsText: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.primary,
        fontWeight: TYPOGRAPHY.weight.semibold,
        marginRight: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: TYPOGRAPHY.size.md,
        color: COLORS.textTertiary,
        marginTop: SPACING.md,
        textAlign: 'center',
    },
    shopButton: {
        marginTop: SPACING.lg,
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
    },
    shopButtonText: {
        color: COLORS.white,
        fontWeight: TYPOGRAPHY.weight.bold,
    },
    errorText: {
        color: COLORS.error,
        fontSize: TYPOGRAPHY.size.md,
    },
    retryButton: {
        marginTop: SPACING.md,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default MyOrders;
