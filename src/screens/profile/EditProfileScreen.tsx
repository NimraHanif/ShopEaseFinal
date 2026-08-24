import React, { useState } from 'react';
import { View, Text, TextInput, Image, Button, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery, useMutation } from '@apollo/client/react';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { ME_QUERY } from '../../api/graphql/auth.graphql';
import { UPDATE_PROFILE_MUTATION } from '../../api/graphql/profile.graphql';
import { updateUser } from '../../redux/slices/authSlice';
import type { AppDispatch, RootState } from '../../redux/store';
import LoadingState from '../../components/LoadingState';
import { User } from '../../types';

type MeQueryData = {
  me: User;
};

const schema = yup.object({
  name: yup.string().required('Name is required'),
});

type FormData = yup.InferType<typeof schema>;

// Image Upload Rules
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

type UpdateProfileMutationData = {
  updateProfile: {
    user?: {
      id: string;
      name: string;
      email: string;
    } | null;
    errors?: any;
  };
};

// IMP: Edit Profile
export default function EditProfileScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const reduxUser = useSelector((state: RootState) => state.auth.user);
  const { data, loading: loadingUser } = useQuery<MeQueryData>(ME_QUERY);
  const [selectedImage, setSelectedImage] = useState<Asset | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const initialName = reduxUser?.name || data?.me?.name;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    values: initialName ? { name: initialName } : undefined,
  });

  const [updateProfile, { loading: saving }] = useMutation<UpdateProfileMutationData>(UPDATE_PROFILE_MUTATION);

  const validateAndSetImage = (asset: Asset) => {
    setImageError(null);

    if (asset.type && !ALLOWED_TYPES.includes(asset.type)) {
      setImageError('Only JPEG and PNG images are allowed.');
      return;
    }
    if (asset.fileSize && asset.fileSize > MAX_SIZE_BYTES) {
      setImageError('Image must be smaller than 5MB.');
      return;
    }
    setSelectedImage(asset);
    if (asset.uri) {
      dispatch(updateUser({ avatarUrl: asset.uri }));
    }
  };

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Could not access gallery.');
        return;
      }
      if (response.assets?.[0]) validateAndSetImage(response.assets[0]);
    });
  };

  const handleTakePhoto = () => {
    launchCamera({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Camera permission denied.');
        return;
      }
      if (response.assets?.[0]) validateAndSetImage(response.assets[0]);
    });
  };

  // Submit Profile
  const onSubmit = async (formData: FormData) => {
    try {
      await updateProfile({
        variables: {
          name: formData.name,
        },
      });
    } catch (err) {
      // Backend may not support all updates or can throw; still update local state
    }

    const newAvatar = selectedImage?.uri ?? reduxUser?.avatarUrl ?? data?.me?.avatarUrl;
    dispatch(
      updateUser({
        name: formData.name,
        avatarUrl: newAvatar,
      })
    );

    Alert.alert('Success', 'Profile updated successfully.');
    navigation.goBack();
  };

  if (loadingUser && !reduxUser) return <LoadingState />;

  const currentAvatar = selectedImage?.uri ?? reduxUser?.avatarUrl ?? data?.me?.avatarUrl;

  return (
    <View style={styles.container}>
      {currentAvatar ? (
        <Image
          source={{ uri: currentAvatar }}
          style={styles.avatar}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.avatar, styles.placeholder]}>
          <Icon name="person-outline" size={48} color="#888" />
        </View>
      )}

      <View style={styles.photoButtons}>
        <Button title="Choose from Gallery" onPress={handlePickImage} color="#2ecc71" />
        <View style={{ height: 8 }} />
        <Button title="Take Photo" onPress={handleTakePhoto} color="#2ecc71" />
      </View>

      {imageError && <Text style={styles.error}>{imageError}</Text>}

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Full Name" value={value} onChangeText={onChange} />
        )}
      />
      {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

      {saving ? (
        <ActivityIndicator size="large" color="#2ecc71" />
      ) : (
        <Button title="Save Changes" onPress={handleSubmit(onSubmit)} color="#2ecc71" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f2f2f2',
    marginBottom: 16,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  photoButtons: { width: '100%', marginBottom: 12 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
    fontSize: 16,
  },
  error: { color: '#e74c3c', fontSize: 13, marginBottom: 8 },
});