import React from 'react';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { MockedProvider } from '@apollo/client/testing/react';
import { configureStore } from '@reduxjs/toolkit';
import LoginScreen from '../LoginScreen';
import authReducer from '../../../redux/slices/authSlice';

function renderLoginScreen(mocks: any[] = []) {
  const store = configureStore({ reducer: { auth: authReducer } });
  return render(
    <Provider store={store}>
      <MockedProvider mocks={mocks}>
        <LoginScreen navigation={{ navigate: jest.fn() } as any} />
      </MockedProvider>
    </Provider>
  );
}

describe('LoginScreen validation', () => {
  it('shows an error when submitting with an empty email', async () => {
    const user = userEvent.setup();
    await renderLoginScreen();

    await user.type(screen.getByPlaceholderText('Password'), 'somepassword');
    await user.press(screen.getByText('Log In'));

    expect(await screen.findByText('Email is required')).toBeTruthy();
  });

  it('shows an error for an invalid email format', async () => {
    const user = userEvent.setup();
    await renderLoginScreen();

    await user.type(screen.getByPlaceholderText('Email'), 'not-an-email');
    await user.type(screen.getByPlaceholderText('Password'), 'somepassword');
    await user.press(screen.getByText('Log In'));

    expect(await screen.findByText('Enter a valid email')).toBeTruthy();
  });

  it('shows an error when password is empty', async () => {
    const user = userEvent.setup();
    await renderLoginScreen();

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.press(screen.getByText('Log In'));

    expect(await screen.findByText('Password is required')).toBeTruthy();
  });
});