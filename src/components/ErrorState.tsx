// Error
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

type ErrorStateProps = { message?: string; onRetry: () => void };

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.centered}>
      <Text style={styles.text}>{message || 'Something went wrong.'}</Text>
      <Button title="Retry" onPress={onRetry} color="#2ecc71" />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  text: { color: '#e74c3c', fontSize: 15, textAlign: 'center', marginBottom: 12 },
});