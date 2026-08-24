import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@apollo/client/react';
import { FORGOT_PASSWORD_MUTATION } from '../../api/graphql/auth.graphql';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
});

type FormData = yup.InferType<typeof schema>;

// Reset
export default function ForgotPasswordScreen({ navigation }: any) {
  const [submitted, setSubmitted] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD_MUTATION);

  const onSubmit = async (formData: FormData) => {
    await forgotPassword({ variables: { email: formData.email } });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.message}>
          If an account exists with that email, we've sent password reset instructions.
        </Text>
        <Button title="Back to Login" onPress={() => navigation.navigate('Login')} color="#2ecc71" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.message}>Enter your email and we'll send you reset instructions.</Text>

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

      {loading ? (
        <ActivityIndicator size="large" color="#2ecc71" />
      ) : (
        <Button title="Send Reset Link" onPress={() => handleSubmit(onSubmit)()} disabled={loading} color="#2ecc71" />
      )}

      <View style={{ height: 10 }} />
      <Button title="Back to Login" onPress={() => navigation.goBack()} color="#2ecc71" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  message: { color: '#666', marginBottom: 20, textAlign: 'center' },
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