export type EcosystemType =
  | 'cropland'
  | 'grassland'
  | 'forest'
  | 'agroforestry'
  | 'wetland'
  | 'mixed';

export type Alignment = 'CCB' | 'SD_VISta' | 'Nature_Framework' | 'Corporate';

export type ProjectStatus =
  | 'draft'
  | 'processing'
  | 'processed'
  | 'reviewed'
  | 'exported';

export type WaterRiskClass =
  | 'low'
  | 'low-medium'
  | 'medium-high'
  | 'high'
  | 'extreme'
  | 'unknown';

export interface Project {
  id: string;
  name: string;
  country: string;
  ecosystem_type: EcosystemType;
  alignment: Alignment[];
  baseline_start: string | null;
  baseline_end: string | null;
  monitoring_start: string | null;
  monitoring_end: string | null;
  status: ProjectStatus;
  area_ha: number;
  habitat_area_ha: number;
  habitat_condition_score: number;
  connectivity_score: number;
  water_risk_class: WaterRiskClass;
  drought_resilience_score: number;
  livelihood_support_evidence_score: number;
  overall_cobenefit_score: number;
  qa_warning_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface SpatialUnit {
  id?: string;
  project_id: string;
  unit_id: string;
  area_ha: number;
  habitat_area_ha: number;
  habitat_change_ha: number;
  baseline_condition_score: number;
  monitoring_condition_score: number;
  condition_change: number;
  connectivity_score: number;
  water_risk_class: WaterRiskClass;
  wri_baseline_water_stress: number;
  terraclimate_deficit_mean: number;
  spei3_min: number;
  vegetation_drought_resilience_score: number;
  erosion_pressure_proxy: number;
  livelihood_support_evidence_score: number;
  overall_cobenefit_score: number;
  qa_status: 'pass' | 'warning' | 'fail';
  qa_warning_count: number;
  // Phase A additions (added by migration 20260513140000_v2_phase_a.sql)
  vegetated_area_ha?: number;
  surface_water_occurrence_1km?: number;
}

export interface MetricTimeseries {
  id?: string;
  project_id: string;
  unit_id: string | null;
  metric_name: string;
  period_month: string;
  value: number;
  period_type: string;
}

export interface MetricResult {
  metric_id: string;
  project_id: string;
  unit_id: string;
  metric_name: string;
  metric_value: number | string | boolean | null;
  metric_units: string;
  period: 'baseline' | 'monitoring' | 'change' | 'reference';
  qa_status: 'pass' | 'warning' | 'fail';
}

export type QAIssueType =
  | 'geometry'
  | 'imagery'
  | 'dataset'
  | 'metric'
  | 'report'
  | 'claim_language'
  | 'user_input';

export interface QAIssue {
  id?: string;
  project_id: string;
  unit_id?: string | null;
  issue_type: QAIssueType;
  severity: 'info' | 'warning' | 'fail';
  message: string;
  recommended_action: string;
  resolved: boolean;
}

export interface CommunityIndicator {
  id?: string;
  project_id: string;
  participating_households: number;
  participating_farms: number;
  hectares_enrolled: number;
  payments_to_participants: number;
  jobs_created: number;
  training_events: number;
  participants_trained: number;
  grievances_received: number;
  grievances_resolved: number;
  stakeholder_consultation_events: number;
  benefit_sharing_description: string;
  negative_impact_mitigation: string;
}

export interface ReportExport {
  format: 'csv' | 'geojson' | 'pdf' | 'methods' | 'qa_report' | 'crosswalk';
  title: string;
  description: string;
}
