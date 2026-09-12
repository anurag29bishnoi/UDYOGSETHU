export interface BusinessCategoryDefinition {
  code: string;
  name: string;
  icon: string;
  description: string;
  sortOrder: number;
}

export interface BusinessTypeDefinition {
  code: string;
  name: string;
  categoryCode: string;
  description: string;
  icon: string;
  isHazardous: boolean;
  typicalInvestmentRange: string;
  governingActs: string;
  keywords: string[];
  isActive?: boolean;
  badgeText?: string;
  tagline?: string;
}

export interface DynamicQuestionDefinition {
  code: string;
  businessTypeCode?: string; // If undefined, generic for all
  questionText: string;
  helpText?: string;
  inputType: 'TEXT' | 'NUMBER' | 'SELECT' | 'BOOLEAN' | 'RADIO';
  options?: Array<{ label: string; value: string; triggersApprovalCode?: string }>;
  isRequired: boolean;
  dependsOnQuestionCode?: string;
  dependsOnAnswerValue?: string;
  sortOrder: number;
}

export interface DiscoveredRequirement {
  id: string;
  code: string;
  name: string;
  jurisdiction: 'CENTRAL' | 'STATE' | 'LOCAL' | 'SECTOR_SPECIFIC';
  department: string;
  authority: string;
  category: string;
  applicabilityReason: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  statutorySLA: number; // working days
  isInspectionRequired: boolean;
  isRenewalRequired: boolean;
  renewalFrequencyMonths: number;
  legalAct: string;
  requiredDocuments: Array<{
    name: string;
    category: string;
    isMandatory: boolean;
    description: string;
  }>;
  officialSource: string;
  lastVerified: string;
}

export interface KnowYourApprovalsResult {
  businessType: BusinessTypeDefinition;
  location: {
    state: string;
    district: string;
    cityOrTaluka: string;
    localAuthority?: string;
  };
  projectStage: string;
  totalRequirementsCount: number;
  requirementsByJurisdiction: {
    central: DiscoveredRequirement[];
    state: DiscoveredRequirement[];
    local: DiscoveredRequirement[];
    sectorSpecific: DiscoveredRequirement[];
  };
  allRequirements: DiscoveredRequirement[];
  mandatoryDocumentsList: Array<{
    name: string;
    category: string;
    usedForApprovals: string[];
  }>;
  estimatedTotalWorkingDays: number;
  parallelProcessingSavesDays: number;
  criticalPathSequence: string[];
  potentialGovernmentSchemes: Array<{
    name: string;
    department: string;
    benefitSummary: string;
    matchConfidence: string;
    maxSubsidy?: string;
  }>;
  smartRecommendations: Array<{
    category: 'LICENSING' | 'WATER_QUALITY' | 'LAYOUT_DESIGN' | 'WORKER_HYGIENE' | 'GOVERNMENT_SCHEME';
    title: string;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'RECOMMENDED';
    actionableStep: string;
  }>;
}

// 1. Curated Master Categories
export const MASTER_CATEGORIES: BusinessCategoryDefinition[] = [
  { code: 'PETROLEUM', name: 'Petroleum & Fuel Retail', icon: 'Fuel', description: 'Petrol pumps, retail outlets, CNG dispensing, and LPG storage', sortOrder: 1 },
  { code: 'HOSPITALITY', name: 'Hospitality & Food Services', icon: 'Hotel', description: 'Hotels, resorts, restaurants, cafes, and banquet facilities', sortOrder: 2 },
  { code: 'HEALTHCARE', name: 'Healthcare & Life Sciences', icon: 'HeartPulse', description: 'Hospitals, diagnostic clinics, pharmacies, and medical equipment', sortOrder: 3 },
  { code: 'MANUFACTURING', name: 'Industrial Manufacturing', icon: 'Factory', description: 'Textiles, heavy engineering, plastics, and consumer products', sortOrder: 4 },
  { code: 'FOOD_PROCESSING', name: 'Food & Agro Processing', icon: 'Apple', description: 'Dairy plants, cold storages, grain milling, and beverage packaging', sortOrder: 5 },
  { code: 'IT_BPM', name: 'Information Technology & BPM', icon: 'Cpu', description: 'Software companies, data centers, BPM, and electronics design', sortOrder: 6 },
  { code: 'AUTOMOTIVE', name: 'Automotive & EV Mobility', icon: 'Car', description: 'Vehicle manufacturing, auto components, and EV charging hubs', sortOrder: 7 },
  { code: 'PHARMACEUTICALS', name: 'Pharmaceuticals & Chemicals', icon: 'FlaskConical', description: 'Bulk drugs, formulations, specialty chemicals, and biotechnology', sortOrder: 8 },
  { code: 'LOGISTICS', name: 'Logistics & Warehousing', icon: 'Truck', description: 'Supply chain hubs, container freight stations, and distribution parks', sortOrder: 9 },
  { code: 'RETAIL', name: 'Retail & Commercial Trading', icon: 'ShoppingBag', description: 'Supermarkets, departmental stores, and commercial complexes', sortOrder: 10 },
  { code: 'ENERGY', name: 'Renewable & Solar Power', icon: 'SunMedium', description: 'Solar farms, wind power plants, and clean energy generation', sortOrder: 11 }
];

// 2. Curated Master Business Types
export const MASTER_BUSINESS_TYPES: BusinessTypeDefinition[] = [
  // ==========================================
  // ACTIVE FOCUS: FOOD & AGRO INDUSTRIAL VENTURES
  // ==========================================
  {
    code: 'FOOD_PROCESSING',
    name: 'Food Processing & Packaging Factory',
    categoryCode: 'FOOD_PROCESSING',
    description: 'Agro value addition, ready-to-eat snacks, spice processing, sauces, pickles, and automated food packaging.',
    icon: 'Apple',
    isHazardous: false,
    typicalInvestmentRange: '₹50 Lakhs - ₹15 Cr',
    governingActs: 'Food Safety and Standards Act 2006 (FSSAI), Legal Metrology Act 2009, Water & Air Pollution Acts, Factories Act 1948',
    keywords: ['food', 'processing', 'snacks', 'fssai', 'agro', 'spices', 'packaging', 'factory', 'pmfme', 'pmksy'],
    isActive: true,
    badgeText: 'LIVE ENGINE - FULL ACCESS',
    tagline: 'Complete FSSAI, NABL Water, Pollution, and MoFPI Subsidy Roadmap'
  },
  {
    code: 'RESTAURANT_CLOUD_KITCHEN',
    name: 'Restaurant, Commercial Eatery & Cloud Kitchen',
    categoryCode: 'FOOD_PROCESSING',
    description: 'Commercial dining establishment, quick service restaurant (QSR), delivery-only cloud kitchen, or catering commissary.',
    icon: 'Utensils',
    isHazardous: false,
    typicalInvestmentRange: '₹15 Lakhs - ₹2 Cr',
    governingActs: 'FSSAI Act 2006, Police Eating House License, Fire Prevention Act, Municipal Health Trade License',
    keywords: ['restaurant', 'cloud kitchen', 'cafe', 'kitchen', 'food delivery', 'qsr', 'eatery', 'fssai', 'catering'],
    isActive: true,
    badgeText: 'LIVE ENGINE - FULL ACCESS',
    tagline: 'FSSAI Food License, Health Trade NOC, Fire Manifold & Food Hygiene'
  },
  {
    code: 'DAIRY_PROCESSING',
    name: 'Dairy & Milk Processing Plant',
    categoryCode: 'FOOD_PROCESSING',
    description: 'Milk chilling, pasteurization, packaging, and manufacturing of paneer, curd, cheese, ghee, and dairy products.',
    icon: 'Apple',
    isHazardous: false,
    typicalInvestmentRange: '₹1 Cr - ₹25 Cr',
    governingActs: 'FSSAI Act 2006 (Dairy Regulations), State Pollution Control Board Effluent Rules, Factories Act 1948',
    keywords: ['dairy', 'milk', 'pasteurization', 'paneer', 'curd', 'ghee', 'cheese', 'fssai', 'cold chain'],
    isActive: true,
    badgeText: 'LIVE ENGINE - FULL ACCESS',
    tagline: 'High-Volume Dairy FSSAI Central/State Licensing, ETP & Cold Chain Subsidy'
  },
  {
    code: 'COLD_STORAGE_AGRO',
    name: 'Agro Cold Storage & Perishable Logistics',
    categoryCode: 'FOOD_PROCESSING',
    description: 'Multi-chamber controlled atmosphere cold storage for fruits, vegetables, seeds, dairy, and cold chain distribution.',
    icon: 'Truck',
    isHazardous: false,
    typicalInvestmentRange: '₹2 Cr - ₹30 Cr',
    governingActs: 'MoFPI Cold Chain Guidelines, State Agricultural Marketing Board, Energy Conservation Building Code',
    keywords: ['cold storage', 'warehouse', 'refrigerated', 'ripening', 'agro logistics', 'pmksy', 'mofpi', 'perishable'],
    isActive: true,
    badgeText: 'LIVE ENGINE - FULL ACCESS',
    tagline: 'MoFPI Cold Chain ₹10 Cr Capital Grant, Refrigerant Safety & MIDC Approval'
  },
  {
    code: 'BAKERY_CONFECTIONERY',
    name: 'Bakery, Sweets & Snacks Manufacturing',
    categoryCode: 'FOOD_PROCESSING',
    description: 'Industrial automated bakery for bread, biscuits, cakes, traditional Indian sweets, and extruded namkeen snacks.',
    icon: 'Apple',
    isHazardous: false,
    typicalInvestmentRange: '₹25 Lakhs - ₹8 Cr',
    governingActs: 'FSSAI Act 2006, Legal Metrology (Packaged Commodities) Rules 2011, DISH Factory Rules',
    keywords: ['bakery', 'biscuit', 'bread', 'sweets', 'confectionery', 'namkeen', 'packaged snacks', 'fssai'],
    isActive: true,
    badgeText: 'LIVE ENGINE - FULL ACCESS',
    tagline: 'FSSAI License, LMPC Packaging Certification, Oven Fire Safety & PMFME 35% Grant'
  },
  {
    code: 'BEVERAGE_WATER_UNIT',
    name: 'Packaged Drinking Water & Beverage Bottling',
    categoryCode: 'FOOD_PROCESSING',
    description: 'Reverse osmosis mineral water treatment, automated blow molding bottling line, fruit juices, and carbonated beverages.',
    icon: 'GlassWater',
    isHazardous: false,
    typicalInvestmentRange: '₹50 Lakhs - ₹10 Cr',
    governingActs: 'BIS IS 14543 / IS 13428 Certification, FSSAI Central/State License, CGWA Groundwater Clearance',
    keywords: ['packaged water', 'mineral water', 'beverage', 'juice', 'bottling', 'bis', 'isi mark', 'cgwa', 'fssai'],
    isActive: true,
    badgeText: 'LIVE ENGINE - FULL ACCESS',
    tagline: 'BIS Certification (ISI Mark), FSSAI Central License, CGWA Groundwater NOC & MPCB'
  },

  // ==========================================
  // PHASE 2 ROLLOUT (COMING SOON)
  // ==========================================
  {
    code: 'PETROL_PUMP',
    name: 'Petrol Pump / Retail Fuel Outlet',
    categoryCode: 'PETROLEUM',
    description: 'Retail dispensing station for Motor Spirit (Petrol), High Speed Diesel (HSD), and optional CNG or EV points.',
    icon: 'Fuel',
    isHazardous: true,
    typicalInvestmentRange: '₹1.5 Cr - ₹4.5 Cr',
    governingActs: 'Petroleum Act 1934, Petroleum Rules 2002, Explosives Act 1884, Legal Metrology Act 2009',
    keywords: ['petrol', 'pump', 'diesel', 'fuel', 'gas station', 'iocl', 'bpcl', 'hpcl', 'nayara', 'shell', 'peso'],
    isActive: false,
    badgeText: 'COMING SOON (Phase 2)'
  },
  {
    code: 'HOTEL',
    name: 'Hotel & Hospitality Resort',
    categoryCode: 'HOSPITALITY',
    description: 'Commercial lodging establishment with guest rooms, in-house dining restaurant, banquet hall, and amenities.',
    icon: 'Hotel',
    isHazardous: false,
    typicalInvestmentRange: '₹3 Cr - ₹25 Cr',
    governingActs: 'Sarais Act 1867, FSSAI Act 2006, State Police Act, State Fire Prevention Act, Local Municipal Corporation Act',
    keywords: ['hotel', 'resort', 'motel', 'lodging', 'rooms', 'hospitality', 'restaurant', 'bar'],
    isActive: false,
    badgeText: 'COMING SOON (Phase 2)'
  },
  {
    code: 'HOSPITAL',
    name: 'Multi-Specialty Hospital / Nursing Home',
    categoryCode: 'HEALTHCARE',
    description: 'Healthcare institution providing specialized medical, surgical, diagnostic radiology, in-patient care, and 24x7 pharmacy.',
    icon: 'HeartPulse',
    isHazardous: true,
    typicalInvestmentRange: '₹5 Cr - ₹50 Cr',
    governingActs: 'Clinical Establishments Act 2010, Bio-Medical Waste Management Rules 2016, Atomic Energy Act 1962 (AERB), Drugs & Cosmetics Act 1940',
    keywords: ['hospital', 'clinic', 'nursing home', 'medical', 'diagnostic', 'health', 'biomedical', 'aerb'],
    isActive: false,
    badgeText: 'COMING SOON (Phase 2)'
  },
  {
    code: 'TEXTILE_FACTORY',
    name: 'Textile & Technical Fabrics Factory',
    categoryCode: 'MANUFACTURING',
    description: 'Industrial manufacturing facility for yarn spinning, fabric weaving, wet dyeing, and technical garment production.',
    icon: 'Factory',
    isHazardous: false,
    typicalInvestmentRange: '₹10 Cr - ₹75 Cr',
    governingActs: 'Factories Act 1948, Water & Air Pollution Control Acts, State Boiler Regulations, Industrial Disputes Act',
    keywords: ['textile', 'fabric', 'garment', 'spinning', 'weaving', 'dyeing', 'cotton', 'factory', 'midc'],
    isActive: false,
    badgeText: 'COMING SOON (Phase 2)'
  },
  {
    code: 'IT_COMPANY',
    name: 'IT / Software Services & BPM Hub',
    categoryCode: 'IT_BPM',
    description: 'Technology center for enterprise software engineering, cloud solutions, data processing, and 24x7 client support operations.',
    icon: 'Cpu',
    isHazardous: false,
    typicalInvestmentRange: '₹50 Lakhs - ₹10 Cr',
    governingActs: 'Information Technology Act 2000, State Shops & Commercial Establishments Act, STPI / SEZ Scheme Guidelines',
    keywords: ['it', 'software', 'tech', 'saas', 'bpm', 'bpo', 'stpi', 'cloud', 'data center'],
    isActive: false,
    badgeText: 'COMING SOON (Phase 2)'
  },
  {
    code: 'AUTO_COMPONENTS',
    name: 'Precision Auto Components Unit',
    categoryCode: 'AUTOMOTIVE',
    description: 'Machining, stamping, casting, and assembly of transmission, chassis, and electronic powertrain assemblies.',
    icon: 'Car',
    isHazardous: false,
    typicalInvestmentRange: '₹5 Cr - ₹35 Cr',
    governingActs: 'Factories Act 1948, State Industrial Policy, Central Motor Vehicles Rules (CMVR)',
    keywords: ['automobile', 'auto parts', 'ev', 'components', 'metal', 'casting', 'machinery'],
    isActive: false,
    badgeText: 'COMING SOON (Phase 2)'
  },
  {
    code: 'PHARMACEUTICAL',
    name: 'Pharmaceutical Formulations & API Facility',
    categoryCode: 'PHARMACEUTICALS',
    description: 'Active Pharmaceutical Ingredients (API) synthesis, sterile injectables, tablet formulations, and bio-tech manufacturing.',
    icon: 'FlaskConical',
    isHazardous: true,
    typicalInvestmentRange: '₹15 Cr - ₹100 Cr',
    governingActs: 'Drugs and Cosmetics Act 1940, Good Manufacturing Practices (Schedule M), Environmental Protection Act 1986',
    keywords: ['pharma', 'medicine', 'api', 'drugs', 'chemical', 'biotech', 'cdsco', 'who-gmp'],
    isActive: false,
    badgeText: 'COMING SOON (Phase 2)'
  },
  {
    code: 'SOLAR_PROJECT',
    name: 'Ground-Mounted / Rooftop Solar Plant',
    categoryCode: 'ENERGY',
    description: 'Grid-connected photovoltaic renewable power installation for captive industrial consumption or net metering feed-in.',
    icon: 'SunMedium',
    isHazardous: false,
    typicalInvestmentRange: '₹1 Cr - ₹15 Cr',
    governingActs: 'Electricity Act 2003, State Renewable Energy Policy, Central Electricity Authority (CEA) Technical Standards',
    keywords: ['solar', 'energy', 'power', 'renewable', 'pv', 'net metering'],
    isActive: false,
    badgeText: 'COMING SOON (Phase 2)'
  },
  {
    code: 'EV_CHARGING',
    name: 'Commercial EV Fast-Charging Station',
    categoryCode: 'AUTOMOTIVE',
    description: 'Public electric vehicle multi-gun DC fast-charging hub with dedicated HT electrical step-down transformer.',
    icon: 'Zap',
    isHazardous: false,
    typicalInvestmentRange: '₹25 Lakhs - ₹1.5 Cr',
    governingActs: 'Ministry of Power Guidelines for EV Charging Infrastructure 2022, State DISCOM Open Access Regulations',
    keywords: ['ev', 'charging', 'electric vehicle', 'dc charger', 'mobility'],
    isActive: false,
    badgeText: 'COMING SOON (Phase 2)'
  }
];

// 3. Dynamic Questionnaire Definitions
export const DYNAMIC_QUESTIONS: Record<string, DynamicQuestionDefinition[]> = {
  PETROL_PUMP: [
    {
      code: 'PETROL_LOI_STATUS',
      questionText: 'Do you hold a Letter of Intent (LOI) from an authorized Oil Marketing Company (OMC)?',
      helpText: 'Official allotment letter from IOCL, BPCL, HPCL, Nayara Energy, or Reliance Petroleum.',
      inputType: 'SELECT',
      options: [
        { label: 'Yes, LOI is sanctioned and in hand', value: 'LOI_RECEIVED' },
        { label: 'Under bidding / dealer selection process', value: 'IN_PROCESS' },
        { label: 'Private / commercial proposal without OMC', value: 'INDEPENDENT' }
      ],
      isRequired: true,
      sortOrder: 1
    },
    {
      code: 'PETROL_LAND_LOCATION_TYPE',
      questionText: 'What is the classification of the road frontage on your proposed plot?',
      helpText: 'Determines whether NHAI Access Permission or State PWD Highway NOC applies.',
      inputType: 'SELECT',
      options: [
        { label: 'National Highway (NHAI jurisdiction)', value: 'NATIONAL_HIGHWAY', triggersApprovalCode: 'NHAI_ACCESS_NOC' },
        { label: 'State Highway (State PWD jurisdiction)', value: 'STATE_HIGHWAY', triggersApprovalCode: 'PWD_ACCESS_NOC' },
        { label: 'Major District Road (MDR / Zilla Parishad)', value: 'DISTRICT_ROAD', triggersApprovalCode: 'ZP_ROAD_NOC' },
        { label: 'Municipal Corporation / City Urban Road', value: 'CITY_ROAD', triggersApprovalCode: 'MUNICIPAL_NOC' }
      ],
      isRequired: true,
      sortOrder: 2
    },
    {
      code: 'PETROL_STORAGE_CAPACITY_KL',
      questionText: 'What is the total planned underground petroleum storage capacity (in Kilolitres)?',
      helpText: 'Standard retail outlet tanks store 20 KL to 70 KL of Class A/B petroleum fuels.',
      inputType: 'NUMBER',
      isRequired: true,
      sortOrder: 3
    },
    {
      code: 'PETROL_HAS_CNG',
      questionText: 'Will this outlet include a Compressed Natural Gas (CNG) dispensing facility?',
      helpText: 'Triggers Gas Cylinders Rules and cascade safety distance compliance.',
      inputType: 'BOOLEAN',
      isRequired: false,
      sortOrder: 4
    },
    {
      code: 'PETROL_DISPENSER_COUNT',
      questionText: 'How many Multi-Product Fuel Dispensers (MPDs) will be installed?',
      helpText: 'Each dispensing nozzle requires verification and calibration stamping under Legal Metrology Act.',
      inputType: 'NUMBER',
      isRequired: true,
      sortOrder: 5
    }
  ],

  HOTEL: [
    {
      code: 'HOTEL_ROOM_COUNT',
      questionText: 'How many total guest lodging rooms will be built/operated?',
      helpText: 'Hotels with >20 rooms trigger structured commercial fire audit and Sarai Act registration.',
      inputType: 'NUMBER',
      isRequired: true,
      sortOrder: 1
    },
    {
      code: 'HOTEL_SERVES_ALCOHOL',
      questionText: 'Will the hotel serve alcoholic beverages in the bar, restaurant, or room service?',
      helpText: 'Mandates State Excise Department FL-III Hotel / Restaurant Liquor License.',
      inputType: 'BOOLEAN',
      isRequired: true,
      sortOrder: 2
    },
    {
      code: 'HOTEL_HAS_RESTAURANT',
      questionText: 'Will you operate an in-house commercial kitchen / restaurant?',
      helpText: 'Requires FSSAI Food Safety & Standards Authority License.',
      inputType: 'BOOLEAN',
      isRequired: true,
      sortOrder: 3
    },
    {
      code: 'HOTEL_HAS_SWIMMING_POOL',
      questionText: 'Will the premises feature a recreational swimming pool?',
      helpText: 'Requires Local Municipal Health Trade & Lifeguard Safety Clearance.',
      inputType: 'BOOLEAN',
      isRequired: false,
      sortOrder: 4
    },
    {
      code: 'HOTEL_PLAYS_MUSIC',
      questionText: 'Will pre-recorded or live music be played in common areas or banquets?',
      helpText: 'Triggers statutory copyright performance licenses (PPL & IPRS).',
      inputType: 'BOOLEAN',
      isRequired: false,
      sortOrder: 5
    }
  ],

  HOSPITAL: [
    {
      code: 'HOSP_BED_COUNT',
      questionText: 'What is the total planned in-patient bed capacity?',
      helpText: 'Institutions with ≥50 beds fall under stricter biomedical and effluent scrutiny.',
      inputType: 'NUMBER',
      isRequired: true,
      sortOrder: 1
    },
    {
      code: 'HOSP_HAS_RADIOLOGY',
      questionText: 'Will the facility operate diagnostic radiology (X-Ray, CT Scan, Mammography, Cath Lab)?',
      helpText: 'Mandates Atomic Energy Regulatory Board (AERB) site layout & equipment registration.',
      inputType: 'BOOLEAN',
      isRequired: true,
      sortOrder: 2
    },
    {
      code: 'HOSP_BIOMEDICAL_WASTE_KG',
      questionText: 'Estimated daily bio-medical waste generation (in Kg/day)?',
      helpText: 'Requires authorization under Bio-Medical Waste Rules and formal tie-up with Common CBMWTF operator.',
      inputType: 'NUMBER',
      isRequired: true,
      sortOrder: 3
    },
    {
      code: 'HOSP_HAS_PHARMACY',
      questionText: 'Will you operate an in-house retail medical pharmacy?',
      helpText: 'Requires Drug Control Department Form 20 & 21 Chemist License.',
      inputType: 'BOOLEAN',
      isRequired: true,
      sortOrder: 4
    },
    {
      code: 'HOSP_HAS_BLOOD_BANK',
      questionText: 'Will an in-house Blood Bank or Blood Storage Centre be operated?',
      helpText: 'Requires Central Drugs Standard Control Organisation (CDSCO) & State FDA joint sanction.',
      inputType: 'BOOLEAN',
      isRequired: false,
      sortOrder: 5
    }
  ],

  IT_COMPANY: [
    {
      code: 'IT_EXPORT_ORIENTATION',
      questionText: 'Are software engineering services predominantly export-oriented (foreign currency revenue)?',
      helpText: 'Qualifies for Software Technology Parks of India (STPI) or Special Economic Zone (SEZ) benefits.',
      inputType: 'BOOLEAN',
      isRequired: true,
      sortOrder: 1
    },
    {
      code: 'IT_OFFICE_TYPE',
      questionText: 'What is the physical office setup?',
      inputType: 'SELECT',
      options: [
        { label: 'Commercial IT Park (Built-up space)', value: 'IT_PARK' },
        { label: 'Standalone commercial building', value: 'COMMERCIAL_BUILDING' },
        { label: 'Co-working shared office / Virtual office', value: 'COWORKING' }
      ],
      isRequired: true,
      sortOrder: 2
    },
    {
      code: 'IT_NIGHT_SHIFTS',
      questionText: 'Will employees work in 24x7 shifts or night shifts?',
      helpText: 'Requires statutory Night Shift Exemption under State Shops & Establishments Act.',
      inputType: 'BOOLEAN',
      isRequired: true,
      sortOrder: 3
    }
  ],

  TEXTILE_FACTORY: [
    {
      code: 'TEXTILE_PROCESS_TYPE',
      questionText: 'What industrial operations are conducted on site?',
      inputType: 'SELECT',
      options: [
        { label: 'Dry Operations (Spinning, Weaving, Garment Stitching)', value: 'DRY' },
        { label: 'Wet Operations (Bleaching, Dyeing, Chemical Printing)', value: 'WET' },
        { label: 'Integrated Composite Mill (Both Dry & Wet Processing)', value: 'COMPOSITE' }
      ],
      isRequired: true,
      sortOrder: 1
    },
    {
      code: 'TEXTILE_HAS_BOILER',
      questionText: 'Does the plant utilize industrial steam boilers or thermic fluid heaters?',
      helpText: 'Mandates Indian Boiler Regulations (IBR) sanction from the Directorate of Steam Boilers.',
      inputType: 'BOOLEAN',
      isRequired: true,
      sortOrder: 2
    }
  ]
};

/**
 * Universal Know Your Approvals (KYA) Engine
 * Evaluates business category, location, and dynamic answers to produce complete statutory roadmap.
 */
export function discoverBusinessRequirements(
  businessTypeCode: string,
  location: { state: string; district: string; cityOrTaluka: string; localAuthority?: string },
  projectStage: string = 'Planning',
  answers: Record<string, any> = {},
  investmentCr: number = 2,
  employeeCount: number = 15
): KnowYourApprovalsResult {
  const bType = MASTER_BUSINESS_TYPES.find(b => b.code === businessTypeCode) || MASTER_BUSINESS_TYPES[0];

  const centralReqs: DiscoveredRequirement[] = [];
  const stateReqs: DiscoveredRequirement[] = [];
  const localReqs: DiscoveredRequirement[] = [];
  const sectorReqs: DiscoveredRequirement[] = [];

  // ==========================================
  // 1. PETROL PUMP SPECIFIC REQUIREMENTS
  // ==========================================
  if (bType.code === 'PETROL_PUMP') {
    // CENTRAL: PESO
    centralReqs.push({
      id: 'REQ_PESO_XIV',
      code: 'PESO_FORM_XIV',
      name: 'PESO Petroleum Storage License (Form XIV)',
      jurisdiction: 'CENTRAL',
      department: 'Petroleum and Explosives Safety Organisation (PESO)',
      authority: 'Department for Promotion of Industry and Internal Trade (DPIIT), Govt of India',
      category: 'PETROLEUM_SAFETY',
      applicabilityReason: `Mandatory under Section 4 of Petroleum Act 1934 for underground fuel storage tanks (${answers.PETROL_STORAGE_CAPACITY_KL || 40} KL).`,
      priority: 'CRITICAL',
      statutorySLA: 30,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 36,
      legalAct: 'Petroleum Rules 2002, Rules 141 & 144',
      requiredDocuments: [
        { name: 'PESO Approved Layout Plan', category: 'TECHNICAL_DRAWING', isMandatory: true, description: 'CAD drawing showing safety distances and dispenser islands' },
        { name: 'Tank Fabrication & Hydrostatic Test Certificate', category: 'TECHNICAL_CERTIFICATE', isMandatory: true, description: 'Issued by approved competent inspector' },
        { name: 'District Magistrate (DM) No Objection Certificate', category: 'GOVERNMENT_NOC', isMandatory: true, description: 'Under Rule 144 of Petroleum Rules' }
      ],
      officialSource: 'https://peso.gov.in',
      lastVerified: '2026-03-01'
    });

    // LOCAL: District Magistrate NOC (Rule 144)
    localReqs.push({
      id: 'REQ_DM_NOC_144',
      code: 'DM_NOC_PETROL',
      name: 'District Magistrate / Collector No Objection Certificate',
      jurisdiction: 'LOCAL',
      department: 'Office of the District Magistrate & District Police',
      authority: 'Revenue & Home Department, Govt of ' + location.state,
      category: 'LOCAL_AUTHORITY',
      applicabilityReason: 'Statutory prerequisite under Rule 144 of Petroleum Rules 2002. DM coordinates police, PWD, and revenue clearances.',
      priority: 'CRITICAL',
      statutorySLA: 60,
      isInspectionRequired: true,
      isRenewalRequired: false,
      renewalFrequencyMonths: 0,
      legalAct: 'Petroleum Rules 2002, Rule 144',
      requiredDocuments: [
        { name: 'Land Ownership Document / Registered 30-Year Lease', category: 'LAND_TITLE', isMandatory: true, description: 'Registered conveyance deed or lease agreement' },
        { name: 'OMC Letter of Intent (LOI)', category: 'ALLOTMENT_LETTER', isMandatory: true, description: 'Official letter from IOCL/BPCL/HPCL' },
        { name: 'Site Boundary Survey & Revenue Demarcation Map', category: 'LAND_SURVEY', isMandatory: true, description: 'Certified by Taluka Inspector of Land Records (TILR)' }
      ],
      officialSource: 'District Collectorate Single Window',
      lastVerified: '2026-02-15'
    });

    // HIGHWAY ACCESS NOC (NHAI / PWD)
    if (answers.PETROL_LAND_LOCATION_TYPE === 'NATIONAL_HIGHWAY') {
      centralReqs.push({
        id: 'REQ_NHAI_ACCESS',
        code: 'NHAI_ACCESS_NOC',
        name: 'NHAI Highway Access & Deceleration Lane Permission',
        jurisdiction: 'CENTRAL',
        department: 'National Highways Authority of India (NHAI)',
        authority: 'Ministry of Road Transport and Highways (MoRTH)',
        category: 'HIGHWAY_ACCESS',
        applicabilityReason: 'Plot abuts National Highway. Mandatory access permission for acceleration/deceleration lane layout.',
        priority: 'HIGH',
        statutorySLA: 45,
        isInspectionRequired: true,
        isRenewalRequired: false,
        renewalFrequencyMonths: 0,
        legalAct: 'Control of National Highways (Land and Traffic) Act 2002',
        requiredDocuments: [
          { name: 'Detailed Highway Access Engineering Drawing', category: 'TECHNICAL_DRAWING', isMandatory: true, description: 'IRC:12-2016 compliant entry/exit layout' },
          { name: 'Land Title & Highway Frontage Survey', category: 'LAND_TITLE', isMandatory: true, description: 'Minimum 35m frontage confirmation' }
        ],
        officialSource: 'https://morth.nic.in',
        lastVerified: '2026-01-20'
      });
    } else {
      stateReqs.push({
        id: 'REQ_PWD_ACCESS',
        code: 'PWD_ACCESS_NOC',
        name: 'State PWD Highway Access Permission',
        jurisdiction: 'STATE',
        department: 'Public Works Department (PWD)',
        authority: 'Government of ' + location.state,
        category: 'HIGHWAY_ACCESS',
        applicabilityReason: 'Plot fronts State Highway / Major District Road. PWD site access permission required before construction.',
        priority: 'HIGH',
        statutorySLA: 30,
        isInspectionRequired: true,
        isRenewalRequired: false,
        renewalFrequencyMonths: 0,
        legalAct: 'State Highways Act',
        requiredDocuments: [
          { name: 'PWD Access Layout Drawing', category: 'TECHNICAL_DRAWING', isMandatory: true, description: 'Geometric curve & buffer strip alignment' }
        ],
        officialSource: 'State PWD Portal',
        lastVerified: '2026-02-01'
      });
    }

    // STATE: Fire Safety NOC
    stateReqs.push({
      id: 'REQ_FIRE_PETROL',
      code: 'FIRE_NOC_PETROL',
      name: 'Fire & Rescue Services No Objection Certificate',
      jurisdiction: 'STATE',
      department: 'Directorate of Fire Services',
      authority: 'Home (Fire) Department, Govt of ' + location.state,
      category: 'FIRE_SAFETY',
      applicabilityReason: 'Flammable Class A/B petroleum storage requires approved static fire fighting equipment and foam dispensers.',
      priority: 'HIGH',
      statutorySLA: 21,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 12,
      legalAct: 'Fire Prevention and Life Safety Measures Act',
      requiredDocuments: [
        { name: 'Fire Fighting System Layout & Sand Bucket Plan', category: 'SAFETY_PLAN', isMandatory: true, description: 'Dry chemical powder extinguisher layout' }
      ],
      officialSource: 'State Fire Portal',
      lastVerified: '2026-02-10'
    });

    // SECTOR: Legal Metrology (Weights & Measures)
    sectorReqs.push({
      id: 'REQ_LEGAL_METROLOGY',
      code: 'LEGAL_METROLOGY_STAMPING',
      name: 'Legal Metrology Dispenser Stamping & Calibration',
      jurisdiction: 'SECTOR_SPECIFIC',
      department: 'Legal Metrology Organisation (Consumer Protection)',
      authority: 'Department of Food, Civil Supplies and Consumer Protection',
      category: 'LEGAL_METROLOGY',
      applicabilityReason: `Mandatory calibration verification for ${answers.PETROL_DISPENSER_COUNT || 4} fuel dispensing units prior to commercial retail sale.`,
      priority: 'CRITICAL',
      statutorySLA: 7,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 12,
      legalAct: 'Legal Metrology Act 2009, Section 24',
      requiredDocuments: [
        { name: 'Dispenser Flow Meter OEM Test Certificate', category: 'TECHNICAL_CERTIFICATE', isMandatory: true, description: 'Manufacturer seal verification' }
      ],
      officialSource: 'Legal Metrology Controllerate',
      lastVerified: '2026-01-15'
    });

    // STATE: Pollution SPCB
    stateReqs.push({
      id: 'REQ_SPCB_PETROL',
      code: 'SPCB_CTE_PETROL',
      name: 'State Pollution Control Board Consent (CTE/CTO)',
      jurisdiction: 'STATE',
      department: 'State Pollution Control Board',
      authority: 'Environment Department, Govt of ' + location.state,
      category: 'ENVIRONMENT',
      applicabilityReason: 'Installation of Vapor Recovery System (VRS Stage I & II) and DG backup sets under Orange Category.',
      priority: 'HIGH',
      statutorySLA: 21,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 60,
      legalAct: 'Water (Prevention and Control of Pollution) Act 1974',
      requiredDocuments: [
        { name: 'Vapor Recovery System (VRS) Compliance Report', category: 'ENVIRONMENTAL_REPORT', isMandatory: true, description: 'Stage I & II vapor balance installation' }
      ],
      officialSource: 'State Pollution Single Window',
      lastVerified: '2026-02-28'
    });
  }

  // ==========================================
  // 2. HOTEL SPECIFIC REQUIREMENTS
  // ==========================================
  else if (bType.code === 'HOTEL') {
    // LOCAL: Municipal Trade / Health License
    localReqs.push({
      id: 'REQ_MUNICIPAL_HOTEL',
      code: 'MUNICIPAL_HEALTH_TRADE',
      name: 'Municipal Corporation Health Trade & Lodging License',
      jurisdiction: 'LOCAL',
      department: 'Public Health Department, Local Municipal Corporation',
      authority: location.localAuthority || 'Municipal Corporation of ' + location.district,
      category: 'TRADE_LICENSE',
      applicabilityReason: `Required for operating commercial public lodging accommodation (${answers.HOTEL_ROOM_COUNT || 40} rooms).`,
      priority: 'CRITICAL',
      statutorySLA: 21,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 12,
      legalAct: 'Municipal Corporation Act / Sarai Act 1867',
      requiredDocuments: [
        { name: 'Sanctioned Building Completion Certificate (BCC)', category: 'BUILDING_SANCTION', isMandatory: true, description: 'Occupancy certificate issued by planning authority' },
        { name: 'Potable Water Bacteriological Test Certificate', category: 'TEST_REPORT', isMandatory: true, description: 'Lab report confirming water safety standards' }
      ],
      officialSource: 'Municipal Citizen Portal',
      lastVerified: '2026-02-18'
    });

    // STATE: Fire Safety Certificate
    stateReqs.push({
      id: 'REQ_FIRE_HOTEL',
      code: 'FIRE_SAFETY_HOTEL',
      name: 'Fire Safety Clearance & Final NOC',
      jurisdiction: 'STATE',
      department: 'Directorate of Fire & Emergency Services',
      authority: 'Home Department, Govt of ' + location.state,
      category: 'FIRE_SAFETY',
      applicabilityReason: 'Mandatory commercial hospitality fire protection audit: smoke detectors, wet risers, emergency staircases.',
      priority: 'CRITICAL',
      statutorySLA: 15,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 12,
      legalAct: 'Fire Prevention & Life Safety Act',
      requiredDocuments: [
        { name: 'Fire Hydrant & Evacuation Route Layout', category: 'SAFETY_PLAN', isMandatory: true, description: 'Architect-stamped fire layout drawing' }
      ],
      officialSource: 'State Fire Portal',
      lastVerified: '2026-02-10'
    });

    // SECTOR: FSSAI (If kitchen/restaurant)
    if (answers.HOTEL_HAS_RESTAURANT !== false) {
      sectorReqs.push({
        id: 'REQ_FSSAI_HOTEL',
        code: 'FSSAI_FOOD_LICENSE',
        name: 'FSSAI Food Business Operator (FBO) License',
        jurisdiction: 'SECTOR_SPECIFIC',
        department: 'Food Safety and Standards Authority of India',
        authority: 'Ministry of Health and Family Welfare, Govt of India',
        category: 'FOOD_SAFETY',
        applicabilityReason: 'Mandatory license for hotel restaurant, kitchen, food prep, and room service facilities.',
        priority: 'HIGH',
        statutorySLA: 15,
        isInspectionRequired: true,
        isRenewalRequired: true,
        renewalFrequencyMonths: 12,
        legalAct: 'Food Safety and Standards Act 2006',
        requiredDocuments: [
          { name: 'Kitchen Layout & Equipment List', category: 'TECHNICAL_DRAWING', isMandatory: true, description: 'Commercial kitchen ventilation & workflow plan' },
          { name: 'Food Handlers Medical Fitness Certificates', category: 'MEDICAL_CERTIFICATE', isMandatory: true, description: 'Fitness certification under Schedule 4' }
        ],
        officialSource: 'https://foscos.fssai.gov.in',
        lastVerified: '2026-02-25'
      });
    }

    // STATE: Liquor License (If serving alcohol)
    if (answers.HOTEL_SERVES_ALCOHOL) {
      stateReqs.push({
        id: 'REQ_EXCISE_FL3',
        code: 'EXCISE_FL_III_LICENSE',
        name: 'State Excise Hotel Bar & Liquor License (FL-III)',
        jurisdiction: 'STATE',
        department: 'State Excise Department',
        authority: 'Finance Department, Govt of ' + location.state,
        category: 'EXCISE_LICENSING',
        applicabilityReason: 'Required to possess, serve, and retail foreign liquor and beer to hotel guests and patrons.',
        priority: 'HIGH',
        statutorySLA: 30,
        isInspectionRequired: true,
        isRenewalRequired: true,
        renewalFrequencyMonths: 12,
        legalAct: 'State Prohibition & Excise Act',
        requiredDocuments: [
          { name: 'Dedicated Bar Enclosure Architectural Plan', category: 'TECHNICAL_DRAWING', isMandatory: true, description: 'Blueprint indicating demarcated serving lounge' },
          { name: 'Character & Antecedents Verification Certificate', category: 'IDENTITY_PROOF', isMandatory: true, description: 'Police verification report of proprietors/directors' }
        ],
        officialSource: 'State Excise Portal',
        lastVerified: '2026-01-30'
      });
    }

    // LOCAL: Police Eating House & Public Entertainment
    localReqs.push({
      id: 'REQ_POLICE_HOTEL',
      code: 'POLICE_EATING_HOUSE',
      name: 'Police Department Eating House & Lodging Registration',
      jurisdiction: 'LOCAL',
      department: 'Office of the Commissioner of Police / Superintendent of Police',
      authority: 'District Police Headquarters',
      category: 'LAW_AND_ORDER',
      applicabilityReason: 'Mandatory guest record maintenance (Form C for foreign guests) and public surveillance security clearance.',
      priority: 'MEDIUM',
      statutorySLA: 15,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 36,
      legalAct: 'State Police Act / Public Amusement Rules',
      requiredDocuments: [
        { name: 'CCTV Camera Surveillance Layout', category: 'SECURITY_PLAN', isMandatory: true, description: 'Camera coverage plan with 30-day storage declaration' }
      ],
      officialSource: 'District Police Licensing Branch',
      lastVerified: '2026-01-10'
    });
  }

  // ==========================================
  // 3. HOSPITAL SPECIFIC REQUIREMENTS
  // ==========================================
  else if (bType.code === 'HOSPITAL') {
    // STATE: Clinical Establishments Act
    stateReqs.push({
      id: 'REQ_CLINICAL_EST',
      code: 'CLINICAL_ESTABLISHMENTS_REG',
      name: 'State Clinical Establishments Registration',
      jurisdiction: 'STATE',
      department: 'Directorate of Health Services (DHS)',
      authority: 'Public Health Department, Govt of ' + location.state,
      category: 'HEALTHCARE_REGULATION',
      applicabilityReason: `Statutory registration for clinical facility operating ${answers.HOSP_BED_COUNT || 50} in-patient medical beds.`,
      priority: 'CRITICAL',
      statutorySLA: 30,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 36,
      legalAct: 'Clinical Establishments (Registration and Regulation) Act 2010',
      requiredDocuments: [
        { name: 'Qualified Medical Staff & Nursing Roster', category: 'PROFESSIONAL_CREDENTIALS', isMandatory: true, description: 'Medical Council registration certificates of all doctors' },
        { name: 'Emergency Resuscitation & ICU Equipment Audit', category: 'TECHNICAL_CERTIFICATE', isMandatory: true, description: 'Compliance with minimum care standards' }
      ],
      officialSource: 'State Health DHS Portal',
      lastVerified: '2026-02-22'
    });

    // STATE: Bio-Medical Waste (BMW) Management
    stateReqs.push({
      id: 'REQ_BMW_AUTHORIZATION',
      code: 'SPCB_BMW_AUTHORIZATION',
      name: 'Bio-Medical Waste Management Authorization',
      jurisdiction: 'STATE',
      department: 'State Pollution Control Board',
      authority: 'Environment & Climate Change Department, Govt of ' + location.state,
      category: 'ENVIRONMENT',
      applicabilityReason: `Health care facility generating ${answers.HOSP_BIOMEDICAL_WASTE_KG || 25} kg/day of anatomical, sharp, and cytotoxic infectious waste.`,
      priority: 'CRITICAL',
      statutorySLA: 21,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 36,
      legalAct: 'Bio-Medical Waste Management Rules 2016',
      requiredDocuments: [
        { name: 'Agreement with Common Bio-Medical Waste Facility (CBMWTF)', category: 'LEGAL_AGREEMENT', isMandatory: true, description: 'Authorized vendor collection contract' },
        { name: 'Barcoded Segregation & Effluent Treatment Plan', category: 'SAFETY_PLAN', isMandatory: true, description: 'Color-coded bin system and disinfection protocol' }
      ],
      officialSource: 'State Pollution Control Board Portal',
      lastVerified: '2026-02-14'
    });

    // CENTRAL: AERB Radiation Safety (If has X-Ray / CT)
    if (answers.HOSP_HAS_RADIOLOGY !== false) {
      centralReqs.push({
        id: 'REQ_AERB_RADIATION',
        code: 'AERB_RADIATION_LICENSE',
        name: 'Atomic Energy Regulatory Board (AERB) Radiation Clearance',
        jurisdiction: 'CENTRAL',
        department: 'Atomic Energy Regulatory Board (AERB)',
        authority: 'Department of Atomic Energy, Govt of India',
        category: 'RADIATION_SAFETY',
        applicabilityReason: 'Mandatory site layout approval and equipment registration (eLORA) for diagnostic medical X-Ray and CT scanners.',
        priority: 'CRITICAL',
        statutorySLA: 30,
        isInspectionRequired: false,
        isRenewalRequired: true,
        renewalFrequencyMonths: 60,
        legalAct: 'Atomic Energy Act 1962 & Radiation Protection Rules 2004',
        requiredDocuments: [
          { name: 'Lead-Shielded Room Layout & Barrier Drawing', category: 'TECHNICAL_DRAWING', isMandatory: true, description: 'Wall thickness & lead glass specifications' },
          { name: 'Radiation Safety Officer (RSO) Certification', category: 'PROFESSIONAL_CREDENTIALS', isMandatory: true, description: 'AERB approved RSO qualification' }
        ],
        officialSource: 'https://elora.aerb.gov.in',
        lastVerified: '2026-03-02'
      });
    }

    // STATE: Pharmacy Retail License (If operating in-house chemist)
    if (answers.HOSP_HAS_PHARMACY !== false) {
      stateReqs.push({
        id: 'REQ_DRUG_LICENSE',
        code: 'DRUG_RETAIL_CHEMIST_LICENSE',
        name: 'Drugs Control Department Chemist License (Form 20 & 21)',
        jurisdiction: 'STATE',
        department: 'Food and Drug Administration (FDA)',
        authority: 'Health & Family Welfare Department, Govt of ' + location.state,
        category: 'DRUG_CONTROL',
        applicabilityReason: 'Required to stock, retail, and dispense schedule H, H1, and allopathic medicines in hospital premises.',
        priority: 'HIGH',
        statutorySLA: 21,
        isInspectionRequired: true,
        isRenewalRequired: true,
        renewalFrequencyMonths: 60,
        legalAct: 'Drugs and Cosmetics Act 1940 & Rules 1945',
        requiredDocuments: [
          { name: 'Registered Pharmacist State Council Certificate', category: 'PROFESSIONAL_CREDENTIALS', isMandatory: true, description: 'Affidavit of full-time employment' },
          { name: 'Cold Storage / Refrigerator Verification Invoice', category: 'EQUIPMENT_INVOICE', isMandatory: true, description: 'For temperature-sensitive vaccine storage' }
        ],
        officialSource: 'State FDA Licensing Portal',
        lastVerified: '2026-01-25'
      });
    }

    // STATE: Fire Safety Certificate
    stateReqs.push({
      id: 'REQ_FIRE_HOSPITAL',
      code: 'FIRE_NOC_HOSPITAL',
      name: 'Hospital Fire Safety NOC & Evacuation Clearance',
      jurisdiction: 'STATE',
      department: 'Directorate of Fire Services',
      authority: 'Govt of ' + location.state,
      category: 'FIRE_SAFETY',
      applicabilityReason: 'High life-safety risk institutional occupancy with non-ambulatory patients requiring specialized ramp exits and medical gas bank isolation.',
      priority: 'CRITICAL',
      statutorySLA: 15,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 12,
      legalAct: 'Fire Safety Act & National Building Code (NBC Part IV)',
      requiredDocuments: [
        { name: 'Medical Oxygen Manifold & Gas Plant Isolation Plan', category: 'SAFETY_PLAN', isMandatory: true, description: 'Liquid medical oxygen (LMO) safety distances' }
      ],
      officialSource: 'State Fire Portal',
      lastVerified: '2026-02-15'
    });
  }

  // ==========================================
  // 4. IT COMPANY SPECIFIC REQUIREMENTS
  // ==========================================
  else if (bType.code === 'IT_COMPANY') {
    // STATE: Shops & Establishments Registration
    stateReqs.push({
      id: 'REQ_SHOPS_EST_IT',
      code: 'SHOPS_AND_ESTABLISHMENTS_REG',
      name: 'Shops and Commercial Establishments Act Registration',
      jurisdiction: 'STATE',
      department: 'Office of the Labour Commissioner',
      authority: 'Labour Department, Govt of ' + location.state,
      category: 'LABOUR_COMPLIANCE',
      applicabilityReason: `Statutory registration for technology enterprise employing ${employeeCount || 25} white-collar professionals.`,
      priority: 'CRITICAL',
      statutorySLA: 7,
      isInspectionRequired: false,
      isRenewalRequired: false,
      renewalFrequencyMonths: 0,
      legalAct: 'State Shops & Commercial Establishments Act',
      requiredDocuments: [
        { name: 'Office Commercial Lease Agreement / Title Deed', category: 'LEASE_AGREEMENT', isMandatory: true, description: 'Proof of occupancy in tech park' },
        { name: 'PAN & Certificate of Incorporation', category: 'COMPANY_REGISTRATION', isMandatory: true, description: 'Corporate entity documents' }
      ],
      officialSource: 'Labour Department e-Services',
      lastVerified: '2026-02-05'
    });

    // CENTRAL: STPI Registration (If export oriented)
    if (answers.IT_EXPORT_ORIENTATION !== false) {
      centralReqs.push({
        id: 'REQ_STPI_REG',
        code: 'STPI_SOFTWARE_EXPORT_REG',
        name: 'STPI 100% Export Oriented Unit (EOU) Registration',
        jurisdiction: 'CENTRAL',
        department: 'Software Technology Parks of India (STPI)',
        authority: 'Ministry of Electronics & Information Technology (MeitY), Govt of India',
        category: 'EXPORT_INCENTIVE',
        applicabilityReason: 'Required for duty-free import of hardware, green-card customs fast-track, and Softex export certification.',
        priority: 'HIGH',
        statutorySLA: 15,
        isInspectionRequired: false,
        isRenewalRequired: true,
        renewalFrequencyMonths: 36,
        legalAct: 'Foreign Trade Policy & STPI Guidelines',
        requiredDocuments: [
          { name: 'Project Export Feasibility Report (DPR)', category: 'PROJECT_REPORT', isMandatory: true, description: 'Projected export turnover and FX earnings' }
        ],
        officialSource: 'https://stpi.in',
        lastVerified: '2026-01-28'
      });
    }

    // STATE: Night Shift Women Employment Exemption
    if (answers.IT_NIGHT_SHIFTS !== false) {
      stateReqs.push({
        id: 'REQ_NIGHT_SHIFT_EXEMPTION',
        code: 'LABOUR_NIGHT_SHIFT_EXEMPTION',
        name: '24x7 Operations & Night Shift Exemption Order',
        jurisdiction: 'STATE',
        department: 'Labour Commissionerate',
        authority: 'Govt of ' + location.state,
        category: 'LABOUR_COMPLIANCE',
        applicabilityReason: 'Required under State Labour regulations to permit 24x7 shift operations with security and transport undertakings.',
        priority: 'MEDIUM',
        statutorySLA: 14,
        isInspectionRequired: false,
        isRenewalRequired: true,
        renewalFrequencyMonths: 12,
        legalAct: 'State Shops & Establishments Act (Section on Night Employment)',
        requiredDocuments: [
          { name: 'Security & GPS Cabs Transport Policy Undertaking', category: 'STATUTORY_UNDERTAKING', isMandatory: true, description: 'Declaration of security compliance for women personnel' }
        ],
        officialSource: 'Labour Department Portal',
        lastVerified: '2026-02-12'
      });
    }
  }

  // ==========================================
  // 5. TEXTILE FACTORY / GENERAL MANUFACTURING
  // ==========================================
  else {
    // STATE: MPCB / SPCB Consent to Establish
    stateReqs.push({
      id: 'REQ_MPCB_CTE',
      code: 'MPCB_CTE',
      name: 'State Pollution Control Board Consent to Establish (CTE)',
      jurisdiction: 'STATE',
      department: 'State Pollution Control Board',
      authority: 'Environment Department, Govt of ' + location.state,
      category: 'ENVIRONMENT',
      applicabilityReason: 'Mandatory environmental sanction under Water & Air Acts before physical erection of industrial plant.',
      priority: 'CRITICAL',
      statutorySLA: 21,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 60,
      legalAct: 'Water Act 1974 & Air Act 1981',
      requiredDocuments: [
        { name: 'Effluent Treatment Plant (ETP) Engineering Schematic', category: 'ENVIRONMENTAL_PLAN', isMandatory: true, description: 'Process flow and zero liquid discharge design' }
      ],
      officialSource: 'Pollution Control Single Window',
      lastVerified: '2026-02-28'
    });

    // STATE: DISH Factory Plan Approval
    stateReqs.push({
      id: 'REQ_DISH_FACTORY',
      code: 'DISH_FACTORY_PLAN',
      name: 'DISH Factory Plan Sanction & License',
      jurisdiction: 'STATE',
      department: 'Directorate of Industrial Safety & Health (DISH)',
      authority: 'Labour Department, Govt of ' + location.state,
      category: 'FACTORY_SAFETY',
      applicabilityReason: `Statutory workplace safety approval for manufacturing premises employing ${employeeCount || 100} factory workers.`,
      priority: 'CRITICAL',
      statutorySLA: 30,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 12,
      legalAct: 'Factories Act 1948, Section 6',
      requiredDocuments: [
        { name: 'Factory Layout Plan (Form 1)', category: 'TECHNICAL_DRAWING', isMandatory: true, description: 'Machinery layout, ventilation and emergency exits' }
      ],
      officialSource: 'DISH Portal',
      lastVerified: '2026-02-15'
    });

    // STATE: Fire Safety NOC
    stateReqs.push({
      id: 'REQ_FIRE_MFG',
      code: 'FIRE_NOC_MFG',
      name: 'Industrial Fire Safety Provisional NOC',
      jurisdiction: 'STATE',
      department: 'Fire Prevention Service',
      authority: 'Govt of ' + location.state,
      category: 'FIRE_SAFETY',
      applicabilityReason: 'Mandatory fire protection audit for industrial production buildings.',
      priority: 'HIGH',
      statutorySLA: 15,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 12,
      legalAct: 'Fire Safety Act',
      requiredDocuments: [
        { name: 'Fire Protection Architectural Drawing', category: 'SAFETY_PLAN', isMandatory: true, description: 'Static water storage & hydrant locations' }
      ],
      officialSource: 'Fire Services Portal',
      lastVerified: '2026-02-10'
    });

    // LOCAL: MIDC / Municipal Building Sanction
    localReqs.push({
      id: 'REQ_MIDC_BUILDING',
      code: 'MIDC_BUILDING_SANCTION',
      name: 'Industrial Estate / MIDC Building Plan Sanction',
      jurisdiction: 'LOCAL',
      department: 'Industrial Development Corporation (MIDC / RIICO / GIDC)',
      authority: 'Special Planning Authority',
      category: 'CIVIL_CONSTRUCTION',
      applicabilityReason: 'Required prior to commencement of civil construction work on industrial plot.',
      priority: 'HIGH',
      statutorySLA: 21,
      isInspectionRequired: true,
      isRenewalRequired: false,
      renewalFrequencyMonths: 0,
      legalAct: 'Industrial Development Act & Building Regulations',
      requiredDocuments: [
        { name: 'Structural Engineering & Architectural Blueprints', category: 'TECHNICAL_DRAWING', isMandatory: true, description: 'Certified by licensed structural engineer' }
      ],
      officialSource: 'MIDC Single Window',
      lastVerified: '2026-02-20'
    })