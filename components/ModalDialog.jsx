import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';

const ModalDialog = ({
  visible,
  onClose,
  icon,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  onConfirm,
  confirmColor = colors.gold,
  danger = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {icon && (
            <View style={[styles.iconContainer, danger && styles.iconDanger]}>
              <Text style={styles.iconEmoji}>{icon}</Text>
            </View>
          )}

          {title && (
            <Text style={styles.title}>{title}</Text>
          )}

          {description && (
            <Text style={styles.description}>{description}</Text>
          )}

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: danger ? colors.error : confirmColor }]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 32,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconDanger: {
    backgroundColor: colors.error + '22',
  },
  iconEmoji: {
    fontSize: typography.sizes['3xl'],
  },
  title: {
    fontFamily: typography.font,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontFamily: typography.font,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.normal * typography.sizes.md,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.bg,
  },
});

export default ModalDialog;
