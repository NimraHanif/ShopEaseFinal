import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

// Success
export default function PasswordResetSuccessScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Password Reset Successful</Text>
      <Button title="Go to Login" onPress={() => navigation.navigate('Login')} color="#2ecc71" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
});