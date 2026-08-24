import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddressListScreen from '../screens/addresses/AddressListScreen';
import AddAddressScreen from '../screens/addresses/AddAddressScreen';
import EditAddressScreen from '../screens/addresses/EditAddressScreen';

const Stack = createNativeStackNavigator();

// Address
export default function AddressStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AddressList" component={AddressListScreen} options={{ title: 'Delivery Addresses' }} />
      <Stack.Screen name="AddAddress" component={AddAddressScreen} options={{ title: 'Add Address' }} />
      <Stack.Screen name="EditAddress" component={EditAddressScreen} options={{ title: 'Edit Address' }} />
    </Stack.Navigator>
  );
}