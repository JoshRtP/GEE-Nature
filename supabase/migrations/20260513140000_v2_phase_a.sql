-- Phase A additions: JRC surface water columns + metric_timeseries table
-- Run in Supabase Studio → SQL Editor, or via: npx supabase db push

-- New per-field columns on spatial_units
ALTER TABLE spatial_units
  ADD COLUMN IF NOT EXISTS surface_water_occurrence_1km  numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vegetated_area_ha             numeric NOT NULL DEFAULT 0;

-- New project-level time series table
CREATE TABLE IF NOT EXISTS metric_timeseries (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  unit_id       text        DEFAULT NULL,          -- NULL = project aggregate
  metric_name   text        NOT NULL,              -- 'ndvi' | 'ndmi'
  period_month  date        NOT NULL,              -- first day of month
  value         numeric     NOT NULL,
  period_type   text        NOT NULL DEFAULT 'monthly',
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE metric_timeseries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read timeseries"
  ON metric_timeseries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anon can insert timeseries"
  ON metric_timeseries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anon can update timeseries"
  ON metric_timeseries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete timeseries"
  ON metric_timeseries FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_timeseries_project
  ON metric_timeseries(project_id);
CREATE INDEX IF NOT EXISTS idx_timeseries_metric
  ON metric_timeseries(project_id, metric_name);
CREATE INDEX IF NOT EXISTS idx_timeseries_period
  ON metric_timeseries(project_id, metric_name, period_month);
