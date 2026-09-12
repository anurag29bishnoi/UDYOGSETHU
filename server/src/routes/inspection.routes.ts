import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { logAuditAction } from '../middleware/audit';

const router = Router();

// GET /api/inspections (List inspections)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userRole = req.user!.role;
    let whereClause: any = {};

    if (userRole === 'ENTREPRENEUR') {
      const company = await prisma.company.findFirst({ where: { userId: req.user!.id } });
      if (!company) return res.json([]);
      whereClause = { project: { companyId: company.id } };
    }

    const inspections = await prisma.inspection.findMany({
      where: whereClause,
      include: {
        project: {
          include: { company: true }
        }
      },
      orderBy: { scheduledDate: 'asc' }
    });

    res.json(inspections);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve inspections' });
  }
});

// GET /api/inspections/opportunities/:projectId (Detect multiple departments requiring inspection)
router.get('/opportunities/:projectId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      include: {
        applications: {
          where: {
            status: { in: ['UNDER_REVIEW', 'SUBMITTED', 'INSPECTION_SCHEDULED'] }
          },
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

    const inspectionApps = project.applications.filter(a => a.approval.isInspectionRequired);
    const departmentCodes = Array.from(new Set(inspectionApps.map(a => a.department.code)));

    const hasCommonOpportunity = inspectionApps.length >= 2;

    res.json({
      hasCommonOpportunity,
      qualifyingApplications: inspectionApps,
      departments: departmentCodes,
      suggestedLocation: `${project.midcPlot || 'Plot C-14'}, ${project.industrialArea || 'MIDC'}, ${project.district}`,
      recommendedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to evaluate inspection opportunity' });
  }
});

// POST /api/inspections/schedule (Schedule Joint Inspection)
router.post('/schedule', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      projectId,
      applicationIds,
      departmentCodes,
      scheduledDate,
      timeSlot,
      location,
      officerNames
    } = req.body;

    const inspection = await prisma.inspection.create({
      data: {
        projectId,
        applicationIdsJson: JSON.stringify(applicationIds || []),
        departmentCodesJson: JSON.stringify(departmentCodes || ['MPCB', 'FIRE', 'DISH']),
        scheduledDate: new Date(scheduledDate || Date.now() + 5 * 24 * 60 * 60 * 1000),
        timeSlot: timeSlot || '10:30 AM - 01:30 PM',
        location: location || 'Plot C-14, Additional Baramati MIDC, Pune',
        status: 'SCHEDULED',
        officerNames: officerNames || 'Joint Squad: Er. S. Kulkarni (MPCB), Insp. V. Patil (Fire), Insp. R. Deshmukh (DISH)',
        checklistJson: JSON.stringify([
          { item: 'Boundary and Plot Layout Verification', category: 'General', status: 'PENDING' },
          { item: 'Effluent Treatment Plant (ETP) / Zero Liquid Discharge Setup', category: 'Environmental', status: 'PENDING' },
          { item: 'Fire Hydrant Ring, Underground Water Tank & Fire Extinguishers', category: 'Fire Safety', status: 'PENDING' },
          { item: 'Emergency Exit Routes and Minimum 6m Clear Driveway Access', category: 'Safety', status: 'PENDING' },
          { item: 'Factory Machine Guarding, Ventilation & Worker Restrooms', category: 'DISH Factory Conditions', status: 'PENDING' },
          { item: 'High Tension Electrical Substation Fencing & Earthing Pit', category: 'Electrical Safety', status: 'PENDING' }
        ])
      }
    });

    // Update statuses of included applications
    if (Array.isArray(applicationIds)) {
      for (const appId of applicationIds) {
        await prisma.application.update({
          where: { id: appId },
          data: {
            status: 'INSPECTION_SCHEDULED',
            currentStage: 'Joint Field Inspection'
          }
        });

        await prisma.applicationTimeline.create({
          data: {
            applicationId: appId,
            stage: 'Field Inspection',
            status: 'INSPECTION_SCHEDULED',
            remarks: `Common Joint Inspection scheduled on ${new Date(scheduledDate).toLocaleDateString()} with squad officers.`,
            actorName: req.user!.name,
            actorRole: req.user!.role
          }
        });
      }
    }

    await logAuditAction({
      userId: req.user!.id,
      userName: req.user!.name,
      action: 'INSPECTION_SCHEDULED',
      entityType: 'INSPECTION',
      entityId: inspection.id,
      details: { scheduledDate, departments: departmentCodes }
    });

    res.status(201).json(inspection);
  } catch (error) {
    console.error('Inspection schedule error:', error);
    res.status(500).json({ message: 'Failed to schedule inspection' });
  }
});

// POST /api/inspections/:id/submit-report (Officer submits field inspection findings)
router.post('/:id/submit-report', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { checklist, remarks, evidencePhotos } = req.body;

    const inspection = await prisma.inspection.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        checklistJson: JSON.stringify(checklist),
        officerRemarks: remarks || 'Site verified. All joint safety, environmental, and structural standards satisfied satisfactorily.',
        evidencePhotosJson: JSON.stringify(evidencePhotos || ['/uploads/inspection_evidence_1.jpg']),
        reportSubmittedAt: new Date()
      }
    });

    // Update the applications included in this inspection to INSPECTION_COMPLETED
    let appIds: string[] = [];
    try {
      appIds = JSON.parse(inspection.applicationIdsJson);
    } catch (e) {}

    for (const appId of appIds) {
      await prisma.application.update({
        where: { id: appId },
        data: {
          status: 'UNDER_REVIEW',
          currentStage: 'Post-Inspection Final Review'
        }
      });

      await prisma.applicationTimeline.create({
        data: {
          applicationId: appId,
          stage: 'Field Inspection',
          status: 'INSPECTION_COMPLETED',
          remarks: `Joint Field Inspection Report filed and signed by squad officers. Site conditions verified satisfactory.`,
          actorName: req.user!.name,
          actorRole: req.user!.role
        }
      });
    }

    await logAuditAction({
      userId: req.user!.id,
      userName: req.user!.name,
      action: 'INSPECTION_REPORT_SUBMITTED',
      entityType: 'INSPECTION',
      entityId: inspection.id,
      details: { remarks }
    });

    res.json(inspection);
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit inspection report' });
  }
});

export default router;
