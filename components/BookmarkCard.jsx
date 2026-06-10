import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import typography from '../constants/typography';
import { getInitial, truncateText } from '../utils/formatters';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BookmarkCard = ({ bookmark, isExpanded, onToggleExpand, onOpen, onEdit, onDelete, onPress }) => {
  const categoryColor = bookmark.category_color || colors.textTertiary;
  const categoryName = bookmark.category_name || 'Uncategorized';

  const handleToggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggleExpand?.(bookmark.id);
  }, [bookmark.id, onToggleExpand]);

  const handlePress = useCallback(() => {
    if (!isExpanded) {
      handleToggle();
    } else {
      onPress?.(bookmark);
    }
  }, [isExpanded, handleToggle, onPress, bookmark]);

  return (
    <TouchableOpacity
      style={[styles.card, isExpanded && styles.cardExpanded]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <View style={[styles.iconInitial, { backgroundColor: categoryColor + '22', borderColor: categoryColor }]}>
          <Text style={[styles.iconText, { color: categoryColor }]}>
            {getInitial(bookmark.title)}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {bookmark.title || 'Tanpa Judul'}
          </Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: categoryColor + '22' }]}>
              <Text style={[styles.badgeText, { color: categoryColor }]}>
                {categoryName}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={handleToggle} style={styles.chevronBtn}>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={isExpanded ? colors.gold : colors.textTertiary}
          />
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.urlText} numberOfLines={2}>
            {bookmark.url}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionBtn, styles.openBtn]} onPress={() => onOpen?.(bookmark)}>
              <Text style={styles.openBtnText}>Buka</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => onEdit?.(bookmark)}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => onDelete?.(bookmark)}>
              <Text style={styles.deleteBtnText}>Hapus</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  cardExpanded: {
    borderColor: colors.gold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconInitial: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.font,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  chevronBtn: {
    padding: 8,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  urlText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.sm,
    color: colors.accentBlue,
    marginBottom: 12,
    lineHeight: typography.lineHeights.normal * typography.sizes.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openBtn: {
    backgroundColor: colors.gold,
  },
  openBtnText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.bg,
  },
  editBtn: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editBtnText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  deleteBtn: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.error + '44',
  },
  deleteBtnText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.error,
  },
});

export default BookmarkCard;
