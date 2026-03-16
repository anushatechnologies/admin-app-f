import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@/src/constants/theme';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  confirmColor?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function CommonAlertModal({
  visible,
  title,
  message,
  confirmText,
  confirmColor = COLORS.success,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          <Text style={styles.title}>{title}</Text>

          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                { backgroundColor: confirmColor },
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '85%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg - 4,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.md - 6,
  },

  message: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: SPACING.lg - 4,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  cancelBtn: {
    marginRight: SPACING.md - 1,
  },

  cancelText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  confirmBtn: {
    paddingVertical: SPACING.sm - 2,
    paddingHorizontal: SPACING.md - 1,
    borderRadius: BORDER_RADIUS.sm,
  },

  confirmText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
