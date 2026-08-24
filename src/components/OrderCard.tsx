import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Order } from '../types';

type OrderCardProps = {
  order: Order;
  onPress: () => void;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f39c12',
  PROCESSING: '#3498db',
  SHIPPED: '#9b59b6',
  DELIVERED: '#2ecc71',
  CANCELLED: '#e74c3c',
};

function formatOrderDate(dateStr?: string | number | null): string {
  if (!dateStr) return '';
  try {
    const raw = String(dateStr).trim();
    if (/^\d+$/.test(raw)) {
      const num = Number(raw);
      const d = new Date(num > 1e11 ? num : num * 1000);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
    }
    const isoLike = raw.replace(' UTC', 'Z').replace(' ', 'T');
    let d = new Date(isoLike);
    if (isNaN(d.getTime())) {
      d = new Date(raw);
    }
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString();
    }
  } catch {}
  return String(dateStr);
}

function OrderCard({ order, onPress }: OrderCardProps) {
  const items = (order as any)?.items ?? (order as any)?.orderItems ?? [];
  const itemCount = Array.isArray(items) && items.length > 0
    ? items.reduce((sum: number, item: any) => sum + (item?.quantity ?? 1), 0)
    : 0;
  const statusColor = STATUS_COLORS[order?.status] ?? '#999';
  const price = typeof order?.totalPrice === 'number'
    ? order.totalPrice.toFixed(2)
    : (parseFloat(String(order?.totalPrice ?? 0)) || 0).toFixed(2);
  const dateStr = formatOrderDate(order?.createdAt);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.headerRow}>
        <Text style={styles.orderNumber}>#{order?.orderNumber ?? order?.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{order?.status ?? 'PENDING'}</Text>
        </View>
      </View>
      {dateStr ? <Text style={styles.date}>{dateStr}</Text> : null}
      {itemCount > 0 ? (
        <Text style={styles.items}>{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
      ) : null}
      <Text style={styles.total}>${price}</Text>
    </TouchableOpacity>
  );
}

export default React.memo(OrderCard);

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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNumber: { fontSize: 15, fontWeight: 'bold' },
  statusBadge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  date: { fontSize: 12, color: '#888', marginTop: 4 },
  items: { fontSize: 13, color: '#555', marginTop: 4 },
  total: { fontSize: 16, fontWeight: 'bold', color: '#2ecc71', marginTop: 6 },
});