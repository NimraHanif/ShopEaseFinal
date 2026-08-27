import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { MockedProvider } from '@apollo/client/testing/react';
import { configureStore } from '@reduxjs/toolkit';
import SignUpScreen from '../SignUpScreen';
import authReducer from '../../../redux/slices/authSlice';

const store = configureStore({ reducer: { auth: authReducer } });

async function renderSignUpScreen() {
    return render(
        <Provider store={store}>
            <MockedProvider mocks={[]}>
                <SignUpScreen navigation={{ navigate: jest.fn() }} />
            </MockedProvider>
        </Provider>
    );
}

describe('SignUpScreen validation', () => {
    jest.setTimeout(15000);

    it('requires full name, email, and password', async () => {
        const { getByRole, getByText } = await renderSignUpScreen();

        // getByRole disambiguates the BUTTON specifically, not the heading text
        await fireEvent.press(getByRole('button', { name: 'Sign Up' }));

        await waitFor(() => {
            expect(getByText('Full name is required')).toBeTruthy();
            expect(getByText('Email is required')).toBeTruthy();
            expect(getByText('Password is required')).toBeTruthy();
        });
    });

    it('enforces minimum password length', async () => {
        const { getByRole, getByText, getByPlaceholderText } = await renderSignUpScreen();

        await fireEvent.changeText(getByPlaceholderText('Full Name'), 'Jane Doe');
        await fireEvent.changeText(getByPlaceholderText('Email'), 'jane@example.com');
        await fireEvent.changeText(getByPlaceholderText('Password'), 'short');
        await fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'short');
        await fireEvent.press(getByRole('button', { name: 'Sign Up' }));

        await waitFor(() => {
            expect(getByText('Password must be at least 8 characters')).toBeTruthy();
        });
    });

    it('requires matching passwords', async () => {
        const { getByRole, getByText, getByPlaceholderText } = await renderSignUpScreen();

        await fireEvent.changeText(getByPlaceholderText('Full Name'), 'Jane Doe');
        await fireEvent.changeText(getByPlaceholderText('Email'), 'jane@example.com');
        await fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        await fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'different123');
        await fireEvent.press(getByRole('button', { name: 'Sign Up' }));

        await waitFor(() => {
            expect(getByText('Passwords must match')).toBeTruthy();
        });
    });
});