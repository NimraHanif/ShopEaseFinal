import authReducer, { authSuccess, authFailed, logout, updateUser } from '../authSlice';

const sampleUser = { id: '1', name: 'Test User', email: 'test@example.com' };

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isInitializing: true,
  };

  it('sets authenticated state on authSuccess', () => {
    const state = authReducer(initialState, authSuccess({ user: sampleUser, token: 'abc123' }));
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(sampleUser);
    expect(state.token).toBe('abc123');
    expect(state.isInitializing).toBe(false);
  });

  it('clears state on authFailed', () => {
    const loggedInState = { user: sampleUser, token: 'abc123', isAuthenticated: true, isInitializing: false };
    const state = authReducer(loggedInState, authFailed());
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('clears state on logout, same as authFailed', () => {
    const loggedInState = { user: sampleUser, token: 'abc123', isAuthenticated: true, isInitializing: false };
    const state = authReducer(loggedInState, logout());
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('merges partial updates via updateUser', () => {
    const loggedInState = { user: sampleUser, token: 'abc123', isAuthenticated: true, isInitializing: false };
    const state = authReducer(loggedInState, updateUser({ name: 'Updated Name' }));
    expect(state.user?.name).toBe('Updated Name');
    expect(state.user?.email).toBe(sampleUser.email); // unchanged fields preserved
  });
});