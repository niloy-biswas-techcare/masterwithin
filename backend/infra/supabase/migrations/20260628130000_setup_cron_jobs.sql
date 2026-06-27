-- ---------------------------------------------------------------------------
-- Cron jobs for Edge Function triggers (§8c, §21.4)
-- pg_cron and pg_net are enabled by default on all Supabase projects.
-- ---------------------------------------------------------------------------

-- Enable extensions (no-op if already enabled)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Remove existing jobs if re-running this migration
select cron.unschedule('sync-youtube-daily') where exists (
  select 1 from cron.job where jobname = 'sync-youtube-daily'
);
select cron.unschedule('sync-substack-daily') where exists (
  select 1 from cron.job where jobname = 'sync-substack-daily'
);

-- YouTube sync — daily at 00:00 UTC
select cron.schedule(
  'sync-youtube-daily',
  '0 0 * * *',
  $$
  select net.http_post(
    url     := 'https://yhtqfmqlzijaqglvwfab.supabase.co/functions/v1/sync-youtube',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer On1N61vULGiRj7TfTauqtws9MBr+SGtzbbmcaHbxlp0="}'::jsonb,
    body    := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
  $$
);

-- Substack sync — daily at 01:00 UTC (staggered after YouTube sync)
select cron.schedule(
  'sync-substack-daily',
  '0 1 * * *',
  $$
  select net.http_post(
    url     := 'https://yhtqfmqlzijaqglvwfab.supabase.co/functions/v1/sync-substack',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer On1N61vULGiRj7TfTauqtws9MBr+SGtzbbmcaHbxlp0="}'::jsonb,
    body    := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
  $$
);

-- Confirm
select jobname, schedule, active from cron.job
where jobname in ('sync-youtube-daily', 'sync-substack-daily');
