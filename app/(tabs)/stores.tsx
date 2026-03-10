import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import InventoryPopup from '@/components/stores/inventory';
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

export type Store = {
  id: string;
  name: string;
  location: string;
  image: string;
  status: boolean;
  products: Product[];
};

/* ================= DATA ================= */

const storeData: Store[] = [
  {
    id: '1',
    name: 'AnushaBazaar Store',
    location: 'Hyderabad',
    image: 'https://cdn-icons-png.flaticon.com/128/891/891462.png',
    status: true,
    products: [
      {
        id: '1',
        name: 'Rice Bag',
        subCategory: 'Groceries',
        stock: 25,
        price: 1200,
        sales: 150,
        image:
          'https://5.imimg.com/data5/UB/WG/JK/SELLER-98634555/brown-plain-industrial-jute-sack-bag.jpg',
        inStock: true,
      },
      {
        id: '2',
        name: 'Oil Bottle',
        subCategory: 'Groceries',
        stock: 10,
        price: 150,
        sales: 90,
        image:
          'https://m.media-amazon.com/images/I/61SQDzxSt3L.jpg',
        inStock: false,
      },
    ],
  },
  {
    id: '2',
    name: 'Anusha Store',
    location: 'Chennai',
    image: 'https://cdn-icons-png.flaticon.com/128/891/891462.png',
    status: false,
    products: [
      {
        id: '3',
        name: 'Rice Bag',
        subCategory: 'Groceries',
        stock: 5,
        price: 1350,
        sales: 60,
        image:
          'https://5.imimg.com/data5/UB/WG/JK/SELLER-98634555/brown-plain-industrial-jute-sack-bag.jpg',
        inStock: true,
      },
      {
        id: '4',
        name: 'Oil Bottle',
        subCategory: 'Groceries',
        stock: 2,
        price: 180,
        sales: 40,
        image:
          'https://m.media-amazon.com/images/I/61SQDzxSt3L.jpg',
        inStock: true,
      },
    ],
  },
];

/* ================= STORE CARD ================= */

const StoreCard = React.memo(
  ({
    store,
    onInventory,
    onToggle,
  }: {
    store: Store;
    onInventory: (store: Store) => void;
    onToggle: (store: Store) => void;
  }) => (
    <View style={styles.card}>
      <Image source={{ uri: store.image }} style={styles.image} />

      <View style={styles.rightSection}>
        <View style={styles.topRow}>
          <Text style={styles.storeName}>{store.name}</Text>
          <Text
            style={[
              styles.status,
              { color: store.status ? '#4caf50' : '#ff4d4d' },
            ]}
          >
            {store.status ? 'Active' : 'Inactive'}
          </Text>
        </View>

        <Text style={styles.location}>{store.location}</Text>

        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={styles.inventoryBtn}
            onPress={() => onInventory(store)}
          >
            <Ionicons name="cube-outline" size={16} color="#25292e" />
            <Text style={styles.inventoryText}> Inventory</Text>
          </TouchableOpacity>

          <Switch
            value={store.status}
            onValueChange={() => onToggle(store)}
          />
        </View>
      </View>
    </View>
  )
);

/* ================= MAIN COMPONENT ================= */

export default function Stores() {
  const [stores, setStores] = useState<Store[]>(storeData);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const handleInventory = (store: Store) => {
    setSelectedStore(store);
    setInventoryVisible(true);
  };

  const handleToggleRequest = (store: Store) => {
    setSelectedStore(store);
    setAlertVisible(true);
  };

  const confirmToggle = () => {
    if (!selectedStore) return;

    setStores(prev =>
      prev.map(store =>
        store.id === selectedStore.id
          ? { ...store, status: !store.status }
          : store
      )
    );

    setAlertVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Stores</Text>

      <FlatList
        data={stores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StoreCard
            store={item}
            onInventory={handleInventory}
            onToggle={handleToggleRequest}
          />
        )}
      />

      {selectedStore && (
        <>
          <InventoryPopup
            visible={inventoryVisible}
            storeName={selectedStore.name}
            products={selectedStore.products}
            onClose={() => setInventoryVisible(false)}
          />

          <CommonAlertModal
            visible={alertVisible}
            title={
              selectedStore.status
                ? 'Deactivate Store'
                : 'Activate Store'
            }
            message={`Products from "${selectedStore.name}" will be ${
              selectedStore.status
                ? 'hidden from customers.'
                : 'visible to customers.'
            }`}
            confirmText={
              selectedStore.status ? 'Deactivate' : 'Activate'
            }
            confirmColor={
              selectedStore.status ? '#ff4d4d' : '#4caf50'
            }
            onCancel={() => setAlertVisible(false)}
            onConfirm={confirmToggle}
          />
        </>
      )}
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#25292e', padding: 20 },
  heading: {
    fontSize: 22,
    color: '#ffd33d',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#3a3f47',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  image: { width: 80, height: 80, borderRadius: 10, marginRight: 15 },
  rightSection: { flex: 1, justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between' },
  storeName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  status: { fontWeight: 'bold' },
  location: { color: '#aaa', marginVertical: 6 },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inventoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  inventoryText: { fontWeight: 'bold', color: '#25292e', marginLeft: 5 },
});