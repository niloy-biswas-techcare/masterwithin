import type { StartHereConfig } from '../entities';

/**
 * StartHereRepository port (§9, §16). The four guided-entry paths, kept data-driven
 * so they update as new articles match — no hardcoded lists in JSX (§7.4, §17.5).
 */
export interface StartHereRepository {
  /** Read the ordered Start-Here paths (empty array before seeding). */
  get(): Promise<StartHereConfig>;
  /** Replace the whole Start-Here configuration. */
  upsert(config: StartHereConfig): Promise<StartHereConfig>;
}
