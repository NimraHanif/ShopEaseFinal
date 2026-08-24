import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Button, ActivityIndicator, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useQuery, useMutation } from '@apollo/client/react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ADDRESSES_QUERY,
  DELETE_ADDRESS_MUTATION,
  SET_DEFAULT_ADDRESS_MUTATION,
} from '../../api/graphql/addresses.graphql';
import AddressCard from '../../components/AddressCard';
import { Address } from '../../types';

type AddressesQueryData = {
  addresses: Address[];
};

// Address
export default function AddressListScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, error, refetch } = useQuery<AddressesQueryData>(ADDRESSES_QUERY, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const [deleteAddress] = useMutation(DELETE_ADDRESS_MUTATION, {
    refetchQueries: [{ query: ADDRESSES_QUERY }],
    awaitRefetchQueries: true,
  });

  const [setDefaultAddress] = useMutation(SET_DEFAULT_ADDRESS_MUTATION, {
    refetchQueries: [{ query: ADDRESSES_QUERY }],
    awaitRefetchQueries: true,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAddress({ variables: { id } });
            await refetch();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete address.');
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress({ variables: { id } });
      await refetch();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to set default address.');
    }
  };

  if (loading && !refreshing && !data?.addresses) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  if (error && !data?.addresses) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load addresses.</Text>
        <Button title="Retry" onPress={() => refetch()} color="#2ecc71" />
      </View>
    );
  }

  const addresses: Address[] = data?.addresses ?? [];

  if (addresses.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No delivery addresses yet.</Text>
        <Button title="Add Address" onPress={() => navigation.navigate('AddAddress')} color="#2ecc71" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AddressCard
            address={item}
            onEdit={() => navigation.navigate('EditAddress', { addressId: item.id })}
            onDelete={() => handleDelete(item.id)}
            onSetDefault={() => handleSetDefault(item.id)}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={{ paddingVertical: 10 }}
      />
      <View style={styles.addButton}>
        <Button title="Add New Address" onPress={() => navigation.navigate('AddAddress')} color="#2ecc71" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  errorText: { color: '#e74c3c', marginBottom: 12 },
  emptyText: { color: '#777', marginBottom: 16, fontSize: 15 },
  addButton: { padding: 16 },
});