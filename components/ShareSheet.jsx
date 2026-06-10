import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import colors from '../constants/colors';
import typography from '../constants/typography';

const ShareSheet = ({ visible, onClose, url, title }) => {
  const handleWhatsApp = async () => {
    const text = title ? `${title} - ${url}` : url;
    const encoded = encodeURIComponent(text);
    const supported = await Linking.canOpenURL(`whatsapp://send?text=${encoded}`);
    if (supported) {
      await Linking.openURL(`whatsapp://send?text=${encoded}`);
    }
    onClose?.();
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(url);
    onClose?.();
  };

  const handleEmail = async () => {
    const subject = title || 'Link dari LinkVault';
    const body = title ? `${title}\n${url}` : url;
    const encoded = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const supported = await Linking.canOpenURL(encoded);
    if (supported) {
      await Linking.openURL(encoded);
    }
    onClose?.();
  };

  const handleSystemShare = async () => {
    await Share.share({
      message: title ? `${title} - ${url}` : url,
      url: url,
    });
    onClose?.();
  };

  const options = [
    { label: 'WhatsApp', icon: '💬', onPress: handleWhatsApp },
    { label: 'Salin Link', icon: '📋', onPress: handleCopy },
    { label: 'Email', icon: '✉️', onPress: handleEmail },
    { label: 'Share', icon: '📤', onPress: handleSystemShare },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          <View style={styles.optionsRow}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.label}
                style={styles.optionBtn}
                onPress={opt.onPress}
              >
                <View style={styles.optionIcon}>
                  <Text style={styles.optionEmoji}>{opt.icon}</Text>
                </View>
                <Text style={styles.optionLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerUrl} numberOfLines={1}>{url}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
              <Text style={styles.copyBtnText}>Salin Link</Text>
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
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textTertiary,
    alignSelf: 'center',
    marginBottom: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  optionBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionEmoji: {
    fontSize: typography.sizes['2xl'],
  },
  optionLabel: {
    fontFamily: typography.font,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  footerUrl: {
    flex: 1,
    fontFamily: typography.font,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  copyBtn: {
    backgroundColor: colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  copyBtnText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.bg,
  },
});

export default ShareSheet;
