import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

const ICON_SIZE = 24;

const COLORS = {
  background: '#25292e',
  active: '#ffd33d',
  inactive: '#888',
};

type TabItem = {
  name: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
};

const TABS: TabItem[] = [
  { name: 'home', activeIcon: 'home', inactiveIcon: 'home-outline' },
  { name: 'pulse', activeIcon: 'pulse', inactiveIcon: 'pulse-outline' },
  { name: 'stores', activeIcon: 'storefront', inactiveIcon: 'storefront-outline' },
  { name: 'kpi', activeIcon: 'bar-chart', inactiveIcon: 'bar-chart-outline' },
  { name: 'profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
];

function TabContent() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,

          tabBarActiveTintColor: COLORS.active,
          tabBarInactiveTintColor: COLORS.inactive,

          tabBarStyle: styles.tabBar,
        }}
      >
        {TABS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? tab.activeIcon : tab.inactiveIcon}
                  size={ICON_SIZE}
                  color={color}
                />
              ),
            }}
          />
        ))}
      </Tabs>
    </View>
  );
}

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <TabContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  tabBar: {
    backgroundColor: COLORS.background,
    borderTopWidth: 0,
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
});