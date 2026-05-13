"""
apply_v2_schema.py
==================
Adds Phase A columns to spatial_units and creates metric_timeseries table.

Usage:
    python scripts/apply_v2_schema.py
"""
import os, sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.environ["VITE_SUPABASE_URL"]
key = os.environ["VITE_SUPABASE_ANON_KEY"]
sb  = create_client(url, key)

# We need a service-role key to run DDL via the REST API (anon can't ALTER TABLE).
# Check if we have it; fall back to printing the SQL if not.
service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

if not service_key:
    print("SUPABASE_SERVICE_ROLE_KEY not found in .env — printing SQL to run manually in Supabase Studio:\n")
    print("""
-- Run this in Supabase Studio → SQL Editor

-- Phase A new columns on spatial_units
ALTER TABLE spatial_units
  ADD COLUMN IF NOT EXISTS surface_water_occurrence_1km  numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS surface_water_occurrence_5km  numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS permanent_water_1km_ha        numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS distance_to_water_m           numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ndvi_integral_baseline        numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ndvi_integral_monitoring      numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS patch_count                   integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS core_habitat_ha               numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS edge_density                  numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mean_patch_size_ha            numeric NOT NULL DEFAULT 0;

-- New metric_timeseries table
CREATE TABLE IF NOT EXISTS metric_timeseries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  unit_id       text DEFAULT NULL,
  metric_name   text NOT NULL,
  period_month  date NOT NULL,
  value         numeric NOT NULL,
  period_type   text NOT NULL DEFAULT 'monthly',
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE metric_timeseries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read timeseries"  ON metric_timeseries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anon can insert timeseries" ON metric_timeseries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anon can update timeseries" ON metric_timeseries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete timeseries" ON metric_timeseries FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_timeseries_project ON metric_timeseries(project_id);
CREATE INDEX IF NOT EXISTS idx_timeseries_metric  ON metric_timeseries(project_id, metric_name);
""")
    sys.exit(0)

# With service role key we can call the pg REST API
from supabase import create_client as create_admin_client
admin = create_admin_client(url, service_key)
print("Applying schema migration …")
try:
    admin.rpc("exec_sql", {"sql": """
        ALTER TABLE spatial_units
          ADD COLUMN IF NOT EXISTS surface_water_occurrence_1km  numeric NOT NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS surface_water_occurrence_5km  numeric NOT NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS permanent_water_1km_ha        numeric NOT NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS distance_to_water_m           numeric NOT NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS ndvi_integral_baseline        numeric NOT NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS ndvi_integral_monitoring      numeric NOT NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS patch_count                   integer NOT NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS core_habitat_ha               numeric NOT NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS edge_density                  numeric NOT NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS mean_patch_size_ha            numeric NOT NULL DEFAULT 0;
    """}).execute()
    print("  Added new columns to spatial_units")
except Exception as e:
    print(f"  ERROR: {e}")

print("Done — run the SQL manually in Supabase Studio if needed.")
