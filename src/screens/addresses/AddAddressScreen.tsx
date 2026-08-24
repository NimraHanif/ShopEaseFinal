import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@apollo/client/react';
import Geolocation from '@react-native-community/geolocation';
import { CREATE_ADDRESS_MUTATION, ADDRESSES_QUERY } from '../../api/graphql/addresses.graphql';
import { Address } from '../../types';

const schema = yup.object({
  label: yup.string().required('Label is required (e.g. Home, Work)'),
  recipientName: yup.string().required('Recipient name is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  addressLine1: yup.string().required('Address line 1 is required'),
  city: yup.string().required('City is required'),
  state: yup.string().optional(),
  postalCode: yup.string().optional(),
  country: yup.string().required('Country is required'),
});

type FormData = yup.InferType<typeof schema>;

// Address
export default function AddAddressScreen({ navigation }: any) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  type CreateAddressMutationData = {
    createAddress: {
      address: Address | null;
      errors: string[] | null;
    } | null;
  };

  const [createAddress, { loading }] = useMutation<CreateAddressMutationData>(CREATE_ADDRESS_MUTATION, {
    update(cache, { data }) {
      const newAddress = data?.createAddress?.address;
      if (!newAddress) return;
      try {
        const existing: any = cache.readQuery({ query: ADDRESSES_QUERY });
        cache.writeQuery({
          query: ADDRESSES_QUERY,
          data: { addresses: [...(existing?.addresses ?? []), newAddress] },
        });
      } catch {
        // Cache miss — refetchQueries will handle it
      }
    },
    refetchQueries: [{ query: ADDRESSES_QUERY }],
    awaitRefetchQueries: true,
  });

  const requestLocation = async () => {
    setFetchingLocation(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Allow location access to auto-fill your delivery address.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setLocationDenied(true);
          setFetchingLocation(false);
          Alert.alert(
            'Permission Denied',
            'Location permission was denied. You can manually enter your address details in the form below.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          setLocationDenied(false);

          // Reverse geocode to auto-fill city & country
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              { headers: { 'User-Agent': 'ShopEase/1.0' } }
            );
            const geo = await response.json();
            const addr = geo?.address ?? {};

            if (addr.city || addr.town || addr.village) {
              setValue('city', addr.city ?? addr.town ?? addr.village ?? '');
            }
            if (addr.state) {
              setValue('state', addr.state);
            }
            if (addr.country) {
              setValue('country', addr.country);
            }
            if (addr.postcode) {
              setValue('postalCode', addr.postcode);
            }

            setFetchingLocation(false);
            Alert.alert('Location Found', 'City, state and country have been auto-filled. Please verify and complete the remaining fields.');
          } catch {
            setFetchingLocation(false);
            Alert.alert('Location Found', 'Coordinates attached. Could not auto-fill address — please fill in the fields manually.');
          }
        },
        (error) => {
          setLocationDenied(true);
          setFetchingLocation(false);
          Alert.alert(
            'Location Error',
            error.message || 'Could not fetch your current location. Please enter your address manually.'
          );
        },
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 30000 }
      );
    } catch (err: any) {
      setLocationDenied(true);
      setFetchingLocation(false);
      Alert.alert('Permission Error', 'Unable to request location. Please fill in the address manually.');
    }
  };

  const onSubmit = async (formData: FormData) => {
    try {
      const result = await createAddress({
        variables: {
          label: formData.label,
          recipientName: formData.recipientName,
          phoneNumber: formData.phoneNumber,
          address: formData.addressLine1,
          city: formData.city,
          country: formData.country,
          postalCode: formData.postalCode ?? '',
          default: false,
        },
      });

      const payload = result.data?.createAddress;
      const backendErrors = payload?.errors;

      if (backendErrors && backendErrors.length > 0) {
        // Backend returned business-level errors — address was NOT saved
        const msg = Array.isArray(backendErrors)
          ? backendErrors.map((e: any) => (typeof e === 'string' ? e : e?.message ?? JSON.stringify(e))).join('\n')
          : String(backendErrors);
        Alert.alert('Failed to Save', msg);
        return;
      }

      if (!payload?.address) {
        Alert.alert('Error', 'Address could not be saved. Please try again.');
        return;
      }

      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save address.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Address</Text>

      <TouchableOpacity
        style={[styles.locationBtn, fetchingLocation && styles.disabledBtn]}
        onPress={requestLocation}
        disabled={fetchingLocation}
      >
        <Text style={styles.locationBtnText}>
          {fetchingLocation ? 'Fetching Location...' : 'Use Current Location'}
        </Text>
      </TouchableOpacity>

      {coords && (
        <Text style={styles.coordsText}>
          Coordinates: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </Text>
      )}

      {locationDenied && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Location permission is denied or location services are disabled. You can still manually enter your full address below to save it.
          </Text>
        </View>
      )}

      {(
        [
          ['label', 'Label (e.g. Home, Work)'],
          ['recipientName', 'Recipient Name'],
          ['phoneNumber', 'Phone Number'],
          ['addressLine1', 'Street Address'],
          ['city', 'City'],
          ['state', 'State / Province (optional)'],
          ['postalCode', 'Postal Code (optional)'],
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
        <ActivityIndicator size="large" color="#2ecc71" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.submitContainer}>
          <Button title="Save Address" onPress={() => handleSubmit(onSubmit)()} color="#2ecc71" />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#333' },
  locationBtn: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledBtn: { backgroundColor: '#bdc3c7' },
  locationBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  coordsText: { textAlign: 'center', marginTop: 4, marginBottom: 10, color: '#2ecc71', fontWeight: '500' },
  warningBox: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  warningText: { textAlign: 'center', color: '#856404', fontSize: 13, lineHeight: 18 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  error: { color: '#e74c3c', fontSize: 12, marginTop: 2 },
  submitContainer: { marginTop: 20, marginBottom: 30 },
});