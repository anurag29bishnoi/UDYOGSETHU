export interface ProjectData {
  id?: string;
  name: string;
  projectType: string;
  sector: string;
  state: string;
  district: string;
  industrialArea?: string | null;
  midcPlot?: string | null;
  totalInvestment: number; // Crores
  productionType?: string | null;
  employeeCount: number;
  waterReq: number; // KLD
  powerReq: number; // kVA
  wastewater: number; // KLD
  airEmissions?: string | null;
  hazardousMaterials: boolean;
  hazardousWaste: boolean;
  buildingRequired: boolean;
  factoryRequired: boolean;
  fireRisk: string; // Low, Medium, High
  buildingArea: number; // sq m
}

export interface DiscoveredApproval {
  approvalCode: string;
  approvalName: string;
  departmentCode: string;
  departmentName: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  statutoryDaysSLA: number;
  isInspectionRequired: boolean;
  isRenewalRequired: boolean;
  renewalFrequencyMonths: number;
  applicabilityReason: string;
  legalAct: string;
  dependencies: string[];
  requiredDocuments: Array<{
    name: string;
    category: string;
    isMandatory: boolean;
    description: string;
  }>;
}

export interface ApprovalDiscoveryResult {
  approvals: DiscoveredApproval[];
  totalApprovals: number;
  estimatedTotalDays: number;
  parallelProcessingPossible: boolean;
  inspectionRequiredCount: number;
  graphNodes: Array<{ id: string; label: string; department: string; type: string }>;
  graphEdges: Array<{ from: string; to: string }>;
}

export function evaluateApprovalRules(project: ProjectData): ApprovalDiscoveryResult {
  const approvals: DiscoveredApproval[] = [];

  // Rule 1: MPCB Consent to Establish (CTE)
  const isPollutionRelevantSector = ['Textile', 'Chemical', 'Pharmaceutical', 'Food Processing', 'Automobile', 'General Manufacturing'].includes(project.sector);
  if (isPollutionRelevantSector || project.wastewater > 0 || project.hazardousWaste || project.hazardousMaterials) {
    approvals.push({
      approvalCode: 'MPCB_CTE',
      approvalName: 'Consent to Establish (CTE) - Orange/Red Category',
      departmentCode: 'MPCB',
      departmentName: 'Maharashtra Pollution Control Board (MPCB)',
      priority: 'HIGH',
      statutoryDaysSLA: 21,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 36,
      applicabilityReason: `Mandatory for ${project.sector} sector with industrial water discharge of ${project.wastewater} KLD under Water (Prevention & Control of Pollution) Act 1974.`,
      legalAct: 'Water Act 1974 & Air Act 1981, Government of Maharashtra',
      dependencies: ['MIDC_LAND'],
      requiredDocuments: [
        { name: 'Environmental Management Plan', category: 'Environmental', isMandatory: true, description: 'EIA / EMP report detailing effluent treatment plant (ETP) design' },
        { name: 'Water & Wastewater Balance Chart', category: 'Environmental', isMandatory: true, description: 'Flow diagram indicating daily intake and recycling balance' },
        { name: 'MIDC Allotment / Possession Letter', category: 'Land', isMandatory: true, description: 'Proof of industrial plot possession' },
        { name: 'Chartered Accountant Project Cost Certificate', category: 'Financial', isMandatory: true, description: 'Certified capital investment appraisal' }
      ]
    });
  }

  // Rule 2: Directorate of Industrial Safety & Health (DISH) - Factory License Plan Approval
  if (project.factoryRequired || project.employeeCount >= 10) {
    approvals.push({
      approvalCode: 'DISH_FACTORY',
      approvalName: 'Factory License & Layout Plan Approval (Form 1)',
      departmentCode: 'DISH',
      departmentName: 'Directorate of Industrial Safety & Health (DISH), Maharashtra',
      priority: 'HIGH',
      statutoryDaysSLA: 30,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 12,
      applicabilityReason: `Applies as enterprise employs ${project.employeeCount} persons with industrial manufacturing machinery under Maharashtra Factories Rules 1963.`,
      legalAct: 'Factories Act 1948, Section 6',
      dependencies: ['FIRE_NOC'],
      requiredDocuments: [
        { name: 'Approved Factory Building & Machinery Layout Plan', category: 'Factory', isMandatory: true, description: 'Blueprints certified by a licensed structural engineer' },
        { name: 'Process Flow Chart & Material Safety Data Sheet (MSDS)', category: 'Technical', isMandatory: true, description: 'Step-by-step manufacturing process description' },
        { name: 'List of Directors & Authorized Signatory Resolution', category: 'Company', isMandatory: true, description: 'Board resolution designating occupier/factory manager' }
      ]
    });
  }

  // Rule 3: Maharashtra Fire Services NOC (Provisional / Final)
  if (project.fireRisk === 'High' || project.fireRisk === 'Medium' || project.buildingArea > 500) {
    approvals.push({
      approvalCode: 'FIRE_NOC',
      approvalName: 'Provisional Fire Safety No-Objection Certificate (NOC)',
      departmentCode: 'FIRE',
      departmentName: 'Directorate of Maharashtra Fire Services',
      priority: 'HIGH',
      statutoryDaysSLA: 15,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 12,
      applicabilityReason: `Triggered due to built-up area of ${project.buildingArea} sq.m with '${project.fireRisk}' fire classification risk under Maharashtra Fire Prevention Act 2006.`,
      legalAct: 'Maharashtra Fire Prevention and Life Safety Measures Act 2006',
      dependencies: ['MIDC_LAND'],
      requiredDocuments: [
        { name: 'Architectural Fire Safety Evacuation Plan', category: 'Factory', isMandatory: true, description: 'Floor plans showing hydrant network, exits, fire alarm layouts' },
        { name: 'Hazardous Chemical Storage Inventory', category: 'Technical', isMandatory: project.hazardousMaterials, description: 'Quantity and flash point data of raw materials' }
      ]
    });
  }

  // Rule 4: MSEDCL High Tension (HT) / Low Tension (LT) Power Sanction
  if (project.powerReq > 0) {
    const isHT = project.powerReq >= 100;
    approvals.push({
      approvalCode: isHT ? 'MSEDCL_HT_SANCTION' : 'MSEDCL_LT_SANCTION',
      approvalName: isHT ? 'High Tension (HT) Industrial Power Sanction & Grid Feasibility' : 'LT Industrial Power Connection',
      departmentCode: 'MSEDCL',
      departmentName: 'Maharashtra State Electricity Distribution Co. Ltd. (MSEDCL)',
      priority: 'MEDIUM',
      statutoryDaysSLA: 14,
      isInspectionRequired: true,
      isRenewalRequired: false,
      renewalFrequencyMonths: 0,
      applicabilityReason: `Required for industrial connected load requirement of ${project.powerReq} kVA from local sub-station.`,
      legalAct: 'Electricity Act 2003 & MERC Supply Code Regulations',
      dependencies: ['MIDC_LAND'],
      requiredDocuments: [
        { name: 'Electrical Single Line Diagram (SLD)', category: 'Technical', isMandatory: true, description: 'Electrical schematic showing transformer and switchgear details' },
        { name: 'Proof of Plot Allotment / Ownership', category: 'Land', isMandatory: true, description: 'MIDC allotment letter or 7/12 extract' }
      ]
    });
  }

  // Rule 5: Labour Commissionerate Registration (Contract Labour / Shop & Estab)
  if (project.employeeCount >= 20) {
    approvals.push({
      approvalCode: 'LABOUR_REGISTRATION',
      approvalName: 'Principal Employer Registration under Contract Labour Act',
      departmentCode: 'LABOUR',
      departmentName: 'Office of the Labour Commissioner, Maharashtra',
      priority: 'MEDIUM',
      statutoryDaysSLA: 7,
      isInspectionRequired: false,
      isRenewalRequired: true,
      renewalFrequencyMonths: 12,
      applicabilityReason: `Mandatory for commercial undertakings engaging ${project.employeeCount} or more workers under Contract Labour (Regulation & Abolition) Act 1970.`,
      legalAct: 'Contract Labour (R&A) Maharashtra Rules 1971',
      dependencies: [],
      requiredDocuments: [
        { name: 'Form I Application for Principal Employer Registration', category: 'Company', isMandatory: true, description: 'Details of contractor agencies and worker headcount' },
        { name: 'PAN & Certificate of Incorporation', category: 'Identity', isMandatory: true, description: 'Entity legal credentials' }
      ]
    });
  }

  // Rule 6: MIDC Building Plan Approval / Tree Authority NOC
  if (project.industrialArea?.includes('MIDC') || project.midcPlot) {
    approvals.push({
      approvalCode: 'MIDC_PLAN_APPROVAL',
      approvalName: 'MIDC Building Plan Approval & Commencement Certificate',
      departmentCode: 'MIDC',
      departmentName: 'Maharashtra Industrial Development Corporation (Special Planning Authority)',
      priority: 'HIGH',
      statutoryDaysSLA: 21,
      isInspectionRequired: true,
      isRenewalRequired: false,
      renewalFrequencyMonths: 0,
      applicabilityReason: `Required as plot is located inside MIDC Industrial Estate subject to MIDC Development Control Regulations.`,
      legalAct: 'MIDC Act 1961 & Development Control Regulations 2009',
      dependencies: [],
      requiredDocuments: [
        { name: 'Plot Allotment & Lease Deed', category: 'Land', isMandatory: true, description: 'Registered lease agreement with MIDC' },
        { name: 'Architectural Detailed Building Plans', category: 'Factory', isMandatory: true, description: 'Full architectural layout conforming to FSI norms' }
      ]
    });
  }

  // Rule 7: Central Ground Water Authority (CGWA) / State Groundwater NOC
  if (project.waterReq >= 50) {
    approvals.push({
      approvalCode: 'CGWA_NOC',
      approvalName: 'Groundwater Extraction Permission / NOC',
      departmentCode: 'CGWA',
      departmentName: 'Groundwater Surveys and Development Agency (GSDA) / CGWA',
      priority: 'LOW',
      statutoryDaysSLA: 30,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 24,
      applicabilityReason: `High industrial daily water demand of ${project.waterReq} KLD requires groundwater extraction appraisal or MIDC pipeline commitment.`,
      legalAct: 'Environment (Protection) Act 1986, Section 5',
      dependencies: ['MPCB_CTE'],
      requiredDocuments: [
        { name: 'Hydrogeological Water Impact Study', category: 'Environmental', isMandatory: true, description: 'Rainwater harvesting and recharge well schematic' }
      ]
    });
  }

  // Build visual workflow graph
  const graphNodes = [
    { id: 'PROJECT', label: project.name || 'Project Profile', department: 'Entrepreneur', type: 'root' },
    ...approvals.map(a => ({
      id: a.approvalCode,
      label: a.approvalName,
      department: a.departmentCode,
      type: 'approval'
    })),
    { id: 'INSPECTION', label: 'Joint On-Site Inspection', department: 'Joint Squad', type: 'milestone' },
    { id: 'FINAL_APPROVAL', label: 'Consolidated Industrial Sanction', department: 'Government Portal', type: 'decision' }
  ];

  const graphEdges: Array<{ from: string; to: string }> = [];
  approvals.forEach(a => {
    graphEdges.push({ from: 'PROJECT', to: a.approvalCode });
    if (a.isInspectionRequired) {
      graphEdges.push({ from: a.approvalCode, to: 'INSPECTION' });
    } else {
      graphEdges.push({ from: a.approvalCode, to: 'FINAL_APPROVAL' });
    }
  });
  graphEdges.push({ from: 'INSPECTION', to: 'FINAL_APPROVAL' });

  const estimatedTotalDays = Math.max(...approvals.map(a => a.statutoryDaysSLA), 21);
  const inspectionRequiredCount = approvals.filter(a => a.isInspectionRequired).length;

  return {
    approvals,
    totalApprovals: approvals.length,
    estimatedTotalDays,
    parallelProcessingPossible: true,
    inspectionRequiredCount,
    graphNodes,
    graphEdges
  };
}
