import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { CURATED_SCHEMES } from './engines/schemeMatchingEngine';
import { MASTER_CATEGORIES, MASTER_BUSINESS_TYPES } from './engines/businessTaxonomyEngine';

async function main() {
  console.log('🌱 Seeding UdyogSetu database with realistic SIH 2026 industrial data...');

  // Clean old records
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.grievance.deleteMany();
  await prisma.renewal.deleteMany();
  await prisma.compliance.deleteMany();
  await prisma.schemeApplication.deleteMany();
  await prisma.scheme.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.clarificationQuery.deleteMany();
  await prisma.applicationTimeline.deleteMany();
  await prisma.application.deleteMany();
  await prisma.approvalRequirement.deleteMany();
  await prisma.approvalRule.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.department.deleteMany();
  await prisma.documentVerification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.project.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();
  await prisma.regulation.deleteMany();
  await prisma.businessQuestionOption.deleteMany();
  await prisma.businessQuestion.deleteMany();
  await prisma.businessType.deleteMany();
  await prisma.businessCategory.deleteMany();

  const passwordHash = await bcrypt.hash('Demo@123', 10);

  // 0. Seed Business Categories & Types
  console.log('📂 Seeding Master Business Taxonomy (Categories & Business Types)...');
  for (const cat of MASTER_CATEGORIES) {
    await prisma.businessCategory.create({
      data: {
        code: cat.code,
        name: cat.name,
        icon: cat.icon,
        description: cat.description,
        sortOrder: cat.sortOrder
      }
    });
  }

  const categoryMap = new Map<string, string>();
  const dbCats = await prisma.businessCategory.findMany();
  dbCats.forEach(c => categoryMap.set(c.code, c.id));

  for (const bType of MASTER_BUSINESS_TYPES) {
    const catId = categoryMap.get(bType.categoryCode);
    if (catId) {
      await prisma.businessType.create({
        data: {
          code: bType.code,
          name: bType.name,
          categoryId: catId,
          description: bType.description,
          icon: bType.icon,
          isHazardous: bType.isHazardous,
          typicalInvestmentRange: bType.typicalInvestmentRange,
          governingActs: bType.governingActs
        }
      });
    }
  }

  // 1. Create Users
  const entrepreneur = await prisma.user.create({
    data: {
      email: 'demo@udyogsetu.in',
      name: 'Rajesh Sharma',
      mobile: '+91 98230 45678',
      role: 'ENTREPRENEUR',
      passwordHash
    }
  });

  const entrepreneur2 = await prisma.user.create({
    data: {
      email: 'foodmfg@udyogsetu.in',
      name: 'Suresh Deshmukh',
      mobile: '+91 94220 12345',
      role: 'ENTREPRENEUR',
      passwordHash
    }
  });

  const mpcbOfficer = await prisma.user.create({
    data: {
      email: 'officer@udyogsetu.in',
      name: 'Dr. Anjali Patil',
      mobile: '+91 98810 54321',
      role: 'DEPARTMENT_OFFICER',
      designation: 'Sub-Regional Officer (SRO-I)',
      departmentCode: 'MPCB',
      passwordHash
    }
  });

  const fireOfficer = await prisma.user.create({
    data: {
      email: 'fire.officer@udyogsetu.in',
      name: 'Insp. Vinod Shinde',
      mobile: '+91 98500 67890',
      role: 'DEPARTMENT_OFFICER',
      designation: 'Divisional Fire Officer',
      departmentCode: 'FIRE',
      passwordHash
    }
  });

  const dishOfficer = await prisma.user.create({
    data: {
      email: 'dish.officer@udyogsetu.in',
      name: 'Eng. Ramesh Gaikwad',
      mobile: '+91 97650 11223',
      role: 'DEPARTMENT_OFFICER',
      designation: 'Deputy Director of Industrial Safety & Health',
      departmentCode: 'DISH',
      passwordHash
    }
  });

  const seniorOfficer = await prisma.user.create({
    data: {
      email: 'senior@udyogsetu.in',
      name: 'Shri Sunil Joshi, IAS',
      mobile: '+91 99220 99887',
      role: 'SENIOR_OFFICER',
      designation: 'Joint CEO & Chief Facilitation Officer, MIDC',
      passwordHash
    }
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@udyogsetu.in',
      name: 'System Administrator',
      mobile: '+91 98220 00112',
      role: 'ADMIN',
      designation: 'State Single Window IT Director',
      passwordHash
    }
  });

  console.log('✓ Seeded Users (Demo@123): demo, officer, fire.officer, dish.officer, senior, admin');

  // 2. Create Departments
  const mpcb = await prisma.department.create({
    data: {
      code: 'MPCB',
      name: 'Maharashtra Pollution Control Board',
      ministry: 'Environment and Climate Change Department, GoM',
      officerName: 'Dr. Anjali Patil',
      contactEmail: 'sro.pune@mpcb.gov.in',
      description: 'Regulatory body responsible for environmental pollution prevention, industrial consents (CTE/CTO), and monitoring.'
    }
  });

  const fire = await prisma.department.create({
    data: {
      code: 'FIRE',
      name: 'Directorate of Maharashtra Fire Services',
      ministry: 'Urban Development & Home Department, GoM',
      officerName: 'Insp. Vinod Shinde',
      contactEmail: 'fireservices@maharashtra.gov.in',
      description: 'State fire safety oversight authority issuing provisional and final building fire safety NOCs.'
    }
  });

  const dish = await prisma.department.create({
    data: {
      code: 'DISH',
      name: 'Directorate of Industrial Safety & Health',
      ministry: 'Labour Department, GoM',
      officerName: 'Eng. Ramesh Gaikwad',
      contactEmail: 'dish.pune@maharashtra.gov.in',
      description: 'Enforces the Factories Act 1948, machine safety standards, worker health, and factory plan approvals.'
    }
  });

  const msedcl = await prisma.department.create({
    data: {
      code: 'MSEDCL',
      name: 'Maharashtra State Electricity Distribution Co. Ltd.',
      ministry: 'Energy Department, GoM',
      contactEmail: 'industrial.power@mahadiscom.in',
      description: 'State power utility managing industrial electrical connections, High Tension (HT) lines, and load sanctions.'
    }
  });

  const labour = await prisma.department.create({
    data: {
      code: 'LABOUR',
      name: 'Office of the Labour Commissioner',
      ministry: 'Labour Department, GoM',
      contactEmail: 'labourcommissioner@maharashtra.gov.in',
      description: 'Principal employer registration, contract labour regulation, and statutory worker benefits.'
    }
  });

  console.log('✓ Seeded Departments: MPCB, FIRE, DISH, MSEDCL, LABOUR');

  // 3. Create Approvals
  const approvalMpcb = await prisma.approval.create({
    data: {
      code: 'MPCB_CTE',
      name: 'Consent to Establish (CTE) - Orange/Red Category',
      departmentId: mpcb.id,
      priority: 'HIGH',
      statutoryDaysSLA: 21,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 36,
      description: 'Mandatory environmental approval prior to breaking ground or installing industrial machinery.'
    }
  });

  const approvalFire = await prisma.approval.create({
    data: {
      code: 'FIRE_NOC',
      name: 'Provisional Fire Safety No-Objection Certificate (NOC)',
      departmentId: fire.id,
      priority: 'HIGH',
      statutoryDaysSLA: 15,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 12,
      description: 'Verification of industrial layout, hydrants, sprinkler loops, and emergency egress.'
    }
  });

  const approvalDish = await prisma.approval.create({
    data: {
      code: 'DISH_FACTORY',
      name: 'Factory License & Layout Plan Approval (Form 1)',
      departmentId: dish.id,
      priority: 'HIGH',
      statutoryDaysSLA: 30,
      isInspectionRequired: true,
      isRenewalRequired: true,
      renewalFrequencyMonths: 12,
      description: 'Factory structural layout, machine spacing, and occupational safety plan sanction.'
    }
  });

  const approvalPower = await prisma.approval.create({
    data: {
      code: 'MSEDCL_HT_SANCTION',
      name: 'High Tension (HT) Industrial Power Sanction',
      departmentId: msedcl.id,
      priority: 'MEDIUM',
      statutoryDaysSLA: 14,
      isInspectionRequired: true,
      isRenewalRequired: false,
      renewalFrequencyMonths: 0,
      description: 'Sanction of dedicated HT industrial line & transformer substation feasibility.'
    }
  });

  const approvalLabour = await prisma.approval.create({
    data: {
      code: 'LABOUR_REGISTRATION',
      name: 'Principal Employer Contract Labour Registration',
      departmentId: labour.id,
      priority: 'MEDIUM',
      statutoryDaysSLA: 7,
      isInspectionRequired: false,
      isRenewalRequired: true,
      renewalFrequencyMonths: 12,
      description: 'Mandatory compliance registration for units employing contract workforce.'
    }
  });

  console.log('✓ Seeded Statutory Approvals with SLAs');

  // 4. Create Companies & Projects
  const company = await prisma.company.create({
    data: {
      userId: entrepreneur.id,
      name: 'ABC Industries Pvt Ltd',
      cin: 'U17120MH2021PTC365412',
      pan: 'AABCA1234F',
      gstin: '27AABCA1234F1Z5',
      udyam: 'UDYAM-MH-26-0034182',
      companyType: 'Private Limited',
      dateOfIncorporation: '2021-08-20',
      registeredAddress: 'Plot No. C-14, Additional MIDC, Baramati, Pune 413133',
      district: 'Pune',
      taluka: 'Baramati',
      industrialArea: 'Additional Baramati MIDC',
      directors: 'Rajesh Sharma, Sunita Sharma',
      employeeCount: 300,
      annualTurnover: 42.5,
      businessSector: 'Textile',
      verificationStatus: 'VERIFIED'
    }
  });

  const project = await prisma.project.create({
    data: {
      companyId: company.id,
      name: 'ABC High-Tech Textile & Technical Fabrics Facility',
      projectType: 'New',
      sector: 'Textile',
      state: 'Maharashtra',
      district: 'Pune',
      taluka: 'Baramati',
      industrialArea: 'Additional Baramati MIDC',
      midcPlot: 'Plot C-14',
      landCost: 4.5,
      buildingCost: 8.0,
      machineryCost: 11.5,
      otherCost: 1.0,
      totalInvestment: 25.0, // 25 Crore
      productionType: 'Continuous Automated Weaving & Technical Fabric Processing',
      productionCapacity: '15,000 meters / day',
      employeeCount: 300,
      waterReq: 60, // KLD
      powerReq: 500, // kVA (HT)
      waterConsumption: 60,
      wastewater: 35, // KLD (Triggering MPCB)
      airEmissions: 'Boiler flue gas with baghouse filter assembly',
      hazardousMaterials: true,
      solidWaste: 1.5,
      hazardousWaste: true,
      buildingRequired: true,
      factoryRequired: true,
      fireRisk: 'High',
      buildingArea: 4800, // sq m
      status: 'APPLICATIONS_IN_PROGRESS',
      healthScore: 88
    }
  });

  console.log('✓ Seeded Company & Project: ABC Industries Pvt Ltd (25 Cr Textile Unit)');

  // 5. Create Documents with realistic extraction & issues
  const docPan = await prisma.document.create({
    data: {
      companyId: company.id,
      projectId: project.id,
      category: 'Identity',
      name: 'Company PAN Card',
      filePath: '/uploads/sample_pan.pdf',
      fileType: 'application/pdf',
      fileSize: 420000,
      extractedData: JSON.stringify({
        documentType: 'Company PAN Card',
        pan: 'AABCA1234F',
        companyName: 'ABC Industries Pvt Ltd',
        authority: 'Income Tax Department, Govt of India',
        issueDate: '2021-08-15',
        isReadable: true
      }),
      status: 'VERIFIED',
      healthScore: 100
    }
  });

  const docGst = await prisma.document.create({
    data: {
      companyId: company.id,
      projectId: project.id,
      category: 'Tax',
      name: 'GST Registration Certificate (REG-06)',
      filePath: '/uploads/sample_gst.pdf',
      fileType: 'application/pdf',
      fileSize: 680000,
      extractedData: JSON.stringify({
        documentType: 'GST Registration Certificate',
        gstin: '27AABCA1234F1Z5',
        pan: 'AABCA1234F',
        companyName: 'ABC Industries Private Limited', // Intentional minor name variation for demo!
        authority: 'GSTN, Government of Maharashtra',
        issueDate: '2022-04-10',
        isReadable: true
      }),
      status: 'NEEDS_REVIEW',
      issuesJson: JSON.stringify([
        {
          id: 'NAME_MISMATCH',
          severity: 'MEDIUM',
          category: 'CONSISTENCY',
          title: 'Company name variation detected across documents',
          description: "Entity name appears as 'ABC Industries Private Limited' on GST certificate and 'ABC Industries Pvt Ltd' on PAN/Incorporation.",
          suggestedAction: 'Verify that legal entity name spelling matches consistently.'
        }
      ]),
      healthScore: 85
    }
  });

  const docLand = await prisma.document.create({
    data: {
      companyId: company.id,
      projectId: project.id,
      category: 'Land',
      name: 'MIDC Plot Possession & Registered Lease Deed',
      filePath: '/uploads/sample_midc_lease.pdf',
      fileType: 'application/pdf',
      fileSize: 1240000,
      extractedData: JSON.stringify({
        documentType: 'MIDC Lease Deed',
        documentNumber: 'MIDC/RO/PUNE/2023/PL-14',
        companyName: 'ABC Industries Pvt Ltd',
        address: 'Plot C-14, Additional Baramati MIDC, Pune',
        authority: 'MIDC Pune Region',
        issueDate: '2023-03-01',
        isReadable: true
      }),
      status: 'VERIFIED',
      healthScore: 100
    }
  });

  const docEnv = await prisma.document.create({
    data: {
      companyId: company.id,
      projectId: project.id,
      category: 'Environmental',
      name: 'Environmental Management Plan & ETP Baseline Report',
      filePath: '/uploads/sample_emp.pdf',
      fileType: 'application/pdf',
      fileSize: 3100000,
      extractedData: JSON.stringify({
        documentType: 'Environmental Baseline Study',
        companyName: 'ABC Industries Pvt Ltd',
        authority: 'Accredited EIA Consultant / MPCB Empanelled',
        issueDate: '2023-11-20',
        expiryDate: '2024-11-30', // Expiring soon for demo warning
        isReadable: true
      }),
      status: 'NEEDS_REVIEW',
      issuesJson: JSON.stringify([
        {
          id: 'EXPIRING_SOON',
          severity: 'MEDIUM',
          category: 'VALIDITY',
          title: 'Baseline study validity expiring soon',
          description: 'Environmental baseline sampling is valid up to 2024-11-30.',
          suggestedAction: 'Ensure baseline ambient data remains current during scrutiny.'
        }
      ]),
      healthScore: 85
    }
  });

  const docFactory = await prisma.document.create({
    data: {
      companyId: company.id,
      projectId: project.id,
      category: 'Factory',
      name: 'Factory Layout & Machinery Blueprint Plan',
      filePath: '/uploads/sample_factory_plan.pdf',
      fileType: 'application/pdf',
      fileSize: 4500000,
      extractedData: JSON.stringify({
        documentType: 'Factory Machine Layout',
        companyName: 'ABC Industries Pvt Ltd',
        isSigned: false, // Intentional missing signature for demo!
        authority: 'Chartered Structural Engineer',
        isReadable: true
      }),
      status: 'NEEDS_REVIEW',
      issuesJson: JSON.stringify([
        {
          id: 'MISSING_SIGNATURE',
          severity: 'HIGH',
          category: 'SIGNATURE',
          title: 'Authorized architect seal / signature missing',
          description: 'Factory structural layout blueprint appears unsigned on sheet 3.',
          suggestedAction: 'Upload certified sheet signed and stamped by licensed structural engineer.'
        }
      ]),
      healthScore: 75
    }
  });

  console.log('✓ Seeded Document Vault with 20-Point Error Scrutiny items (Health Score: 88%)');

  // 6. Create Applications in realistic states
  const now = new Date();

  // App 1: MPCB Consent to Establish (Under Review, 12 days remaining)
  const appMpcb = await prisma.application.create({
    data: {
      projectId: project.id,
      approvalId: approvalMpcb.id,
      departmentId: mpcb.id,
      applicationNumber: 'UDY-2026-MPCB-4491',
      status: 'UNDER_REVIEW',
      currentStage: 'Document & ETP Scrutiny',
      submittedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      slaDueDate: new Date(now.getTime() + 17 * 24 * 60 * 60 * 1000), // 17 days left of 21
      slaStatus: 'ON_TRACK',
      riskScore: 28,
      riskFactorsJson: JSON.stringify(['35 KLD trade effluent treatment scrutiny', 'ETP zero discharge validation']),
      preScrutinySummary: 'All statutory records verified. 35 KLD trade effluent requires common inspection with DISH squad.',
      feePaid: 15000.0
    }
  });

  await prisma.applicationTimeline.create({
    data: {
      applicationId: appMpcb.id,
      stage: 'Submission',
      status: 'SUBMITTED',
      remarks: 'Submitted via UdyogSetu. Verified GST and MIDC credentials auto-populated.',
      actorName: entrepreneur.name,
      actorRole: 'ENTREPRENEUR',
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.applicationTimeline.create({
    data: {
      applicationId: appMpcb.id,
      stage: 'Desk Scrutiny',
      status: 'UNDER_REVIEW',
      remarks: 'Assigned to Dr. Anjali Patil (SRO Pune-I). Desk scrutiny on ETP baseline underway.',
      actorName: 'UdyogSetu System',
      actorRole: 'SYSTEM',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    }
  });

  // App 2: Fire NOC (Query Raised / Inspection Opportunity)
  const appFire = await prisma.application.create({
    data: {
      projectId: project.id,
      approvalId: approvalFire.id,
      departmentId: fire.id,
      applicationNumber: 'UDY-2026-FIRE-2104',
      status: 'QUERY_RAISED',
      currentStage: 'Clarification Required',
      submittedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      slaDueDate: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
      slaStatus: 'ON_TRACK',
      riskScore: 35,
      riskFactorsJson: JSON.stringify(['High fire risk textile category', 'Internal driveway turning radius check']),
      preScrutinySummary: 'Provisional layout meets 6m driveway clearance. Clarification sought regarding booster pump capacity.',
      feePaid: 7500.0
    }
  });

  await prisma.clarificationQuery.create({
    data: {
      applicationId: appFire.id,
      officerId: fireOfficer.id,
      queryText: 'Please submit certified calculation of static underground fire water storage tank capacity (minimum 100,000 Litres recommended for 4800 sq.m built-up area).',
      status: 'PENDING'
    }
  });

  // App 3: DISH Factory License (Approaching Deadline / Common Inspection Candidate)
  const appDish = await prisma.application.create({
    data: {
      projectId: project.id,
      approvalId: approvalDish.id,
      departmentId: dish.id,
      applicationNumber: 'UDY-2026-DISH-8832',
      status: 'UNDER_REVIEW',
      currentStage: 'Safety Blueprint Scrutiny',
      submittedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      slaDueDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      slaStatus: 'ON_TRACK',
      riskScore: 30,
      riskFactorsJson: JSON.stringify(['300 factory workers', 'Machinery layout signature clarification']),
      preScrutinySummary: 'Worker amenity provisions checked. Common inspection opportunity identified with MPCB & Fire.',
      feePaid: 12000.0
    }
  });

  // App 4: MSEDCL Power Sanction (APPROVED & Issued!)
  const appPower = await prisma.application.create({
    data: {
      projectId: project.id,
      approvalId: approvalPower.id,
      departmentId: msedcl.id,
      applicationNumber: 'UDY-2026-MSEDCL-1049',
      status: 'APPROVED',
      currentStage: 'Sanctioned & Grid Feasibility Issued',
      submittedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      slaDueDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      slaStatus: 'ON_TRACK',
      riskScore: 10,
      riskFactorsJson: JSON.stringify(['Standard 11kV substation feeder']),
      preScrutinySummary: 'Substation feasibility confirmed. Sanction letter issued.',
      certificateUrl: '/certificates/SANCTION_UDY-2026-MSEDCL-1049.pdf',
      feePaid: 25000.0
    }
  });

  // App 5: Labour Registration (SLA BREACHED Demo Example for Escalation demo!)
  const appLabour = await prisma.application.create({
    data: {
      projectId: project.id,
      approvalId: approvalLabour.id,
      departmentId: labour.id,
      applicationNumber: 'UDY-2026-LABOUR-9011',
      status: 'SLA_BREACHED',
      currentStage: 'Statutory Escalation to Senior Officer',
      submittedAt: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000), // 16 days ago on 7 day SLA
      slaDueDate: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000), // 9 days overdue!
      slaStatus: 'BREACHED',
      riskScore: 20,
      preScrutinySummary: 'Statutory 7-day SLA exceeded. Auto-escalated to Senior Supervisory Officer Shri Sunil Joshi, IAS.',
      feePaid: 2000.0
    }
  });

  await prisma.applicationTimeline.create({
    data: {
      applicationId: appLabour.id,
      stage: 'Statutory SLA Escalation',
      status: 'SLA_BREACHED',
      remarks: 'Automated statutory escalation triggered under Maharashtra RTSA 2015. 9 days overdue beyond 7-day SLA limit.',
      actorName: 'UdyogSetu SLA Engine',
      actorRole: 'SYSTEM'
    }
  });

  console.log('✓ Seeded Applications: MPCB (In Progress), FIRE (Query), DISH (In Progress), MSEDCL (Approved), LABOUR (SLA Breached Demo)');

  // 7. Create Common Inspection Record
  await prisma.inspection.create({
    data: {
      projectId: project.id,
      applicationIdsJson: JSON.stringify([appMpcb.id, appFire.id, appDish.id]),
      departmentCodesJson: JSON.stringify(['MPCB', 'FIRE', 'DISH']),
      scheduledDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      timeSlot: '10:30 AM - 01:30 PM',
      location: 'Plot C-14, Additional Baramati MIDC, District Pune',
      status: 'SCHEDULED',
      officerNames: 'Dr. Anjali Patil (MPCB), Insp. Vinod Shinde (Fire), Eng. Ramesh Gaikwad (DISH)',
      checklistJson: JSON.stringify([
        { item: 'Boundary and Plot Layout Verification', category: 'General', status: 'PENDING' },
        { item: 'Effluent Treatment Plant (ETP) / Zero Liquid Discharge Setup', category: 'Environmental', status: 'PENDING' },
        { item: 'Fire Hydrant Ring, Underground Water Tank & Fire Extinguishers', category: 'Fire Safety', status: 'PENDING' },
        { item: 'Emergency Exit Routes and Minimum 6m Clear Driveway Access', category: 'Safety', status: 'PENDING' },
        { item: 'Factory Machine Guarding, Ventilation & Worker Restrooms', category: 'DISH Factory Conditions', status: 'PENDING' },
        { item: 'High Tension Electrical Substation Fencing & Earthing Pit', category: 'Electrical Safety', status: 'PENDING' }
      ]),
      officerRemarks: 'Joint Common Inspection scheduled to save entrepreneur from 3 separate site visits.'
    }
  });

  console.log('✓ Seeded Common Inspection opportunity & joint schedule');

  // 8. Create Active Compliances & Renewals
  await prisma.compliance.create({
    data: {
      projectId: project.id,
      approvalId: approvalPower.id,
      name: 'Half-Yearly Energy & Power Factor Harmonic Audit',
      department: 'MSEDCL',
      frequency: 'Half-Yearly',
      dueDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
      status: 'UPCOMING',
      documentRequired: 'Chartered Electrical Safety Report'
    }
  });

  await prisma.compliance.create({
    data: {
      projectId: project.id,
      approvalId: approvalMpcb.id,
      name: 'Environmental Statement Return (Form V)',
      department: 'Maharashtra Pollution Control Board',
      frequency: 'Annual',
      dueDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      status: 'UPCOMING',
      documentRequired: 'Annual Environmental Audit Form V'
    }
  });

  await prisma.renewal.create({
    data: {
      projectId: project.id,
      approvalId: approvalPower.id,
      licenseName: 'High Tension Power Feeder Connectivity License',
      licenseNumber: 'HT-PUN-2024-8841',
      issueDate: new Date(now.getTime() - 300 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(now.getTime() + 65 * 24 * 60 * 60 * 1000), // Due in 65 days (Warning 60/90 trigger)
      renewalWindowDays: 60,
      status: 'RENEWAL_DUE'
    }
  });

  // 9. Seed Curated Schemes
  for (const s of CURATED_SCHEMES) {
    await prisma.scheme.create({
      data: {
        id: s.id,
        code: s.code,
        name: s.name,
        department: s.department,
        schemeType: s.schemeType,
        minInvestment: s.minInvestment,
        maxInvestment: s.maxInvestment,
        eligibleSectorsJson: JSON.stringify(s.eligibleSectors),
        eligibleLocationsJson: JSON.stringify(s.eligibleLocations),
        eligibleCompanyTypesJson: JSON.stringify(s.eligibleCompanyTypes),
        minEmployees: s.minEmployees,
        benefitsSummary: s.benefitsSummary,
        subsidyPercentage: s.subsidyPercentage,
        maxSubsidyAmount: s.maxSubsidyAmount,
        officialSourceUrl: s.officialSourceUrl,
        lastVerifiedDate: s.lastVerifiedDate,
        detailsJson: JSON.stringify(s.details)
      }
    });
  }

  console.log('✓ Seeded Curated Schemes database');

  // 10. Seed Grievance
  await prisma.grievance.create({
    data: {
      userId: entrepreneur.id,
      projectId: project.id,
      token: 'GRV-2026-88192',
      department: 'Office of the Labour Commissioner',
      category: 'Delay in Approval Processing',
      description: 'Principal employer registration (UDY-2026-LABOUR-9011) has been pending for over 16 days against the 7-day statutory limit. Kindly expedite.',
      status: 'UNDER_REVIEW',
      officerRemarks: 'Escalated to Senior Divisional Commissioner for priority disposal under RTSA 2015.'
    }
  });

  // 11. Seed Notifications
  await prisma.notification.create({
    data: {
      userId: entrepreneur.id,
      title: 'Clarification Requested: Fire NOC',
      message: 'Divisional Fire Officer has requested static water storage calculations for Plot C-14.',
      type: 'QUERY',
      link: `/applications/${appFire.id}`
    }
  });

  await prisma.notification.create({
    data: {
      userId: entrepreneur.id,
      title: 'Common Inspection Scheduled',
      message: 'Joint squad (MPCB, Fire, DISH) will visit Plot C-14 on 16th Sept, 10:30 AM.',
      type: 'INSPECTION',
      link: `/inspections`
    }
  });

  await prisma.notification.create({
    data: {
      userId: seniorOfficer.id,
      title: 'CRITICAL SLA BREACH: UDY-2026-LABOUR-9011',
      message: 'Statutory 7-day timeline breached by Labour Department. Application escalated for senior review.',
      type: 'SLA_BREACH',
      link: `/officer/escalations`
    }
  });

  // 12. Seed Statutory Regulations for Knowledge Base
  await prisma.regulation.create({
    data: {
      title: 'Water (Prevention and Control of Pollution) Act 1974',
      category: 'Environment',
      authority: 'Central Pollution Control Board & MPCB',
      summary: 'Mandates prior Consent to Establish (CTE) before starting construction of any industrial plant likely to discharge sewage or trade effluent.',
      officialUrl: 'https://mpcb.gov.in',
      effectiveDate: '1974-03-23',
      lastUpdated: '2026-01-01'
    }
  });

  await prisma.regulation.create({
    data: {
      title: 'Maharashtra Fire Prevention and Life Safety Measures Act 2006',
      category: 'Fire Safety',
      authority: 'Directorate of Maharashtra Fire Services',
      summary: 'Prescribes mandatory fire protection requirements, 6m clear motorable access, hydrant installations, and static fire water storage tanks for industrial buildings.',
      officialUrl: 'https://mahafireservice.gov.in',
      effectiveDate: '2006-08-01',
      lastUpdated: '2026-01-15'
    }
  });

  await prisma.regulation.create({
    data: {
      title: 'Factories Act 1948 & Maharashtra Factories Rules 1963',
      category: 'Factory Safety',
      authority: 'Directorate of Industrial Safety & Health (DISH)',
      summary: 'Requires layout plan approval from the Chief Inspector of Factories prior to constructing or extending premises employing 10 or more workers with power.',
      officialUrl: 'https://dish.maharashtra.gov.in',
      effectiveDate: '1948-04-01',
      lastUpdated: '2026-02-01'
    }
  });

  console.log('✅ Seed completed successfully! UdyogSetu is fully populated with realistic demo data.');
}

main()
  .catch(e => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
