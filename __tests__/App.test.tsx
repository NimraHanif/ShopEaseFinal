/**
 * @format
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

describe('App', () => {
  it('renders the Splash screen on initial mount', async () => {
    const { findByTestId } = await render(<App />);
    expect(await findByTestId('splash-screen')).toBeTruthy();
  });
});
