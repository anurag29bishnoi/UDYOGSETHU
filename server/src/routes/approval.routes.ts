import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { evaluateApprovalRules } from '../engines/approvalRulesEngine';

const router = Router();

// GET /api/approvals/discover/:projectId
router.get('/discover/:projectId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      include: {
        documents: true,
        applications: {
          include: {
            approval: true,
            department: true
          }
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

    // Check which approvals already have an active application
    const existingCodes = new Set(project.applications.map(a => a.approval.code));

    const roadmap = discovery.approvals.map(approval => {
      const existing = project.applications.find(a => a.approval.code === approval.approvalCode);
      return {
        ...approval,
        isApplied: Boolean(existing),
        applicationId: existing ? existing.id : null,
        applicationStatus: existing ? existing.status : 'NOT_APPLIED',
        applicationNumber: existing ? existing.applicationNumber : null
      };
    });

    res.json({
      ...discovery,
      approvals: roadmap
    });
  } catch (error) {
    console.error('Error discovering approvals:', error);
    res.status(500).json({ message: 'Failed to evaluate required approvals' });
  }
});

// GET /api/approvals/all (Master list of statutory approvals)
router.get('/all', async (req, res) => {
  try {
    const approvals = await prisma.approval.findMany({
      include: {
        department: true,
        requirements: true
      },
      orderBy: { priority: 'desc' }
    });
    res.json(approvals);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load approvals catalog' });
  }
});

export default router;
