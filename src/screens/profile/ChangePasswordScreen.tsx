import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@apollo/client/react';
import { CHANGE_PASSWORD_MUTATION } from '../../api/graphql/profile.graphql';
import { MutationResponse } from '../../types';

type ChangePasswordMutationData = {
  changePassword: {
    user?: {
      id: string;
      name: string;
      email: string;
    } | null;
    errors?: any;
  };
};

const schema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(8, 'Password must be at least 8 characters').required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your new password'),
});

type FormData = yup.InferType<typeof schema>;

// Change Password
export default function ChangePasswordScreen({ navigation }: any) {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  const [changePassword, { loading }] = useMutation<ChangePasswordMutationData>(CHANGE_PASSWORD_MUTATION);

  const onSubmit = async (formData: FormData) => {
    const { data } = await changePassword({
      variables: {
        currentPassword: formData.currentPassword,
        password: formData.newPassword,
        passwordConfirmation: formData.confirmPassword,
      },
    });

    if (data?.changePassword?.user) {
      navigation.goBack();
    } else if (data?.changePassword?.errors) {
      setError('currentPassword', { message: 'Incorrect current password or invalid data.' });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>

      <Controller
        control={control}
        name="currentPassword"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            value={value}
            onChangeText={onChange}
            secureTextEntry
          />
        )}
      />
      {errors.currentPassword && <Text style={styles.error}>{errors.currentPassword.message}</Text>}

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
        <Button title="Update Password" onPress={handleSubmit(onSubmit)} color="#2ecc71" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
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