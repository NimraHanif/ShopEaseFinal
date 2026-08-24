import React, { useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  ADDRESSES_QUERY,
  UPDATE_ADDRESS_MUTATION,
} from '../../api/graphql/addresses.graphql';
import type { Address } from '../../types';

type AddressesQueryData = {
  addresses: Address[];
};

const schema = yup.object({
  label: yup.string().required('Label is required'),
  recipientName: yup.string().required('Recipient name is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  addressLine1: yup.string().required('Address line 1 is required'),
  addressLine2: yup.string().optional(),
  city: yup.string().required('City is required'),
  state: yup.string().required('State/Province is required'),
  postalCode: yup.string().required('Postal code is required'),
  country: yup.string().required('Country is required'),
});

type FormData = yup.InferType<typeof schema>;

// Address
export default function EditAddressScreen({ route, navigation }: any) {
  const { addressId } = route.params;

  const { data } = useQuery<AddressesQueryData>(ADDRESSES_QUERY);
  const address = data?.addresses?.find((a) => a.id === addressId);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  useEffect(() => {
    if (address) {
      reset({
        label: address.label,
        recipientName: address.recipientName,
        phoneNumber: address.phoneNumber,
        addressLine1: address.addressLine1 || (address as any).address || '',
        addressLine2: address.addressLine2 ?? '',
        city: address.city,
        state: address.state ?? '',
        postalCode: address.postalCode,
        country: address.country,
      });
    }
  }, [address, reset]);

  const [updateAddress, { loading }] = useMutation(UPDATE_ADDRESS_MUTATION, {
    refetchQueries: [{ query: ADDRESSES_QUERY }],
    awaitRefetchQueries: true,
  });

  const onSubmit = async (formData: FormData) => {
    try {
      await updateAddress({
        variables: {
          id: addressId,
          label: formData.label,
          recipientName: formData.recipientName,
          phoneNumber: formData.phoneNumber,
          address: formData.addressLine1,
          city: formData.city,
          country: formData.country,
          postalCode: formData.postalCode,
        },
      });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update address.');
    }
  };

  if (!address) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Address</Text>

      {(
        [
          ['label', 'Label'],
          ['recipientName', 'Recipient Name'],
          ['phoneNumber', 'Phone Number'],
          ['addressLine1', 'Address Line 1'],
          ['addressLine2', 'Address Line 2 (optional)'],
          ['city', 'City'],
          ['state', 'State / Province'],
          ['postalCode', 'Postal Code'],
          ['country', 'Country'],
        ] as [keyof FormData, string][]
      ).map(([name, placeholder]) => (
        <View key={name}>
          <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                value={value ?? ''}
                onChangeText={onChange}
              />
            )}
          />
          {errors[name] && <Text style={styles.error}>{errors[name]?.message}</Text>}
        </View>
      ))}

      {loading ? (
        <ActivityIndicator size="large" color="#2ecc71" />
      ) : (
        <Button title="Save Changes" onPress={() => handleSubmit(onSubmit)()} color="#2ecc71" />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    fontSize: 15,
  },
  error: { color: '#e74c3c', fontSize: 12, marginTop: 2 },
});