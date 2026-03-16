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
  ActivityIndicator,
} from 'react-native';

import InventoryPopup from '@/src/components/stores/inventory';
import CommonAlertModal from '@/src/components/common/ToggleAlertModal';
import { useStores } from '@/src/hooks/useStores';
import { Store } from '@/src/types/api';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '@/src/constants/theme';

/* ================= DATA ================= */

// Removed hardcoded data


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
              { color: store.isActive !== false ? COLORS.success : COLORS.error },
            ]}
          >
            {store.isActive !== false ? 'Active' : 'Inactive'}
          </Text>
        </View>

        <Text style={styles.location}>{store.address}</Text>

        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={styles.inventoryBtn}
            onPress={() => onInventory(store)}
          >
            <Ionicons name="cube-outline" size={16} color={COLORS.background} />
            <Text style={styles.inventoryText}> Inventory</Text>
          </TouchableOpacity>

          <Switch
            value={store.isActive !== false}
            onValueChange={() => onToggle(store)}
            trackColor={{ false: '#767577', true: COLORS.primary }}
          />
        </View>
      </View>
    </View>
  )
);
StoreCard.displayName = 'StoreCard';

/* ================= MAIN COMPONENT ================= */

export default function Stores() {
  const { stores, loading, error, fetchStores, toggleStoreStatus } = useStores();
  
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

  const confirmToggle = async () => {
    if (!selectedStore) return;
    const success = await toggleStoreStatus(selectedStore);
    if (success) {
      setAlertVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Stores</Text>
      
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchStores}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {loading && stores.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading stores...</Text>
        </View>
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id || Math.random().toString()}
          refreshing={loading}
          onRefresh={fetchStores}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <StoreCard
              store={item}
              onInventory={handleInventory}
              onToggle={handleToggleRequest}
            />
          )}
        />
      )}

      {selectedStore && (
        <>
          <InventoryPopup
            visible={inventoryVisible}
            store={selectedStore}
            onClose={() => setInventoryVisible(false)}
          />

          <CommonAlertModal
            visible={alertVisible}
            title={
              selectedStore.isActive !== false
                ? 'Deactivate Store'
                : 'Activate Store'
            }
            message={`Products from "${selectedStore.name}" will be ${
              selectedStore.isActive !== false
                ? 'hidden from customers.'
                : 'visible to customers.'
            }`}
            confirmText={
              selectedStore.isActive !== false ? 'Deactivate' : 'Activate'
            }
            confirmColor={
              selectedStore.isActive !== false ? COLORS.error : COLORS.success
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
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background, 
    padding: SPACING.md 
  },
  heading: {
    fontSize: TYPOGRAPHY.size.xxl,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: SPACING.md,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: { 
    width: 80, 
    height: 80, 
    borderRadius: BORDER_RADIUS.md, 
    marginRight: SPACING.md 
  },
  rightSection: { 
    flex: 1, 
    justifyContent: 'space-between' 
  },
  topRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeName: { 
    color: COLORS.text, 
    fontSize: TYPOGRAPHY.size.md, 
    fontWeight: TYPOGRAPHY.weight.bold 
  },
  status: { 
    fontWeight: TYPOGRAPHY.weight.bold,
    fontSize: TYPOGRAPHY.size.xs,
  },
  location: { 
    color: COLORS.textSecondary, 
    marginVertical: SPACING.xs,
    fontSize: TYPOGRAPHY.size.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  inventoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    ...SHADOWS.sm,
  },
  inventoryText: { 
    fontWeight: TYPOGRAPHY.weight.bold, 
    color: COLORS.white, 
    marginLeft: SPACING.xs,
    fontSize: TYPOGRAPHY.size.sm,
  },
  input: {
    color: COLORS.text,
    fontSize: TYPOGRAPHY.size.sm,
    padding: 0,
  },
  errorBox: {
    backgroundColor: COLORS.errorLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorText: { 
    color: COLORS.error, 
    flex: 1,
    fontSize: TYPOGRAPHY.size.sm,
  },
  retryBtn: { 
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs, 
    backgroundColor: COLORS.error, 
    borderRadius: BORDER_RADIUS.sm 
  },
  retryText: { 
    color: COLORS.white, 
    fontSize: TYPOGRAPHY.size.xs, 
    fontWeight: TYPOGRAPHY.weight.bold 
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    color: COLORS.textSecondary, 
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.size.sm,
  },
});