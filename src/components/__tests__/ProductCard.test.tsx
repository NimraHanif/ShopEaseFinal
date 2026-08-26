import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProductCard from '../ProductCard';
import { Product } from '../../types';

const inStockProduct: Product = {
    id: '1',
    name: 'Test Sneakers',
    description: 'Comfy shoes',
    price: 49.99,
    stock: 10,
    active: true,
    photoUrl: null,
    category: { id: 'c1', name: 'Shoes', slug: 'shoes' },
};

describe('ProductCard', () => {
    it('renders product name and price', async () => {
        const { getByText } = await render(<ProductCard product={inStockProduct} onPress={jest.fn()} />);
        expect(getByText('Test Sneakers')).toBeTruthy();
        expect(getByText('$49.99')).toBeTruthy();
    });

    it('calls onPress when tapped, if in stock', async () => {
        const onPress = jest.fn();
        const { getByText } = await render(<ProductCard product={inStockProduct} onPress={onPress} />);
        fireEvent.press(getByText('Test Sneakers'));
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('shows "Out of Stock" and disables press when stock is 0', async () => {
        const outOfStock = { ...inStockProduct, stock: 0 };
        const onPress = jest.fn();
        const { getByText } = await render(<ProductCard product={outOfStock} onPress={onPress} />);
        expect(getByText('Out of Stock')).toBeTruthy();
        fireEvent.press(getByText('Test Sneakers'));
        expect(onPress).not.toHaveBeenCalled();
    });
});