import type { SiteConfigRepository, SiteConfig } from '../../domain';

export type GetSiteConfig = () => Promise<SiteConfig | null>;

export function makeGetSiteConfig(siteConfig: SiteConfigRepository): GetSiteConfig {
  return async () => {
    return siteConfig.get();
  };
}
