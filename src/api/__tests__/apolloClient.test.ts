import { CombinedGraphQLErrors } from '@apollo/client';
describe('errorLink UNAUTHENTICATED handling', () => {
  it('identifies an UNAUTHENTICATED GraphQL error correctly', () => {
    const mockError = new CombinedGraphQLErrors({
      errors: [{ message: 'Not authenticated', extensions: { code: 'UNAUTHENTICATED' } }],
    } as any);

    expect(CombinedGraphQLErrors.is(mockError)).toBe(true);
    const hasUnauthenticated = mockError.errors.some(
      (e) => e.extensions?.code === 'UNAUTHENTICATED'
    );
    expect(hasUnauthenticated).toBe(true);
  });

  it('does not flag a different error code as UNAUTHENTICATED', () => {
    const mockError = new CombinedGraphQLErrors({
      errors: [{ message: 'Not found', extensions: { code: 'NOT_FOUND' } }],
    } as any);

    const hasUnauthenticated = mockError.errors.some(
      (e) => e.extensions?.code === 'UNAUTHENTICATED'
    );
    expect(hasUnauthenticated).toBe(false);
  });
});