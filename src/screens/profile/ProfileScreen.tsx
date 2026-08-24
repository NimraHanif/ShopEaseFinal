import React, { useCallback } from 'react';
import { View, Text, Image, Button, StyleSheet } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ME_QUERY } from '../../api/graphql/auth.graphql';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { logout as logoutAction } from '../../redux/slices/authSlice';
import { clearCart } from '../../redux/slices/cartSlice';
import { useMutation } from '@apollo/client/react';
import { LOGOUT_MUTATION } from '../../api/graphql/profile.graphql';
import { apolloClient } from '../../api/apolloClient';
import type { AppDispatch, RootState } from '../../redux/store';
import { User } from '../../types';

type MeQueryData = {
  me: User;
};

// Profile Screen
export default function ProfileScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const reduxUser = useSelector((state: RootState) => state.auth.user);
  const { data, loading, error, refetch } = useQuery<MeQueryData>(ME_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  useFocusEffect(
    useCallback(() => {
      refetch().catch(() => { });
    }, [refetch])
  );

  if (loading && !data?.me && !reduxUser) return <LoadingState />;
  if (error && !data?.me && !reduxUser) {
    return <ErrorState message="Failed to load profile." onRetry={() => refetch()} />;
  }

  const user = { ...(data?.me ?? {}), ...(reduxUser ?? {}) } as Partial<User>;
  const avatarUri = reduxUser?.avatarUrl || user.avatarUrl;

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logoutMutation();
    } catch (err) {
      // Ignore error
    }

    dispatch(clearCart());
    dispatch(logoutAction());
    // Clear Apollo Cache
    await apolloClient.clearStore();
  };

  return (
    <View style={styles.container}>
      {avatarUri ? (
        <Image
          source={{ uri: avatarUri }}
          style={styles.avatar}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.avatar, styles.placeholder]}>
          <Icon name="person-outline" size={48} color="#888" />
        </View>
      )}
      <Text style={styles.name}>{user.name || 'User'}</Text>
      <Text style={styles.email}>{user.email || ''}</Text>

      <View style={styles.menu}>
        <Button title="Edit Profile" onPress={() => navigation.navigate('EditProfile')} color="#2ecc71" />
        <View style={styles.spacer} />
        <Button title="Change Password" onPress={() => navigation.navigate('ChangePassword')} color="#2ecc71" />
        <View style={styles.spacer} />
        <Button title="My Orders" onPress={() => navigation.getParent()?.navigate('MyOrders')} color="#2ecc71" />
        <View style={styles.spacer} />
        <Button title="Delivery Addresses" onPress={() => navigation.getParent()?.navigate('DeliveryAddresses')} color="#2ecc71" />
        <View style={styles.spacer} />
        <Button title="Help & Support" onPress={() => navigation.getParent()?.navigate('HelpSupport')} color="#2ecc71" />
      </View>

      <Button title="Log Out" color="#e74c3c" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f2f2f2',
    marginTop: 10,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  name: { fontSize: 20, fontWeight: 'bold', marginTop: 12 },
  email: { fontSize: 14, color: '#777', marginBottom: 20 },
  menu: { width: '100%', marginBottom: 20 },
  spacer: { height: 10 },
});