export interface Claim {
  id: string;
  name: string;
  status: 'processing' | 'ready' | 'error';
  lastUpdated: Date;
  createdAt: Date;
  fileCount: number;
  totalBilled?: number;
  accidentDate?: string;
}

export interface MedicalEvent {
  id: string;
  date: string;
  provider: string;
  specialty: string;
  eventType: string;
  description: string;
  sourceDocument: string;
  sourcePageRef: string;
  // Optional detailed fields for expanded view
  patientName?: string;
  doctorName?: string;
  medicalFacility?: string;
  medicationType?: string;
  labels?: string[];
  narrativeSummary?: string;
  patientComplaints?: string[];
  medicalSpecialties?: string[];
  medicalFacilities?: string[];
  procedureTypes?: string[];
  vitals?: Record<string, string>;
  diagnostics?: string[];
  interventions?: string[];
  isKeyDate?: boolean;
  needsReview?: boolean;
  fileIds?: string[];
}

export interface Contradiction {
  id: string;
  type: 'diagnosis' | 'notes_vs_procedures' | 'narrative_vs_records';
  description: string;
  sources: string[];
  severity: 'high' | 'medium' | 'low';
}

export interface MissingFlag {
  id: string;
  type: 'missing_conservative_care' | 'missing_objective_findings' | 'documentation_gap' | 'silence_as_signal';
  description: string;
  significance: string;
}

export interface BillItem {
  id: string;
  date: string;
  provider: string;
  description: string;
  amount: number;
  category: string;
  isAccidentRelated: boolean;
  hasMatchingTreatment: boolean;
  isDuplicate: boolean;
  riskScore: 'high' | 'medium' | 'low';
  documentLink?: string;
  hcpcsCode?: string;
  hcpcsDescription?: string;
  ndcUpcCode?: string;
  ndcUpcDescription?: string;
  treatmentType?: string;
  justification?: string;
  fileId?: string;
  fileLink?: string;
}

export interface ReportSection {
  id: string;
  title: string;
  order: number;
}
