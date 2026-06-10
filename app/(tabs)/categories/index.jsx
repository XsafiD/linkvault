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
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../constants/colors';
import typography from '../../../constants/typography';
import { useCategories } from '../../../hooks/useCategories';
import CategoryCard from '../../../components/CategoryCard';
import ColorPicker from '../../../components/ColorPicker';
import ModalDialog from '../../../components/ModalDialog';

const Categories = () => {
  const router = useRouter();
  const { categories, loading, loadCategories, addCategory, editCategory, deleteCategory } =
    useCategories();

  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Modal state for add/edit
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState(colors.gold);
  const [formError, setFormError] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  }, [loadCategories]);

  // Open modal for adding new category
  const handleAdd = useCallback(() => {
    setEditTarget(null);
    setFormName('');
    setFormColor(colors.gold);
    setFormError('');
    setModalVisible(true);
  }, []);

  // Open modal for editing existing category
  const handleEdit = useCallback((category) => {
    setEditTarget(category);
    setFormName(category.name);
    setFormColor(category.color || colors.gold);
    setFormError('');
    setModalVisible(true);
  }, []);

  // Save (create or update) category
  const handleSave = useCallback(async () => {
    const trimmed = formName.trim();
    if (!trimmed) {
      setFormError('Nama kategori wajib diisi');
      return;
    }
    try {
      if (editTarget) {
        await editCategory(editTarget.id, { name: trimmed, color: formColor });
      } else {
        await addCategory({ name: trimmed, color: formColor });
      }
      setModalVisible(false);
    } catch {
      setFormError('Gagal menyimpan kategori');
    }
  }, [formName, formColor, editTarget, addCategory, editCategory]);

  // Delete flow
  const handleDeletePress = useCallback((category) => {
    setDeleteTarget(category);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteTarget) {
      await deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteCategory]);

  // Navigate to category detail
  const handlePress = useCallback(
    (category) => {
      router.push(`/categories/${category.id}`);
    },
    [router],
  );

  const renderCategory = useCallback(
    ({ item }) => (
      <CategoryCard
        category={item}
        onPress={handlePress}
        onEdit={handleEdit}
        onDelete={handleDeletePress}
      />
    ),
    [handlePress, handleEdit, handleDeletePress],
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="folder-outline" size={64} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>Belum ada kategori</Text>
      <Text style={styles.emptySubtitle}>
        Tekan tombol + untuk menambah kategori pertama
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kategori</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleAdd}>
          <Ionicons name="add" size={26} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Category List */}
      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCategory}
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

      {/* Add / Edit Category Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalWrapper}
          >
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>
                {editTarget ? 'Edit Kategori' : 'Kategori Baru'}
              </Text>

              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nama Kategori</Text>
                <TextInput
                  style={[styles.input, formError ? styles.inputError : null]}
                  value={formName}
                  onChangeText={(text) => {
                    setFormName(text);
                    if (formError) setFormError('');
                  }}
                  placeholder="Masukkan nama kategori"
                  placeholderTextColor={colors.textTertiary}
                  maxLength={50}
                />
                {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
              </View>

              {/* Color Picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Warna</Text>
                <ColorPicker selectedColor={formColor} onSelect={setFormColor} />
              </View>

              {/* Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave}>
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
        title="Hapus Kategori?"
        description={`Kategori "${deleteTarget?.name || ''}" akan dihapus. Bookmark dalam kategori ini akan berpindah ke "Uncategorized".`}
        confirmLabel="Hapus Sekarang"
        cancelLabel="Kembali"
        onConfirm={handleDeleteConfirm}
        danger
      />
    </View>
  );
};

export default Categories;

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
  headerBtn: {
    padding: 8,
    borderRadius: 12,
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

  // Modal styles
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
  input: {
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
