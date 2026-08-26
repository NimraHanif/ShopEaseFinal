import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import QuantitySelector from '../QuantitySelector';

describe('QuantitySelector', () => {
    it('displays the current quantity', async () => {
        const { getByText } = await render(
            <QuantitySelector quantity={3} maxStock={10} onIncrease={jest.fn()} onDecrease={jest.fn()} />
        );
        expect(getByText('3')).toBeTruthy();
    });

    it('calls onIncrease when the + button is pressed', async () => {
        const onIncrease = jest.fn();
        const { getByText } = await render(
            <QuantitySelector quantity={1} maxStock={10} onIncrease={onIncrease} onDecrease={jest.fn()} />
        );
        fireEvent.press(getByText('+'));
        expect(onIncrease).toHaveBeenCalledTimes(1);
    });

    it('calls onDecrease when the − button is pressed', async () => {
        const onDecrease = jest.fn();
        const { getByText } = await render(
            <QuantitySelector quantity={2} maxStock={10} onIncrease={jest.fn()} onDecrease={onDecrease} />
        );
        fireEvent.press(getByText('−'));
        expect(onDecrease).toHaveBeenCalledTimes(1);
    });

    it('disables the decrease button at quantity 1', async () => {
        const onDecrease = jest.fn();
        const { getByText } = await render(
            <QuantitySelector quantity={1} maxStock={10} onIncrease={jest.fn()} onDecrease={onDecrease} />
        );
        fireEvent.press(getByText('−'));
        expect(onDecrease).not.toHaveBeenCalled();
    });

    it('disables the increase button at max stock', async () => {
        const onIncrease = jest.fn();
        const { getByText } = await render(
            <QuantitySelector quantity={5} maxStock={5} onIncrease={onIncrease} onDecrease={jest.fn()} />
        );
        fireEvent.press(getByText('+'));
        expect(onIncrease).not.toHaveBeenCalled();
    });
});