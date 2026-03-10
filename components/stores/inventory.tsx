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

import CommonAlertModal from '@/components/ToggleAlertModal';

/* ================= TYPES ================= */

export type Product = {
  id: string;
  name: string;
  subCategory: string;
  stock: number;
  price: number;
  sales: number;
  image: string;
  inStock: boolean;
};

type Props = {
  visible: boolean;
  storeName: string;
  products: Product[];   // ✅ receive from store
  onClose: () => void;
};

/* ================= COMPONENT ================= */

export default function InventoryPopup({
  visible,
  storeName,
  products: storeProducts,
  onClose,
}: Props) {

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'in' | 'out'>('all');
  const [sortKey, setSortKey] = useState<keyof Product>('name');
  const [ascending, setAscending] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);

  /* ✅ Sync products when store changes */
  useEffect(() => {
    setProducts(storeProducts);
  }, [storeProducts]);

  if (!visible) return null;

  /* ================= SEARCH + FILTER + SORT ================= */

  const processedProducts = useMemo(() => {
    let data = [...products];

    // Search
    data = data.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
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

  const confirmToggle = () => {
    if (!selectedProduct) return;

    setProducts(prev =>
      prev.map(p =>
        p.id === selectedProduct.id
          ? { ...p, inStock: !p.inStock }
          : p
      )
    );

    setAlertVisible(false);
  };

  /* ================= UI ================= */

  return (
    <View style={styles.absoluteOverlay}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Inventory</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.storeName}>{storeName}</Text>

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
              <Text style={styles.filterText}>
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
        <View style={styles.tableHeader}>
          {['name', 'stock', 'price', 'sales'].map(key => (
            <TouchableOpacity
              key={key}
              style={styles.headerItem}
              onPress={() => handleSort(key as keyof Product)}
            >
              <Text style={styles.headerText}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
              {sortKey === key && (
                <Ionicons
                  name={ascending ? 'caret-up' : 'caret-down'}
                  size={14}
                  color="#ffd33d"
                />
              )}
            </TouchableOpacity>
          ))}
          <Text style={styles.headerText}>Status</Text>
        </View>

        {/* Rows */}
        <FlatList
          data={processedProducts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.productRow}>
              <View style={styles.productInfo}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <View>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.subCategory}>{item.subCategory}</Text>
                </View>
              </View>

              <Text style={styles.cell}>{item.stock}</Text>
              <Text style={styles.cell}>₹{item.price}</Text>
              <Text style={styles.cell}>{item.sales}</Text>

              <Switch
                value={item.inStock}
                onValueChange={() => {
                  setSelectedProduct(item);
                  setAlertVisible(true);
                }}
              />
            </View>
          )}
        />

        {/* Toggle Alert */}
        {selectedProduct && (
          <CommonAlertModal
            visible={alertVisible}
            title={
              selectedProduct.inStock
                ? 'Mark as Out of Stock'
                : 'Bring Back to Stock'
            }
            message={
              selectedProduct.inStock
                ? 'This product will be hidden from customers.'
                : 'This product will be visible to customers.'
            }
            confirmText={
              selectedProduct.inStock
                ? 'Mark Out of Stock'
                : 'Bring to Stock'
            }
            confirmColor={
              selectedProduct.inStock ? '#ff4d4d' : '#4caf50'
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
    backgroundColor: '#25292e',
    zIndex: 999,
  },
  container: { flex: 1, padding: 15 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: '#ffd33d', fontSize: 20, fontWeight: 'bold' },
  storeName: { color: '#fff', marginVertical: 10, fontWeight: '600' },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#3a3f47',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  input: { marginLeft: 8, flex: 1, color: '#fff' },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#3a3f47',
  },
  activeFilter: { backgroundColor: '#ffd33d' },
  filterText: { color: '#fff', fontWeight: '600' },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerText: { color: '#aaa', fontWeight: 'bold', fontSize: 12 },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a3f47',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  productInfo: { flexDirection: 'row', alignItems: 'center', flex: 2 },
  productImage: { width: 40, height: 40, marginRight: 8, borderRadius: 6 },
  productName: { color: '#fff', fontWeight: 'bold' },
  subCategory: { color: '#aaa', fontSize: 12 },
  cell: { flex: 1, color: '#fff', textAlign: 'center' },
});