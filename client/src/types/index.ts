export type UserRole = 'ENTREPRENEUR' | 'DEPARTMENT_OFFICER' | 'SENIOR_OFFICER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string | null;
  role: UserRole;
  designation?: string | null;
  departmentCode?: string | null;
}

export interface Company {
  id: string;
  userId: string;
  name: string;
  cin?: string | null;
  pan?: string | null;
  gstin?: string | null;
  udyam?: string | null;
  companyType: string;
  dateOfIncorporation?: string | null;
  registeredAddress?: string | null;
  district?: string | null;
  taluka?: string | null;
  industrialArea?: string | null;
  directors?: string | null;
  employeeCount: number;
  annualTurnover: number;
  businessSector?: string | null;
  verificationStatus: 'VERIFIED' | 'NEEDS_REVIEW' | 'NOT_VERIFIED';
}

export interface Project {
  id: string;
  companyId: string;
  name: string;
  projectType: string;
  sector: string;
  state: string;
  district: string;
  taluka?: string | null;
  industrialArea?: string | null;
  midcPlot?: string | null;
  landCost: number;
  buildingCost: number;
  machineryCost: number;
  otherCost: number;
  totalInvestment: number;
  productionType?: string | null;
  productionCapacity?: string | null;
  employeeCount: number;
  waterReq: number;
  powerReq: number;
  waterConsumption: number;
  wastewater: number;
  airEmissions?: string | null;
  hazardousMaterials: boolean;
  solidWaste: number;
  hazardousWaste: boolean;
  buildingRequired: boolean;
  factoryRequired: boolean;
  fireRisk: string;
  buildingArea: number;
  status: string;
  healthScore: number;
  createdAt: string;
  company?: Company;
  documents?: DocumentItem[];
  applications?: Application[];
  compliances?: ComplianceItem[];
  renewals?: RenewalItem[];
}

export interface DocumentIssue {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  title: string;
  description: string;
  field?: string;
  suggestedAction: string;
}

export interface DocumentItem {
  id: string;
  companyId: string;
  projectId?: string | null;
  category: string;
  name: string;
  filePath: string;
  originalFileName?: string | null;
  fileType: string;
  fileSize: number;
  extractedData?: string | null;
  status: 'UPLOADED' | 'PROCESSING' | 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED' | 'EXPIRED';
  issuesJson?: string | null;
  healthScore: number;
  uploadedAt: string;
}

export interface DocumentHealthReport {
  overallScore: number;
  completeness: number;
  readability: number;
  consistency: number;
  validity: number;
  requiredDocsRatio: number;
  issues: DocumentIssue[];
  status: 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED';
}

export interface Approval {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  description?: string | null;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  statutoryDaysSLA: number;
  isInspectionRequired: boolean;
  isRenewalRequired: boolean;
  renewalFrequencyMonths: number;
  department?: Department;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  ministry: string;
  officerName?: string | null;
  contactEmail?: string | null;
}

export interface ApplicationTimeline {
  id: string;
  stage: string;
  status: string;
  remarks?: string | null;
  actorName: string;
  actorRole: string;
  createdAt: string;
}

export interface ClarificationQuery {
  id: string;
  officerId?: string | null;
  queryText: string;
  responseText?: string | null;
  status: 'PENDING' | 'RESOLVED';
  queryDate: string;
  responseDate?: string | null;
  responseDocumentUrl?: string | null;
}

export interface Application {
  id: string;
  projectId: string;
  approvalId: string;
  departmentId: string;
  applicationNumber: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'QUERY_RAISED' | 'APPLICANT_RESPONDED' | 'INSPECTION_SCHEDULED' | 'INSPECTION_COMPLETED' | 'APPROVED' | 'REJECTED' | 'SLA_BREACHED' | 'WITHDRAWN';
  currentStage: string;
  submittedAt: string;
  slaDueDate: string;
  slaStatus: 'ON_TRACK' | 'APPROACHING_DEADLINE' | 'BREACHED';
  riskScore: number;
  riskFactorsJson?: string | null;
  preScrutinySummary?: string | null;
  assignedOfficerId?: string | null;
  feePaid: number;
  certificateUrl?: string | null;
  approval: Approval;
  department: Department;
  project?: Project;
  timeline?: ApplicationTimeline[];
  queries?: ClarificationQuery[];
  slaInfo?: {
    statutoryDays: number;
    elapsedDays: number;
    remainingDays: number;
    status: 'ON_TRACK' | 'APPROACHING_DEADLINE' | 'BREACHED';
    isBreached: boolean;
  };
}

export interface Inspection {
  id: string;
  projectId: string;
  applicationIdsJson: string;
  departmentCodesJson: string;
  scheduledDate: string;
  timeSlot: string;
  location: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  officerNames?: string | null;
  checklistJson?: string | null;
  officerRemarks?: string | null;
  evidencePhotosJson?: string | null;
  reportSubmittedAt?: string | null;
  project?: Project;
}

export interface SchemeMatch {
  schemeId: string;
  schemeCode: string;
  schemeName: string;
  department: string;
  schemeType: string;
  matchScore: number;
  eligibilityStatus: 'Likely Eligible' | 'Potentially Eligible' | 'Not Eligible' | 'Needs More Information';
  scoreBreakdown: {
    sectorScore: number;
    locationScore: number;
    investmentScore: number;
    entityTypeScore: number;
    employmentScore: number;
    docScore: number;
  };
  satisfiedConditions: string[];
  missingOrUnsatisfiedConditions: string[];
  remedySuggestions: string[];
  supportingDocumentsFound: string[];
  benefitsSummary: string;
  officialSourceUrl: string;
  lastVerifiedDate: string;
  isApplied?: boolean;
}

export interface ComplianceItem {
  id: string;
  projectId: string;
  approvalId?: string | null;
  name: string;
  department: string;
  frequency: string;
  dueDate: string;
  status: 'UPCOMING' | 'DUE' | 'COMPLETED' | 'OVERDUE';
  completedDate?: string | null;
  documentRequired?: string | null;
  documentUrl?: string | null;
  remarks?: string | null;
  projectName?: string;
}

export interface RenewalItem {
  id: string;
  projectId: string;
  approvalId?: string | null;
  licenseName: string;
  licenseNumber: string;
  issueDate: string;
  expiryDate: string;
  renewalWindowDays: number;
  status: 'ACTIVE' | 'RENEWAL_DUE' | 'RENEWAL_SUBMITTED' | 'EXPIRED';
  projectName?: string;
  daysRemaining?: number;
  urgency?: 'NORMAL' | 'WARNING_90' | 'WARNING_60' | 'WARNING_30' | 'CRITICAL_7' | 'EXPIRED';
}

export interface Grievance {
  id: string;
  token: string;
  category: string;
  department: string;
  description: string;
  status: 'SUBMITTED' | 'ASSIGNED' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
  officerRemarks?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  userId?: string | null;
  userName?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  detailsJson?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface OfficerStats {
  totalApplications: number;
  pendingReview: number;
  queryRaised: number;
  inspectionRequired: number;
  slaBreached: number;
  approved: number;
}
