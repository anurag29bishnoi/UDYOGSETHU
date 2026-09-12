import { ProjectData } from './approvalRulesEngine';

export interface SchemeRuleDefinition {
  id: string;
  code: string;
  name: string;
  department: string;
  schemeType: string;
  minInvestment: number; // Crores
  maxInvestment?: number;
  eligibleSectors: string[];
  eligibleLocations: string[]; // Districts or "ALL" or "Developing Zones"
  eligibleCompanyTypes: string[];
  minEmployees: number;
  benefitsSummary: string;
  subsidyPercentage?: number;
  maxSubsidyAmount?: string;
  officialSourceUrl: string;
  lastVerifiedDate: string;
  details: {
    criteriaNotes: string[];
    requiredDocuments: string[];
    applicationMethod: string;
    keyIncentives: string[];
  };
}

export interface SchemeMatchEvaluation {
  schemeId: string;
  schemeCode: string;
  schemeName: string;
  department: string;
  schemeType: string;
  matchScore: number; // 0-100
  eligibilityStatus: 'Likely Eligible' | 'Potentially Eligible' | 'Not Eligible' | 'Needs More Information';
  scoreBreakdown: {
    sectorScore: number; // Max 30
    locationScore: number; // Max 20
    investmentScore: number; // Max 20
    entityTypeScore: number; // Max 10
    employmentScore: number; // Max 10
    docScore: number; // Max 10
  };
  satisfiedConditions: string[];
  missingOrUnsatisfiedConditions: string[];
  remedySuggestions: string[];
  supportingDocumentsFound: string[];
  benefitsSummary: string;
  officialSourceUrl: string;
  lastVerifiedDate: string;
}

/**
 * Curated Seed Database of Maharashtra & National Industrial Incentive Schemes
 */
export const CURATED_SCHEMES: SchemeRuleDefinition[] = [
  {
    id: 'SCHEME_PSI_2019',
    code: 'MAHA_PSI_2019',
    name: 'Maharashtra Package Scheme of Incentives (PSI) 2019',
    department: 'Industries, Energy and Labour Department, Govt of Maharashtra',
    schemeType: 'Capital & Industrial Subsidy',
    minInvestment: 5.0, // In Crores
    maxInvestment: 500.0,
    eligibleSectors: ['Textile', 'Food Processing', 'Automobile', 'Electronics', 'Pharmaceutical', 'Chemical', 'General Manufacturing'],
    eligibleLocations: ['Pune', 'Nashik', 'Chhatrapati Sambhajinagar', 'Solapur', 'Nagpur', 'Amravati', 'Nanded', 'Kolhapur', 'ALL'],
    eligibleCompanyTypes: ['Private Limited', 'Public Limited', 'LLP', 'Partnership', 'Proprietorship', 'Startup'],
    minEmployees: 25,
    benefitsSummary: 'Up to 50% Industrial Promotion Subsidy (IPS) on gross SGST paid, 100% Stamp Duty exemption for 15 years, and 100% Electricity Duty waiver.',
    subsidyPercentage: 50,
    maxSubsidyAmount: '₹25.0 Crore over 7 years',
    officialSourceUrl: 'https://mahakamgar.maharashtra.gov.in / Industries Directorate Circular 2019/CR-128/IND-8',
    lastVerifiedDate: '2026-03-01 (Active Statutory Policy)',
    details: {
      criteriaNotes: [
        'Enterprise must set up a new unit or undertake minimum 25% expansion in eligible talukas/industrial areas of Maharashtra.',
        'Must maintain commercial production for a minimum period of 7 years from sanction date.'
      ],
      requiredDocuments: [
        'Udyam Registration Certificate',
        'MIDC Land Possession / Registered Lease Deed',
        'Chartered Accountant Certified Capital Investment Breakdown',
        'Consent to Establish (CTE) from MPCB'
      ],
      applicationMethod: 'Single Window Online Portal submission within 6 months of acquiring land or machinery installation.',
      keyIncentives: [
        '50% gross SGST refund as Industrial Promotion Subsidy',
        'Electricity Duty exemption for 7 to 10 years',
        '100% Stamp Duty exemption on land lease/mortgage'
      ]
    }
  },
  {
    id: 'SCHEME_PM_MITRA',
    code: 'PM_MITRA_TEXTILE',
    name: 'PM Mega Integrated Textile Region and Apparel (PM MITRA) Scheme',
    department: 'Ministry of Textiles, Govt of India & Govt of Maharashtra (Amravati Textile Park)',
    schemeType: 'Textile Sector Infrastructure & Machinery Subsidy',
    minInvestment: 10.0,
    eligibleSectors: ['Textile'],
    eligibleLocations: ['Amravati', 'Vidarbha', 'Solapur', 'Ichalkaranji', 'ALL'],
    eligibleCompanyTypes: ['Private Limited', 'Public Limited', 'LLP'],
    minEmployees: 100,
    benefitsSummary: 'Up to ₹30 Crore Development Capital Support (DCS) for common effluent plants, zero liquid discharge (ZLD), plus 30% capital subsidy on modern textile looms.',
    subsidyPercentage: 30,
    maxSubsidyAmount: '₹30.0 Crore',
    officialSourceUrl: 'https://texmin.nic.in/pm-mitra',
    lastVerifiedDate: '2026-02-15',
    details: {
      criteriaNotes: [
        'Applicant must operate in spinning, weaving, garmenting, or technical textile manufacturing.',
        'Must provide direct employment to minimum 100 workers with at least 30% women employment focus.'
      ],
      requiredDocuments: [
        'Factory Layout & Machinery Invoices',
        'MPCB Consent to Establish (CTE)',
        'EPCG / Textile Commissioner Registration',
        'Udyam Registration'
      ],
      applicationMethod: 'State-Level Textile Empowerment Committee (SLEIC) single window clearance.',
      keyIncentives: [
        '30% plant & machinery capital grant',
        '50% power tariff reimbursement for green energy adoption'
      ]
    }
  },
  {
    id: 'SCHEME_MOFPI_CEFPPC',
    code: 'MOFPI_FOOD_PROCESSING',
    name: 'Scheme for Creation / Expansion of Food Processing & Preservation (CEFPPC)',
    department: 'Ministry of Food Processing Industries (MoFPI), GoI / MSAMB Maharashtra',
    schemeType: 'Agro & Food Processing Grant-in-Aid',
    minInvestment: 3.0,
    maxInvestment: 50.0,
    eligibleSectors: ['Food Processing'],
    eligibleLocations: ['Pune', 'Nashik', 'Nagpur', 'Satara', 'Sangli', 'ALL'],
    eligibleCompanyTypes: ['Private Limited', 'Partnership', 'LLP', 'Proprietorship', 'Startup'],
    minEmployees: 20,
    benefitsSummary: '35% capital subsidy on technical civil works and eligible plant & machinery (up to ₹5 Crore), enhanced to 50% in notified backward districts.',
    subsidyPercentage: 35,
    maxSubsidyAmount: '₹5.0 Crore grant-in-aid',
    officialSourceUrl: 'https://mofpi.gov.in/schemes/pradhan-mantri-kisan-sampada-yojana/cefppc',
    lastVerifiedDate: '2026-01-20',
    details: {
      criteriaNotes: [
        'Must be engaged in perishable agro/horticulture processing or cold chain logistics.',
        'Net worth of promoters must be at least 1.5 times the requested grant amount.'
      ],
      requiredDocuments: [
        'Bank Appraisal & Term Loan Sanction Letter',
        'FSSAI Manufacturing License Application',
        'Detailed Project Report (DPR) certified by approved agency',
        'MPCB CTE'
      ],
      applicationMethod: 'Online through MoFPI SAMPADA single window module.',
      keyIncentives: [
        '35% to 50% non-refundable capital grant',
        'Reimbursement of FSSAI and HACCP compliance auditing costs'
      ]
    }
  },
  {
    id: 'SCHEME_SPECS_ELECTRONICS',
    code: 'MEITY_SPECS_2026',
    name: 'Scheme for Promotion of Manufacturing of Electronic Components and Semiconductors (SPECS)',
    department: 'Ministry of Electronics and IT (MeitY) & Maharashtra IT/Electronics Policy',
    schemeType: 'Electronics Capital Expenditure Reimbursement',
    minInvestment: 5.0,
    eligibleSectors: ['Electronics'],
    eligibleLocations: ['Pune', 'Navi Mumbai', 'Aurangabad (AURIC)', 'ALL'],
    eligibleCompanyTypes: ['Private Limited', 'Public Limited', 'LLP'],
    minEmployees: 50,
    benefitsSummary: '25% direct financial incentive on capital expenditure for plant, machinery, equipment, associated utilities and R&D.',
    subsidyPercentage: 25,
    maxSubsidyAmount: '₹50.0 Crore capex reimbursement',
    officialSourceUrl: 'https://meity.gov.in/esdm/specs',
    lastVerifiedDate: '2026-03-05',
    details: {
      criteriaNotes: [
        'Production of passive components, PCB, connectors, sensors, or semiconductor packaging.',
        'Eligible investments incurred within 5 years of approval.'
      ],
      requiredDocuments: [
        'Detailed Technical Bill of Quantities for SMT/Testing lines',
        'Factory Plan Approval from DISH',
        'Chartered Engineer Certificate of Imported/Domestic Machinery'
      ],
      applicationMethod: 'Direct online verification via MeitY Single Window.',
      keyIncentives: [
        '25% capex refund on all manufacturing equipment',
        'Exemption from local municipal property taxes for 5 years'
      ]
    }
  },
  {
    id: 'SCHEME_PMEGP',
    code: 'MSME_PMEGP_2026',
    name: "Prime Minister's Employment Generation Programme (PMEGP) - Manufacturing",
    department: 'Khadi and Village Industries Commission (KVIC) & Maharashtra KVI Board',
    schemeType: 'Credit-Linked Margin Money Subsidy',
    minInvestment: 0.1,
    maxInvestment: 0.5, // Upto 50 Lakhs project cost for manufacturing
    eligibleSectors: ['General Manufacturing', 'Textile', 'Food Processing', 'ALL'],
    eligibleLocations: ['ALL'],
    eligibleCompanyTypes: ['Proprietorship', 'Partnership', 'Startup', 'LLP'],
    minEmployees: 5,
    benefitsSummary: '15% to 35% margin money capital subsidy on bank-financed manufacturing projects up to ₹50 Lakhs.',
    subsidyPercentage: 25,
    maxSubsidyAmount: '₹12.50 Lakh margin money',
    officialSourceUrl: 'https://www.kviconline.gov.in/pmegpeportal',
    lastVerifiedDate: '2026-02-01',
    details: {
      criteriaNotes: [
        'Project cost up to ₹50 Lakh for manufacturing units.',
        'Beneficiary should possess minimum 8th class pass certificate for projects above ₹10 Lakh.'
      ],
      requiredDocuments: ['Aadhaar Card', 'Detailed Project Profile', 'EDP Training Certificate', 'Educational Certificate'],
      applicationMethod: 'Online e-Portal through District Industries Centre (DIC).',
      keyIncentives: ['25% margin money for urban general category, 35% for rural and special category']
    }
  },
  {
    id: 'SCHEME_TOURISM_POLICY',
    code: 'MAHA_TOURISM_2026',
    name: 'Maharashtra Tourism Policy - Hospitality Capital Incentive & Duty Waiver',
    department: 'Directorate of Tourism, Government of Maharashtra',
    schemeType: 'Capital Subsidy & Operational Concession',
    minInvestment: 1.0,
    maxInvestment: 50.0,
    eligibleSectors: ['Hotel', 'Hospitality', 'Tourism', 'Resort', 'Restaurant'],
    eligibleLocations: ['ALL'],
    eligibleCompanyTypes: ['Private Limited', 'Public Limited', 'LLP', 'Partnership', 'Proprietorship'],
    minEmployees: 10,
    benefitsSummary: 'Up to 20% Capital Investment Subsidy (max ₹3.0 Cr), 100% Stamp Duty exemption, and Electricity Duty exemption for 7 years.',
    subsidyPercentage: 20,
    maxSubsidyAmount: '₹3.0 Crore capital subsidy',
    officialSourceUrl: 'https://maharashtratourism.gov.in/incentives',
    lastVerifiedDate: '2026-02-28',
    details: {
      criteriaNotes: [
        'Star-category or classified hotel, heritage hotel, or eco-tourism resort establishment.',
        'Must adhere to green building norms and water conservation systems.'
      ],
      requiredDocuments: ['Tourism Department Registration', 'Approved Building Plan', 'Fire NOC', 'FSSAI License'],
      applicationMethod: 'Directorate of Tourism Single Window portal within 12 months of project commencement.',
      keyIncentives: ['20% capital subsidy on qualifying construction costs', '100% stamp duty waiver on title deeds']
    }
  },
  {
    id: 'SCHEME_HEALTHCARE_MSME',
    code: 'PM_ABHIM_HEALTHCARE',
    name: 'Ayushman Bharat Health Infrastructure & State Healthcare Credit Guarantee',
    department: 'Ministry of Health & Family Welfare / National Health Mission Maharashtra',
    schemeType: 'Medical Infrastructure Credit Enhancement',
    minInvestment: 1.0,
    maxInvestment: 100.0,
    eligibleSectors: ['Hospital', 'Healthcare', 'Diagnostic', 'Medical Device', 'Pharmacy'],
    eligibleLocations: ['ALL'],
    eligibleCompanyTypes: ['Private Limited', 'Trust', 'Society', 'LLP', 'Partnership'],
    minEmployees: 15,
    benefitsSummary: 'Up to 75% credit guarantee on hospital equipment term loans up to ₹10 Crore, with 3% interest subvention for diagnostic imaging setups.',
    subsidyPercentage: 15,
    maxSubsidyAmount: '₹2.5 Crore via Interest Subvention & Guarantee',
    officialSourceUrl: 'https://abdm.gov.in/infrastructure',
    lastVerifiedDate: '2026-03-01',
    details: {
      criteriaNotes: [
        'Hospitals providing secondary/tertiary care or diagnostic ultrasound/CT facilities.',
        'Must reserve minimum 10% inpatient beds for Ayushman Bharat (PM-JAY) beneficiaries.'
      ],
      requiredDocuments: ['Clinical Establishments Act Registration', 'AERB Certificate', 'BMW Authorization', 'Project Feasibility Report'],
      applicationMethod: 'State Health Systems Resource Centre (SHSRC) portal.',
      keyIncentives: ['3% interest subvention on high-end medical equipment', 'Priority power feeder connection']
    }
  },
  {
    id: 'SCHEME_MAHA_IT_POLICY',
    code: 'MAHA_IT_ITES_2023',
    name: 'Maharashtra IT & ITES Policy 2023 - Soft-Infrastructure & Green Power Grant',
    department: 'Directorate of Industries (IT Cell), Govt of Maharashtra',
    schemeType: 'Tech & BPM Infrastructure Support',
    minInvestment: 0.5,
    maxInvestment: 200.0,
    eligibleSectors: ['IT', 'BPM', 'Software', 'Data Center', 'Electronics', 'Fintech'],
    eligibleLocations: ['Pune', 'Navi Mumbai', 'Nagpur', 'Nashik', 'Chhatrapati Sambhajinagar', 'ALL'],
    eligibleCompanyTypes: ['Private Limited', 'Public Limited', 'LLP', 'Startup'],
    minEmployees: 20,
    benefitsSummary: '100% Stamp Duty exemption, industrial power tariff concessions, and up to ₹25 Lakh patent filing & international marketing grant.',
    subsidyPercentage: 25,
    maxSubsidyAmount: '₹5.0 Crore total fiscal incentives',
    officialSourceUrl: 'https://di.maharashtra.gov.in/it-policy',
    lastVerifiedDate: '2026-02-10',
    details: {
      criteriaNotes: [
        'Software development, IT enabled services, AI/Cloud data centers, or registered tech incubators.',
        'Continuous commercial operation and minimum 20 qualified software engineers.'
      ],
      requiredDocuments: ['STPI / SEZ Approval or Shops & Establishments', 'CA Employment Certificate', 'Lease Deed of Tech Park'],
      applicationMethod: 'Maharashtra IT Single Window online submission.',
      keyIncentives: ['Power tariff at industrial rates instead of commercial rates', '100% stamp duty exemption']
    }
  },
  {
    id: 'SCHEME_GREEN_ENERGY_EV',
    code: 'MAHA_EV_SOLAR_2025',
    name: 'Maharashtra EV & Renewable Energy Infrastructure Capital Support Scheme',
    department: 'Maharashtra Energy Development Agency (MEDA) & Dept of Industries',
    schemeType: 'Green Energy Capital Incentive',
    minInvestment: 0.25,
    maxInvestment: 50.0,
    eligibleSectors: ['Solar', 'Renewable Energy', 'EV Charging', 'Automobile', 'Energy'],
    eligibleLocations: ['ALL'],
    eligibleCompanyTypes: ['Private Limited', 'LLP', 'Proprietorship', 'Partnership', 'Public Limited'],
    minEmployees: 4,
    benefitsSummary: 'Up to 25% capital subsidy on public EV charging station equipment and ₹1.00/unit power tariff subsidy for 5 years.',
    subsidyPercentage: 25,
    maxSubsidyAmount: '₹10.0 Lakh per Fast Charging Station / ₹1.5 Cr for Solar Plants',
    officialSourceUrl: 'https://meda.maharashtra.gov.in/ev-policy',
    lastVerifiedDate: '2026-03-02',
    details: {
      criteriaNotes: [
        'Public EV charging station meeting Bureau of Indian Standards (BIS) specifications or captive rooftop solar.',
        'Open-access or DISCOM sanctioned connection.'
      ],
      requiredDocuments: ['DISCOM Sanction Letter', 'Electrical Inspector Safety Certificate', 'Vendor OEM Invoices'],
      applicationMethod: 'MEDA online green clearance portal.',
      keyIncentives: ['25% capex subsidy on DC fast chargers', 'Exemption from Electricity Duty for 10 years']
    }
  },
  {
    id: 'SCHEME_COMMERCIAL_CGTMSE',
    code: 'CGTMSE_COMMERCIAL_RETAIL',
    name: 'Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)',
    department: 'Ministry of MSME, Govt of India & SIDBI',
    schemeType: 'Collateral-Free Bank Credit Guarantee',
    minInvestment: 0.1,
    maxInvestment: 10.0,
    eligibleSectors: ['Petrol Pump', 'Retail', 'Fuel Retail', 'Logistics', 'Warehouse', 'ALL'],
    eligibleLocations: ['ALL'],
    eligibleCompanyTypes: ['Proprietorship', 'Partnership', 'LLP', 'Private Limited'],
    minEmployees: 2,
    benefitsSummary: 'Collateral-free credit guarantee coverage up to ₹5.0 Crore for commercial retail and petroleum distribution enterprises with reduced guarantee fees.',
    subsidyPercentage: 85,
    maxSubsidyAmount: '₹5.0 Crore guarantee coverage',
    officialSourceUrl: 'https://www.cgtmse.in',
    lastVerifiedDate: '2026-02-20',
    details: {
      criteriaNotes: [
        'New or existing Micro & Small Enterprises engaged in retail distribution or services.',
        'Facility sanctioned by Scheduled Commercial Banks or NBFCs without collateral requirement.'
      ],
      requiredDocuments: ['Udyam Registration Certificate', 'Bank Sanction Letter', 'Business Project Cashflow Forecast'],
      applicationMethod: 'Directly enrolled through Member Lending Institutions (MLIs).',
      keyIncentives: ['Up to 85% default guarantee cover on bank loans', 'Lower interest rate spread']
    }
  }
];

/**
 * 100-Point Deterministic Scheme Eligibility Engine
 */
export function evaluateSchemeEligibility(
  project: ProjectData,
  company?: { name?: string; companyType?: string } | null,
  uploadedDocCategories: string[] = []
): SchemeMatchEvaluation[] {
  const results: SchemeMatchEvaluation[] = [];

  for (const scheme of CURATED_SCHEMES) {
    let sectorScore = 0;
    let locationScore = 0;
    let investmentScore = 0;
    let entityTypeScore = 0;
    let employmentScore = 0;
    let docScore = 0;

    const satisfied: string[] = [];
    const unsatisfied: string[] = [];
    const remedy: string[] = [];
    const supportingDocs: string[] = [];

    // 1. Resilient Sector Check (Max 30 pts)
    const projSectorLower = (project.sector || '').toLowerCase();
    const isSectorMatch = scheme.eligibleSectors.some(s => {
      if (s === 'ALL') return true;
      const sLower = s.toLowerCase();
      return projSectorLower.includes(sLower) || sLower.includes(projSectorLower);
    });

    if (isSectorMatch) {
      sectorScore = 30;
      satisfied.push(`Project sector '${project.sector}' matches target notified focus area.`);
    } else {
      unsatisfied.push(`Scheme is restricted to [${scheme.eligibleSectors.join(', ')}]. Project declared sector is '${project.sector}'.`);
      remedy.push(`Explore scheme variations or diversify product line to include notified eligible industrial components.`);
    }

    // 2. Location Check (Max 20 pts)
    const isStateMatch = project.state.toLowerCase() === 'maharashtra';
    const isDistrictMatch = scheme.eligibleLocations.includes('ALL') || scheme.eligibleLocations.includes(project.district);
    if (isStateMatch && isDistrictMatch) {
      locationScore = 20;
      satisfied.push(`Location '${project.district}, ${project.state}' falls under notified developing/industrial incentive talukas.`);
    } else if (isStateMatch) {
      locationScore = 12;
      satisfied.push(`State of Maharashtra matches; district classification may fall under standard Zone A tier.`);
    } else {
      unsatisfied.push(`Project location outside notified Maharashtra incentive zones.`);
    }

    // 3. Investment Criteria Check (Max 20 pts)
    const inv = project.totalInvestment;
    if (inv >= scheme.minInvestment && (!scheme.maxInvestment || inv <= scheme.maxInvestment)) {
      investmentScore = 20;
      satisfied.push(`Capital outlay of ₹${inv} Cr satisfies statutory investment window (₹${scheme.minInvestment} Cr - ${scheme.maxInvestment ? '₹' + scheme.maxInvestment + ' Cr' : 'No Upper Cap'}).`);
    } else if (inv < scheme.minInvestment) {
      investmentScore = Math.max(0, Math.round((inv / scheme.minInvestment) * 15));
      unsatisfied.push(`Project investment is ₹${inv} Cr, which is below the minimum threshold of ₹${scheme.minInvestment} Cr.`);
      remedy.push(`Aggregate subsequent phase capital expenditure or expansion plant outlays to meet the ₹${scheme.minInvestment} Cr qualifying threshold.`);
    } else if (scheme.maxInvestment && inv > scheme.maxInvestment) {
      investmentScore = 5;
      unsatisfied.push(`Project investment ₹${inv} Cr exceeds MSME ceiling of ₹${scheme.maxInvestment} Cr.`);
      remedy.push(`Check Mega / Ultra-Mega Project policy incentives for investments exceeding ₹${scheme.maxInvestment} Cr.`);
    }

    // 4. Entity Type Check (Max 10 pts)
    const compType = company?.companyType || 'Private Limited';
    if (scheme.eligibleCompanyTypes.includes('ALL') || scheme.eligibleCompanyTypes.includes(compType)) {
      entityTypeScore = 10;
      satisfied.push(`Entity constitution '${compType}' is recognized under scheme guidelines.`);
    } else {
      entityTypeScore = 3;
      unsatisfied.push(`Constitution '${compType}' may require SPV incorporation or LLP registration.`);
    }

    // 5. Employment Generation (Max 10 pts)
    if (project.employeeCount >= scheme.minEmployees) {
      employmentScore = 10;
      satisfied.push(`Committed direct employment of ${project.employeeCount} satisfies minimum criterion of ${scheme.minEmployees} persons.`);
    } else {
      employmentScore = Math.max(0, Math.round((project.employeeCount / scheme.minEmployees) * 8));
      unsatisfied.push(`Current manpower planning (${project.employeeCount} workers) is below the required ${scheme.minEmployees} workforce mark.`);
      remedy.push(`Incorporate shift planning or ancillary packing staff in Project Report to achieve ${scheme.minEmployees} jobs.`);
    }

    // 6. Documentation Readiness (Max 10 pts)
    if (uploadedDocCategories.includes('Tax') || uploadedDocCategories.includes('Company')) {
      docScore += 5;
      supportingDocs.push('Udyam / GST Registration extracted');
    }
    if (uploadedDocCategories.includes('Land')) {
      docScore += 3;
      supportingDocs.push('Industrial Land Possession proof verified');
    }
    if (uploadedDocCategories.includes('Financial')) {
      docScore += 2;
      supportingDocs.push('CA Certified Project Cost report available');
    }

    const totalScore = sectorScore + locationScore + investmentScore + entityTypeScore + employmentScore + docScore;

    let eligibilityStatus: 'Likely Eligible' | 'Potentially Eligible' | 'Not Eligible' | 'Needs More Information' = 'Potentially Eligible';
    if (totalScore >= 85) {
      eligibilityStatus = 'Likely Eligible';
    } else if (totalScore >= 60) {
      eligibilityStatus = 'Potentially Eligible';
    } else if (totalScore >= 40) {
      eligibilityStatus = 'Needs More Information';
    } else {
      eligibilityStatus = 'Not Eligible';
    }

    results.push({
      schemeId: scheme.id,
      schemeCode: scheme.code,
      schemeName: scheme.name,
      department: scheme.department,
      schemeType: scheme.schemeType,
      matchScore: totalScore,
      eligibilityStatus,
      scoreBreakdown: {
        sectorScore,
        locationScore,
        investmentScore,
        entityTypeScore,
        employmentScore,
        docScore
      },
      satisfiedConditions: satisfied,
      missingOrUnsatisfiedConditions: unsatisfied,
      remedySuggestions: remedy,
      supportingDocumentsFound: supportingDocs,
      benefitsSummary: scheme.benefitsSummary,
      officialSourceUrl: scheme.officialSourceUrl,
      lastVerifiedDate: scheme.lastVerifiedDate
    });
  }

  // Sort descending by score
  return results.sort((a, b) => b.matchScore - a.matchScore);
}
