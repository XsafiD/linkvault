import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import colors from '../constants/colors';
import typography from '../constants/typography';
import { useBookmarks } from '../hooks/useBookmarks';
import { useCategories } from '../hooks/useCategories';
import { validateBookmarkForm, isValidUrl, isRequired } from '../utils/validators';
import { bookmarkRepository } from '../database/bookmarkRepository';
import LivePreview from '../components/LivePreview';
import ColorPicker from '../components/ColorPicker';

const EditUrl = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { editBookmark } = useBookmarks();
  const { categories, loadCategories, addCategory } = useCategories();

  // Form state
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [notes, setNotes] = useState('');

  // Validation state
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  // Category modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#D4AF37');

  // Loading & saving state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  // Load existing bookmark data
  useEffect(() => {
    const loadBookmark = async () => {
      if (!params.id) {
        Alert.alert('Error', 'ID bookmark tidak ditemukan');
        if (router.canGoBack()) router.back();
        return;
      }

      try {
        const bookmark = await bookmarkRepository.getById(params.id);
        if (!bookmark) {
          Alert.alert('Error', 'Bookmark tidak ditemukan');
          if (router.canGoBack()) router.back();
          return;
        }
        setTitle(bookmark.title || '');
        setUrl(bookmark.url || '');
        setIconUrl(bookmark.icon_url || '');
        setCategoryId(bookmark.category_id ? String(bookmark.category_id) : null);
        setNotes(bookmark.notes || '');
      } catch {
        Alert.alert('Error', 'Gagal memuat data bookmark');
        if (router.canGoBack()) router.back();
      } finally {
        setLoading(false);
      }
    };

    loadBookmark();
  }, [params.id]);

  // Real-time validation
  useEffect(() => {
    const result = validateBookmarkForm({ title, url });
    setErrors(result.errors);
  }, [title, url]);

  const isFormValid = isValidUrl(url) && isRequired(title);

  const handleFieldBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handlePasteClipboard = async () => {
    try {
      const hasString = await Clipboard.hasStringAsync();
      if (hasString) {
        const text = await Clipboard.getStringAsync();
        setUrl(text.trim());
        setTouched((prev) => ({ ...prev, url: true }));
      } else {
        Alert.alert('Info', 'Clipboard kosong');
      }
    } catch {
      Alert.alert('Error', 'Gagal membaca clipboard');
    }
  };

  const handleSave = async () => {
    setTouched({ title: true, url: true });

    const validation = validateBookmarkForm({ title, url });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setSaving(true);
    try {
      await editBookmark(params.id, {
        title: title.trim(),
        url: url.trim(),
        icon_url: iconUrl.trim() || null,
        category_id: categoryId,
        notes: notes.trim() || null,
      });
      if (router.canGoBack()) {
        router.back();
      }
    } catch {
      Alert.alert('Error', 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Nama kategori wajib diisi');
      return;
    }
    try {
      await addCategory({ name: newCategoryName.trim(), color: newCategoryColor });
      setShowCategoryModal(false);
      setNewCategoryName('');
      setNewCategoryColor('#D4AF37');
    } catch {
      Alert.alert('Error', 'Gagal membuat kategori');
    }
  };

  // Find selected category for preview
  const selectedCategory = categories.find((c) => String(c.id) === String(categoryId));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit URL</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.headerBtn}
          disabled={!isFormValid || saving}
        >
          <Text style={[styles.checkText, (!isFormValid || saving) && styles.checkDisabled]}>
            ✓
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Live Preview */}
        <LivePreview
          title={title}
          url={url}
          iconUrl={iconUrl}
          categoryName={selectedCategory?.name}
          categoryColor={selectedCategory?.color}
          notes={notes}
        />

        {/* Judul URL */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Judul URL</Text>
            {touched.title && errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Masukkan judul bookmark"
            placeholderTextColor={colors.textTertiary}
            value={title}
            onChangeText={setTitle}
            onBlur={() => handleFieldBlur('title')}
            returnKeyType="next"
          />
        </View>

        {/* Link/URL */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Link / URL</Text>
            {touched.url && errors.url && (
              <Text style={styles.errorText}>{errors.url}</Text>
            )}
          </View>
          <View style={styles.urlRow}>
            <TextInput
              style={[styles.input, styles.urlInput]}
              placeholder="https://example.com"
              placeholderTextColor={colors.textTertiary}
              value={url}
              onChangeText={setUrl}
              onBlur={() => handleFieldBlur('url')}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
            <TouchableOpacity style={styles.pasteBtn} onPress={handlePasteClipboard}>
              <Text style={styles.pasteBtnText}>Paste</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* URL Ikon */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, styles.optionalLabel]}>URL Ikon</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com/icon.png (opsional)"
            placeholderTextColor={colors.textTertiary}
            value={iconUrl}
            onChangeText={setIconUrl}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>

        {/* Kategori */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Kategori</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((cat) => {
              const isSelected = String(cat.id) === String(categoryId);
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    isSelected && { backgroundColor: cat.color + '22', borderColor: cat.color },
                  ]}
                  onPress={() => setCategoryId(isSelected ? null : String(cat.id))}
                >
                  <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                  <Text style={[styles.categoryChipText, isSelected && { color: cat.color }]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.categoryChip}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={styles.addCategoryIcon}>+</Text>
              <Text style={styles.categoryChipText}>Kategori Baru</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Catatan Tambahan */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, styles.optionalLabel]}>Catatan Tambahan</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Tambahkan catatan (opsional)"
            placeholderTextColor={colors.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={!isFormValid || saving}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isFormValid && !saving ? [colors.gold, colors.goldDark] : [colors.border, colors.border]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveGradient}
          >
            <Text style={styles.saveBtnText}>
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Batalkan</Text>
        </TouchableOpacity>
      </View>

      {/* Category Modal */}
      {showCategoryModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Kategori Baru</Text>
            <TextInput
              style={styles.input}
              placeholder="Nama kategori"
              placeholderTextColor={colors.textTertiary}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <Text style={styles.modalLabel}>Pilih Warna</Text>
            <ColorPicker selectedColor={newCategoryColor} onSelect={setNewCategoryColor} />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleCreateCategory}
              >
                <Text style={styles.modalSaveText}>Simpan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowCategoryModal(false)}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

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
  backText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.xl,
    color: colors.textSecondary,
  },
  headerTitle: {
    fontFamily: typography.font,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  checkText: {
    fontFamily: typography.font,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.gold,
  },
  checkDisabled: {
    color: colors.textTertiary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 200,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontFamily: typography.font,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.textSecondary,
    letterSpacing: typography.letterSpacings.wide,
  },
  optionalLabel: {
    color: colors.textTertiary,
  },
  errorText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.xs,
    color: colors.error,
  },
  input: {
    fontFamily: typography.font,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  urlRow: {
    flexDirection: 'row',
    gap: 8,
  },
  urlInput: {
    flex: 1,
  },
  pasteBtn: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pasteBtnText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.gold,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  categoryScroll: {
    marginTop: 4,
    flexGrow: 0,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryChipText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  addCategoryIcon: {
    fontFamily: typography.font,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.gold,
    marginRight: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  saveBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  saveGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
  },
  saveBtnText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.bg,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelBtnText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.md,
    color: colors.textTertiary,
  },
  // Modal styles
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontFamily: typography.font,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  modalLabel: {
    fontFamily: typography.font,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalSaveText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.bg,
  },
  modalCancelBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
});

export default EditUrl;
