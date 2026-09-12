import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/auth';
import { calculateSLA } from '../engines/slaEscalationEngine';
import { logAuditAction } from '../middleware/audit';

const router = Router();

// GET /api/officer/stats (Overview metrics for Government Officer dashboard)
router.get(
  '/stats',
  authenticateToken,
  requireRole(['DEPARTMENT_OFFICER', 'SENIOR_OFFICER', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const officerDept = req.user!.departmentCode;
      const filter: any = {};
      if (req.user!.role === 'DEPARTMENT_OFFICER' && officerDept) {
        filter.department = { code: officerDept };
      }

      const totalApplications = await prisma.application.count({ where: filter });
      const pendingReview = await prisma.application.count({
        where: { ...filter, status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } }
      });
      const queryRaised = await prisma.application.count({
        where: { ...filter, status: 'QUERY_RAISED' }
      });
      const inspectionRequired = await prisma.application.count({
        where: { ...filter, status: 'INSPECTION_SCHEDULED' }
      });
      const slaBreached = await prisma.application.count({
        where: { ...filter, slaStatus: 'BREACHED' }
      });
      const approved = await prisma.application.count({
        where: { ...filter, status: 'APPROVED' }
      });

      res.json({
        totalApplications,
        pendingReview,
        queryRaised,
        inspectionRequired,
        slaBreached,
        approved
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch officer stats' });
    }
  }
);

// GET /api/officer/escalations (Senior Officer queue of breached/escalated applications)
router.get(
  '/escalations',
  authenticateToken,
  requireRole(['SENIOR_OFFICER', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const escalated = await prisma.application.findMany({
        where: {
          OR: [
            { slaStatus: 'BREACHED' },
            { status: 'SLA_BREACHED' },
            { slaStatus: 'APPROACHING_DEADLINE' }
          ]
        },
        include: {
          approval: true,
          department: true,
          project: { include: { company: true } },
          timeline: { orderBy: { createdAt: 'desc' } }
        },
        orderBy: { slaDueDate: 'asc' }
      });

      const enriched = escalated.map(app => ({
        ...app,
        slaInfo: calculateSLA(app.submittedAt, app.slaDueDate, app.approval.statutoryDaysSLA)
      }));

      res.json(enriched);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch escalations' });
    }
  }
);

// POST /api/officer/reassign (Senior Officer reassigns application to another officer)
router.post(
  '/reassign',
  authenticateToken,
  requireRole(['SENIOR_OFFICER', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { applicationId, newOfficerId, remarks } = req.body;

      const app = await prisma.application.update({
        where: { id: applicationId },
        data: { assignedOfficerId: newOfficerId }
      });

      await prisma.applicationTimeline.create({
        data: {
          applicationId,
          stage: 'Senior Officer Reassignment',
          status: 'UNDER_REVIEW',
          remarks: remarks || `Reassigned by Senior Officer ${req.user!.name} for expedited clearance.`,
          actorName: req.user!.name,
          actorRole: req.user!.role
        }
      });

      await logAuditAction({
        userId: req.user!.id,
        userName: req.user!.name,
        action: 'APPLICATION_REASSIGNED',
        entityType: 'APPLICATION',
        entityId: applicationId,
        details: { newOfficerId, remarks }
      });

      res.json(app);
    } catch (error) {
      res.status(500).json({ message: 'Failed to reassign application' });
    }
  }
);

export default router;
