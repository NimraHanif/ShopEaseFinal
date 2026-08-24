import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import type { AppDispatch } from '../redux/store';

// Home
export default function AppPlaceholder() {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>You're logged in! 🎉</Text>
      <Text style={styles.subtitle}>(Main app UI comes in a later phase)</Text>
      <Button title="Log Out" onPress={() => dispatch(logout())} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#777', marginBottom: 20 },
});