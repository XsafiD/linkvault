import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { categoryRepository } from '../../database/categoryRepository';
import { bookmarkRepository } from '../../database/bookmarkRepository';
import { useSearch } from '../../hooks/useSearch';
import { formatDate, getInitial, ensureScheme } from '../../utils/formatters';
import SearchBar from '../../components/SearchBar';
import BookmarkCard from '../../components/BookmarkCard';
import ModalDialog from '../../components/ModalDialog';
import ColorPicker from '../../components/ColorPicker';

const CategoryDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [category, setCategory] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Edit category modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(colors.gold);
  const [editError, setEditError] = useState('');

  const { query, results, handleSearch, clearSearch } = useSearch(bookmarks);

  const loadData = useCallback(async () => {
    try {
      const catData = await categoryRepository.getById(id);
      const bmData = await bookmarkRepository.getByCategory(id);
      // Attach category info to each bookmark for BookmarkCard
      const enriched = bmData.map((bm) => ({
        ...bm,
        category_name: catData?.name || 'Uncategorized',
        category_color: catData?.color || colors.textTertiary,
      }));
      setCategory(catData);
      setBookmarks(enriched);
    } catch (err) {
      // silently fail
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleToggleExpand = useCallback((bookmarkId) => {
    setExpandedId((prev) => (prev === bookmarkId ? null : bookmarkId));
  }, []);

  const handleOpen = useCallback(async (bookmark) => {
    await Linking.openURL(ensureScheme(bookmark.url));
    await bookmarkRepository.incrementVisit(bookmark.id);
  }, []);

  const handleEdit = useCallback(
    (bookmark) => {
      router.push(`/edit-url?id=${bookmark.id}`);
    },
    [router]
  );

  const handleDeletePress = useCallback((bookmark) => {
    setDeleteTarget(bookmark);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteTarget) {
      await bookmarkRepository.remove(deleteTarget.id);
      setDeleteTarget(null);
      setExpandedId(null);
      await loadData();
    }
  }, [deleteTarget, loadData]);

  const handlePress = useCallback(
    (bookmark) => {
      router.push(`/detail-url?id=${bookmark.id}`);
    },
    [router]
  );

  const handleAddBookmark = useCallback(() => {
    router.push(`/add-url?category_id=${id}`);
  }, [router, id]);

  const handleOpenEditCategory = useCallback(() => {
    if (category) {
      setEditName(category.name);
      setEditColor(category.color || colors.gold);
      setEditError('');
      setShowEditModal(true);
    }
  }, [category]);

  const handleSaveEditCategory = useCallback(async () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      setEditError('Nama kategori wajib diisi');
      return;
    }
    try {
      await categoryRepository.update(id, { name: trimmed, color: editColor });
      setShowEditModal(false);
      await loadData();
    } catch {
      setEditError('Gagal menyimpan kategori');
    }
  }, [editName, editColor, id, loadData]);

  const renderBookmark = useCallback(
    ({ item }) => (
      <BookmarkCard
        bookmark={item}
        isExpanded={expandedId === item.id}
        onToggleExpand={handleToggleExpand}
        onOpen={handleOpen}
        onEdit={handleEdit}
        onDelete={handleDeletePress}
        onPress={handlePress}
      />
    ),
    [
      expandedId,
      handleToggleExpand,
      handleOpen,
      handleEdit,
      handleDeletePress,
      handlePress,
    ]
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bookmark-outline" size={64} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>Belum ada bookmark</Text>
      <Text style={styles.emptySubtitle}>
        Tekan tombol + untuk menambah bookmark ke kategori ini
      </Text>
    </View>
  );

  const displayData = query.trim() ? results : bookmarks;

  const categoryColor = category?.color || colors.textTertiary;
  const categoryName = category?.name || 'Kategori';
  const bookmarkCount = bookmarks.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Kategori</Text>
        <TouchableOpacity onPress={handleOpenEditCategory} style={styles.headerBtn}>
          <Ionicons name="create-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Category Info Header */}
      <View style={styles.categoryInfo}>
        <View
          style={[
            styles.categoryInitial,
            {
              backgroundColor: categoryColor + '22',
              borderColor: categoryColor,
              shadowColor: categoryColor,
            },
          ]}
        >
          <Text style={[styles.categoryInitialText, { color: categoryColor }]}>
            {getInitial(categoryName)}
          </Text>
        </View>
        <Text style={styles.categoryName}>{categoryName.toUpperCase()}</Text>
        <View style={styles.categoryMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="link-outline" size={14} color={colors.textTertiary} />
            <Text style={styles.metaText}>{bookmarkCount} URL</Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
            <Text style={styles.metaText}>
              {formatDate(category?.updated_at || category?.created_at)}
            </Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={query}
          onChangeText={(text) => handleSearch(text, bookmarks)}
          placeholder="Cari bookmark di kategori ini..."
        />
      </View>

      {/* Bookmark List */}
      <FlatList
        data={displayData}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderBookmark}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.gold}
            colors={[colors.gold]}
          />
        }
      />

      {/* FAB - Add Bookmark */}
      <TouchableOpacity style={styles.fab} onPress={handleAddBookmark} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color={colors.bg} />
      </TouchableOpacity>

      {/* Edit Category Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowEditModal(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalWrapper}
          >
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>Edit Kategori</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nama Kategori</Text>
                <TextInput
                  style={[styles.modalInput, editError ? styles.inputError : null]}
                  value={editName}
                  onChangeText={(text) => {
                    setEditName(text);
                    if (editError) setEditError('');
                  }}
                  placeholder="Masukkan nama kategori"
                  placeholderTextColor={colors.textTertiary}
                  maxLength={50}
                />
                {editError ? <Text style={styles.errorText}>{editError}</Text> : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Warna</Text>
                <ColorPicker selectedColor={editColor} onSelect={setEditColor} />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.modalCancelText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveEditCategory}>
                  <Text style={styles.modalSaveText}>Simpan Perubahan</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ModalDialog
        visible={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        icon="🗑️"
        title="Hapus Bookmark?"
        description={`Bookmark "${deleteTarget?.title || ''}" akan dihapus secara permanen.`}
        confirmLabel="Hapus Sekarang"
        cancelLabel="Kembali"
        onConfirm={handleDeleteConfirm}
        danger
      />
    </View>
  );
};

export default CategoryDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerBtn: {
    padding: 8,
    borderRadius: 12,
  },
  headerTitle: {
    fontFamily: typography.font,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.gold,
    letterSpacing: typography.letterSpacings.wider,
  },
  categoryInfo: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  categoryInitial: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  categoryInitialText: {
    fontFamily: typography.font,
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.extraBold,
  },
  categoryName: {
    fontFamily: typography.font,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textTertiary,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    marginBottom: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontFamily: typography.font,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semiBold,
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontFamily: typography.font,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: typography.lineHeights.normal * typography.sizes.md,
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  // Edit Category Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalWrapper: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 32,
    padding: 28,
    width: '100%',
  },
  modalTitle: {
    fontFamily: typography.font,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: typography.font,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  modalInput: {
    fontFamily: typography.font,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.error,
    marginTop: 6,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.bg,
  },
});
