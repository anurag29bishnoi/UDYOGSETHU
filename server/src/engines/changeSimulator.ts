import { evaluateApprovalRules, ProjectData, DiscoveredApproval } from './approvalRulesEngine';
import { evaluateSchemeEligibility, SchemeMatchEvaluation } from './schemeMatchingEngine';
import { compileApprovalPipeline } from './pipelineCompiler';

export interface ProposedChanges {
  sector?: string;
  state?: string;
  district?: string;
  totalInvestment?: number;
  employeeCount?: number;
  waterReq?: number;
  powerReq?: number;
  wastewater?: number;
  hazardousMaterials?: boolean;
  hazardousWaste?: boolean;
  buildingRequired?: boolean;
  factoryRequired?: boolean;
  fireRisk?: string;
  buildingArea?: number;
  projectType?: string;
}

export interface ChangeImpactResult {
  isSimulation: true;
  simulationNote: string;
  currentProfile: ProjectData;
  proposedProfile: ProjectData;
  differences: Array<{
    field: string;
    label: string;
    currentValue: any;
    proposedValue: any;
  }>;
  approvalsImpact: {
    netChange: number; // e.g. +2
    added: DiscoveredApproval[];
    removed: DiscoveredApproval[];
    retained: DiscoveredApproval[];
  };
  documentsImpact: {
    netChange: number; // e.g. +3
    added: Array<{ name: string; category: string; reason: string }>;
    removed: Array<{ name: string; category: string }>;
  };
  complianceImpact: {
    netChange: number; // e.g. +4
    added: Array<{
      title: string;
      department: string;
      frequency: string;
      reason: string;
      legalAct: string;
    }>;
    removed: string[];
  };
  schemesImpact: {
    netChange: number; // e.g. +2
    newlyEligible: SchemeMatchEvaluation[];
    disqualified: SchemeMatchEvaluation[];
    retained: SchemeMatchEvaluation[];
    additionalIncentivesPotential: string;
  };
  timelineImpact: {
    currentCriticalDays: number;
    proposedCriticalDays: number;
    deltaDays: number;
    explanation: string;
  };
  executiveSummary: string;
}

/**
 * Change Impact Simulator Engine
 * Evaluates hypothetical alterations to business/project parameters
 * and computes downstream statutory impacts without touching production records.
 */
export function simulateProjectChange(
  current: ProjectData,
  changes: ProposedChanges,
  company: any = { companyType: 'Private Limited', udyamCategory: 'Medium', dateOfIncorporation: new Date('2022-01-15') },
  uploadedDocCategories: string[] = ['ID_PROOF', 'INCORPORATION', 'PAN', 'GST', 'UDYAM', 'LAND_TITLE', 'DPR']
): ChangeImpactResult {
  // Merge proposed changes into a cloned proposed project
  const proposed: ProjectData = {
    ...current,
    ...changes
  };

  // 1. Identify parameter differences
  const differences: ChangeImpactResult['differences'] = [];
  const fieldsToCheck: Array<{ key: keyof ProposedChanges; label: string; unit?: string }> = [
    { key: 'totalInvestment', label: 'Capital Investment', unit: '₹ Crore' },
    { key: 'employeeCount', label: 'Total Workforce', unit: 'Employees' },
    { key: 'sector', label: 'Industrial Sector' },
    { key: 'district', label: 'District Location' },
    { key: 'waterReq', label: 'Fresh Water Requirement', unit: 'KLD' },
    { key: 'powerReq', label: 'Connected Power Demand', unit: 'kVA' },
    { key: 'wastewater', label: 'Effluent Generation', unit: 'KLD' },
    { key: 'hazardousMaterials', label: 'Hazardous Substances Present' },
    { key: 'hazardousWaste', label: 'Hazardous Waste Generation' },
    { key: 'fireRisk', label: 'Fire Risk Classification' },
    { key: 'buildingArea', label: 'Built-up Area', unit: 'sq.m.' }
  ];

  fieldsToCheck.forEach(f => {
    if (changes[f.key] !== undefined && changes[f.key] !== current[f.key as keyof ProjectData]) {
      differences.push({
        field: f.key,
        label: f.label,
        currentValue: `${current[f.key as keyof ProjectData]}${f.unit ? ' ' + f.unit : ''}`,
        proposedValue: `${changes[f.key]}${f.unit ? ' ' + f.unit : ''}`
      });
    }
  });

  // 2. Evaluate Approvals Impact
  const currentApprovals = evaluateApprovalRules(current).approvals;
  const proposedApprovals = evaluateApprovalRules(proposed).approvals;

  const currentCodes = new Set(currentApprovals.map(a => a.approvalCode));
  const proposedCodes = new Set(proposedApprovals.map(a => a.approvalCode));

  const addedApprovals = proposedApprovals.filter(a => !currentCodes.has(a.approvalCode));
  const removedApprovals = currentApprovals.filter(a => !proposedCodes.has(a.approvalCode));
  const retainedApprovals = proposedApprovals.filter(a => currentCodes.has(a.approvalCode));

  // 3. Evaluate Documents Impact
  const currentDocsMap = new Map<string, { name: string; category: string }>();
  currentApprovals.forEach(a => {
    a.requiredDocuments.forEach(d => currentDocsMap.set(d.name, { name: d.name, category: d.category }));
  });

  const proposedDocsMap = new Map<string, { name: string; category: string }>();
  proposedApprovals.forEach(a => {
    a.requiredDocuments.forEach(d => proposedDocsMap.set(d.name, { name: d.name, category: d.category }));
  });

  const addedDocs: Array<{ name: string; category: string; reason: string }> = [];
  proposedDocsMap.forEach((val, key) => {
    if (!currentDocsMap.has(key)) {
      addedDocs.push({
        name: val.name,
        category: val.category,
        reason: `Triggered by new approval requirement.`
      });
    }
  });

  // Extra document triggers
  if (proposed.hazardousMaterials && !current.hazardousMaterials) {
    if (!addedDocs.some(d => d.name.includes('MSDS'))) {
      addedDocs.push({
        name: 'Material Safety Data Sheets (MSDS) & Chemical Inventory',
        category: 'HAZARDOUS_SAFETY',
        reason: 'Triggered by hazardous material declaration.'
      });
    }
  }
  if (proposed.totalInvestment >= 50 && current.totalInvestment < 50) {
    addedDocs.push({
      name: 'Detailed Bank Appraisal & TEV (Techno-Economic Viability) Report',
      category: 'FINANCIAL_REPORT',
      reason: 'Mandatory for Mega Project sanction (Investment ≥ ₹50 Crore).'
    });
  }

  const removedDocs: Array<{ name: string; category: string }> = [];
  currentDocsMap.forEach((val, key) => {
    if (!proposedDocsMap.has(key)) {
      removedDocs.push(val);
    }
  });

  // 4. Evaluate Compliance Impact
  const addedCompliance: ChangeImpactResult['complianceImpact']['added'] = [];
  if (proposed.hazardousWaste && !current.hazardousWaste) {
    addedCompliance.push({
      title: 'Annual Hazardous Waste Manifest (Form 4) Filing',
      department: 'MPCB',
      frequency: 'Annual (By 30th June)',
      reason: 'Triggered by generation of scheduled hazardous waste.',
      legalAct: 'Hazardous Waste Management Rules, 2016'
    });
    addedCompliance.push({
      title: 'Common Hazardous Waste TSDF Disposal Manifest (Form 10)',
      department: 'MPCB / MEPL',
      frequency: 'Per Consignment',
      reason: 'Consignment tracking for transfer to Ranjangaon / Taloja TSDF.',
      legalAct: 'Hazardous Waste Rules, 2016'
    });
  }
  if (proposed.employeeCount >= 100 && current.employeeCount < 100) {
    addedCompliance.push({
      title: 'Statutory Welfare Officer Appointment & Quarterly Report',
      department: 'Directorate of Industrial Safety & Health (DISH)',
      frequency: 'Quarterly',
      reason: 'Workforce exceeds 100 industrial employees.',
      legalAct: 'Factories Act 1948, Section 49'
    });
    addedCompliance.push({
      title: 'Certified Standing Orders Submission',
      department: 'Labour Department',
      frequency: 'One-time & Triennial Update',
      reason: 'Industrial establishment employing 100 or more workmen.',
      legalAct: 'Industrial Employment (Standing Orders) Act, 1946'
    });
  }
  if (proposed.totalInvestment >= 50 && current.totalInvestment < 50) {
    addedCompliance.push({
      title: 'Mega Project Half-Yearly Investment & Employment Progress Filing',
      department: 'Directorate of Industries (Maharashtra)',
      frequency: 'Half-Yearly',
      reason: 'Required to claim continuous Mega Project fiscal incentives under PSI 2019.',
      legalAct: 'Package Scheme of Incentives 2019'
    });
  }

  // 5. Evaluate Schemes Impact
  const currentSchemes = evaluateSchemeEligibility(current, company, uploadedDocCategories);
  const proposedSchemes = evaluateSchemeEligibility(proposed, company, uploadedDocCategories);

  const newlyEligible: SchemeMatchEvaluation[] = [];
  const disqualified: SchemeMatchEvaluation[] = [];
  const retainedSchemes: SchemeMatchEvaluation[] = [];

  proposedSchemes.forEach(ps => {
    const cs = currentSchemes.find(c => c.schemeCode === ps.schemeCode);
    if (!cs || cs.eligibilityStatus === 'Not Eligible') {
      if (ps.eligibilityStatus !== 'Not Eligible') {
        newlyEligible.push(ps);
      }
    } else {
      retainedSchemes.push(ps);
    }
  });

  currentSchemes.forEach(cs => {
    const ps = proposedSchemes.find(p => p.schemeCode === cs.schemeCode);
    if (cs.eligibilityStatus !== 'Not Eligible' && (!ps || ps.eligibilityStatus === 'Not Eligible')) {
      disqualified.push(cs);
    }
  });

  let additionalIncentivesPotential = 'Standard MSME Fiscal Benefits apply.';
  if (proposed.totalInvestment >= 50) {
    additionalIncentivesPotential = 'Qualifies for Mega Project Status under PSI 2019: Up to 100% Capital Subsidy / SGST refund over 10 years, 100% Electricity Duty Exemption, and ₹1/unit power tariff subsidy for 5 years (Est. benefit: ₹12.5 - ₹18.0 Cr).';
  } else if (proposed.totalInvestment >= 25 && proposed.sector.toLowerCase().includes('textile')) {
    additionalIncentivesPotential = 'Eligible for Special Textile Sector Incentives under PM MITRA & Maharashtra PSI 2019 (Capital subsidy up to 30% + 5% interest subvention).';
  }

  // 6. Evaluate Timeline Impact using Pipeline Compiler
  const currentPipeline = compileApprovalPipeline(current, [], uploadedDocCategories);
  const proposedPipeline = compileApprovalPipeline(proposed, [], uploadedDocCategories);

  const currentCriticalDays = currentPipeline.criticalPath.totalEstimatedDays;
  const proposedCriticalDays = proposedPipeline.criticalPath.totalEstimatedDays;
  const deltaDays = proposedCriticalDays - currentCriticalDays;

  const timelineExplanation = deltaDays > 0
    ? `Proposed changes introduce ${addedApprovals.length} additional regulatory clearance(s), extending the critical statutory path by +${deltaDays} working days.`
    : deltaDays < 0
    ? `Optimized parameters reduce sequential dependencies, shortening the critical path by ${Math.abs(deltaDays)} working days.`
    : `Critical statutory path duration remains steady at ${currentCriticalDays} working days via parallel processing.`;

  // 7. Executive Summary
  const executiveSummary = `Simulating change from ₹${current.totalInvestment} Cr to ₹${proposed.totalInvestment} Cr ` +
    `(${differences.length} parameters adjusted) results in ${addedApprovals.length > 0 ? `+${addedApprovals.length}` : '0'} new statutory approvals, ` +
    `+${addedDocs.length} required documents, +${addedCompliance.length} compliance returns, and ` +
    `${newlyEligible.length > 0 ? `+${newlyEligible.length} new government scheme opportunity` : 'realigned scheme scores'}.`;

  return {
    isSimulation: true,
    simulationNote: 'Simulation Only — No live project records were altered.',
    currentProfile: current,
    proposedProfile: proposed,
    differences,
    approvalsImpact: {
      netChange: addedApprovals.length - removedApprovals.length,
      added: addedApprovals,
      removed: removedApprovals,
      retained: retainedApprovals
    },
    documentsImpact: {
      netChange: addedDocs.length - removedDocs.length,
      added: addedDocs,
      removed: removedDocs
    },
    complianceImpact: {
      netChange: addedCompliance.length,
      added: addedCompliance,
      removed: []
    },
    schemesImpact: {
      netChange: newlyEligible.length - disqualified.length,
      newlyEligible,
      disqualified,
      retained: retainedSchemes,
      additionalIncentivesPotential
    },
    timelineImpact: {
      currentCriticalDays,
      proposedCriticalDays,
      deltaDays,
      explanation: timelineExplanation
    },
    executiveSummary
  };
}
