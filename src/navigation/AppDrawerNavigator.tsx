import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import HomeTabNavigator from './HomeTabNavigator';
import MyOrdersScreen from '../screens/orders/MyOrdersScreen';
import AddressListScreen from '../screens/addresses/AddressListScreen';
import HelpSupportScreen from '../screens/support/HelpSupportScreen';
import AddressStack from './AddressStack';
import { logout } from '../redux/slices/authSlice';
import { clearCart } from '../redux/slices/cartSlice';
import type { AppDispatch } from '../redux/store';

// Drawer
import ProductDetailsScreen from '../screens/home/ProductDetailsScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';
import AddAddressScreen from '../screens/addresses/AddAddressScreen';
import EditAddressScreen from '../screens/addresses/EditAddressScreen';
import OrderDetailsScreen from '../screens/orders/OrderDetailsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import SupportRequestScreen from '../screens/support/SupportRequestScreen';
import OrderSuccessScreen from '../screens/cart/OrderSuccessScreen';

const Drawer = createDrawerNavigator();
const ShopStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();
const SupportStack = createNativeStackNavigator();

// Shop
function ShopStackScreen() {
  return (
    <ShopStack.Navigator>
      <ShopStack.Screen name="Tabs" component={HomeTabNavigator} options={{ headerShown: false }} />
      <ShopStack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: 'Product' }} />
      <ShopStack.Screen name="Checkout" component={CheckoutScreen} />
      <ShopStack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ headerShown: false }} />
      <ShopStack.Screen name="AddAddress" component={AddAddressScreen} options={{ title: 'Add Address' }} />
      <ShopStack.Screen name="EditAddress" component={EditAddressScreen} options={{ title: 'Edit Address' }} />
      <ShopStack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ title: 'Order Details' }} />
      <ShopStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <ShopStack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
      <ShopStack.Screen name="SupportRequest" component={SupportRequestScreen} options={{ title: 'Contact Support' }} />
    </ShopStack.Navigator>
  );
}

// Orders Stack
function OrdersStackScreen() {
  return (
    <OrdersStack.Navigator>
      <OrdersStack.Screen name="MyOrders" component={MyOrdersScreen} options={{ title: 'My Orders' }} />
      <OrdersStack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ title: 'Order Details' }} />
    </OrdersStack.Navigator>
  );
}

// Support Stack
function SupportStackScreen() {
  return (
    <SupportStack.Navigator>
      <SupportStack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ title: 'Help & Support' }} />
      <SupportStack.Screen name="SupportRequest" component={SupportRequestScreen} options={{ title: 'Contact Support' }} />
    </SupportStack.Navigator>
  );
}

// Logout
function LogoutScreen() {
  return null;
}

export default function AppDrawerNavigator() {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveTintColor: '#2ecc71',
        drawerInactiveTintColor: '#555',
        drawerActiveBackgroundColor: '#eafaf1',
        headerStyle: { backgroundColor: '#1e1e1e' },
        headerTintColor: '#fff',
      }}
    >
      <Drawer.Screen
        name="Shop"
        component={ShopStackScreen}
        options={{
          headerShown: false,
          drawerIcon: ({ color, size }) => <Icon name="storefront-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="MyOrders"
        component={OrdersStackScreen}
        options={{
          headerShown: false,
          title: 'My Orders',
          drawerIcon: ({ color, size }) => <Icon name="receipt-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="DeliveryAddresses"
        component={AddressStack}
        options={{
          headerShown: false,
          title: 'Delivery Addresses',
          drawerIcon: ({ color, size }) => <Icon name="location-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="HelpSupport"
        component={SupportStackScreen}
        options={{
          headerShown: false,
          title: 'Help & Support',
          drawerIcon: ({ color, size }) => <Icon name="help-circle-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Logout"
        component={LogoutScreen}
        listeners={{
          drawerItemPress: (e) => {
            e.preventDefault();
            dispatch(clearCart());
            dispatch(logout());
          },
        }}
        options={{
          drawerIcon: ({ color, size }) => <Icon name="log-out-outline" size={size} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
}