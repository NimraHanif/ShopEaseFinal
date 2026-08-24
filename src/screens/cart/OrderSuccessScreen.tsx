import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { ORDER_QUERY } from '../../api/graphql/orders.graphql';
import LoadingState from '../../components/LoadingState';
import { Order } from '../../types';

type OrderQueryData = {
  order: Order;
};

export default function OrderSuccessScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  const { data, loading } = useQuery<OrderQueryData>(ORDER_QUERY, { variables: { id: orderId } });

  if (loading) return <LoadingState />;

  const order = data?.order;

  return (
    <View style={styles.container}>
      <Text style={styles.checkmark}>✓</Text>
      <Text style={styles.title}>Order Placed!</Text>

      {order && (
        <>
          <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
          <Text style={styles.status}>Status: {order.status}</Text>
          <Text style={styles.total}>Total: ${order.totalPrice.toFixed(2)}</Text>
        </>
      )}

      <View style={styles.buttonRow}>
        <Button
          title="View Order"
          onPress={() => navigation.replace('OrderDetails', { orderId })}
          color="#2ecc71"
        />
        <View style={{ height: 12 }} />
        <Button
          title="Continue Shopping"
          onPress={() => navigation.navigate('Tabs', { screen: 'HomeTab' })}
          color="#2ecc71"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  checkmark: { fontSize: 60, color: '#2ecc71', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  orderNumber: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  status: { fontSize: 14, color: '#555', marginBottom: 4 },
  total: { fontSize: 18, fontWeight: 'bold', color: '#2ecc71', marginBottom: 24 },
  buttonRow: { width: '100%', paddingHorizontal: 20 },
});