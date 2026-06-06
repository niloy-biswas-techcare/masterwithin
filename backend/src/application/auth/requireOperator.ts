import type { AuthGateway, Operator, OperatorRole } from '../../domain';
import { ForbiddenError, UnauthorizedError } from '../errors';

/**
 * Role hierarchy (§17.3): `admin` is a superset of `editor`. An action requiring
 * `editor` accepts an `admin`; an action requiring `admin` rejects an `editor`.
 */
const ROLE_RANK: Record<OperatorRole, number> = { editor: 1, admin: 2 };

/** True if `held` satisfies a requirement for `required` (admin ⊇ editor). */
export function roleSatisfies(held: OperatorRole, required: OperatorRole): boolean {
  return ROLE_RANK[held] >= ROLE_RANK[required];
}

export type RequireOperator = (
  sessionToken: string | undefined | null,
  requiredRole?: OperatorRole,
) => Promise<Operator>;

/**
 * `requireOperator(role?)` — the real authorization boundary (§17.3) 🔒.
 *
 * Called as the **first statement** of every admin server action and loader: it
 * re-verifies the session cookie/token on every request and checks the role, so a
 * stale or revoked session is caught immediately. Throws `UnauthorizedError` when
 * there is no valid operator, `ForbiddenError` when the role is insufficient.
 */
export function makeRequireOperator(auth: AuthGateway): RequireOperator {
  return async (sessionToken, requiredRole) => {
    if (!sessionToken) throw new UnauthorizedError();

    const operator = await auth.verifySession(sessionToken);
    if (!operator) throw new UnauthorizedError();

    if (requiredRole && !roleSatisfies(operator.role, requiredRole)) {
      throw new ForbiddenError(
        `This action requires the '${requiredRole}' role.`,
      );
    }

    return operator;
  };
}
