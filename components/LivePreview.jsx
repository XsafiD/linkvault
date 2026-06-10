import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';
import { getInitial, truncateText } from '../utils/formatters';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LivePreview = ({ title, url, iconUrl, categoryName, categoryColor, notes }) => {
  const [expanded, setExpanded] = useState(false);
  const displayTitle = title || 'Judul Bookmark';
  const displayCategory = categoryName || 'Uncategorized';
  const displayColor = categoryColor || colors.textTertiary;
  const displayUrl = url ? truncateText(url, 60) : 'https://example.com';
  const hasNotes = notes && notes.trim().length > 0;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Preview</Text>

      <TouchableOpacity style={styles.previewContent} onPress={toggleExpand} activeOpacity={0.8}>
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: displayColor + '22', borderColor: displayColor }]}>
            <Text style={[styles.iconLetter, { color: displayColor }]}>
              {getInitial(displayTitle)}
            </Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>
              {displayTitle}
            </Text>
            <Text style={styles.url} numberOfLines={1}>
              {displayUrl}
            </Text>
            <View style={[styles.badge, { backgroundColor: displayColor + '22' }]}>
              <Text style={[styles.badgeText, { color: displayColor }]}>
                {displayCategory}
              </Text>
            </View>
          </View>
        </View>

        {expanded && hasNotes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Catatan:</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}

        {hasNotes && (
          <Text style={styles.expandHint}>
            {expanded ? 'Sembunyikan catatan ▴' : 'Lihat catatan ▾'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  label: {
    fontFamily: typography.font,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.textTertiary,
    letterSpacing: typography.letterSpacings.wider,
    marginBottom: 10,
  },
  previewContent: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconLetter: {
    fontFamily: typography.font,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
  },
  info: {
    flex: 1,
  },
  title: {
    fontFamily: typography.font,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  url: {
    fontFamily: typography.font,
    fontSize: typography.sizes.sm,
    color: colors.accentBlue,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  notesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  notesLabel: {
    fontFamily: typography.font,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  notesText: {
    fontFamily: typography.font,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.normal * typography.sizes.sm,
  },
  expandHint: {
    fontFamily: typography.font,
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default LivePreview;
