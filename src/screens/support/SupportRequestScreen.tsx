import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@apollo/client/react';
import { CREATE_SUPPORT_REQUEST_MUTATION } from '../../api/graphql/support.graphql';
import { MutationResponse } from '../../types';

type CreateSupportRequestMutationData = {
  createSupportRequest: {
    supportRequest?: {
      id: string;
      subject: string;
    } | null;
    errors?: any;
  };
};

const schema = yup.object({
  subject: yup.string().required('Subject is required'),
  message: yup.string().required('Message is required').min(10, 'Please provide more detail'),
});

type FormData = yup.InferType<typeof schema>;

// Support Request
export default function SupportRequestScreen({ navigation }: any) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  const [createSupportRequest, { loading }] = useMutation<CreateSupportRequestMutationData>(CREATE_SUPPORT_REQUEST_MUTATION);

  const onSubmit = async (formData: FormData) => {
    const { data } = await createSupportRequest({
      variables: {
        subject: formData.subject,
        message: formData.message,
      },
    });

    if (data?.createSupportRequest?.supportRequest) {
      Alert.alert('Request Sent', "We've received your message and will get back to you soon.");
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Support</Text>

      <Controller
        control={control}
        name="subject"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Subject" value={value} onChangeText={onChange} />
        )}
      />
      {errors.subject && <Text style={styles.error}>{errors.subject.message}</Text>}

      <Controller
        control={control}
        name="message"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="How can we help?"
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={5}
          />
        )}
      />
      {errors.message && <Text style={styles.error}>{errors.message.message}</Text>}

      {loading ? (
        <ActivityIndicator size="large" color="#2ecc71" />
      ) : (
        <Button title="Send Request" onPress={handleSubmit(onSubmit)} color="#2ecc71" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
    fontSize: 16,
  },
  messageInput: { height: 120, textAlignVertical: 'top' },
  error: { color: '#e74c3c', marginBottom: 10, fontSize: 13 },
});