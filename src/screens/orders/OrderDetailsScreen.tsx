import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { ORDER_QUERY } from '../../api/graphql/orders.graphql';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { Order } from '../../types';

type OrderQueryData = {
  order: Order;
};

function parseRubyHash(str: string): Record<string, any> {
  const result: Record<string, any> = {};
  const regex = /["':]?([a-zA-Z0-9_]+)["']?\s*=>\s*(?:"([^"]*)"|'([^']*)'|(nil|true|false|-?\d+(?:\.\d+)?))/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    const key = match[1];
    if (match[2] !== undefined) {
      result[key] = match[2];
    } else if (match[3] !== undefined) {
      result[key] = match[3];
    } else if (match[4] !== undefined) {
      const val = match[4];
      if (val === 'nil') result[key] = null;
      else if (val === 'true') result[key] = true;
      else if (val === 'false') result[key] = false;
      else result[key] = Number(val);
    }
  }
  return result;
}

function parseDeliveryAddress(order: any) {
  if (order?.address && typeof order.address === 'object') {
    return order.address;
  }

  if (typeof order?.deliveryAddressSnapshot === 'object' && order.deliveryAddressSnapshot !== null) {
    return order.deliveryAddressSnapshot;
  }

  if (typeof order?.deliveryAddressSnapshot === 'string' && order.deliveryAddressSnapshot.trim()) {
    const raw = order.deliveryAddressSnapshot.trim();

    // Check if it's a Ruby hash string (e.g. {"id"=>3, ...})
    if (raw.includes('=>')) {
      const parsedRuby = parseRubyHash(raw);
      if (Object.keys(parsedRuby).length > 0) {
        return parsedRuby;
      }
    }

    // Try standard JSON parse
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch {
      return { rawText: raw };
    }
  }

  return null;
}

function formatOrderDate(dateStr?: string | number | null): string {
  if (!dateStr) return '';
  try {
    const raw = String(dateStr).trim();
    if (/^\d+$/.test(raw)) {
      const num = Number(raw);
      const d = new Date(num > 1e11 ? num : num * 1000);
      if (!isNaN(d.getTime())) return d.toLocaleString();
    }
    const isoLike = raw.replace(' UTC', 'Z').replace(' ', 'T');
    let d = new Date(isoLike);
    if (isNaN(d.getTime())) {
      d = new Date(raw);
    }
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } catch {}
  return String(dateStr);
}

// Order Details
export default function OrderDetailsScreen({ route }: any) {
  const orderId = route?.params?.orderId ?? route?.params?.id;
  const { data, loading, error, refetch } = useQuery<OrderQueryData>(ORDER_QUERY, {
    variables: { id: orderId },
    skip: !orderId,
  });

  if (!orderId) {
    return <ErrorState message="No order ID provided." onRetry={() => {}} />;
  }

  if (loading) return <LoadingState />;
  if (error || !data?.order) {
    const errorMsg =
      error?.message ||
      (error as any)?.graphQLErrors?.map((e: any) => e.message).join(', ') ||
      'Failed to load order.';
    return <ErrorState message={errorMsg} onRetry={() => refetch()} />;
  }

  const order = data.order;
  const address = parseDeliveryAddress(order);
  const itemsList = order.orderItems ?? order.items ?? [];

  const label = address?.label;
  const recipientName = address?.recipientName ?? address?.recipient_name;
  const phoneNumber = address?.phoneNumber ?? address?.phone_number;
  const street = address?.address ?? address?.addressLine1 ?? address?.address_line_1 ?? address?.street;
  const city = address?.city;
  const state = address?.state;
  const postalCode = address?.postalCode ?? address?.postal_code ?? address?.zip;
  const country = address?.country;
  const rawText = address?.rawText;

  const cityStateZip = [city, state, postalCode].filter(Boolean).join(', ');
  const formattedDate = formatOrderDate(order?.createdAt);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.orderNumber}>Order #{order?.orderNumber ?? order?.id}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{order?.status ?? 'PENDING'}</Text>
          </View>
        </View>
        {formattedDate ? (
          <Text style={styles.date}>{formattedDate}</Text>
        ) : null}
      </View>

      {/* Items */}
      <Text style={styles.sectionTitle}>Ordered Items</Text>
      <View style={styles.itemsCard}>
        {itemsList.map((item: any, index: number) => {
          const name = item?.product?.name ?? item?.productNameAtPurchase ?? 'Product';
          const unitPrice = Number(item?.price ?? item?.priceAtPurchase) || 0;
          const qty = item?.quantity ?? 1;
          return (
            <View key={item?.id ?? String(index)} style={[styles.itemRow, index > 0 && styles.itemRowBorder]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{name}</Text>
                <Text style={styles.itemQty}>Qty: {qty} × ${unitPrice.toFixed(2)}</Text>
              </View>
              <Text style={styles.itemPrice}>
                ${(unitPrice * qty).toFixed(2)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Totals */}
      <View style={styles.totalsBox}>
        <View style={styles.totalRow}>
          <Text style={styles.totalSubLabel}>Subtotal</Text>
          <Text style={styles.totalSubValue}>${(Number(order?.subtotal) || 0).toFixed(2)}</Text>
        </View>
        <View style={[styles.totalRow, { marginTop: 6 }]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${(Number(order?.totalPrice) || 0).toFixed(2)}</Text>
        </View>
      </View>

      {/* Delivery Address */}
      {address ? (
        <View style={styles.deliverySection}>
          <Text style={styles.sectionTitle}>Delivered To</Text>
          <View style={styles.addressBox}>
            {label ? (
              <View style={styles.labelBadge}>
                <Text style={styles.labelText}>{label}</Text>
              </View>
            ) : null}
            {recipientName ? <Text style={styles.recipientName}>{recipientName}</Text> : null}
            {phoneNumber ? <Text style={styles.phoneNumber}>Phone: {phoneNumber}</Text> : null}
            {street ? <Text style={styles.addressText}>{street}</Text> : null}
            {cityStateZip ? <Text style={styles.addressText}>{cityStateZip}</Text> : null}
            {country ? <Text style={styles.addressText}>{country}</Text> : null}
            {rawText ? <Text style={styles.addressText}>{rawText}</Text> : null}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { padding: 16, paddingBottom: 32 },
  header: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  statusBadge: {
    backgroundColor: '#2ecc71',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  date: { fontSize: 12, color: '#888', marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginTop: 14, marginBottom: 8 },
  itemsCard: {
    backgroundColor: '#fbfbfb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  itemName: { fontSize: 14, fontWeight: '600', color: '#333' },
  itemQty: { fontSize: 12, color: '#777', marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: 'bold', color: '#222' },
  totalsBox: {
    backgroundColor: '#f8fdf9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d4eedc',
    padding: 12,
    marginTop: 14,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalSubLabel: { fontSize: 14, color: '#666' },
  totalSubValue: { fontSize: 14, color: '#444' },
  totalLabel: { fontWeight: 'bold', fontSize: 16, color: '#111' },
  totalValue: { fontWeight: 'bold', fontSize: 16, color: '#2ecc71' },
  deliverySection: { marginTop: 8 },
  addressBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 14,
  },
  labelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eafaf1',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
  },
  labelText: { color: '#2ecc71', fontSize: 11, fontWeight: 'bold' },
  recipientName: { fontSize: 15, fontWeight: 'bold', color: '#222', marginBottom: 2 },
  phoneNumber: { fontSize: 13, color: '#666', marginBottom: 4 },
  addressText: { fontSize: 13, color: '#444', lineHeight: 18 },
});