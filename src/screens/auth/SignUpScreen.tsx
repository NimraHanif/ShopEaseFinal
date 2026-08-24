import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@apollo/client/react';
import { useDispatch } from 'react-redux';
import { SIGN_UP_MUTATION } from '../../api/graphql/auth.graphql';
import { authSuccess } from '../../redux/slices/authSlice';
import type { AppDispatch } from '../../redux/store';

interface SignUpResponse {
  signUp: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    errors?: string | null;
  };
}

const schema = yup.object({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

type FormData = yup.InferType<typeof schema>;

// Sign Up
export default function SignUpScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const [signUp, { loading }] = useMutation<SignUpResponse, { name: string; email: string; password: string; passwordConfirmation: string }>(SIGN_UP_MUTATION);

  const onSubmit = async (formData: FormData) => {
    const { data } = await signUp({
      variables: {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        passwordConfirmation: formData.confirmPassword,
      },
    });

    if (data?.signUp?.token) {
      const { token, user } = data.signUp;
      dispatch(authSuccess({ user, token }));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Full Name" value={value} onChangeText={onChange} />
        )}
      />
      {errors.fullName && <Text style={styles.error}>{errors.fullName.message}</Text>}

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
          <TextInput style={styles.input} placeholder="Password" value={value} onChangeText={onChange} secureTextEntry />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={value}
            onChangeText={onChange}
            secureTextEntry
          />
        )}
      />
      {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword.message}</Text>}

      {loading ? (
        <ActivityIndicator size="large" color="#2ecc71" />
      ) : (
        <Button title="Sign Up" onPress={() => handleSubmit(onSubmit)()} color="#2ecc71" />
      )}

      <View style={{ height: 10 }} />
      <Button title="Already have an account? Log In" onPress={() => navigation.navigate('Login')} color="#2ecc71" />
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