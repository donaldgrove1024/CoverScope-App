export type PolicyType = 'home' | 'vehicle';

export interface CoverageItem {
  name: string;
  category: string;
  isCovered: boolean;
  limitDollar?: number;
  conditions?: string;
}

export interface WarrantyPolicy {
  id: string;
  name: string;
  provider: string;
  planTier: string;
  type: PolicyType;
  tradeServiceCallFee: number; // e.g. 100
  annualAggregateCap?: number; // e.g. 25000
  perItemLimit?: number; // e.g. 2000 or 5000
  hvacLimit?: number;
  applianceLimit?: number;
  plumbingLimit?: number;
  wearAndTearCovered: boolean;
  secondaryDamageCovered: boolean;
  codeViolationCoverageDollar?: number;
  refrigerantCoverage: boolean;
  coverageItems: CoverageItem[];
  commonExclusions: string[];
  contractClauses: Array<{
    section: string;
    title: string;
    description: string;
  }>;
  notes?: string;
}

export interface TriageInput {
  policy: WarrantyPolicy;
  symptomDescription: string;
  category: string;
  applianceOrPart: string;
  approxAgeYears?: string | number;
  preExistingSuspected?: boolean;
  rustOrCorrosionVisible?: boolean;
  maintenanceRecordsAvailable?: boolean;
  diyAttempted?: boolean;
  waterLeakPresent?: boolean;
  imagePreviewUrl?: string | null;
  imageBase64?: string | null;
  imageMimeType?: string | null;
  audioTranscript?: string | null;
}

export type VerdictStatus = 'LIKELY_COVERED' | 'LIKELY_DENIED' | 'AMBIGUOUS';

export interface CitedClause {
  section: string;
  clauseTitle: string;
  textExcerpt: string;
  status: 'INCLUDED' | 'EXCLUDED' | 'CONDITIONAL' | 'LIMIT_APPLIED';
  impactExplanation: string;
}

export interface DenialTrap {
  trapName: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation: string;
  preventativeAdvice: string;
}

export interface ForbiddenPhrase {
  phrase: string;
  why: string;
  replacement: string;
}

export interface FinancialAnalysis {
  tradeCallFee: number;
  estimatedRepairCostMin: number;
  estimatedRepairCostMax: number;
  estimatedReplacementCost: number;
  netBenefitMin: number;
  netBenefitMax: number;
  recommendation: 'SUBMIT_CLAIM' | 'PAY_OUT_OF_POCKET_OR_DIY' | 'SEEK_DIAGNOSTIC_FIRST' | 'REPLACE_EQUIPMENT';
  recommendationReason: string;
}

export interface ClaimPlaybook {
  recommendedActionPlan: string[];
  exactPhoneScript: string;
  mandatoryKeywordsToUse: string[];
  forbiddenPhrasesToAvoid: ForbiddenPhrase[];
  dispatcherChecklist: string[];
}

export interface AlternativeSolution {
  title: string;
  costEstimate: string;
  difficulty: 'EASY' | 'MODERATE' | 'PROFESSIONAL';
  description: string;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  category: 'MAKE_MODEL' | 'MANUFACTURER_YEAR' | 'SYMPTOM_LOCATION' | 'ERROR_CODE' | 'MAINTENANCE_HISTORY' | 'GENERAL';
  quickOptions?: string[];
  whyItMatters: string;
}

export interface TriageVerdict {
  id: string;
  timestamp: string;
  status: VerdictStatus;
  confidenceScore: number; // 0 - 100
  headline: string;
  executiveSummary: string;
  conversationalAdvisorResponse?: string; // Direct natural voice response (e.g., "Based on your American Home Shield contract, water heaters are generally covered...")
  followUpPrompt?: string; // e.g. "Would you like me to help you file a claim?"
  clarifyingQuestions?: ClarifyingQuestion[]; // Clarifying questions to dial in recommendation accuracy
  detectedAppliance: {
    name: string;
    makeModelEstimated?: string;
    failureMode: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
  financialAnalysis: FinancialAnalysis;
  citedPolicyClauses: CitedClause[];
  denialTraps: DenialTrap[];
  claimPlaybook: ClaimPlaybook;
  alternativeSolutions: AlternativeSolution[];
  inputSnapshot: {
    category: string;
    applianceOrPart: string;
    symptomDescription: string;
    policyName: string;
    tradeFee: number;
    hasImage: boolean;
    imagePreviewUrl?: string | null;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export type SubscriptionPlanTier = 'basic' | 'premium';

export interface PlanFeature {
  name: string;
  basic: boolean | string;
  premium: boolean | string;
  description?: string;
}

export interface HomeApplianceItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  modelNumber?: string;
  serialNumber?: string;
  location?: string;
  installYear: number;
  ageYears?: number;
  lastServicedDate?: string;
  photoUrl?: string;
  conditionStatus: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'AT_RISK';
  estimatedReplacementValue: number;
  notes?: string;
  coveredUnderCurrentPolicy: boolean;
  coverageLimitDollar?: number;
}


export interface ContractorPro {
  id: string;
  name: string;
  company: string;
  category: 'HVAC' | 'Plumbing' | 'Electrical' | 'Appliances' | 'Roofing' | 'General';
  rating: number; // e.g. 4.9
  reviewCount: number;
  hourlyRateEstimate: string;
  averageResponseTime: string;
  phone: string;
  distanceMiles: number;
  verifiedLicense: boolean;
  specialtyBadges: string[];
  exclusiveCoverScopeDiscount: string;
  angiCertified?: boolean;
  superServiceAward?: boolean;
  estimatedProjectRange?: string;
  yearsInBusiness?: number;
}

export interface HomeWarrantyAccount {
  providerId: string;
  providerName: string;
  memberId: string;
  policyNumber: string;
  accountHolderName: string;
  propertyAddress: string;
  phone: string;
  email: string;
  status: 'CONNECTED' | 'DISCONNECTED';
  autonomousDispatchEnabled: boolean; // Autonomous mode: submit without popup approval
  verifiedDate?: string;
  lastClaimReference?: string;
}

export interface ClaimSubmittalRecord {
  id: string;
  claimNumber: string;
  timestamp: string;
  providerName: string;
  memberId: string;
  applianceName: string;
  failureMode: string;
  tradeFee: number;
  dispatchWindow: string;
  autonomous: boolean;
  status: 'SUBMITTED' | 'DISPATCHED' | 'IN_REVIEW' | 'CONTRACTOR_ASSIGNED';
  confirmationNotes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  propertyAddress?: string;
  cityStateZip?: string;
  warrantyProvider?: string;
  memberId?: string;
  planTier: SubscriptionPlanTier;
  createdAt: string;
  emailVerified: boolean;
  twoFactorEnabled?: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
}

export interface AngiVendorRequest {
  id: string;
  timestamp: string;
  category: string;
  projectScope: string;
  zipCode: string;
  urgency: 'URGENT_24H' | 'NEXT_2_3_DAYS' | 'FLEXIBLE';
  requestedProIds: string[];
  homeownerName: string;
  homeownerPhone: string;
  estimatedCostRange: string;
  status: 'DISPATCHED' | 'QUOTES_RECEIVED';
}

// ==========================================
// PREVENTIVE MAINTENANCE REMINDERS & SCHEDULE
// ==========================================

export type PreventiveTaskCategory =
  | 'HVAC_FILTERS'
  | 'SMOKE_DETECTORS'
  | 'HVAC_TUNEUP'
  | 'WATER_HEATER'
  | 'APPLIANCES'
  | 'PLUMBING'
  | 'SAFETY'
  | 'SEASONAL'
  | 'CUSTOM';

export type PreventiveFrequency =
  | 'MONTHLY'
  | 'EVERY_60_DAYS'
  | 'QUARTERLY'
  | 'BI_ANNUAL'
  | 'ANNUAL'
  | 'CUSTOM';

export interface MaintenanceLogEntry {
  id: string;
  date: string;
  completedBy: string;
  notes?: string;
  proofPhotoUrl?: string;
  cost?: number;
  replacedItems?: string;
}

export interface PreventiveMaintenanceTask {
  id: string;
  title: string;
  category: PreventiveTaskCategory;
  frequency: PreventiveFrequency;
  frequencyDays: number;
  lastCompletedDate: string;
  nextDueDate: string;
  specs: {
    filterSize?: string;
    batteryType?: string;
    location?: string;
    modelNumber?: string;
    notes?: string;
    estimatedMinutes?: number;
    diyDifficulty?: 'Easy (5 mins)' | 'Moderate (15-30 mins)' | 'Requires Pro';
  };
  whyWarrantyMatters: string; // How neglecting this leads to warranty claim denials
  instructionsStepByStep: string[];
  productReorderTip?: string;
  reminderEnabled: boolean;
  assignedRole: 'HOMEOWNER' | 'TENANT' | 'PROPERTY_MANAGER';
  logs: MaintenanceLogEntry[];
}

// ==========================================
// RENTAL MODE & GENERIC TENANT/PM ACCESS
// ==========================================

export interface RentalTenantInfo {
  id: string;
  name: string;
  unitNumber?: string;
  email: string;
  phone: string;
  leaseEndDate?: string;
  occupiedSince?: string;
}

export interface RentalPropertySettings {
  enabled: boolean;
  propertyNickname: string;
  propertyAddress: string;
  unitCount?: number;
  managementCompany: string;
  pmName: string;
  pmEmail: string;
  pmPhone: string;
  emergencyPhone: string;
  genericAccessCode: string; // e.g. "RENT-75001-A4"
  genericAccessUrlSlug: string;
  autoDispatchWarrantyIfCovered: boolean;
  requireLandlordApprovalAbove: number; // e.g. 100
  activeTenants: RentalTenantInfo[];
  notesForTenants?: string;
}

export type MaintenanceTicketStatus =
  | 'OPEN'
  | 'AI_TRIAGED'
  | 'LANDLORD_REVIEW'
  | 'WARRANTY_DISPATCHED'
  | 'PRO_SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface TicketTimelineEntry {
  id: string;
  timestamp: string;
  title: string;
  notes: string;
  updatedBy: string;
  type?: 'status' | 'comment' | 'dispatch' | 'approval';
}

export interface RentalMaintenanceTicket {
  id: string;
  ticketNumber: string;
  propertyAddress: string;
  unitNumber?: string;
  reportedBy: {
    name: string;
    phone: string;
    email: string;
    role: 'TENANT' | 'PROPERTY_MANAGER' | 'LANDLORD';
  };
  createdAt: string;
  category: string;
  applianceOrArea: string;
  symptomDescription: string;
  urgency: 'EMERGENCY_24H' | 'URGENT_2_3_DAYS' | 'ROUTINE';
  photos: string[];
  isCoveredByWarranty: boolean;
  warrantyCoverageExplanation: string;
  responsibility: 'LANDLORD' | 'TENANT' | 'WARRANTY_ELIGIBLE';
  status: MaintenanceTicketStatus;
  estimatedCostRange?: string;
  tradeFeeAmount?: number;
  warrantyProviderName?: string;
  landlordApproved: boolean;
  landlordApprovalNotes?: string;
  assignedContractor?: string;
  scheduledServiceDate?: string;
  timeline: TicketTimelineEntry[];
}



