import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { Animated, StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/theme';

interface NotificationData {
  title: string;
  body: string;
  onPress?: () => void;
}

interface NotificationContextType {
  showToast: (data: NotificationData) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const TOAST_HEIGHT = 100;
const { width } = Dimensions.get('window');

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<NotificationData | null>(null);
  const translateY = useRef(new Animated.Value(-TOAST_HEIGHT - 50)).current;

  const hideToast = useCallback(() => {
    Animated.timing(translateY, {
      toValue: -TOAST_HEIGHT - 50,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setData(null);
    });
  }, [translateY]);

  const showToast = useCallback((notificationData: NotificationData) => {
    setData(notificationData);
    setVisible(true);

    Animated.spring(translateY, {
      toValue: 20, // Distance from top
      useNativeDriver: true,
      bounciness: 8,
    }).start();

    // Auto-hide after 5 seconds
    setTimeout(hideToast, 5000);
  }, [translateY, hideToast]);

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      {visible && data && (
        <Animated.View 
          style={[
            styles.toastContainer, 
            { transform: [{ translateY }] }
          ]}
        >
          <TouchableOpacity 
            activeOpacity={0.9} 
            style={styles.toastContent}
            onPress={() => {
              if (data.onPress) data.onPress();
              hideToast();
            }}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="notifications" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1}>{data.title}</Text>
              <Text style={styles.body} numberOfLines={2}>{data.body}</Text>
            </View>
            <TouchableOpacity onPress={hideToast} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}
    </NotificationContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 15,
    right: 15,
    zIndex: 9999,
    paddingTop: 40, // Account for status bar
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    ...SHADOWS.md,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
    marginBottom: 2,
  },
  body: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
});
