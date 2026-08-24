import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type QuantitySelectorProps = {
  quantity: number;
  maxStock: number;
  onIncrease: () => void;
  onDecrease: () => void;
};

// Quantity
function QuantitySelector({ quantity, maxStock, onIncrease, onDecrease }: QuantitySelectorProps) {
  const atMin = quantity <= 1;
  const atMax = quantity >= maxStock;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, atMin && styles.disabled]}
        onPress={onDecrease}
        disabled={atMin}
      >
        <Text style={styles.buttonText}>−</Text>
      </TouchableOpacity>

      <Text style={styles.quantity}>{quantity}</Text>

      <TouchableOpacity
        style={[styles.button, atMax && styles.disabled]}
        onPress={onIncrease}
        disabled={atMax}
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export default React.memo(QuantitySelector);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2ecc71',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  quantity: { marginHorizontal: 16, fontSize: 16, fontWeight: '600' },
});