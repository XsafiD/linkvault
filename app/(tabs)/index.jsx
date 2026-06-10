import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Linking } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import typography from '../../constants/typography';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useSearch } from '../../hooks/useSearch';
import { bookmarkRepository } from '../../database/bookmarkRepository';
import { ensureScheme } from '../../utils/formatters';
import SearchBar from '../../components/SearchBar';
import BookmarkCard from '../../components/BookmarkCard';
import ModalDialog from '../../components/ModalDialog';

const Dashboard = () => {
  const router = useRouter();
  const { bookmarks, loading, loadBookmarks, deleteBookmark } = useBookmarks();
  const { query, results, handleSearch, clearSearch } = useSearch(bookmarks);
  const [expandedId, setExpandedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [loadBookmarks])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBookmarks();
    setRefreshing(false);
  }, [loadBookmarks]);

  const handleToggleExpand = useCallback((id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleOpen = useCallback(async (bookmark) => {
    await Linking.openURL(ensureScheme(bookmark.url));
    await bookmarkRepository.incrementVisit(bookmark.id);
  }, []);

  const handleEdit = useCallback((bookmark) => {
    router.push(`/edit-url?id=${bookmark.id}`);
  }, [router]);

  const handleDeletePress = useCallback((bookmark) => {
    setDeleteTarget(bookmark);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteTarget) {
      await deleteBookmark(deleteTarget.id);
      setDeleteTarget(null);
      setExpandedId(null);
    }
  }, [deleteTarget, deleteBookmark]);

  const handlePress = useCallback((bookmark) => {
    router.push(`/detail-url?id=${bookmark.id}`);
  }, [router]);

  const handleSettings = useCallback(() => {
    router.push('/settings');
  }, [router]);

  const renderBookmark = useCallback(({ item }) => (
    <BookmarkCard
      bookmark={item}
      isExpanded={expandedId === item.id}
      onToggleExpand={handleToggleExpand}
      onOpen={handleOpen}
      onEdit={handleEdit}
      onDelete={handleDeletePress}
      onPress={handlePress}
    />
  ), [expandedId, handleToggleExpand, handleOpen, handleEdit, handleDeletePress, handlePress]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bookmark-outline" size={64} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>Belum ada bookmark</Text>
      <Text style={styles.emptySubtitle}>
        Tekan tombol + untuk menambah bookmark pertama
      </Text>
    </View>
  );

  const displayData = query.trim() ? results : bookmarks;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Link<Text style={styles.headerTitleGold}>Vault</Text>
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => {
              if (query.trim()) {
                clearSearch(bookmarks);
              }
            }}
            style={styles.headerBtn}
          >
            <Ionicons name="search" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSettings} style={styles.headerBtn}>
            <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={query}
          onChangeText={(text) => handleSearch(text, bookmarks)}
          placeholder="Cari bookmark..."
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

      {/* Delete Confirmation Modal */}
      <ModalDialog
        visible={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        icon={<Ionicons name="trash-outline" size={28} color={colors.error} />}
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

export default Dashboard;

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
  headerTitle: {
    fontFamily: typography.font,
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  headerTitleGold: {
    color: colors.gold,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  headerBtn: {
    padding: 8,
    borderRadius: 12,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 8,
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
  },
});
