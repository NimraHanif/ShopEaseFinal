import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useLazyQuery } from '@apollo/client/react';
import { ME_QUERY } from '../../api/graphql/auth.graphql';
import { authSuccess, authFailed } from '../../redux/slices/authSlice';
import type { RootState, AppDispatch } from '../../redux/store';
import type { User } from '../../types';

type MeQueryData = {
  me: User;
};

// Splash
export default function SplashScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const token = useSelector((state: RootState) => state.auth.token);

  const [runMeQuery] = useLazyQuery<MeQueryData>(ME_QUERY);

  useEffect(() => {
    const startTime = Date.now();

    const complete = (action: () => void) => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 5000 - elapsed);
      setTimeout(action, remaining);
    };

    if (token) {
      runMeQuery()
        .then(({ data }) => {
          complete(() => {
            if (data?.me) {
              dispatch(authSuccess({ user: data.me, token: token as string }));
            } else {
              dispatch(authFailed());
            }
          });
        })
        .catch(() => {
          complete(() => {
            dispatch(authFailed());
          });
        });
    } else {
      complete(() => {
        dispatch(authFailed());
      });
    }
  }, [token, runMeQuery, dispatch]);

  return (
    <View style={styles.container} testID="splash-screen">
      <Text style={styles.logoText}>ShopEase</Text>

      <ActivityIndicator size="large" color="#2ecc71" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 20,
  },
});