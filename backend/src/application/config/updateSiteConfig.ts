import type { SiteConfigRepository, SiteConfig, AuditLogRepository } from '../../domain';
import { writeAuditLogHelper, buildDiff } from '../audit/writeAuditLog';
import { revalidatePath } from '../revalidate';
import { ValidationError } from '../errors';
import { SiteConfigSchema } from '@mw/types';

export type UpdateSiteConfig = (
  actor: { uid: string; email: string },
  config: SiteConfig
) => Promise<SiteConfig>;

export function makeUpdateSiteConfig(
  siteConfig: SiteConfigRepository,
  auditLogs: AuditLogRepository
): UpdateSiteConfig {
  return async (actor, config) => {
    const parsed = SiteConfigSchema.safeParse(config);
    if (!parsed.success) {
      throw new ValidationError('Invalid site config data', parsed.error.flatten().fieldErrors);
    }

    const existing = await siteConfig.get();
    
    const inputConfig = {
      ...parsed.data,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.uid,
    };
    
    const updated = await siteConfig.upsert(inputConfig);

    const diff = buildDiff(existing as any, updated as any);
    await writeAuditLogHelper(auditLogs, {
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: existing ? 'update' : 'create',
      entity: 'site_config',
      entityId: updated.id,
      diff,
    });

    // Revalidate affected routes
    await revalidatePath('/');
    await revalidatePath('/store');
    await revalidatePath('/wisdom');

    return updated;
  };
}
