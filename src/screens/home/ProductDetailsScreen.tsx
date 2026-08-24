import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Button, StyleSheet, Alert } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { useDispatch } from 'react-redux';
import { PRODUCT_QUERY } from '../../api/graphql/products.graphql';
import QuantitySelector from '../../components/QuantitySelector';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { addItem } from '../../redux/slices/cartSlice';
import type { AppDispatch } from '../../redux/store';
import type { Product } from '../../types';

type ProductQueryData = {
  product: Product;
};

export default function ProductDetailsScreen({ route, navigation }: any) {
  const { productId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const [quantity, setQuantity] = useState(1);

  const { data, loading, error, refetch } = useQuery<ProductQueryData>(PRODUCT_QUERY, {
    variables: { id: productId },
  });

  if (loading) return <LoadingState />;
  if (error || !data?.product) {
    return <ErrorState message="Product not found." onRetry={() => refetch()} />;
  }

  const product = data.product;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock || quantity > product.stock) {
      Alert.alert('Unavailable', 'This product cannot be added in the requested quantity.');
      return;
    }

    dispatch(
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        photoUrl: product.photoUrl,
        quantity,
        stock: product.stock,
      })
    );

    Alert.alert('Added to Cart', `${quantity} × ${product.name} added to your cart.`);
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={product.photoUrl ? { uri: product.photoUrl } : undefined}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.content}>
        <Text style={styles.category}>{product.category.name}</Text>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>

        {isOutOfStock ? (
          <Text style={styles.outOfStock}>Out of Stock</Text>
        ) : (
          <Text style={styles.inStock}>{product.stock} available</Text>
        )}

        <Text style={styles.description}>{product.description}</Text>

        {!isOutOfStock && (
          <>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <QuantitySelector
              quantity={quantity}
              maxStock={product.stock}
              onIncrease={() => setQuantity((q) => Math.min(q + 1, product.stock))}
              onDecrease={() => setQuantity((q) => Math.max(q - 1, 1))}
            />
          </>
        )}

        <View style={styles.addButton}>
          <Button
            title={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            onPress={handleAddToCart}
            disabled={isOutOfStock}
            color="#2ecc71"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 280, backgroundColor: '#f2f2f2' },
  content: { padding: 16 },
  category: { color: '#888', fontSize: 12, textTransform: 'uppercase' },
  name: { fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  price: { fontSize: 20, fontWeight: 'bold', color: '#2ecc71', marginTop: 6 },
  inStock: { color: '#888', fontSize: 13, marginTop: 4 },
  outOfStock: { color: '#e74c3c', fontSize: 13, marginTop: 4, fontWeight: '600' },
  description: { fontSize: 14, color: '#555', marginTop: 14, lineHeight: 20 },
  quantityLabel: { fontSize: 14, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  addButton: { marginTop: 24, marginBottom: 20 },
});