import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@apollo/client/react';
import { useDispatch } from 'react-redux';
import { LOGIN_MUTATION } from '../../api/graphql/auth.graphql';
import { authSuccess } from '../../redux/slices/authSlice';
import type { AppDispatch } from '../../redux/store';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

type FormData = yup.InferType<typeof schema>;

interface LoginResponse {
  login: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    errors?: string | null;
  };
}

// Login
export default function LoginScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const [login, { loading, error: mutationError }] = useMutation<LoginResponse, { email: string; password: string }>(LOGIN_MUTATION);

  const onSubmit = async (formData: FormData) => {
    const { data } = await login({ variables: { email: formData.email, password: formData.password } });

    if (data?.login?.token) {
      const { token, user } = data.login;
      dispatch(authSuccess({ user, token }));
    }
  };

  const loginServerError = mutationError
    ? 'Something went wrong. Please try again.'
    : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={value}
            onChangeText={onChange}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={value}
            onChangeText={onChange}
            secureTextEntry
          />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      {loginServerError && <Text style={styles.error}>{loginServerError}</Text>}

      {loading ? (
        <ActivityIndicator size="large" color="#2ecc71" />
      ) : (
        <Button title="Log In" onPress={() => handleSubmit(onSubmit)()} color="#2ecc71" />
      )}

      <View style={{ height: 10 }} />
      <Button title="Don't have an account? Sign Up" onPress={() => navigation.navigate('SignUp')} color="#2ecc71" />
      <View style={{ height: 10 }} />
      <Button title="Forgot Password?" onPress={() => navigation.navigate('ForgotPassword')} color="#2ecc71" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
    fontSize: 16,
  },
  error: { color: '#e74c3c', marginBottom: 10, fontSize: 13 },
});