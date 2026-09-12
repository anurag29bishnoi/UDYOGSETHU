import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { logAuditAction } from '../middleware/audit';

const router = Router();

// GET /api/compliance (List all active compliances & renewals for user's projects)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        companies: {
          include: {
            projects: {
              include: {
                compliances: {
                  include: { approval: true },
                  orderBy: { dueDate: 'asc' }
                },
                renewals: {
                  include: { approval: true },
                  orderBy: { expiryDate: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    const projects = user?.companies.flatMap(c => c.projects) || [];
    const compliances = projects.flatMap(p =>
      p.compliances.map(c => ({
        ...c,
        projectName: p.name
      }))
    );

    const now = new Date();
    const renewals = projects.flatMap(p =>
      p.renewals.map(r => {
        const daysRemaining = Math.ceil((r.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        let urgency: 'NORMAL' | 'WARNING_90' | 'WARNING_60' | 'WARNING_30' | 'CRITICAL_7' | 'EXPIRED' = 'NORMAL';

        if (daysRemaining <= 0) urgency = 'EXPIRED';
        else if (daysRemaining <= 7) urgency = 'CRITICAL_7';
        else if (daysRemaining <= 30) urgency = 'WARNING_30';
        else if (daysRemaining <= 60) urgency = 'WARNING_60';
        else if (daysRemaining <= 90) urgency = 'WARNING_90';

        return {
          ...r,
          projectName: p.name,
          daysRemaining,
          urgency
        };
      })
    );

    res.json({ compliances, renewals });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve compliance tracking data' });
  }
});

// POST /api/compliance/:id/complete (Mark compliance item completed)
router.post('/:id/complete', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { documentUrl, remarks } = req.body;

    const compliance = await prisma.compliance.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        completedDate: new Date(),
        documentUrl: documentUrl || '/uploads/compliance_filing_doc.pdf',
        remarks: remarks || 'Annual return filed on state department portal.'
      }
    });

    await logAuditAction({
      userId: req.user!.id,
      userName: req.user!.name,
      action: 'COMPLIANCE_COMPLETED',
      entityType: 'APPLICATION',
      entityId: compliance.id,
      details: { complianceName: compliance.name }
    });

    res.json(compliance);
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete compliance filing' });
  }
});

// POST /api/compliance/renewals/:id/renew (Submit license renewal application)
router.post('/renewals/:id/renew', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const renewal = await prisma.renewal.update({
      where: { id: req.params.id },
      data: { status: 'RENEWAL_SUBMITTED' }
    });

    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: `Renewal Submitted: ${renewal.licenseName}`,
        message: `Renewal application for license #${renewal.licenseNumber} has been received by the department.`,
        type: 'RENEWAL',
        link: `/compliance`
      }
    });

    res.json(renewal);
  } catch (error) {
    res.status(500).json({ message: 'Failed to initiate renewal' });
  }
});

export default router;
