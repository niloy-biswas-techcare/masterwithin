import type { SiteConfig } from '../entities';

/**
 * SiteConfigRepository port (§9, §16). The singleton `site_config` row
 * (`id: 'main'`) — WhatsApp number, socials, YouTube, featured selections (§17.9).
 */
export interface SiteConfigRepository {
  /** Read the singleton config, or null before it has been seeded. */
  get(): Promise<SiteConfig | null>;
  /** Create or replace the singleton config row. */
  upsert(config: SiteConfig): Promise<SiteConfig>;
}
