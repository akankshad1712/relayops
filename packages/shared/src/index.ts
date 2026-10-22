export const INCIDENT_SEVERITIES = ["SEV1", "SEV2", "SEV3", "SEV4"] as const;
export const INCIDENT_STATUSES = ["INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"] as const;
export type IncidentSeverity = typeof INCIDENT_SEVERITIES[number];
export type IncidentStatus = typeof INCIDENT_STATUSES[number];

export interface IncidentSummary {
  id: string;
  title: string;
  serviceName: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdAt: string;
  ownerName: string;
}
export interface ApiError { error: { code: string; message: string; requestId?: string } }
