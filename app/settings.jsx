import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import colors from '../constants/colors';
import typography from '../constants/typography';
import { useSettings } from '../hooks/useSettings';
import { useBookmarks } from '../hooks/useBookmarks';
import { useCategories } from '../hooks/useCategories';
import { bookmarkRepository } from '../database/bookmarkRepository';
import { categoryRepository } from '../database/categoryRepository';
import ModalDialog from '../components/ModalDialog';

const Settings = () => {
  const router = useRouter();
  const { settings, toggleDarkMode } = useSettings();
  const { loadBookmarks } = useBookmarks();
  const { loadCategories } = useCategories();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
  }, [router]);

  const handleExportData = useCallback(async () => {
    setExporting(true);
    try {
      const bookmarks = await bookmarkRepository.getAll();
      const categories = await categoryRepository.getAll();

      const exportData = {
        exported_at: new Date().toISOString(),
        version: '1.0',
        categories,
        bookmarks,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const fileName = `linkvault_export_${Date.now()}.json`;
      const filePath = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Ekspor Data LinkVault',
        });
      } else {
        Alert.alert('Berhasil', `File disimpan di ${filePath}`);
      }
    } catch {
      Alert.alert('Error', 'Gagal mengekspor data');
    } finally {
      setExporting(false);
    }
  }, []);

  const handleDeleteAll = useCallback(async () => {
    setDeleting(true);
    try {
      await bookmarkRepository.deleteAll();
      await loadBookmarks();
      await loadCategories();
      setShowDeleteModal(false);
      Alert.alert('Berhasil', 'Semua data bookmark telah dihapus');
    } catch {
      Alert.alert('Error', 'Gagal menghapus data');
    } finally {
      setDeleting(false);
    }
  }, [loadBookmarks, loadCategories]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Setting</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dark Mode Card */}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="moon" size={20} color={colors.gold} />
              </View>
              <View>
                <Text style={styles.cardTitle}>Tema Gelap</Text>
                <Text style={styles.cardDesc}>Tampilan gelap untuk mata nyaman</Text>
              </View>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: colors.surfaceVariant, true: colors.success }}
              thumbColor={settings.darkMode ? colors.textPrimary : colors.textTertiary}
            />
          </View>
        </View>

        {/* Export Data Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={handleExportData}
          activeOpacity={0.7}
          disabled={exporting}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="download-outline" size={20} color={colors.gold} />
              </View>
              <View>
                <Text style={styles.cardTitle}>Ekspor Data</Text>
                <Text style={styles.cardDesc}>
                  {exporting ? 'Mengekspor...' : 'Simpan semua data ke file JSON'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>

        {/* Delete All Card */}
        <TouchableOpacity
          style={[styles.card, styles.cardDanger]}
          onPress={() => setShowDeleteModal(true)}
          activeOpacity={0.7}
          disabled={deleting}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={[styles.iconBox, styles.iconBoxDanger]}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </View>
              <View>
                <Text style={[styles.cardTitle, styles.cardTitleDanger]}>Hapus Semua</Text>
                <Text style={[styles.cardDesc, styles.cardDescDanger]}>
                  {deleting ? 'Menghapus...' : 'Hapus seluruh data bookmark'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.error} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Delete All Confirmation Modal */}
      <ModalDialog
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        icon={<Ionicons name="alert-circle-outline" size={28} color={colors.error} />}
        title="Hapus Semua?"
        description="Semua data bookmark akan dihapus secara permanen. Kategori tidak akan terpengaruh. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={handleDeleteAll}
        danger
      />
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: colors.bg,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: typography.font,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardDanger: {
    borderColor: colors.error + '44',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxDanger: {
    backgroundColor: colors.error + '22',
  },
  cardTitle: {
    fontFamily: typography.font,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardTitleDanger: {
    color: colors.error,
  },
  cardDesc: {
    fontFamily: typography.font,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
  },
  cardDescDanger: {
    color: colors.error + 'AA',
  },
});
