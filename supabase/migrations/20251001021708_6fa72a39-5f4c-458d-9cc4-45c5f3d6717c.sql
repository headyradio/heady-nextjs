-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant permissions to use pg_cron
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule the record-stream function to run every hour at minute 0
SELECT cron.schedule(
  'record-stream-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url:='https://xpqwujjglvhadlgxotcv.supabase.co/functions/v1/record-stream',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwcXd1ampnbHZoYWRsZ3hvdGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDQ1OTgsImV4cCI6MjA3NDc4MDU5OH0.MCiLDMiTqXXzHuJ1B9s-yd1gCjrZHlV33H4oMg6wP-s"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Schedule the update-playlist function to run every hour at minute 5 (after recording starts)
SELECT cron.schedule(
  'update-playlist-hourly',
  '5 * * * *',
  $$
  SELECT net.http_post(
    url:='https://xpqwujjglvhadlgxotcv.supabase.co/functions/v1/update-playlist',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwcXd1ampnbHZoYWRsZ3hvdGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDQ1OTgsImV4cCI6MjA3NDc4MDU5OH0.MCiLDMiTqXXzHuJ1B9s-yd1gCjrZHlV33H4oMg6wP-s"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Schedule the cleanup-archives function to run daily at 3 AM
SELECT cron.schedule(
  'cleanup-archives-daily',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url:='https://xpqwujjglvhadlgxotcv.supabase.co/functions/v1/cleanup-archives',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwcXd1ampnbHZoYWRsZ3hvdGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDQ1OTgsImV4cCI6MjA3NDc4MDU5OH0.MCiLDMiTqXXzHuJ1B9s-yd1gCjrZHlV33H4oMg6wP-s"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);