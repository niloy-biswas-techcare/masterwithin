import { describe, it, expect } from 'vitest';
import { roleSatisfies, makeRequireOperator } from './requireOperator';
import { InMemoryAuthGateway } from '../../adapters/inmemory';
import { UnauthorizedError, ForbiddenError } from '../errors';
import type { Operator } from '../../domain';

const adminOp: Operator = {
  uid: 'op-admin',
  email: 'admin@test.com',
  role: 'admin',
  displayName: 'Admin',
};
const editorOp: Operator = {
  uid: 'op-editor',
  email: 'editor@test.com',
  role: 'editor',
  displayName: 'Editor',
};

describe('roleSatisfies', () => {
  it('editor satisfies editor requirement', () => {
    expect(roleSatisfies('editor', 'editor')).toBe(true);
  });

  it('admin satisfies editor requirement (superset)', () => {
    expect(roleSatisfies('admin', 'editor')).toBe(true);
  });

  it('admin satisfies admin requirement', () => {
    expect(roleSatisfies('admin', 'admin')).toBe(true);
  });

  it('editor does NOT satisfy admin requirement', () => {
    expect(roleSatisfies('editor', 'admin')).toBe(false);
  });
});

describe('requireOperator', () => {
  it('throws UnauthorizedError when token is null', async () => {
    const auth = new InMemoryAuthGateway([adminOp]);
    const requireOperator = makeRequireOperator(auth);
    await expect(requireOperator(null)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('throws UnauthorizedError when token is undefined', async () => {
    const auth = new InMemoryAuthGateway([adminOp]);
    const requireOperator = makeRequireOperator(auth);
    await expect(requireOperator(undefined)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('throws UnauthorizedError when token is invalid / session not found', async () => {
    const auth = new InMemoryAuthGateway([adminOp]);
    const requireOperator = makeRequireOperator(auth);
    await expect(requireOperator('bad-token')).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('returns the operator on a valid session with no role requirement', async () => {
    const auth = new InMemoryAuthGateway([adminOp]);
    const requireOperator = makeRequireOperator(auth);

    const session = await auth.signIn('admin@test.com', 'password123');
    const result = await requireOperator(session!.accessToken);
    expect(result.uid).toBe('op-admin');
    expect(result.role).toBe('admin');
  });

  it('returns the operator when held role satisfies the required role', async () => {
    const auth = new InMemoryAuthGateway([editorOp]);
    const requireOperator = makeRequireOperator(auth);

    const session = await auth.signIn('editor@test.com', 'password123');
    const op = await requireOperator(session!.accessToken, 'editor');
    expect(op.uid).toBe('op-editor');
  });

  it('throws ForbiddenError when editor tries to access admin-only action', async () => {
    const auth = new InMemoryAuthGateway([editorOp]);
    const requireOperator = makeRequireOperator(auth);

    const session = await auth.signIn('editor@test.com', 'password123');
    await expect(requireOperator(session!.accessToken, 'admin')).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('allows admin to access editor-level actions (superset)', async () => {
    const auth = new InMemoryAuthGateway([adminOp]);
    const requireOperator = makeRequireOperator(auth);

    const session = await auth.signIn('admin@test.com', 'password123');
    const op = await requireOperator(session!.accessToken, 'editor');
    expect(op.role).toBe('admin');
  });

  it('throws UnauthorizedError after session is revoked', async () => {
    const auth = new InMemoryAuthGateway([adminOp]);
    const requireOperator = makeRequireOperator(auth);

    const session = await auth.signIn('admin@test.com', 'password123');
    await auth.revoke('op-admin');

    await expect(requireOperator(session!.accessToken)).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
