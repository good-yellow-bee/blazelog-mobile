import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { BlazelogTheme } from '@/theme';

interface OfflineBannerProps {
  visible: boolean;
}

export const OfflineBanner = ({ visible }: OfflineBannerProps) => {
  const theme = useTheme<BlazelogTheme>();

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.banner, { backgroundColor: theme.custom.colors.warning }]}>
      <MaterialCommunityIcons
        name="wifi-off"
        size={16}
        color={theme.custom.colors.textInverse}
        style={styles.icon}
      />
      <Text style={[styles.text, { color: theme.custom.colors.textInverse }]}>You are offline</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
    fontSize: 14,
  },
});
