import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PREDEFINED_COLORS } from '../constants/categories';
import colors from '../constants/colors';
import typography from '../constants/typography';

const ColorPicker = ({ selectedColor, onSelect }) => {
  return (
    <View style={styles.grid}>
      {PREDEFINED_COLORS.map((color) => {
        const isSelected = color === selectedColor;
        return (
          <TouchableOpacity
            key={color}
            style={[styles.colorItem, isSelected && styles.colorItemSelected, { backgroundColor: color }]}
            onPress={() => onSelect?.(color)}
            activeOpacity={0.7}
          >
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorItem: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorItemSelected: {
    borderColor: colors.textPrimary,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  checkmark: {
    fontFamily: typography.font,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
});

export default ColorPicker;
