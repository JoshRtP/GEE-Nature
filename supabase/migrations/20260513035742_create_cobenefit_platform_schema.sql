/*
  # Co-Benefit Monitoring Platform Schema

  1. New Tables
    - `projects` - sustainability projects with name, country, ecosystem type, alignment, periods, status
    - `spatial_units` - mock spatial-unit metric records linked to projects
    - `qa_issues` - QA/QC issues per project (severity, type, message, recommended action, resolved)
    - `community_indicators` - project-entered livelihood and community records
  2. Security
    - Enable RLS on all tables
    - For MVP without auth, allow anonymous read/write (will be tightened when auth is added)
  3. Notes
    - Schema mirrors the design doc data model. Anonymous policies are intentional placeholders pending auth.
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  ecosystem_type text NOT NULL DEFAULT 'mixed',
  alignment text[] NOT NULL DEFAULT '{}',
  baseline_start date,
  baseline_end date,
  monitoring_start date,
  monitoring_end date,
  status text NOT NULL DEFAULT 'draft',
  area_ha numeric NOT NULL DEFAULT 0,
  habitat_area_ha numeric NOT NULL DEFAULT 0,
  habitat_condition_score numeric NOT NULL DEFAULT 0,
  connectivity_score numeric NOT NULL DEFAULT 0,
  water_risk_class text NOT NULL DEFAULT 'unknown',
  drought_resilience_score numeric NOT NULL DEFAULT 0,
  livelihood_support_evidence_score numeric NOT NULL DEFAULT 0,
  overall_cobenefit_score numeric NOT NULL DEFAULT 0,
  qa_warning_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS spatial_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  unit_id text NOT NULL DEFAULT '',
  area_ha numeric NOT NULL DEFAULT 0,
  habitat_area_ha numeric NOT NULL DEFAULT 0,
  habitat_change_ha numeric NOT NULL DEFAULT 0,
  baseline_condition_score numeric NOT NULL DEFAULT 0,
  monitoring_condition_score numeric NOT NULL DEFAULT 0,
  condition_change numeric NOT NULL DEFAULT 0,
  connectivity_score numeric NOT NULL DEFAULT 0,
  water_risk_class text NOT NULL DEFAULT 'unknown',
  wri_baseline_water_stress numeric NOT NULL DEFAULT 0,
  terraclimate_deficit_mean numeric NOT NULL DEFAULT 0,
  spei3_min numeric NOT NULL DEFAULT 0,
  vegetation_drought_resilience_score numeric NOT NULL DEFAULT 0,
  erosion_pressure_proxy numeric NOT NULL DEFAULT 0,
  livelihood_support_evidence_score numeric NOT NULL DEFAULT 0,
  overall_cobenefit_score numeric NOT NULL DEFAULT 0,
  qa_status text NOT NULL DEFAULT 'pass',
  qa_warning_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS qa_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  unit_id text DEFAULT '',
  issue_type text NOT NULL DEFAULT 'metric',
  severity text NOT NULL DEFAULT 'warning',
  message text NOT NULL DEFAULT '',
  recommended_action text NOT NULL DEFAULT '',
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  participating_households integer NOT NULL DEFAULT 0,
  participating_farms integer NOT NULL DEFAULT 0,
  hectares_enrolled numeric NOT NULL DEFAULT 0,
  payments_to_participants numeric NOT NULL DEFAULT 0,
  jobs_created integer NOT NULL DEFAULT 0,
  training_events integer NOT NULL DEFAULT 0,
  participants_trained integer NOT NULL DEFAULT 0,
  grievances_received integer NOT NULL DEFAULT 0,
  grievances_resolved integer NOT NULL DEFAULT 0,
  stakeholder_consultation_events integer NOT NULL DEFAULT 0,
  benefit_sharing_description text NOT NULL DEFAULT '',
  negative_impact_mitigation text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE spatial_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read projects" ON projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anon can insert projects" ON projects FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anon can update projects" ON projects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete projects" ON projects FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Anon can read spatial_units" ON spatial_units FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anon can insert spatial_units" ON spatial_units FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anon can update spatial_units" ON spatial_units FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete spatial_units" ON spatial_units FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Anon can read qa_issues" ON qa_issues FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anon can insert qa_issues" ON qa_issues FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anon can update qa_issues" ON qa_issues FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete qa_issues" ON qa_issues FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Anon can read community_indicators" ON community_indicators FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anon can insert community_indicators" ON community_indicators FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anon can update community_indicators" ON community_indicators FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete community_indicators" ON community_indicators FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_spatial_units_project ON spatial_units(project_id);
CREATE INDEX IF NOT EXISTS idx_qa_issues_project ON qa_issues(project_id);
CREATE INDEX IF NOT EXISTS idx_community_indicators_project ON community_indicators(project_id);
