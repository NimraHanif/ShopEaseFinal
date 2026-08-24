import React from 'react';
import { View, Text, FlatList, Image, Button, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import QuantitySelector from '../../components/QuantitySelector';
import EmptyState from '../../components/EmptyState';
import {
  increaseQuantity,
  decreaseQuantity,
  removeItem,
  selectCartSubtotal,
} from '../../redux/slices/cartSlice';
import type { RootState, AppDispatch } from '../../redux/store';

//  Cart Screen
export default function CartScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((state: RootState) => state.cart.items);
  const subtotal = useSelector(selectCartSubtotal);

  if (items.length === 0) {
    return <EmptyState message="Your cart is empty." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image
              source={item.photoUrl ? { uri: item.photoUrl } : undefined}
              style={styles.image}
            />
            <View style={styles.details}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
              <QuantitySelector
                quantity={item.quantity}
                maxStock={item.stock}
                onIncrease={() => dispatch(increaseQuantity(item.productId))}
                onDecrease={() => dispatch(decreaseQuantity(item.productId))}
              />
            </View>
            <Text style={styles.removeText} onPress={() => dispatch(removeItem(item.productId))}>
              Remove
            </Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.subtotalText}>Subtotal: ${subtotal.toFixed(2)}</Text>
        {/* Proceed Checkout */}
        <Button title="Proceed to Checkout" onPress={() => navigation.navigate('Checkout')} color="#2ecc71" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  row: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  image: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#f2f2f2' },
  details: { flex: 1, marginLeft: 12 },
  name: { fontSize: 14, fontWeight: '600' },
  price: { fontSize: 13, color: '#2ecc71', marginVertical: 4 },
  removeText: { color: '#e74c3c', fontSize: 12, marginLeft: 8 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  subtotalText: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
});