import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';

const SearchBar = ({ value, onChangeText, placeholder = 'Cari bookmark...' }) => {
  const inputRef = useRef(null);

  return (
    <View style={styles.container}>
      <View style={styles.searchIcon}>
        <SvgSearch />
      </View>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
};

const SvgSearch = () => (
  <View style={styles.iconWrapper}>
    <View style={styles.iconCircle} />
    <View style={styles.iconLine} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    height: 52,
  },
  searchIcon: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 18,
    height: 18,
    position: 'relative',
  },
  iconCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textTertiary,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  iconLine: {
    width: 6,
    height: 2,
    backgroundColor: colors.textTertiary,
    position: 'absolute',
    bottom: 1,
    right: 0,
    transform: [{ rotate: '45deg' }],
  },
  input: {
    flex: 1,
    fontFamily: typography.font,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    color: colors.textPrimary,
    paddingVertical: 0,
    height: '100%',
  },
});

export default SearchBar;
