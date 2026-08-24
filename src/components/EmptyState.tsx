// Empty
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type EmptyStateProps = { message: string };

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <View style={styles.centered}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  text: { color: '#777', fontSize: 15, textAlign: 'center' },
});