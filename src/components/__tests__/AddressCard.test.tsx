import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AddressCard from '../AddressCard';
import { Address } from '../../types';

const sampleAddress: Address = {
    id: '1',
    label: 'Home',
    recipientName: 'Jane Doe',
    phoneNumber: '555-1234',
    address: '123 Main St',
    addressLine1: '123 Main St',
    addressLine2: null,
    city: 'Lahore',
    state: 'Punjab',
    postalCode: '54000',
    country: 'Pakistan',
    latitude: null,
    longitude: null,
    default: false,
    isDefault: false,
};

describe('AddressCard', () => {
    it('renders address details', async () => {
        const { getByText } = await render(
            <AddressCard address={sampleAddress} onEdit={jest.fn()} onDelete={jest.fn()} onSetDefault={jest.fn()} />
        );
        expect(getByText('Home')).toBeTruthy();
        expect(getByText('Jane Doe')).toBeTruthy();
    });

    it('shows the DEFAULT badge only when isDefault is true', async () => {
        const { queryByText, rerender } = await render(
            <AddressCard address={sampleAddress} onEdit={jest.fn()} onDelete={jest.fn()} onSetDefault={jest.fn()} />
        );
        expect(queryByText('DEFAULT')).toBeNull();


        await rerender(
            <AddressCard address={{ ...sampleAddress, isDefault: true, default: true }} onEdit={jest.fn()} onDelete={jest.fn()} onSetDefault={jest.fn()} />
        );
        expect(queryByText('DEFAULT')).toBeTruthy();
    });

    it('calls onEdit when Edit is pressed', async () => {
        const onEdit = jest.fn();
        const { getByText } = await render(
            <AddressCard address={sampleAddress} onEdit={onEdit} onDelete={jest.fn()} onSetDefault={jest.fn()} />
        );
        fireEvent.press(getByText('Edit'));
        expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('calls onDelete when Delete is pressed', async () => {
        const onDelete = jest.fn();
        const { getByText } = await render(
            <AddressCard address={sampleAddress} onEdit={jest.fn()} onDelete={onDelete} onSetDefault={jest.fn()} />
        );
        fireEvent.press(getByText('Delete'));
        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('does not show "Set as Default" for an already-default address', async () => {
        const { queryByText } = await render(
            <AddressCard address={{ ...sampleAddress, isDefault: true, default: true }} onEdit={jest.fn()} onDelete={jest.fn()} onSetDefault={jest.fn()} />
        );
        expect(queryByText('Set as Default')).toBeNull();
    });
});