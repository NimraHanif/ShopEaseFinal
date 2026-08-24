import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@apollo/client/react';
import { RESET_PASSWORD_MUTATION } from '../../api/graphql/auth.graphql';

type ResetPasswordMutationData = {
  resetPassword: {
    user?: {
      id: string;
      email: string;
    } | null;
    errors?: any;
  };
};

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  resetToken: yup.string().required('Reset token is required'),
  newPassword: yup.string().min(8, 'Password must be at least 8 characters').required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

type FormData = yup.InferType<typeof schema>;

// Reset
export default function ResetPasswordScreen({ navigation, route }: any) {
  const tokenFromLink = route?.params?.token ?? '';
  const emailFromLink = route?.params?.email ?? '';

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { email: emailFromLink, resetToken: tokenFromLink },
  });

  const [resetPassword, { loading }] = useMutation<ResetPasswordMutationData>(RESET_PASSWORD_MUTATION);

  const onSubmit = async (formData: FormData) => {
    const { data } = await resetPassword({
      variables: {
        email: formData.email,
        token: formData.resetToken,
        password: formData.newPassword,
        passwordConfirmation: formData.confirmPassword,
      },
    });

    if (data?.resetPassword?.user) {
      navigation.replace('PasswordResetSuccess');
    } else if (data?.resetPassword?.errors) {
      setError('resetToken', { message: 'Failed to reset password.' });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>

      <Controller
        control={control}
        name="resetToken"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Reset Token"
            value={value}
            onChangeText={onChange}
            autoCapitalize="none"
            editable={!tokenFromLink}
          />
        )}
      />
      {errors.resetToken && <Text style={styles.error}>{errors.resetToken.message}</Text>}

      <Controller
        control={control}
        name="newPassword"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="New Password"
            value={value}
            onChangeText={onChange}
            secureTextEntry
          />
        )}
      />
      {errors.newPassword && <Text style={styles.error}>{errors.newPassword.message}</Text>}

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
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
        <Button title="Reset Password" onPress={() => handleSubmit(onSubmit)()} color="#2ecc71" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
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