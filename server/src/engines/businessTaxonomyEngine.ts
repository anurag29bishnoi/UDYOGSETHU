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
  // ==========================================
  // ACTIVE FOCUS: FOOD & AGRO INDUSTRIAL VENTURES
  // ==========================================
  FOOD_PROCESSING: [
    {
      code: 'FOOD_ANNUAL_TURNOVER_TIER',
      questionText: 'What is your projected annual business turnover?',
      helpText: 'Under ₹12L -> Basic Registration (₹100/yr) | ₹12L-20Cr -> State FSSAI License (₹2,000-5,000/yr) | > ₹20Cr -> Central FSSAI License (₹7,500/yr).',
      inputType: 'SELECT',
      options: [
        { label: 'Under ₹12 Lakhs / year (Petty Food Manufacturer - Basic Registration)', value: 'TURNOVER_UNDER_12L' },
        { label: '₹12 Lakhs to ₹20 Crore / year (Standard Processing Unit - State FSSAI License)', value: 'TURNOVER_12L_TO_20CR' },
        { label: 'Above ₹20 Crore / year or 100% Export Unit (Large Scale - Central FSSAI License)', value: 'TURNOVER_ABOVE_20CR' }
      ],
      isRequired: true,
      sortOrder: 1
    },
    {
      code: 'FOOD_DAILY_CAPACITY_MT',
      questionText: 'What is the daily processing / manufacturing capacity?',
      helpText: 'Units producing > 2 Metric Tons per day mandate a Central FSSAI License and industrial Effluent Treatment Plant (ETP).',
      inputType: 'SELECT',
      options: [
        { label: 'Up to 1 Metric Ton / day (Small Scale)', value: 'CAPACITY_UNDER_1MT' },
        { label: '1 to 2 Metric Tons / day (Medium Scale)', value: 'CAPACITY_1_TO_2MT' },
        { label: 'Above 2 Metric Tons / day (Industrial High-Volume Unit)', value: 'CAPACITY_ABOVE_2MT' }
      ],
      isRequired: true,
      sortOrder: 2
    },
    {
      code: 'FOOD_WATER_SOURCE',
      questionText: 'What is the primary source of water for food washing and processing?',
      helpText: 'Borewell / groundwater extraction requires Central Ground Water Authority (CGWA) NOC and mandatory NABL IS 10500 Potability Test.',
      inputType: 'SELECT',
      options: [
        { label: 'Groundwater / Private Borewell (Requires CGWA Clearance + NABL IS 10500)', value: 'BOREWELL' },
        { label: 'MIDC / Industrial Piped Water Connection', value: 'MIDC_PIPELINE' },
        { label: 'Municipal Corporation / Local Body Potable Connection', value: 'MUNICIPAL' }
      ],
      isRequired: true,
      sortOrder: 3
    },
    {
      code: 'FOOD_EFFLUENT_KLD',
      questionText: 'Estimated daily process wastewater / effluent discharge (in KLD)?',
      helpText: 'Discharge > 5 KLD requires an on-site Effluent Treatment Plant (ETP) under MPCB Orange Category.',
      inputType: 'SELECT',
      options: [
        { label: 'Under 5 KLD (Minimal washwater - septic tank / soak pit)', value: 'EFFLUENT_LOW' },
        { label: '5 to 25 KLD (Standard processing effluent - Dedicated ETP required)', value: 'EFFLUENT_MED' },
        { label: 'Above 25 KLD (High-volume effluent - Advanced ETP & ZLD required)', value: 'EFFLUENT_HIGH' }
      ],
      isRequired: true,
      sortOrder: 4
    },
    {
      code: 'FOOD_HAS_COLD_STORAGE',
      questionText: 'Will you operate an on-site temperature-controlled cold room or blast freezer?',
      helpText: 'Qualifies for MoFPI Cold Chain Capital Subsidy (up to ₹10 Crore) and requires refrigerant safety certification.',
      inputType: 'BOOLEAN',
      isRequired: true,
      sortOrder: 5
    },
    {
      code: 'FOOD_RETAIL_PACKAGING',
      questionText: 'Will products be packaged in sealed branded retail consumer packs?',
      helpText: 'Requires Legal Metrology Packaged Commodities (LMPC) registration and mandatory nutritional / allergen labeling.',
      inputType: 'BOOLEAN',
      isRequired: true,
      sortOrder: 6
    },
    {
      code: 'FOOD_HAS_STEAM_BOILER',
      questionText: 'Does the plant utilize a steam boiler or biomass briquette furnace?',
      helpText: 'Requires Indian Boiler Regulations (IBR) sanction from the Directorate of Steam Boilers.',
      inputType: 'BOOLEAN',
      isRequired: true,
      sortOrder: 7
    }
  ],

  RESTAURANT_CLOUD_KITCHEN: [
    {
      code: 'REST_SEATING_OR_CLOUD',
      questionText: 'What is your primary commercial operating model?',
      inputType: 'SELECT',
      options: [
        { label: 'Dine-In Restaurant / Cafe with seating', value: 'DINE_IN' },
        { label: 'Delivery-Only Cloud Kitchen / Commissary', value: 'CLOUD_KITCHEN' },
        { label: 'Hybrid: Dine-In + Takeaway + Online Delivery', value: 'HYBRID' }
      ],
      isRequired: true,
      sortOrder: 1
    },
    {
      code: 'REST_TURNOVER_TIER',
      questionText: 'Projected annual food sales turnover?',
      helpText: '< ₹12 Lakhs -> FSSAI Registration | ₹12L to ₹20Cr -> FSSAI State License.',
      inputType: 'SELECT',
      options: [
        { label: 'Under ₹12 Lakhs (Petty food joint / cloud kitchen)', value: 'TURNOVER_UNDER_12L' },
        { label: '₹12 Lakhs to ₹20 Crore (Full Restaurant / Multi-brand cloud kitchen)', value: 'TURNOVER_12L_TO_20CR' },
        { label: 'Above ₹20 Crore / Multi-state chain', value: 'TURNOVER_ABOVE_20CR' }
      ],
      isRequired: true,
      sortOrder: 2
    },
    {
      code: 'REST_SERVES_ALCOHOL',
      questionText: 'Will the establishment serve beer, wine, or alcoholic beverages?',
      helpText: 'Requires State Excise Department Bar License (FL-III).',
      inputType: 'BOOLEAN',
      isRequired: true,
      sortOrder: 3
    },
    {
      code: 'REST_GAS_MANIFOLD',
      questionText: 'Will the kitchen use commercial LPG cylinder manifold or Piped Natural Gas (PNG)?',
      helpText: 'Mandates Fire Brigade Gas Pipeline Safety NOC & flame arrestor manifold check.',
      inputType: 'BOOLEAN',
      isRequired: true,
      sortOrder: 4
    }
  ],

  DAIRY_PROCESSING: [
    {
      code: 'DAIRY_MILK_CAPACITY_LPD',
      questionText: 'Daily milk procurement and processing throughput (Litres per day)?',
      helpText: '> 50,000 Litres/day mandates Central FSSAI License; below 50,000 LPD requires State FSSAI License.',
      inputType: 'SELECT',
      options: [
        { label: 'Up to 5,000 LPD (Micro Chilling & Value Addition)', value: 'UNDER_5000L' },
        { label: '5,000 to 50,000 LPD (Medium Commercial Dairy)', value: '5000_TO_50000L' },
        { label: 'Above 50,000 LPD (Large Scale Industrial Dairy)', value: 'ABOVE_50000L' }
      ],
      isRequired: true,
      sortOrder: 1
    },
    {
      code: 'DAIRY_PRODUCT_TYPES',
      questionText: 'What dairy product lines will be manufactured?',
      inputType: 'SELECT',
      options: [
        { label: 'Pasteurized Liquid Pouch Milk only', value: 'LIQUID_MILK' },
        { label: 'Milk + Paneer, Curd, Ghee, Shrikhand, Butter', value: 'PANEER_CURD_GHEE' },
        { label: 'Ice Cream, Cheese & Spray-Dried Skimmed Milk Powder (SMP)', value: 'CHEESE_ICE_CREAM_POWDER' }
      ],
      isRequired: true,
      sortOrder: 2
    },
    {
      code: 'DAIRY_CHILLING_FACILITY',
      questionText: 'Does the plant feature Bulk Milk Coolers (BMC) and continuous cold chain storage?',
      helpText: 'Qualifies for National Dairy Plan & PMKSY value addition subsidy.',
      inputType: 'BOOLEAN',
      isRequired: true,
      sortOrder: 3
    }
  ],

  COLD_STORAGE_AGRO: [
    {
      code: 'COLD_CHAMBER_CAPACITY_MT',
      questionText: 'Total cold storage holding capacity (in Metric Tons)?',
      inputType: 'SELECT',
      options: [
        { label: 'Up to 1,000 MT (Small farm-gate cold room)', value: 'UNDER_1000MT' },
        { label: '1,000 to 5,000 MT (Commercial multi-commodity hub)', value: '1000_TO_5000MT' },
        { label: 'Above 5,000 MT (Mega Agro Logistics Terminal)', value: 'ABOVE_5000MT' }
      ],
      isRequired: true,
      sortOrder: 1
    },
    {
      code: 'COLD_REFRIGERANT_TYPE',
      questionText: 'What refrigeration system technology will be utilized?',
      helpText: 'Ammonia (NH3) systems require specialized DISH pressure vessel inspection and scrubber safety.',
      inputType: 'SELECT',
      options: [
        { label: 'Eco-friendly Freon / HFC Gas systems', value: 'FREON_ECO_GAS' },
        { label: 'Industrial Ammonia (NH3) Two-Stage Compressor plant', value: 'AMMONIA_NH3' }
      ],
      isRequired: true,
      sortOrder: 2
    },
    {
      code: 'COLD_SEEKING_MOFPI',
      questionText: 'Will you apply for MoFPI Integrated Cold Chain Scheme (up to ₹10 Crore capital grant)?',
      inputType: 'BOOLEAN',
      isRequired: true,
      sortOrder: 3
    }
  ],

  BAKERY_CONFECTIONERY: [
    {
      code: 'BAKERY_OVEN_TYPE',
      questionText: 'Primary industrial baking oven configuration?',
      inputType: 'SELECT',
      options: [
        { label: 'All-Electric Rotary Deck Oven (Clean energy)', value: 'ELECTRIC' },
        { label: 'LPG / PNG Gas Tunnel Oven', value: 'GAS_LPG' },
        { label: 'Diesel / Briquette Fired Heavy Oven', value: 'DIESEL_ROTARY' }
      ],
      isRequired: true,
      sortOrder: 1
    },
    {
      code: 'BAKERY_PACKAGED_MRP',
      questionText: 'Will items be packaged in sealed branded retail packs with MRP & Nutritional tables?',
      helpText: 'Mandates Legal Metrology Packaged Commodities (LMPC) certification.',
      inputType: 'BOOLEAN',
      isRequired: true,
      sortOrder: 2
    }
  ],

  BEVERAGE_WATER_UNIT: [
    {
      code: 'BEV_RAW_WATER_SOURCE',
      questionText: 'Primary source of raw source water for bottling?',
      helpText: 'Packaged drinking water plants using borewell require mandatory CGWA NOC.',
      inputType: 'SELECT',
      options: [
        { label: 'Groundwater / Private Borewell (Mandatory CGWA clearance)', value: 'BOREWELL_GROUNDWATER' },
        { label: 'MIDC / Industrial Canal Bulk Supply', value: 'MIDC_WATER_GRID' }
      ],
      isRequired: true,
      sortOrder: 1
    },
    {
      code: 'BEV_PACKAGING_TYPE',
      questionText: 'Target packaging format for commercial sales?',
      inputType: 'SELECT',
      options: [
        { label: 'Single-use PET Bottles (250ml to 1L) with in-house blow molding', value: 'PET_BOTTLES_BLOW_MOLDING' },
        { label: '20 Litre Bulk Refillable Dispensers for offices/homes', value: '20L_BULK_JARS' },
        { label: 'Aluminum Cans & Tetra Pak (Juices / Ready-to-Drink)', value: 'ALUMINUM_CANS' }
      ],
      isRequired: true,
      sortOrder: 2
    }
  ],

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
  // 1. ACTIVE FOCUS: FOOD & AGRO PROCESSING ECOSYSTEM
  // ==========================================
  if (
    bType.categoryCode === 'FOOD_PROCESSING' ||
    bType.code.startsWith('FOOD_') ||
    bType.code === 'RESTAURANT_CLOUD_KITCHEN' ||
    bType.code === 'DAIRY_PROCESSING' ||
    bType.code === 'COLD_STORAGE_AGRO' ||
    bType.code === 'BAKERY_CONFECTIONERY' ||
    bType.code === 'BEVERAGE_WATER_UNIT'
  ) {
    const isCentral =
      answers.FOOD_ANNUAL_TURNOVER_TIER === 'TURNOVER_ABOVE_20CR' ||
      answers.FOOD_DAILY_CAPACITY_MT === 'CAPACITY_ABOVE_2MT' ||
      answers.DAIRY_MILK_CAPACITY_LPD === 'ABOVE_50000L' ||
      bType.code === 'BEVERAGE_WATER_UNIT' ||
      investmentCr > 20;

    const isBasic =
      answers.FOOD_ANNUAL_TURNOVER_TIER === 'TURNOVER_UNDER_12L' ||
      answers.REST_TURNOVER_TIER === 'TURNOVER_UNDER_12L';

    // A. CENTRAL / STATE: FSSAI Licensing
    if (isCentral) {
      centralReqs.push({
        id: 'REQ_FSSAI_CENTRAL',
        code: 'FSSAI_CENTRAL_LICENSE',
        name: 'FSSAI Central Manufacturing License (FOSCOS Form B)',
        jurisdiction: 'CENTRAL',
        department: 'Food Safety and Standards Authority of India (FSSAI)',
        authority: 'Ministry of Health and Family Welfare, Govt of India',
        category: 'FOOD_SAFETY',
        applicabilityReason: 'Mandatory Central License under Section 31 of FSS Act 2006 for high-capacity food processing (>2 MT/day), packaged drinking water, or turnover > ₹20 Crore. (Statutory Fee: ₹7,500/year).',
        priority: 'CRITICAL',
        statutorySLA: 30,
        isInspectionRequired: true,
        isRenewalRequired: true,
        renewalFrequencyMonths: 60,
        legalAct: 'Food Safety and Standards (Licensing and Registration of Food Businesses) Regulations 2011',
        requiredDocuments: [
          { name: 'Floor Layout Plan (Schedule 4 Unidirectional Flow)', category: 'TECHNICAL_DRAWING', isMandatory: true, description: 'CAD plan separating raw material bay from finished product packaging' },
          { name: 'Potable Water Test Report (IS 10500 - NABL Lab)', category: 'TEST_REPORT', isMandatory: true, description: 'Microbiological and chemical analysis from NABL accredited lab' },
          { name: 'Machinery & Equipment List with HP and Capacity', category: 'EQUIPMENT_INVOICE', isMandatory: true, description: 'Itemized processing capacity specification' },
          { name: 'Food Safety Management System (FSMS) Plan', category: 'SAFETY_PLAN', isMandatory: true, description: 'Hazard Analysis Critical Control Point (HACCP) SOPs' },
          { name: 'Food Handlers Medical Fitness Certificates (Form IX)', category: 'MEDICAL_CERTIFICATE', isMandatory: true, description: 'Typhoid vaccination and medical fitness records' },
          { name: 'Nomination of Technical In-Charge / Supervisor (Form IX)', category: 'PROFESSIONAL_CREDENTIALS', isMandatory: true, description: 'Board resolution appointing authorized food safety officer' }
        ],
        officialSource: 'https://foscos.fssai.gov.in',
        lastVerified: '2026-03-01'
      });
    } else if (isBasic) {
      centralReqs.push({
        id: 'REQ_FSSAI_BASIC',
        code: 'FSSAI_BASIC_REG',
        name: 'FSSAI Basic Food Business Registration (Form A)',
        jurisdiction: 'CENTRAL',
        department: 'Food Safety and Standards Authority of India (FSSAI)',
        authority: 'Food & Drug Administration (FDA) Local Designated Officer',
        category: 'FOOD_SAFETY',
        applicabilityReason: 'Statutory registration for petty food manufacturers with annual turnover up to ₹12 Lakhs (Statutory fee: ₹100/year).',
        priority: 'CRITICAL',
        statutorySLA: 7,
        isInspectionRequired: false,
        isRenewalRequired: true,
        renewalFrequencyMonths: 12,
        legalAct: 'FSS Act 2006, Section 31(1)',
        requiredDocuments: [
          { name: 'Passport Size Photo of Proprietor', category: 'IDENTITY_PROOF', isMandatory: true, description: 'Applicant photograph' },
          { name: 'Government Photo ID (Aadhaar / Voter ID)', category: 'IDENTITY_PROOF', isMandatory: true, description: 'Proof of identity' },
          { name: 'Proof of Business Premises Possession', category: 'LEASE_AGREEMENT', isMandatory: true, description: 'Electricity bill / rent agreement' }
        ],
        officialSource: 'https://foscos.fssai.gov.in',
        lastVerified: '2026-02-20'
      });
    } else {
      stateReqs.push({
        id: 'REQ_FSSAI_STATE',
        code: 'FSSAI_STATE_LICENSE',
        name: 'FSSAI State Food Manufacturing License (FOSCOS Form B)',
        jurisdiction: 'STATE',
        department: 'Food and Drug Administration (FDA)',
        authority: 'Commissioner of Food Safety, Govt of ' + location.state,
        category: 'FOOD_SAFETY',
        applicabilityReason: 'Mandatory State Food License under Section 31 of FSS Act 2006 for food processing units with turnover between ₹12 Lakhs and ₹20 Crore (Statutory fee: ₹2,000 - ₹5,000/year).',
        priority: 'CRITICAL',
        statutorySLA: 30,
        isInspectionRequired: true,
        isRenewalRequired: true,
        renewalFrequencyMonths: 60,
        legalAct: 'FSS (Licensing and Registration) Regulations 2011',
        requiredDocuments: [
          { name: 'Floor Layout Plan (Schedule 4 Compliant)', category: 'TECHNICAL_DRAWING', isMandatory: true, description: 'Demarcating raw materials, preparation, packaging, and fly-catchers' },
          { name: 'Water Potability Testing Certificate (IS 10500)', category: 'TEST_REPORT', isMandatory: true, description: 'Report from NABL accredited lab confirming zero coliform/pathogens' },
          { name: 'Itemized Machinery and Equipment Schedule', category: 'EQUIPMENT_INVOICE', isMandatory: true, description: 'Listing motors, conveyors, blenders, and packaging machines' },
          { name: 'Medical Fitness Certificates for Food Workers (Form IX)', category: 'MEDICAL_CERTIFICATE', isMandatory: true, description: 'Annual health checkup and Typhoid vaccination certificates' },
          { name: 'List of Food Product Categories & Recipe Formulation', category: 'PRODUCT_SPECS', isMandatory: true, description: 'Declared Indian Food Code (IFC) categories' }
        ],
        officialSource: 'https://foscos.fssai.gov.in',
        lastVerified: '2026-03-01'
      });
    }

    // B. STATE: Pollution Control Board Consent (MPCB CTE/CTO - Food Category)
    stateReqs.push({
      id: 'REQ_MPCB_FOOD',
      code: 'MPCB_CTE_FOOD',
      name: 'State Pollution Control Board Consent to Establish (CTE - Food & Agro)',
      jurisdiction: 'STATE',
      department: 'State Pollution Control Board (SPCB / MPCB)',
      authority: 'Environment Department, Govt of ' + location.state,
      category: 'ENVIRONMENT',
      applicabilityReason: 'Mandatory environmental clearance under Section 25 of Water Act 1974 for wash-water discharge, organic biological oxygen demand (BOD) load, and solid waste handling.',
      priority: 'CRITICAL',
      statutorySLA: 21,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 60,
      legalAct: 'Water Act 1974 & Air Act 1981',
      requiredDocuments: [
        { name: 'Effluent Treatment Plant (ETP) / Soak Pit Design Blueprint', category: 'ENVIRONMENTAL_PLAN', isMandatory: true, description: 'Engineering flow diagram for neutralization and BOD reduction' },
        { name: 'Manufacturing Process Flowchart & Water Balance Diagram', category: 'TECHNICAL_DRAWING', isMandatory: true, description: 'Input-output mass balance and water recovery ratio' }
      ],
      officialSource: 'State Pollution Control Single Window',
      lastVerified: '2026-02-28'
    });

    // C. STATE: Industrial Fire Safety Clearance
    stateReqs.push({
      id: 'REQ_FIRE_FOOD',
      code: 'FIRE_NOC_FOOD',
      name: 'Fire Prevention & Life Safety Provisional NOC',
      jurisdiction: 'STATE',
      department: 'Directorate of Fire & Emergency Services',
      authority: 'Home Department, Govt of ' + location.state,
      category: 'FIRE_SAFETY',
      applicabilityReason: 'Mandatory fire protection audit for processing halls, gas piping manifolds, boiler burner units, and packaging material storage.',
      priority: 'HIGH',
      statutorySLA: 15,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 12,
      legalAct: 'Fire Prevention and Life Safety Measures Act',
      requiredDocuments: [
        { name: 'Fire Fighting System Layout & Evacuation Route Plan', category: 'SAFETY_PLAN', isMandatory: true, description: 'ABC dry powder extinguishers, hydrants, and emergency exits' }
      ],
      officialSource: 'State Fire Services Portal',
      lastVerified: '2026-02-15'
    });

    // D. LOCAL: Municipal Health Trade License / Local Body NOC
    localReqs.push({
      id: 'REQ_LOCAL_HEALTH_TRADE',
      code: 'MUNICIPAL_HEALTH_TRADE_FOOD',
      name: 'Municipal Health Trade License / Local Body Food NOC',
      jurisdiction: 'LOCAL',
      department: 'Public Health Department, Local Municipal Corporation / Gram Panchayat',
      authority: location.localAuthority || 'Municipal Corporation of ' + location.district,
      category: 'TRADE_LICENSE',
      applicabilityReason: 'Local authority commercial permission to conduct food manufacturing and culinary activities within municipal/taluka limits.',
      priority: 'HIGH',
      statutorySLA: 14,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 12,
      legalAct: 'Municipal Corporation Act / State Panchayati Raj Act',
      requiredDocuments: [
        { name: 'Sanctioned Building Blueprint & Premises Ownership Proof', category: 'BUILDING_SANCTION', isMandatory: true, description: 'Occupancy certificate or registered lease deed' },
        { name: 'Property Tax Paid Receipt', category: 'TAX_RECEIPT', isMandatory: true, description: 'Latest municipal assessment receipt' }
      ],
      officialSource: 'Municipal Citizen Portal',
      lastVerified: '2026-02-18'
    });

    // E. SECTOR: Mandatory NABL Water Potability Analysis (IS 10500)
    sectorReqs.push({
      id: 'REQ_NABL_WATER_TEST',
      code: 'NABL_WATER_TEST_IS10500',
      name: 'NABL Accredited Potable Water Testing Certificate (IS 10500)',
      jurisdiction: 'SECTOR_SPECIFIC',
      department: 'NABL Certified Testing Laboratories / Public Health Laboratory',
      authority: 'National Accreditation Board for Testing and Calibration Laboratories',
      category: 'LAB_TEST_REPORT',
      applicabilityReason: 'Mandatory statutory water test confirming zero pathogenic bacteria (E. coli, Coliform), neutral pH, and safe mineral levels before food preparation.',
      priority: 'CRITICAL',
      statutorySLA: 7,
      isInspectionRequired: false,
      isRenewalRequired: true,
      renewalFrequencyMonths: 6,
      legalAct: 'FSSAI Schedule 4 Quality Standards & IS 10500:2012',
      requiredDocuments: [
        { name: 'Water Sample Collection Protocol & Lab Test Report', category: 'TEST_REPORT', isMandatory: true, description: 'Comprehensive 32-parameter physical, chemical and bacteriological analysis' }
      ],
      officialSource: 'NABL Public Testing Directory',
      lastVerified: '2026-03-01'
    });

    // F. SECTOR: FoSTaC Food Safety Supervisor Deployment
    sectorReqs.push({
      id: 'REQ_FOSTAC_SUPERVISOR',
      code: 'FOSTAC_CERTIFIED_SUPERVISOR',
      name: 'FoSTaC Food Safety Supervisor Certificate',
      jurisdiction: 'SECTOR_SPECIFIC',
      department: 'Food Safety Training & Certification (FoSTaC) Directorate',
      authority: 'Food Safety and Standards Authority of India (FSSAI)',
      category: 'WORKFORCE_COMPLIANCE',
      applicabilityReason: 'Mandatory deployment of at least 1 certified Food Safety Supervisor for every 25 food handling staff under FSSAI regulations.',
      priority: 'HIGH',
      statutorySLA: 5,
      isInspectionRequired: false,
      isRenewalRequired: true,
      renewalFrequencyMonths: 24,
      legalAct: 'FSSAI Order No. 1-135/FSSAI/Imports/2018',
      requiredDocuments: [
        { name: 'FoSTaC Course Completion Certificate of Nominated Staff', category: 'PROFESSIONAL_CREDENTIALS', isMandatory: true, description: 'Specialized manufacturing level certificate' }
      ],
      officialSource: 'https://fostac.fssai.gov.in',
      lastVerified: '2026-02-10'
    });

    // G. Conditional: Groundwater CGWA NOC
    if (answers.FOOD_WATER_SOURCE === 'BOREWELL' || answers.BEV_RAW_WATER_SOURCE === 'BOREWELL_GROUNDWATER') {
      centralReqs.push({
        id: 'REQ_CGWA_GROUNDWATER',
        code: 'CGWA_GROUNDWATER_NOC',
        name: 'Central Ground Water Authority (CGWA) Abstraction NOC',
        jurisdiction: 'CENTRAL',
        department: 'Central Ground Water Authority (CGWA)',
        authority: 'Ministry of Jal Shakti, Govt of India',
        category: 'WATER_RESOURCE',
        applicabilityReason: 'Mandatory abstraction permit for operating private borewell tubewells for commercial industrial food processing.',
        priority: 'HIGH',
        statutorySLA: 45,
        isInspectionRequired: true,
        isRenewalRequired: true,
        renewalFrequencyMonths: 36,
        legalAct: 'Environment (Protection) Act 1986, Section 5 (CGWA Guidelines)',
        requiredDocuments: [
          { name: 'Hydrogeological Impact Report & Water Meter Calibration', category: 'TECHNICAL_REPORT', isMandatory: true, description: 'Rainwater harvesting and recharge recharge plan' }
        ],
        officialSource: 'https://cgwa-noc.gov.in',
        lastVerified: '2026-01-20'
      });
    }

    // H. Conditional: Legal Metrology LMPC Packaged Commodities Registration
    if (answers.FOOD_RETAIL_PACKAGING !== false || answers.BAKERY_PACKAGED_MRP) {
      sectorReqs.push({
        id: 'REQ_LMPC_PACKAGING',
        code: 'LMPC_PACKAGED_COMMODITIES',
        name: 'Legal Metrology Packaged Commodities (LMPC) Registration',
        jurisdiction: 'SECTOR_SPECIFIC',
        department: 'Legal Metrology Organisation (Consumer Affairs)',
        authority: 'Ministry of Consumer Affairs, Food & Public Distribution',
        category: 'PACKAGING_STANDARDS',
        applicabilityReason: 'Mandatory certificate under Rule 27 for packaging and labeling pre-packed food commodities sold with retail MRP.',
        priority: 'HIGH',
        statutorySLA: 15,
        isInspectionRequired: false,
        isRenewalRequired: false,
        renewalFrequencyMonths: 0,
        legalAct: 'Legal Metrology (Packaged Commodities) Rules 2011, Rule 27',
        requiredDocuments: [
          { name: 'Specimen Packaging Label Artwork', category: 'PACKAGING_ARTWORK', isMandatory: true, description: 'Displaying Net Weight, MRP, Best Before, Nutritional Info, Veg Logo' }
        ],
        officialSource: 'https://e-lmis.gov.in',
        lastVerified: '2026-02-14'
      });
    }

    // I. Conditional: Steam Boiler IBR Sanction
    if (answers.FOOD_HAS_STEAM_BOILER) {
      stateReqs.push({
        id: 'REQ_IBR_BOILER',
        code: 'IBR_STEAM_BOILER_REG',
        name: 'Directorate of Steam Boilers Registration & Mounting Approval',
        jurisdiction: 'STATE',
        department: 'Directorate of Steam Boilers',
        authority: 'Industries, Energy and Labour Department, Govt of ' + location.state,
        category: 'BOILER_SAFETY',
        applicabilityReason: 'Mandatory inspection and hydraulic pressure testing of industrial steam generation boilers under Indian Boilers Act.',
        priority: 'CRITICAL',
        statutorySLA: 21,
        isInspectionRequired: true,
        isRenewalRequired: true,
        renewalFrequencyMonths: 12,
        legalAct: 'Indian Boilers Act 1923 & Indian Boiler Regulations 1950',
        requiredDocuments: [
          { name: 'Boiler Manufacturer Form II, III & IV Certificates', category: 'EQUIPMENT_INVOICE', isMandatory: true, description: 'IBR approved steel plate and welder credentials' }
        ],
        officialSource: 'Directorate of Steam Boilers Portal',
        lastVerified: '2026-02-05'
      });
    }
  }

  // ==========================================
  // 2. PETROL PUMP SPECIFIC REQUIREMENTS
  // ==========================================
  else if (bType.code === 'PETROL_PUMP') {
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
    });
  }

  // Combine all requirements
  const allRequirements: DiscoveredRequirement[] = [
    ...centralReqs,
    ...stateReqs,
    ...localReqs,
    ...sectorReqs
  ];

  // Build unique mandatory documents list with usage mapping
  const docMap = new Map<string, { name: string; category: string; usedForApprovals: string[] }>();
  allRequirements.forEach(req => {
    req.requiredDocuments.forEach(d => {
      if (docMap.has(d.name)) {
        docMap.get(d.name)!.usedForApprovals.push(req.name);
      } else {
        docMap.set(d.name, {
          name: d.name,
          category: d.category,
          usedForApprovals: [req.name]
        });
      }
    });
  });

  // Calculate Critical Path
  const sortedBySLA = [...allRequirements].sort((a, b) => b.statutorySLA - a.statutorySLA);
  const criticalSequence = sortedBySLA.slice(0, 3).map(r => r.name);
  const totalEstimatedDays = sortedBySLA.length > 0 ? sortedBySLA[0].statutorySLA + (sortedBySLA[1]?.statutorySLA ? Math.round(sortedBySLA[1].statutorySLA * 0.4) : 0) : 30;
  const sequentialDays = allRequirements.reduce((acc, r) => acc + r.statutorySLA, 0);
  const parallelSavings = Math.max(0, sequentialDays - totalEstimatedDays);

  // Government Scheme matching based on business category & investment
  const potentialSchemes: KnowYourApprovalsResult['potentialGovernmentSchemes'] = [];

  const isFoodEnterprise =
    bType.categoryCode === 'FOOD_PROCESSING' ||
    bType.code.startsWith('FOOD_') ||
    bType.code === 'RESTAURANT_CLOUD_KITCHEN' ||
    bType.code === 'DAIRY_PROCESSING' ||
    bType.code === 'COLD_STORAGE_AGRO' ||
    bType.code === 'BAKERY_CONFECTIONERY' ||
    bType.code === 'BEVERAGE_WATER_UNIT';

  if (isFoodEnterprise) {
    potentialSchemes.push({
      name: 'Pradhan Mantri Formalisation of Micro food processing Enterprises (PMFME)',
      department: 'Ministry of Food Processing Industries (MoFPI) & Maharashtra State Agriculture Dept',
      benefitSummary: '35% Credit-Linked Capital Subsidy on plant & machinery up to ₹10.0 Lakhs, plus ₹40,000 seed capital for SHG/FPO members and 50% branding support.',
      matchConfidence: 'High Match (95%)',
      maxSubsidy: '₹10.0 Lakhs Capital Grant'
    });

    if (investmentCr >= 2.0) {
      potentialSchemes.push({
        name: 'PM Kisan SAMPADA Yojana - Creation / Expansion of Food Processing (CEFPPC)',
        department: 'Ministry of Food Processing Industries (MoFPI), Govt of India',
        benefitSummary: '35% to 50% Non-refundable Capital Grant on technical civil works and eligible food processing machinery (up to ₹5.0 Crore).',
        matchConfidence: 'High Match (90%)',
        maxSubsidy: '₹5.0 Crore Direct Grant'
      });
    }

    if (answers.FOOD_HAS_COLD_STORAGE || bType.code === 'COLD_STORAGE_AGRO' || bType.code === 'DAIRY_PROCESSING') {
      potentialSchemes.push({
        name: 'MoFPI Integrated Cold Chain and Value Addition Infrastructure Scheme',
        department: 'Ministry of Food Processing Industries (MoFPI)',
        benefitSummary: '35% to 50% Capital Subsidy for multi-temperature cold storages, blast freezers, and refrigerated reefer transport vans.',
        matchConfidence: 'High Match (92%)',
        maxSubsidy: '₹10.0 Crore Capital Subsidy'
      });
    }

    if (location.state === 'Maharashtra') {
      potentialSchemes.push({
        name: 'Maharashtra Package Scheme of Incentives (PSI 2019) - Agro & Food Processing Tier',
        department: 'Directorate of Industries, Govt of Maharashtra',
        benefitSummary: 'Up to 60% Gross SGST reimbursement as Industrial Promotion Subsidy for 9 years, 100% Stamp Duty exemption, and ₹1.50/unit industrial power tariff subsidy.',
        matchConfidence: 'High Match (94%)',
        maxSubsidy: '₹15.0 Crore over 9 Years'
      });
    }

    potentialSchemes.push({
      name: 'NABARD Agriculture Infrastructure Fund (AIF) - Post-Harvest Management',
      department: 'NABARD & Department of Agriculture, Govt of India',
      benefitSummary: '3% per annum Interest Subvention on term loans up to ₹2.0 Crore for post-harvest food sorting, grading, and packaging infrastructure.',
      matchConfidence: 'Likely Match (88%)',
      maxSubsidy: '3% Interest Subvention (₹2.0 Cr Loan)'
    });
  } else {
    // Non-food fallback schemes
    if (investmentCr >= 1 && location.state === 'Maharashtra') {
      potentialSchemes.push({
        name: 'Maharashtra Package Scheme of Incentives (PSI) 2019',
        department: 'Directorate of Industries, Maharashtra',
        benefitSummary: 'Up to 30% Capital Investment Subsidy + 100% Stamp Duty Exemption on Land Lease.',
        matchConfidence: 'High Match (92%)',
        maxSubsidy: '₹10.0 Crore'
      });
    }
    if (investmentCr <= 5) {
      potentialSchemes.push({
        name: 'Credit Linked Capital Subsidy Scheme (CLCSS) for MSMEs',
        department: 'Ministry of MSME, Govt of India',
        benefitSummary: '15% upfront capital subsidy for technology upgradation in micro/small enterprises.',
        matchConfidence: 'High Match (90%)',
        maxSubsidy: '₹15.0 Lakhs'
      });
    }
  }

  // Generate actionable, easy-to-understand Smart Recommendations
  const smartRecommendations: KnowYourApprovalsResult['smartRecommendations'] = [];

  if (isFoodEnterprise) {
    const fssaiTier =
      answers.FOOD_ANNUAL_TURNOVER_TIER === 'TURNOVER_ABOVE_20CR' || investmentCr > 20
        ? 'Central License (₹7,500/yr)'
        : answers.FOOD_ANNUAL_TURNOVER_TIER === 'TURNOVER_UNDER_12L'
        ? 'Basic Registration (₹100/yr)'
        : 'State License (₹2,000 - ₹5,000/yr)';

    smartRecommendations.push({
      category: 'LICENSING',
      title: 'FSSAI License Category Selection',
      description: `Based on your declared project outlay of ₹${investmentCr} Cr and operations, your enterprise qualifies for an FSSAI ${fssaiTier}. Processed online via FOSCOS within 30 statutory working days.`,
      priority: 'HIGH',
      actionableStep: 'Upload Schedule 4 floor layout plan and itemized machinery list in your Document Vault.'
    });

    smartRecommendations.push({
      category: 'WATER_QUALITY',
      title: 'Mandatory NABL Water Quality Certificate (IS 10500:2012)',
      description: 'Water is legally classified as an active food ingredient. FSSAI officers mandate a complete physical, chemical, and microbiological test report (testing for E. coli, Coliform, pH, and heavy metals) from a NABL-accredited laboratory.',
      priority: 'HIGH',
      actionableStep: 'Collect 2-litre water sample from your premises and test under IS 10500 standards.'
    });

    smartRecommendations.push({
      category: 'LAYOUT_DESIGN',
      title: 'FSSAI Schedule 4 Unidirectional Floor Plan Layout',
      description: 'The physical facility must have strict unidirectional flow: raw material bay must NOT cross paths with final packaging or dispatch. Demarcate insect fly-catchers, washable epoxy flooring, and foot-operated hand-wash sinks.',
      priority: 'HIGH',
      actionableStep: 'Verify your CAD floor plan shows separate Raw Material, Preparation, Packaging, and Storage zones.'
    });

    smartRecommendations.push({
      category: 'WORKER_HYGIENE',
      title: 'Food Handler Medical Fitness (Form IX) & FoSTaC Supervisor',
      description: `Every food handling worker (${employeeCount} planned personnel) must possess an annual medical fitness certificate (Form IX) with Typhoid vaccination. Deploy at least 1 certified FoSTaC Food Safety Supervisor.`,
      priority: 'MEDIUM',
      actionableStep: 'Schedule staff health checkups and enroll nominated manager on the FoSTaC portal.'
    });

    smartRecommendations.push({
      category: 'GOVERNMENT_SCHEME',
      title: 'Government Capital Subsidies: PMFME (35% up to ₹10L) & PMKSY (up to ₹5 Cr)',
      description: `Your enterprise has an automatic 95% match for the PMFME scheme (35% capital subsidy up to ₹10 Lakhs). For larger investments, apply under PMKSY CEFPPC for up to ₹5.0 Crore direct non-refundable machinery grant.`,
      priority: 'RECOMMENDED',
      actionableStep: 'Prepare Bank Appraisal and Detailed Project Report (DPR) to claim the capital subsidy.'
    });
  } else {
    smartRecommendations.push({
      category: 'LICENSING',
      title: 'Statutory Single Window Roadmap',
      description: `Your enterprise requires ${allRequirements.length} primary clearances. Concurrent parallel filing saves an estimated ${parallelSavings} statutory working days.`,
      priority: 'HIGH',
      actionableStep: 'Upload your verified identity, land possession, and financial documents to begin.'
    });
  }

  return {
    businessType: bType,
    location,
    projectStage,
    totalRequirementsCount: allRequirements.length,
    requirementsByJurisdiction: {
      central: centralReqs,
      state: stateReqs,
      local: localReqs,
      sectorSpecific: sectorReqs
    },
    allRequirements,
    mandatoryDocumentsList: Array.from(docMap.values()),
    estimatedTotalWorkingDays: totalEstimatedDays,
    parallelProcessingSavesDays: parallelSavings,
    criticalPathSequence: criticalSequence,
    potentialGovernmentSchemes: potentialSchemes,
    smartRecommendations
  };
}
