import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface OfflineBannerProps {
  visible: boolean;
}

export const OfflineBanner = ({ visible }: OfflineBannerProps) => {
  const theme = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.banner, { backgroundColor: '#d29922' }]}>
      <MaterialCommunityIcons
        name="wifi-off"
        size={16}
        color="#0d1117"
        style={styles.icon}
      />
      <Text style={styles.text}>You are offline</Text>
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
    color: '#0d1117',
    fontWeight: '600',
    fontSize: 14,
  },
});
