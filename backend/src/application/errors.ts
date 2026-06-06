/**
 * Application-layer errors (§18, §20).
 *
 * Use-cases throw these typed errors at their boundaries; adapters and the calling
 * server actions/route handlers map them to HTTP status / `ActionResult` shapes.
 * They carry no framework dependency.
 */

/** Input failed Zod validation at a use-case boundary (§3, §18). */
export class ValidationError extends Error {
  readonly code = 'validation' as const;
  /** Field-keyed messages from `ZodError.flatten().fieldErrors`, when available. */
  readonly fieldErrors?: Record<string, string[] | undefined>;
  constructor(message: string, fieldErrors?: Record<string, string[] | undefined>) {
    super(message);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

/** A required entity was not found. */
export class NotFoundError extends Error {
  readonly code = 'not_found' as const;
  constructor(entity: string, id?: string) {
    super(id ? `${entity} not found: ${id}` : `${entity} not found`);
    this.name = 'NotFoundError';
  }
}

/** No valid operator session (authentication failed, §17.3). */
export class UnauthorizedError extends Error {
  readonly code = 'unauthorized' as const;
  constructor(message = 'Operator session required') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/** A valid operator lacks the required role (authorization failed, §17.3). */
export class ForbiddenError extends Error {
  readonly code = 'forbidden' as const;
  constructor(message = 'Insufficient role for this action') {
    super(message);
    this.name = 'ForbiddenError';
  }
}
