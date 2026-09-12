import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/auth';
import { logAuditAction } from '../middleware/audit';

const router = Router();

// GET /api/admin/audit-logs (View immutable audit trail)
router.get(
  '/audit-logs',
  authenticateToken,
  requireRole(['ADMIN', 'SENIOR_OFFICER']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { entityType, search } = req.query;
      const where: any = {};
      if (entityType && typeof entityType === 'string') where.entityType = entityType;

      const logs = await prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100
      });

      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch audit logs' });
    }
  }
);

// GET /api/admin/rules (List all approval rules)
router.get('/rules', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const rules = await prisma.approvalRule.findMany({
      include: {
        approval: { include: { department: true } }
      }
    });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch rules' });
  }
});

// POST /api/admin/rules (Create / update dynamic approval rule)
router.post('/rules', authenticateToken, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { approvalId, conditionsJson, rationale } = req.body;

    const rule = await prisma.approvalRule.create({
      data: {
        approvalId,
        conditionsJson: typeof conditionsJson === 'string' ? conditionsJson : JSON.stringify(conditionsJson),
        rationale: rationale || 'Configured via Admin Rule Builder'
      }
    });

    await logAuditAction({
      userId: req.user!.id,
      userName: req.user!.name,
      action: 'RULE_CREATED',
      entityType: 'RULE',
      entityId: rule.id,
      details: { rationale }
    });

    res.status(201).json(rule);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create rule' });
  }
});

// ==========================================
// DEMO SIMULATION CONTROLS (For SIH Presentation)
// ==========================================

// POST /api/admin/demo/simulate-sla-breach (Instantly shifts an application's dates to breached status)
router.post(
  '/demo/simulate-sla-breach',
  authenticateToken,
  requireRole(['ADMIN', 'SENIOR_OFFICER']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { applicationId } = req.body;

      // Find application or pick first active one
      const targetApp = applicationId
        ? await prisma.application.findUnique({ where: { id: applicationId }, include: { approval: true, department: true } })
        : await prisma.application.findFirst({
            where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
            include: { approval: true, department: true }
          });

      if (!targetApp) {
        return res.status(404).json({ message: 'No active application available to simulate breach' });
      }

      // Shift dates 30 days into the past
      const pastSubmitted = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);
      const pastDueDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

      const updated = await prisma.application.update({
        where: { id: targetApp.id },
        data: {
          submittedAt: pastSubmitted,
          slaDueDate: pastDueDate,
          slaStatus: 'BREACHED',
          status: 'SLA_BREACHED'
        }
      });

      await prisma.applicationTimeline.create({
        data: {
          applicationId: targetApp.id,
          stage: 'Statutory SLA Escalation',
          status: 'SLA_BREACHED',
          remarks: `Simulated SLA Breach event triggered. Elapsed days: 35. Statutory limit: ${targetApp.approval.statutoryDaysSLA} days. Auto-escalated to Senior Supervisory Officer.`,
          actorName: 'Demo SLA Simulator',
          actorRole: 'SYSTEM'
        }
      });

      await logAuditAction({
        userId: req.user!.id,
        userName: req.user!.name,
        action: 'SIMULATE_SLA_BREACH',
        entityType: 'APPLICATION',
        entityId: targetApp.id,
        details: { applicationNumber: targetApp.applicationNumber }
      });

      res.json({
        message: `Simulated SLA Breach successfully applied to ${targetApp.applicationNumber}`,
        application: updated
      });
    } catch (error) {
      console.error('Simulate SLA breach error:', error);
      res.status(500).json({ message: 'Failed to simulate SLA breach' });
    }
  }
);

// POST /api/admin/demo/simulate-sla-warning
router.post(
  '/demo/simulate-sla-warning',
  authenticateToken,
  requireRole(['ADMIN', 'SENIOR_OFFICER']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { applicationId } = req.body;

      const targetApp = applicationId
        ? await prisma.application.findUnique({ where: { id: applicationId } })
        : await prisma.application.findFirst({ where: { status: 'UNDER_REVIEW' } });

      if (!targetApp) {
        return res.status(404).json({ message: 'No active application found' });
      }

      // Due in 1 day
      const dueSoon = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);

      const updated = await prisma.application.update({
        where: { id: targetApp.id },
        data: {
          slaDueDate: dueSoon,
          slaStatus: 'APPROACHING_DEADLINE'
        }
      });

      res.json({ message: 'SLA Warning simulated', application: updated });
    } catch (error) {
      res.status(500).json({ message: 'Failed to simulate warning' });
    }
  }
);

export default router;
