import { z } from 'zod';

/**
 * Start Here — the four guided-entry paths (§7.4, §17.5).
 *
 * Curation is data-driven: each path references article tags and/or a target
 * category stored in the `start_here` backend config, so the curated set updates
 * as new articles match — there are no hardcoded article lists in JSX.
 */
export const StartHerePathSchema = z.object({
  /** Stable id for ordering/keys (e.g. 'feeling-lost'). */
  id: z.string(),
  title: z.string(),
  /** Short framing sentence shown on the card. */
  blurb: z.string(),
  /** Article tags this path surfaces (free-form, normalized). */
  targetTags: z.array(z.string()).default([]),
  /** Optional category slug this path points into. */
  targetCategory: z.string().optional(),
  /** The single "go deeper" call to action. */
  deeperCtaLabel: z.string(),
  deeperCtaHref: z.string(),
});

export type StartHerePath = z.infer<typeof StartHerePathSchema>;

/** The Start Here config is exactly four ordered paths (§7.4). */
export const StartHereConfigSchema = z.array(StartHerePathSchema);

export type StartHereConfig = z.infer<typeof StartHereConfigSchema>;
