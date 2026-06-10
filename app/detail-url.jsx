import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../constants/colors';
import typography from '../constants/typography';
import { bookmarkRepository } from '../database/bookmarkRepository';
import { categoryRepository } from '../database/categoryRepository';
import { getInitial } from '../utils/formatters';
import { formatDate, relativeTime } from '../utils/formatters';
import ModalDialog from '../components/ModalDialog';
import ShareSheet from '../components/ShareSheet';

const DetailUrl = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [bookmark, setBookmark] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);

  useEffect(() => {
    const loadBookmark = async () => {
      if (!params.id) {
        Alert.alert('Error', 'ID bookmark tidak ditemukan');
        if (router.canGoBack()) router.back();
        return;
      }

      try {
        const data = await bookmarkRepository.getById(params.id);
        if (!data) {
          Alert.alert('Error', 'Bookmark tidak ditemukan');
          if (router.canGoBack()) router.back();
          return;
        }
        setBookmark(data);

        if (data.category_id) {
          const cat = await categoryRepository.getById(data.category_id);
          setCategory(cat);
        }
      } catch {
        Alert.alert('Error', 'Gagal memuat data bookmark');
        if (router.canGoBack()) router.back();
      } finally {
        setLoading(false);
      }
    };

    loadBookmark();
  }, [params.id]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
  }, [router]);

  const handleOpenLink = useCallback(async () => {
    if (!bookmark) return;
    await WebBrowser.openBrowserAsync(bookmark.url);
    await bookmarkRepository.incrementVisit(bookmark.id);
    // Refresh data to show updated visit count & last_visited
    const updated = await bookmarkRepository.getById(bookmark.id);
    if (updated) setBookmark(updated);
  }, [bookmark]);

  const handleShare = useCallback(() => {
    setShowShareSheet(true);
  }, []);

  const handleEdit = useCallback(() => {
    router.push(`/edit-url?id=${bookmark.id}`);
  }, [router, bookmark]);

  const handleDeletePress = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await bookmarkRepository.remove(bookmark.id);
      setShowDeleteModal(false);
      if (router.canGoBack()) router.back();
    } catch {
      Alert.alert('Error', 'Gagal menghapus bookmark');
    }
  }, [bookmark, router]);

  const handleUrlPress = useCallback(async () => {
    if (!bookmark) return;
    await WebBrowser.openBrowserAsync(bookmark.url);
  }, [bookmark]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  if (!bookmark) return null;

  const initial = getInitial(bookmark.title);
  const visitCount = bookmark.visit_count || 0;
  const lastVisited = bookmark.last_visited ? relativeTime(bookmark.last_visited) : 'Belum dikunjungi';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          DETAIL
        </Text>
        <TouchableOpacity onPress={handleEdit} style={styles.headerBtn}>
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Initial Icon */}
        <View style={styles.iconSection}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>{initial}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={3}>
          {bookmark.title}
        </Text>

        {/* URL Link */}
        <TouchableOpacity onPress={handleUrlPress} style={styles.urlRow}>
          <Ionicons name="link-outline" size={16} color={colors.accentBlue} />
          <Text style={styles.urlText} numberOfLines={2}>
            {bookmark.url}
          </Text>
        </TouchableOpacity>

        {/* Category Badge + Date */}
        <View style={styles.metaRow}>
          {category && (
            <View style={[styles.categoryBadge, { backgroundColor: (category.color || colors.gold) + '22', borderColor: category.color || colors.gold }]}>
              <View style={[styles.categoryDot, { backgroundColor: category.color || colors.gold }]} />
              <Text style={[styles.categoryText, { color: category.color || colors.gold }]}>
                {category.name}
              </Text>
            </View>
          )}
          {!category && (
            <View style={[styles.categoryBadge, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[styles.categoryText, { color: colors.textTertiary }]}>
                Uncategorized
              </Text>
            </View>
          )}
          <Text style={styles.dateText}>
            {formatDate(bookmark.created_at)}
          </Text>
        </View>

        {/* Stats Grid 2x2 */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="eye-outline" size={20} color={colors.gold} />
            <Text style={styles.statValue}>{visitCount}</Text>
            <Text style={styles.statLabel}>Kunjungan</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={20} color={colors.gold} />
            <Text style={styles.statValueSmall}>{lastVisited}</Text>
            <Text style={styles.statLabel}>Terakhir Dilihat</Text>
          </View>
        </View>

        {/* Notes Card */}
        {bookmark.notes ? (
          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Ionicons name="document-text-outline" size={18} color={colors.gold} />
              <Text style={styles.notesTitle}>Catatan Pribadi</Text>
            </View>
            <Text style={styles.notesContent}>
              {bookmark.notes}
            </Text>
          </View>
        ) : null}

        {/* Action Grid 2x2 */}
        <View style={styles.actionGrid}>
          {/* Buka Link */}
          <TouchableOpacity style={styles.actionBtn} onPress={handleOpenLink} activeOpacity={0.8}>
            <LinearGradient
              colors={[colors.gold, colors.goldDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionGradient}
            >
              <Ionicons name="open-outline" size={22} color={colors.bg} />
              <Text style={styles.actionLabelGold}>Buka Link</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Bagikan */}
          <TouchableOpacity style={styles.actionBtnOutline} onPress={handleShare} activeOpacity={0.8}>
            <View style={styles.actionContent}>
              <Ionicons name="share-social-outline" size={22} color={colors.gold} />
              <Text style={styles.actionLabel}>Bagikan</Text>
            </View>
          </TouchableOpacity>

          {/* Edit Data */}
          <TouchableOpacity style={styles.actionBtnOutline} onPress={handleEdit} activeOpacity={0.8}>
            <View style={styles.actionContent}>
              <Ionicons name="create-outline" size={22} color={colors.gold} />
              <Text style={styles.actionLabel}>Edit Data</Text>
            </View>
          </TouchableOpacity>

          {/* Hapus */}
          <TouchableOpacity style={styles.actionBtnOutlineDanger} onPress={handleDeletePress} activeOpacity={0.8}>
            <View style={styles.actionContent}>
              <Ionicons name="trash-outline" size={22} color={colors.error} />
              <Text style={styles.actionLabelDanger}>Hapus</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ModalDialog
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        icon="🗑️"
        title="Hapus Bookmark?"
        description={`Bookmark "${bookmark.title}" akan dihapus secara permanen.`}
        confirmLabel="Hapus Sekarang"
        cancelLabel="Kembali"
        onConfirm={handleDeleteConfirm}
        danger
      />

      {/* Share Sheet */}
      <ShareSheet
        visible={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        url={bookmark.url}
        title={bookmark.title}
      />
    </View>
  );
};

export default DetailUrl;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: colors.gold,
    letterSpacing: typography.letterSpacings.wider,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconSection: {
    marginTop: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '3deg' }],
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: colors.gold + '44',
  },
  iconText: {
    fontFamily: typography.font,
    fontSize: typography.sizes['5xl'],
    fontWeight: typography.weights.bold,
    color: colors.gold,
  },
  title: {
    fontFamily: typography.font,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: typography.sizes['2xl'] * typography.lineHeights.tight,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  urlText: {
    flex: 1,
    fontFamily: typography.font,
    fontSize: typography.sizes.sm,
    color: colors.accentBlue,
    textDecorationLine: 'underline',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  dateText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontFamily: typography.font,
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: 8,
  },
  statValueSmall: {
    fontFamily: typography.font,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  statLabel: {
    fontFamily: typography.font,
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    marginTop: 4,
  },
  notesCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  notesTitle: {
    fontFamily: typography.font,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.gold,
  },
  notesContent: {
    fontFamily: typography.font,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    color: colors.textSecondary,
    lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    gap: 6,
  },
  actionBtnOutline: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  actionBtnOutlineDanger: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.error + '44',
    backgroundColor: colors.surface,
  },
  actionContent: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionLabelGold: {
    fontFamily: typography.font,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.bg,
  },
  actionLabel: {
    fontFamily: typography.font,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.gold,
  },
  actionLabelDanger: {
    fontFamily: typography.font,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.error,
  },
});
