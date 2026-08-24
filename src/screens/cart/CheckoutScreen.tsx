import React, { useState } from 'react';
import { View, Text, FlatList, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/client/react';
import { ADDRESSES_QUERY } from '../../api/graphql/addresses.graphql';
import { CREATE_ORDER_MUTATION } from '../../api/graphql/orders.graphql';
import { selectCartSubtotal, clearCart } from '../../redux/slices/cartSlice';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import type { RootState, AppDispatch } from '../../redux/store';
import { Address, Order, MutationResponse } from '../../types';

type AddressesQueryData = {
  addresses: Address[];
};

type CreateOrderMutationData = {
  createOrder: {
    order?: {
      id: string;
      orderNumber: string;
      status: string;
      subtotal: number;
    } | null;
    errors?: any;
  };
};

// Checkout Screen
export default function CheckoutScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const localSubtotal = useSelector(selectCartSubtotal);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const { data: addressData, loading: addressesLoading } = useQuery<AddressesQueryData>(ADDRESSES_QUERY);
  const [createOrder, { loading: placingOrder }] = useMutation<CreateOrderMutationData>(CREATE_ORDER_MUTATION);

  const addresses: Address[] = addressData?.addresses ?? [];

  // Default Address Selection
  React.useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault ?? (a as any).default);
      setSelectedAddressId(defaultAddr?.id ?? addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  // Empty Cart Guard
  if (cartItems.length === 0) {
    return <EmptyState message="Your cart is empty." />;
  }

  // Place Order
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      Alert.alert('Select an Address', 'Please choose a delivery address before placing your order.');
      return;
    }

    try {
      const { data } = await createOrder({
        variables: {
          addressId: selectedAddressId,
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      });

      if (data?.createOrder?.order) {
        const order = data.createOrder.order;
        // IMP: Clear Cart
        dispatch(clearCart());
        navigation.replace('OrderSuccess', { orderId: order.id });
      } else if (data?.createOrder?.errors) {
        Alert.alert('Unable to Place Order', 'Failed to place order. Please try again.');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong while placing your order. Please try again.');
    }
  };

  if (addressesLoading) return <LoadingState />;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Delivery Address</Text>

      {addresses.length === 0 ? (
        <View style={styles.noAddressBox}>
          <Text style={styles.noAddressText}>No saved addresses yet.</Text>
          <Button title="Add Address" onPress={() => navigation.navigate('AddAddress')} color="#2ecc71" />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Text
              style={[
                styles.addressOption,
                selectedAddressId === item.id && styles.addressOptionSelected,
              ]}
              onPress={() => setSelectedAddressId(item.id)}
            >
              {item.label} — {item.addressLine1 || (item as any).address || ''}, {item.city}
            </Text>
          )}
        />
      )}

      <Text style={styles.sectionTitle}>Order Summary</Text>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryName}>{item.quantity} × {item.name}</Text>
            <Text style={styles.summaryPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        {/* Estimated Total */}
        <Text style={styles.subtotalText}>Estimated Total: ${localSubtotal.toFixed(2)}</Text>

        {placingOrder ? (
          <ActivityIndicator size="large" color="#2ecc71" />
        ) : (
          <Button
            title="Place Order"
            onPress={handlePlaceOrder}
            disabled={placingOrder || !selectedAddressId}
            color="#2ecc71"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
  noAddressBox: { alignItems: 'center', padding: 16 },
  noAddressText: { color: '#777', marginBottom: 10 },
  addressOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 8,
    fontSize: 13,
  },
  addressOptionSelected: { borderColor: '#2ecc71', backgroundColor: '#eafaf1' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryName: { fontSize: 13, color: '#555', flex: 1 },
  summaryPrice: { fontSize: 13, fontWeight: '600' },
  footer: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 16 },
  subtotalText: { fontSize: 17, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
});