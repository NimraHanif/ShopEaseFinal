import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Address } from '../types';

export {};

type AddressCardProps = {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
};

// Address
function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  const isDefault = Boolean(address.default ?? address.isDefault);
  const streetAddress = address.address || address.addressLine1 || '';

  return (
    <View style={[styles.card, isDefault && styles.defaultCard]}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{address.label}</Text>
        {isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>DEFAULT</Text>
          </View>
        )}
      </View>

      <Text style={styles.recipient}>{address.recipientName}</Text>
      <Text style={styles.detail}>{address.phoneNumber}</Text>
      {streetAddress ? (
        <Text style={styles.detail}>
          {streetAddress}
          {address.addressLine2 ? `, ${address.addressLine2}` : ''}
        </Text>
      ) : null}
      <Text style={styles.detail}>
        {address.city}{address.state ? `, ${address.state}` : ''} {address.postalCode}
      </Text>
      <Text style={styles.detail}>{address.country}</Text>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        {!isDefault && (
          <TouchableOpacity onPress={onSetDefault}>
            <Text style={styles.actionText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onDelete}>
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default React.memo(AddressCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
  defaultCard: { borderColor: '#2ecc71', borderWidth: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  label: { fontSize: 16, fontWeight: 'bold' },
  defaultBadge: { backgroundColor: '#2ecc71', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  defaultBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  recipient: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  detail: { fontSize: 13, color: '#555' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  actionText: { color: '#2ecc71', fontWeight: '600', fontSize: 13 },
  deleteText: { color: '#e74c3c' },
});