import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { logAuditAction } from '../middleware/audit';

const router = Router();

// GET /api/grievances
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userRole = req.user!.role;
    let whereClause: any = {};

    if (userRole === 'ENTREPRENEUR') {
      whereClause = { userId: req.user!.id };
    }

    const grievances = await prisma.grievance.findMany({
      where: whereClause,
      include: { project: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(grievances);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve grievances' });
  }
});

// POST /api/grievances (Create new grievance)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId, department, category, description } = req.body;

    // Generate statutory token: GRV-2026-XXXXX
    const rand = Math.floor(10000 + Math.random() * 90000);
    const token = `GRV-2026-${rand}`;

    const grievance = await prisma.grievance.create({
      data: {
        userId: req.user!.id,
        projectId: projectId || null,
        token,
        category: category || 'Delay in Approval Processing',
        department: department || 'General Single Window Cell',
        description,
        status: 'SUBMITTED'
      }
    });

    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: `Grievance Registered: ${token}`,
        message: `Your grievance regarding ${department} has been lodged. Monitored by the State Grievance Redressal Cell.`,
        type: 'APPLICATION_UPDATE',
        link: `/grievances`
      }
    });

    await logAuditAction({
      userId: req.user!.id,
      userName: req.user!.name,
      action: 'GRIEVANCE_FILED',
      entityType: 'GRIEVANCE',
      entityId: grievance.id,
      details: { token, department, category }
    });

    res.status(201).json(grievance);
  } catch (error) {
    res.status(500).json({ message: 'Failed to file grievance' });
  }
});

// POST /api/grievances/:id/resolve (Officer/Admin resolves grievance)
router.post('/:id/resolve', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { remarks } = req.body;

    const grievance = await prisma.grievance.update({
      where: { id: req.params.id },
      data: {
        status: 'RESOLVED',
        officerRemarks: remarks || 'Addressed by competent supervisory authority.',
        resolvedAt: new Date()
      }
    });

    res.json(grievance);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update grievance' });
  }
});

export default router;
