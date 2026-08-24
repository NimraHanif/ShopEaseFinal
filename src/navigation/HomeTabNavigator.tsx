import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DrawerActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/home/SearchScreen';
import CartScreen from '../screens/cart/CartScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { selectCartItemCount } from '../redux/slices/cartSlice';
import type { RootState } from '../redux/store';

const Tab = createBottomTabNavigator();

// Tabs
function CartIconWithBadge({ color, size }: { color: string; size: number }) {
  const count = useSelector((state: RootState) => selectCartItemCount(state));
  return (
    <View>
      <Icon name="cart-outline" size={size} color={color} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </View>
  );
}

export default function HomeTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ navigation, route }) => ({
        headerShown: true,
        tabBarActiveTintColor: '#2ecc71',
        tabBarInactiveTintColor: '#999',
        headerLeft: () => (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          >
            <Icon name="menu-outline" size={26} color="#333" />
          </TouchableOpacity>
        ),
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'HomeTab') return <Icon name="home-outline" size={size} color={color} />;
          if (route.name === 'Search') return <Icon name="search-outline" size={size} color={color} />;
          if (route.name === 'Cart') return <CartIconWithBadge color={color} size={size} />;
          if (route.name === 'ProfileTab') return <Icon name="person-outline" size={size} color={color} />;
          return null;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    marginLeft: 16,
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});