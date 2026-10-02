import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';

export default function PrimaryButton({ label, onPress, variant = 'primary', disabled, loading }) {
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isGhost && styles.ghost,
        isDanger && styles.danger,
        !isGhost && !isDanger && styles.primary,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isGhost ? colors.asphalt : '#fff'} />
      ) : (
        <Text
          style={[
            styles.label,
            isGhost && { color: colors.asphalt },
            isDanger && { color: '#fff' },
            !isGhost && !isDanger && { color: colors.asphalt },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.signal,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.asphalt,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
});
