// Loading
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function LoadingState() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#2ecc71" />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});