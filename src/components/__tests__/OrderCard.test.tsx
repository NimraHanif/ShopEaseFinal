import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OrderCard from '../OrderCard';
import { Order } from '../../types';

const sampleOrder: Order = {
    id: '1',
    orderNumber: 'ORD-1001',
    status: 'DELIVERED',
    subtotal: 100,
    totalPrice: 110,
    createdAt: '2026-01-01T00:00:00Z',
    items: [
        { id: 'i1', productId: 'p1', productNameAtPurchase: 'Item A', priceAtPurchase: 50, price: 50, quantity: 2 },
    ],
    deliveryAddressSnapshot: {} as any,
};

describe('OrderCard', () => {
    it('renders order number, status, and total', async () => {
        const { getByText } = await render(<OrderCard order={sampleOrder} onPress={jest.fn()} />);
        expect(getByText('#ORD-1001')).toBeTruthy();
        expect(getByText('DELIVERED')).toBeTruthy();
        expect(getByText('$110.00')).toBeTruthy();
    });

    it('calculates total item count from all order items', async () => {
        const { getByText } = await render(<OrderCard order={sampleOrder} onPress={jest.fn()} />);
        expect(getByText('2 items')).toBeTruthy();
    });

    it('calls onPress when tapped', async () => {
        const onPress = jest.fn();
        const { getByText } = await render(<OrderCard order={sampleOrder} onPress={onPress} />);
        fireEvent.press(getByText('#ORD-1001'));
        expect(onPress).toHaveBeenCalledTimes(1);
    });
});