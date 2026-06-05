import { z } from 'zod';

/** Operator roles, carried on the Supabase JWT `app_metadata.role` claim (§17.3). */
export const OperatorRole = z.enum(['admin', 'editor']);
export type OperatorRole = z.infer<typeof OperatorRole>;

/**
 * Operator — an authenticated console user (§16, §17). Identity lives in Supabase
 * Auth (`auth.users`); this is the typed domain view. An optional `operators` table
 * may mirror the non-secret display fields.
 */
export const OperatorSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  role: OperatorRole,
  displayName: z.string().optional(),
});

export type Operator = z.infer<typeof OperatorSchema>;
