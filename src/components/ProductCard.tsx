import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Product } from '../types';

type ProductCardProps = {
  product: Product;
  onPress: () => void;
};

// Product
function ProductCard({ product, onPress }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} disabled={isOutOfStock}>
      <Image
        source={product.photoUrl ? { uri: product.photoUrl } : undefined}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        {isOutOfStock ? (
          <Text style={styles.outOfStock}>Out of Stock</Text>
        ) : (
          <Text style={styles.inStock}>{product.stock} in stock</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(ProductCard);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#f2f2f2',
  },
  info: { padding: 8 },
  name: { fontSize: 14, fontWeight: '600' },
  price: { fontSize: 15, fontWeight: 'bold', color: '#2ecc71', marginTop: 2 },
  inStock: { fontSize: 11, color: '#888', marginTop: 2 },
  outOfStock: { fontSize: 11, color: '#e74c3c', marginTop: 2, fontWeight: '600' },
});