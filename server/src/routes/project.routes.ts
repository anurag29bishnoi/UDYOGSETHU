import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { evaluateApprovalRules } from '../engines/approvalRulesEngine';
import { evaluateSchemeEligibility } from '../engines/schemeMatchingEngine';
import { compileApprovalPipeline } from '../engines/pipelineCompiler';
import { simulateProjectChange } from '../engines/changeSimulator';
import { validatePreSubmission } from '../engines/preSubmissionValidator';
import { logAuditAction } from '../middleware/audit';

const router = Router();

// GET /api/projects
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        companies: {
          include: {
            projects: {
              include: {
                applications: {
                  include: {
                    approval: true,
                    department: true
                  }
                },
                documents: true,
                compliances: true,
                renewals: true,
                schemeApplications: {
                  include: { scheme: true }
                }
              }
            }
          }
        }
      }
    });

    const projects = user?.companies.flatMap(c => c.projects) || [];
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        documents: true,
        applications: {
          include: {
            approval: true,
            department: true,
            timeline: { orderBy: { createdAt: 'desc' } },
            queries: true
          }
        },
        inspections: true,
        compliances: true,
        renewals: true,
        schemeApplications: {
          include: { scheme: true }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch project details' });
  }
});

// POST /api/projects (8-Step Project Wizard)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      companyId,
      name,
      businessTypeCode,
      answers,
      answersJson,
      projectStage,
      projectType,
      sector,
      state,
      district,
      taluka,
      industrialArea,
      midcPlot,
      landCost,
      buildingCost,
      machineryCost,
      otherCost,
      totalInvestment,
      productionType,
      productionCapacity,
      employeeCount,
      waterReq,
      powerReq,
      waterConsumption,
      wastewater,
      airEmissions,
      hazardousMaterials,
      solidWaste,
      hazardousWaste,
      buildingRequired,
      factoryRequired,
      fireRisk,
      buildingArea
    } = req.body;

    let targetCompanyId = companyId;
    if (!targetCompanyId) {
      const company = await prisma.company.findFirst({ where: { userId: req.user!.id } });
      if (company) targetCompanyId = company.id;
      else {
        const newCo = await prisma.company.create({
          data: {
            userId: req.user!.id,
            name: `${name || 'Enterprise'} Entity`,
            companyType: 'Private Limited'
          }
        });
        targetCompanyId = newCo.id;
      }
    }

    let bTypeId: string | undefined = undefined;
    let finalSector = sector;
    if (businessTypeCode) {
      const dbBType = await prisma.businessType.findUnique({
        where: { code: businessTypeCode.toUpperCase() }
      });
      if (dbBType) {
        bTypeId = dbBType.id;
        if (!finalSector) finalSector = dbBType.name;
      }
    }

    const calculatedTotalInv = totalInvestment
      ? parseFloat(totalInvestment)
      : (parseFloat(landCost || 0) + parseFloat(buildingCost || 0) + parseFloat(machineryCost || 0) + parseFloat(otherCost || 0));

    const stringifiedAnswers = answers ? JSON.stringify(answers) : answersJson;

    const project = await prisma.project.create({
      data: {
        companyId: targetCompanyId,
        name: name || 'New Enterprise Project',
        businessTypeId: bTypeId,
        answersJson: stringifiedAnswers,
        projectStage: projectStage || 'Planning',
        projectType: projectType || 'New',
        sector: finalSector || 'General Enterprise',
        state: state || 'Maharashtra',
        district: district || 'Pune',
        taluka: taluka || 'Baramati',
        industrialArea: industrialArea || 'Additional Baramati MIDC',
        midcPlot: midcPlot || 'Plot C-14',
        landCost: parseFloat(landCost || 0),
        buildingCost: parseFloat(buildingCost || 0),
        machineryCost: parseFloat(machineryCost || 0),
        otherCost: parseFloat(otherCost || 0),
        totalInvestment: calculatedTotalInv,
        productionType,
        productionCapacity,
        employeeCount: employeeCount ? parseInt(employeeCount, 10) : 50,
        waterReq: waterReq ? parseFloat(waterReq) : 25,
        powerReq: powerReq ? parseFloat(powerReq) : 250,
        waterConsumption: waterConsumption ? parseFloat(waterConsumption) : 25,
        wastewater: wastewater ? parseFloat(wastewater) : 10,
        airEmissions,
        hazardousMaterials: Boolean(hazardousMaterials),
        solidWaste: solidWaste ? parseFloat(solidWaste) : 0,
        hazardousWaste: Boolean(hazardousWaste),
        buildingRequired: buildingRequired !== false,
        factoryRequired: factoryRequired !== false,
        fireRisk: fireRisk || 'Medium',
        buildingArea: buildingArea ? parseFloat(buildingArea) : 1200,
        status: 'ANALYZED'
      }
    });

    await logAuditAction({
      userId: req.user!.id,
      userName: req.user!.name,
      action: 'CREATE_PROJECT',
      entityType: 'PROJECT',
      entityId: project.id,
      details: { name: project.name, sector: project.sector, totalInvestment: project.totalInvestment }
    });

    res.status(201).json(project);
  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
});

// POST /api/projects/:id/analyze (Step 8: Generate Project Analysis)
router.post('/:id/analyze', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        documents: true
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const docCategories = project.documents.map(d => d.category);

    // 1. Run deterministic approval rules engine
    const approvalDiscovery = evaluateApprovalRules({
      id: project.id,
      name: project.name,
      projectType: project.projectType,
      sector: project.sector,
      state: project.state,
      district: project.district,
      industrialArea: project.industrialArea,
      midcPlot: project.midcPlot,
      totalInvestment: project.totalInvestment,
      employeeCount: project.employeeCount,
      waterReq: project.waterReq,
      powerReq: project.powerReq,
      wastewater: project.wastewater,
      hazardousMaterials: project.hazardousMaterials,
      hazardousWaste: project.hazardousWaste,
      buildingRequired: project.buildingRequired,
      factoryRequired: project.factoryRequired,
      fireRisk: project.fireRisk,
      buildingArea: project.buildingArea
    });

    // 2. Run deterministic government scheme matching engine
    const matchedSchemes = evaluateSchemeEligibility(
      {
        id: project.id,
        name: project.name,
        projectType: project.projectType,
        sector: project.sector,
        state: project.state,
        district: project.district,
        totalInvestment: project.totalInvestment,
        employeeCount: project.employeeCount,
        waterReq: project.waterReq,
        powerReq: project.powerReq,
        wastewater: project.wastewater,
        hazardousMaterials: project.hazardousMaterials,
        hazardousWaste: project.hazardousWaste,
        buildingRequired: project.buildingRequired,
        factoryRequired: project.factoryRequired,
        fireRisk: project.fireRisk,
        buildingArea: project.buildingArea
      },
      project.company,
      docCategories
    );

    // Update project status
    await prisma.project.update({
      where: { id: project.id },
      data: { status: 'ANALYZED' }
    });

    res.json({
      project,
      approvalDiscovery,
      matchedSchemes,
      analysisSummary: {
        requiredApprovalsCount: approvalDiscovery.totalApprovals,
        inspectionRequiredCount: approvalDiscovery.inspectionRequiredCount,
        parallelProcessingPossible: approvalDiscovery.parallelProcessingPossible,
        eligibleSchemesCount: matchedSchemes.filter(s => s.eligibilityStatus !== 'Not Eligible').length
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze project' });
  }
});

// GET /api/projects/:id/pipeline (Pipeline Compiler & Critical Path Graph)
router.get('/:id/pipeline', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        documents: true,
        applications: {
          include: { approval: true }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const activeApps = project.applications.map(a => ({
      approvalCode: a.approval.code,
      status: a.status
    }));
    const docCategories = project.documents.map(d => d.category);

    const pipeline = compileApprovalPipeline(
      {
        id: project.id,
        name: project.name,
        projectType: project.projectType,
        sector: project.sector,
        state: project.state,
        district: project.district,
        industrialArea: project.industrialArea,
        midcPlot: project.midcPlot,
        totalInvestment: project.totalInvestment,
        employeeCount: project.employeeCount,
        waterReq: project.waterReq,
        powerReq: project.powerReq,
        wastewater: project.wastewater,
        hazardousMaterials: project.hazardousMaterials,
        hazardousWaste: project.hazardousWaste,
        buildingRequired: project.buildingRequired,
        factoryRequired: project.factoryRequired,
        fireRisk: project.fireRisk,
        buildingArea: project.buildingArea
      },
      activeApps,
      docCategories
    );

    res.json(pipeline);
  } catch (error) {
    console.error('Pipeline compilation error:', error);
    res.status(500).json({ message: 'Failed to compile approval pipeline' });
  }
});

// POST /api/projects/:id/simulate-change (Feature 22: Change Impact Simulator)
router.post('/:id/simulate-change', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        documents: true
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const proposedChanges = req.body;
    const docCategories = project.documents.map(d => d.category);

    const simulation = simulateProjectChange(
      {
        id: project.id,
        name: project.name,
        projectType: project.projectType,
        sector: project.sector,
        state: project.state,
        district: project.district,
        industrialArea: project.industrialArea,
        midcPlot: project.midcPlot,
        totalInvestment: project.totalInvestment,
        employeeCount: project.employeeCount,
        waterReq: project.waterReq,
        powerReq: project.powerReq,
        wastewater: project.wastewater,
        hazardousMaterials: project.hazardousMaterials,
        hazardousWaste: project.hazardousWaste,
        buildingRequired: project.buildingRequired,
        factoryRequired: project.factoryRequired,
        fireRisk: project.fireRisk,
        buildingArea: project.buildingArea
      },
      proposedChanges,
      project.company,
      docCategories
    );

    res.json(simulation);
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ message: 'Failed to execute project change simulation' });
  }
});

// POST /api/projects/:id/apply-simulation (Commit simulated changes to real project)
router.post('/:id/apply-simulation', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { proposedProfile } = req.body;
    if (!proposedProfile) {
      return res.status(400).json({ message: 'Proposed profile payload is required' });
    }

    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        totalInvestment: proposedProfile.totalInvestment,
        employeeCount: proposedProfile.employeeCount,
        sector: proposedProfile.sector,
        waterReq: proposedProfile.waterReq,
        powerReq: proposedProfile.powerReq,
        wastewater: proposedProfile.wastewater,
        hazardousMaterials: proposedProfile.hazardousMaterials,
        hazardousWaste: proposedProfile.hazardousWaste,
        fireRisk: proposedProfile.fireRisk,
        buildingArea: proposedProfile.buildingArea
      },
      include: { company: true, documents: true }
    });

    await logAuditAction({
      userId: req.user!.id,
      userName: req.user!.name,
      action: 'APPLY_SIMULATION_CHANGES',
      entityType: 'PROJECT',
      entityId: updated.id,
      details: {
        newInvestment: updated.totalInvestment,
        newEmployees: updated.employeeCount,
        newSector: updated.sector
      }
    });

    res.json({
      message: 'Simulated parameters applied successfully to active project.',
      project: updated
    });
  } catch (error) {
    console.error('Error applying simulation:', error);
    res.status(500).json({ message: 'Failed to apply simulated changes' });
  }
});

// POST /api/projects/:id/pre-submission-check (Feature 23: Pre-Submission Validator)
router.post('/:id/pre-submission-check', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { approvalCode } = req.body;
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        documents: {
          include: { verifications: true }
        },
        applications: {
          include: { approval: true }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const discovery = evaluateApprovalRules({
      id: project.id,
      name: project.name,
      projectType: project.projectType,
      sector: project.sector,
      state: project.state,
      district: project.district,
      totalInvestment: project.totalInvestment,
      employeeCount: project.employeeCount,
      waterReq: project.waterReq,
      powerReq: project.powerReq,
      wastewater: project.wastewater,
      hazardousMaterials: project.hazardousMaterials,
      hazardousWaste: project.hazardousWaste,
      buildingRequired: project.buildingRequired,
      factoryRequired: project.factoryRequired,
      fireRisk: project.fireRisk,
      buildingArea: project.buildingArea
    });

    const targetApproval = discovery.approvals.find(a => a.approvalCode === approvalCode) || discovery.approvals[0];

    if (!targetApproval) {
      return res.status(400).json({ message: 'No approval found to validate' });
    }

    const checkResult = validatePreSubmission(
      targetApproval,
      project,
      project.company,
      project.documents,
      project.applications
    );

    res.json(checkResult);
  } catch (error) {
    console.error('Pre-submission check error:', error);
    res.status(500).json({ message: 'Failed to execute pre-submission validation' });
  }
});

// GET /api/projects/:id/submission-package (Feature 24: Submission Package Generation)
router.get('/:id/submission-package', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        documents: { include: { verifications: true } },
        applications: { include: { approval: true } }
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const discovery = evaluateApprovalRules({
      id: project.id,
      name: project.name,
      projectType: project.projectType,
      sector: project.sector,
      state: project.state,
      district: project.district,
      totalInvestment: project.totalInvestment,
      employeeCount: project.employeeCount,
      waterReq: project.waterReq,
      powerReq: project.powerReq,
      wastewater: project.wastewater,
      hazardousMaterials: project.hazardousMaterials,
      hazardousWaste: project.hazardousWaste,
      buildingRequired: project.buildingRequired,
      factoryRequired: project.factoryRequired,
      fireRisk: project.fireRisk,
      buildingArea: project.buildingArea
    });

    const targetApproval = discovery.approvals[0];
    const validation = validatePreSubmission(
      targetApproval,
      project,
      project.company,
      project.documents,
      project.applications
    );

    const packageSummary = {
      projectTitle: project.name,
      corporateEntity: project.company.name,
      cin: project.company.cin,
      pan: project.company.pan,
      gstin: project.company.gstin,
      sector: project.sector,
      location: `${project.industrialArea || 'MIDC'}, Plot ${project.midcPlot || 'N/A'}, ${project.district}, ${project.state}`,
      totalInvestment: `₹${project.totalInvestment} Crore`,
      targetClearance: targetApproval.approvalName,
      department: targetApproval.departmentName,
      statutoryAct: targetApproval.legalAct,
      packageReference: validation.submissionPackage.packageReference,
      statutorySLA: `${targetApproval.statutoryDaysSLA} Working Days (RTSA 2015)`,
      estimatedFilingChallanFee: `₹${validation.submissionPackage.filingFeeINR.toLocaleString('en-IN')}`,
      attachedDossierList: validation.submissionPackage.attachedDocuments,
      statutoryDeclarations: validation.submissionPackage.statutoryDeclarations,
      generatedTimestamp: new Date().toISOString(),
      validationReadiness: validation.status,
      overallHealthScore: validation.overallScore
    };

    res.json(packageSummary);
  } catch (error) {
    console.error('Submission package error:', error);
    res.status(500).json({ message: 'Failed to generate submission package' });
  }
});

// PUT /api/projects/:id (Update project details)
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: req.body,
      include: { company: true }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update project' });
  }
});

export default router;
