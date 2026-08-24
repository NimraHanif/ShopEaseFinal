import React, { useState } from 'react';
import { View, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { ORDERS_QUERY } from '../../api/graphql/orders.graphql';
import OrderCard from '../../components/OrderCard';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { Order } from '../../types';

type OrdersQueryData = {
  orders: Order[] | { nodes: Order[] };
};

export default function MyOrdersScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, error, refetch } = useQuery<OrdersQueryData>(ORDERS_QUERY, {
    variables: { page: 1, perPage: 20 },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading && !refreshing) return <LoadingState />;
  if (error) return <ErrorState message="Failed to load orders." onRetry={() => refetch()} />;

  const orders: Order[] = Array.isArray(data?.orders) ? data.orders : (data?.orders?.nodes ?? []);

  if (orders.length === 0) {
    return <EmptyState message="You haven't placed any orders yet." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={{ paddingVertical: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});