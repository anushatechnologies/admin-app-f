import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import CommonAlertModal from '../common/ToggleAlertModal';
import { useProducts } from '@/src/hooks/useProducts';
import { Product, Store } from '../../types/api';
import { COLORS, SPACING, BORDER_RADIUS } from '@/src/constants/theme';

type Props = {
  visible: boolean;
  store: Store;
  onClose: () => void;
};

/* ================= COMPONENT ================= */

export default function InventoryPopup({
  visible,
  store,
  onClose,
}: Props) {
  const { products, loading, error, fetchProducts, toggleProductStock } = useProducts(store.id);
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'in' | 'out'>('all');
  const [sortKey, setSortKey] = useState<keyof Product>('name');
  const [ascending, setAscending] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);

  /* ✅ Fetch products when visible */
  useEffect(() => {
    if (visible && store) {
      fetchProducts();
    }
  }, [visible, store.id, fetchProducts]); // Use store.id as dependency for stability

  /* ================= SEARCH + FILTER + SORT ================= */

  const processedProducts = useMemo(() => {
    let data = [...products];

    // Search
    data = data.filter(p =>
      (p.name || '').toLowerCase().includes(search.toLowerCase())
    );

    // Filter
    if (filter === 'in') data = data.filter(p => p.inStock);
    if (filter === 'out') data = data.filter(p => !p.inStock);

    // Sort
    data.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return ascending
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return ascending ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return data;
  }, [products, search, filter, sortKey, ascending]);

  const handleSort = (key: keyof Product) => {
    if (sortKey === key) {
      setAscending(!ascending);
    } else {
      setSortKey(key);
      setAscending(true);
    }
  };

  const confirmToggle = async () => {
    if (!selectedProduct) return;
    const success = await toggleProductStock(selectedProduct);
    if (success) {
      setAlertVisible(false);
    }
  };

  if (!visible) return null;

  /* ================= UI ================= */

  return (
    <View style={styles.absoluteOverlay}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Inventory</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <Text style={styles.storeName}>{store.name}</Text>

        {error ? (
          <View style={styles.errorBox}>
             <Text style={styles.errorText}>{error}</Text>
             <TouchableOpacity style={styles.retryBtn} onPress={fetchProducts}>
                <Text style={styles.retryText}>Retry</Text>
             </TouchableOpacity>
          </View>
        ) : null}

        {loading && (
           <Text style={{color: '#aaa', marginVertical: 10}}>Loading products...</Text>
        )}

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#aaa" />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor="#aaa"
            style={styles.input}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {['all', 'in', 'out'].map(type => (
            <TouchableOpacity
              key={type}
              onPress={() => setFilter(type as any)}
              style={[
                styles.filterBtn,
                filter === type && styles.activeFilter,
              ]}
            >
              <Text style={[
                styles.filterText,
                filter === type && { color: COLORS.white }
              ]}>
                {type === 'all'
                  ? 'All'
                  : type === 'in'
                  ? 'In Stock'
                  : 'Out of Stock'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Table Header */}
        <View style={styles.tableHeaderRow}>
          <View style={{ width: 40, marginRight: SPACING.sm }}>
            <Text style={styles.headerText}>Image</Text>
          </View>
          <TouchableOpacity style={[styles.headerItem, { flex: 1 }]} onPress={() => handleSort('name')}>
            <Text style={styles.headerText}>Name</Text>
            {sortKey === 'name' && <Ionicons name={ascending ? 'caret-up' : 'caret-down'} size={14} color="#ffd33d" />}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerItem, { flex: 1, justifyContent: 'center' }]} onPress={() => handleSort('stock')}>
            <Text style={styles.headerText}>Stock</Text>
            {sortKey === 'stock' && <Ionicons name={ascending ? 'caret-up' : 'caret-down'} size={14} color="#ffd33d" />}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerItem, { flex: 1, justifyContent: 'center' }]} onPress={() => handleSort('price')}>
            <Text style={styles.headerText}>Price</Text>
            {sortKey === 'price' && <Ionicons name={ascending ? 'caret-up' : 'caret-down'} size={14} color="#ffd33d" />}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerItem, { flex: 1, justifyContent: 'center' }]} onPress={() => handleSort('sales')}>
            <Text style={styles.headerText}>Sales</Text>
            {sortKey === 'sales' && <Ionicons name={ascending ? 'caret-up' : 'caret-down'} size={14} color="#ffd33d" />}
          </TouchableOpacity>
          <View style={{ width: 50, alignItems: 'center' }}>
            <Text style={styles.headerText}>Status</Text>
          </View>
        </View>

        {/* Rows */}
        <FlatList
          data={processedProducts}
          keyExtractor={item => String(item._id || item.id || Math.random().toString())}
          refreshing={loading}
          onRefresh={fetchProducts}
          renderItem={({ item }) => (
            <View style={styles.productRow}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
              </View>

              <Text style={styles.cell}>{item.stock ?? (item as any).quantity ?? 0}</Text>
              <Text style={styles.cell}>₹{item.price ?? (item as any).mrp ?? (item as any).sellingPrice ?? 0}</Text>
              <Text style={styles.cell}>{item.sales ?? 0}</Text>

              <View style={{ width: 50, alignItems: 'center' }}>
                <Switch
                  value={(item.inStock ?? item.isActive) !== false}
                  onValueChange={() => {
                    setSelectedProduct(item);
                    setAlertVisible(true);
                  }}
                />
              </View>
            </View>
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                 <Ionicons name="basket-outline" size={50} color={COLORS.textTertiary} />
                 <Text style={styles.emptyText}>No products found in this store</Text>
              </View>
            ) : null
          }
        />

        {/* Toggle Alert */}
        {selectedProduct && (
          <CommonAlertModal
            visible={alertVisible}
            title={
              (selectedProduct.inStock ?? selectedProduct.isActive) !== false
                ? 'Mark as Out of Stock'
                : 'Bring Back to Stock'
            }
            message={
              (selectedProduct.inStock ?? selectedProduct.isActive) !== false
                ? 'This product will be hidden from customers.'
                : 'This product will be visible to customers.'
            }
            confirmText={
              (selectedProduct.inStock ?? selectedProduct.isActive) !== false
                ? 'Mark Out of Stock'
                : 'Bring to Stock'
            }
            confirmColor={
              (selectedProduct.inStock ?? selectedProduct.isActive) !== false ? '#ff4d4d' : '#4caf50'
            }
            onCancel={() => setAlertVisible(false)}
            onConfirm={confirmToggle}
          />
        )}

      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  absoluteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 60,
    backgroundColor: COLORS.background,
    zIndex: 999,
  },
  container: { flex: 1, padding: SPACING.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: COLORS.primary, fontSize: 20, fontWeight: 'bold' },
  storeName: { color: COLORS.text, marginVertical: SPACING.sm + 2, fontWeight: '600' },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceVariant,
    padding: SPACING.md - 6,
    borderRadius: BORDER_RADIUS.sm + 2,
    alignItems: 'center',
    marginBottom: SPACING.sm + 2,
  },
  input: { marginLeft: SPACING.sm, flex: 1, color: COLORS.text },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm + 2,
  },
  filterBtn: {
    paddingVertical: SPACING.sm - 2,
    paddingHorizontal: SPACING.md - 4,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surfaceVariant,
  },
  activeFilter: { backgroundColor: COLORS.primary },
  filterText: { color: COLORS.text, fontWeight: '600' },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    marginBottom: SPACING.sm,
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerText: { color: COLORS.textSecondary, fontWeight: 'bold', fontSize: 12 },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.sm + 2,
    marginBottom: SPACING.sm,
    justifyContent: 'space-between',
  },
  productInfo: { flexDirection: 'row', alignItems: 'center', flex: 2 },
  productImage: { width: 40, height: 40, marginRight: SPACING.sm, borderRadius: BORDER_RADIUS.sm },
  productName: { color: COLORS.text, fontWeight: 'bold' },
  subCategory: { color: COLORS.textSecondary, fontSize: 12 },
  cell: { flex: 1, color: COLORS.text, textAlign: 'center' },
  errorBox: {
    backgroundColor: 'rgba(255,70,70,0.1)',
    padding: SPACING.md - 4,
    borderRadius: BORDER_RADIUS.sm + 2,
    marginBottom: SPACING.md - 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: { color: COLORS.error, flex: 1 },
  retryBtn: { padding: SPACING.sm - 2, backgroundColor: COLORS.error, borderRadius: BORDER_RADIUS.sm - 2 },
  retryText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: COLORS.textTertiary,
    marginTop: SPACING.md,
    fontSize: 16,
  },
});
