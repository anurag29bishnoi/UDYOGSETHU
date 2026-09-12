import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { calculateSLA } from '../engines/slaEscalationEngine';
import { logAuditAction } from '../middleware/audit';

const router = Router();

// GET /api/applications (List applications - filters by user/company or officer department)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userRole = req.user!.role;
    let whereClause: any = {};

    if (userRole === 'ENTREPRENEUR') {
      const company = await prisma.company.findFirst({ where: { userId: req.user!.id } });
      if (!company) return res.json([]);
      whereClause = { project: { companyId: company.id } };
    } else if (userRole === 'DEPARTMENT_OFFICER') {
      if (req.user!.departmentCode) {
        whereClause = { department: { code: req.user!.departmentCode } };
      }
    }
    // SENIOR_OFFICER and ADMIN can see all applications

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        approval: true,
        department: true,
        project: {
          include: { company: true }
        },
        queries: true,
        timeline: { orderBy: { createdAt: 'desc' } }
      },
      orderBy: { submittedAt: 'desc' }
    });

    const enriched = applications.map(app => {
      const sla = calculateSLA(app.submittedAt, app.slaDueDate, app.approval.statutoryDaysSLA);
      return {
        ...app,
        slaInfo: sla
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Failed to retrieve applications' });
  }
});

// GET /api/applications/:id (Single application detail)
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        approval: {
          include: { requirements: true }
        },
        department: true,
        project: {
          include: {
            company: true,
            documents: true
          }
        },
        timeline: { orderBy: { createdAt: 'desc' } },
        queries: { orderBy: { queryDate: 'desc' } }
      }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const sla = calculateSLA(
      application.submittedAt,
      application.slaDueDate,
      application.approval.statutoryDaysSLA
    );

    res.json({
      ...application,
      slaInfo: sla
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve application details' });
  }
});

// POST /api/applications (Create & Submit Application with One-Time Data Reuse)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId, approvalCode } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        company: true,
        documents: true
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const approval = await prisma.approval.findUnique({
      where: { code: approvalCode },
      include: { department: true }
    });

    if (!approval) {
      return res.status(404).json({ message: `Approval ${approvalCode} not found in catalog` });
    }

    // Check if already applied
    const existing = await prisma.application.findFirst({
      where: { projectId: project.id, approvalId: approval.id }
    });

    if (existing) {
      return res.status(400).json({
        message: `An application (${existing.applicationNumber}) already exists for this approval.`
      });
    }

    // Generate Application Number: UDY-2026-CODE-RANDOM
    const rand = Math.floor(1000 + Math.random() * 9000);
    const appNumber = `UDY-2026-${approval.department.code}-${rand}`;

    // Calculate SLA due date
    const now = new Date();
    const slaDueDate = new Date(now.getTime() + approval.statutoryDaysSLA * 24 * 60 * 60 * 1000);

    // AI Pre-Scrutiny & Risk Score generation
    const hasIssues = project.documents.some(d => d.status === 'NEEDS_REVIEW');
    let riskScore = 20; // Baseline low risk
    const riskFactors: string[] = ['Standard enterprise scrutiny'];

    if (hasIssues) {
      riskScore += 25;
      riskFactors.push('Minor document discrepancy detected during automated pre-check');
    }
    if (project.fireRisk === 'High') {
      riskScore += 15;
      riskFactors.push('High industrial fire hazard classification');
    }
    if (project.hazardousWaste) {
      riskScore += 15;
      riskFactors.push('Hazardous waste handling protocols required');
    }

    const preScrutinySummary = `Automated Scrutiny: ${project.documents.length} mandatory documents verified from Document Vault. ${hasIssues ? '1 potential document variation noted for officer review.' : 'All mandatory company credentials (PAN, GSTIN, MIDC lease) verified consistent.'} Statutory SLA deadline set to ${approval.statutoryDaysSLA} working days.`;

    const application = await prisma.application.create({
      data: {
        projectId: project.id,
        approvalId: approval.id,
        departmentId: approval.departmentId,
        applicationNumber: appNumber,
        status: 'UNDER_REVIEW',
        currentStage: 'Document Scrutiny',
        submittedAt: now,
        slaDueDate,
        slaStatus: 'ON_TRACK',
        riskScore: Math.min(100, riskScore),
        riskFactorsJson: JSON.stringify(riskFactors),
        preScrutinySummary,
        feePaid: 5000.0
      }
    });

    // Create Initial Timeline Event
    await prisma.applicationTimeline.create({
      data: {
        applicationId: application.id,
        stage: 'Submission',
        status: 'SUBMITTED',
        remarks: `Application submitted successfully via UdyogSetu Single Window. Auto-filled verified credentials for ${project.company.name}.`,
        actorName: req.user!.name,
        actorRole: req.user!.role
      }
    });

    await prisma.applicationTimeline.create({
      data: {
        applicationId: application.id,
        stage: 'Desk Scrutiny',
        status: 'UNDER_REVIEW',
        remarks: `Assigned to ${approval.department.name} verification desk. Automated pre-scrutiny completed with risk score ${riskScore}/100.`,
        actorName: 'UdyogSetu Orchestration Engine',
        actorRole: 'SYSTEM'
      }
    });

    // Notify Entrepreneur
    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: `Application Submitted: ${appNumber}`,
        message: `Your application for ${approval.name} has been routed to ${approval.department.name}. Statutory SLA: ${approval.statutoryDaysSLA} days.`,
        type: 'APPLICATION_UPDATE',
        link: `/applications/${application.id}`
      }
    });

    await logAuditAction({
      userId: req.user!.id,
      userName: req.user!.name,
      action: 'APPLICATION_SUBMITTED',
      entityType: 'APPLICATION',
      entityId: application.id,
      details: { applicationNumber: appNumber, approval: approval.name }
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ message: 'Failed to submit application' });
  }
});

// POST /api/applications/:id/query (Officer requests clarification)
router.post('/:id/query', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { queryText } = req.body;
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        project: { include: { company: { include: { user: true } } } },
        department: true
      }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const query = await prisma.clarificationQuery.create({
      data: {
        applicationId: application.id,
        officerId: req.user!.id,
        queryText,
        status: 'PENDING'
      }
    });

    await prisma.application.update({
      where: { id: application.id },
      data: { status: 'QUERY_RAISED', currentStage: 'Clarification Required' }
    });

    await prisma.applicationTimeline.create({
      data: {
        applicationId: application.id,
        stage: 'Clarification',
        status: 'QUERY_RAISED',
        remarks: `Clarification sought by ${req.user!.name} (${application.department.name}): "${queryText}"`,
        actorName: req.user!.name,
        actorRole: req.user!.role
      }
    });

    // Notify Entrepreneur
    if (application.project.company.user) {
      await prisma.notification.create({
        data: {
          userId: application.project.company.user.id,
          title: `Action Required: Clarification for ${application.applicationNumber}`,
          message: `Officer from ${application.department.name} has requested clarification: "${queryText.substring(0, 100)}..."`,
          type: 'QUERY',
          link: `/applications/${application.id}`
        }
      });
    }

    res.status(201).json(query);
  } catch (error) {
    res.status(500).json({ message: 'Failed to raise clarification query' });
  }
});

// POST /api/applications/:id/respond (Entrepreneur responds to query)
router.post('/:id/respond', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { queryId, responseText, documentUrl } = req.body;

    const query = await prisma.clarificationQuery.update({
      where: { id: queryId },
      data: {
        responseText,
        responseDocumentUrl: documentUrl || null,
        status: 'RESOLVED',
        responseDate: new Date()
      }
    });

    await prisma.application.update({
      where: { id: req.params.id },
      data: { status: 'UNDER_REVIEW', currentStage: 'Reviewing Clarification' }
    });

    await prisma.applicationTimeline.create({
      data: {
        applicationId: req.params.id,
        stage: 'Clarification',
        status: 'APPLICANT_RESPONDED',
        remarks: `Applicant submitted clarification response: "${responseText.substring(0, 120)}..."`,
        actorName: req.user!.name,
        actorRole: req.user!.role
      }
    });

    res.json(query);
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit clarification response' });
  }
});

// POST /api/applications/:id/decision (Officer Approves or Rejects Application)
router.post('/:id/decision', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { decision, remarks } = req.body; // decision: 'APPROVED' | 'REJECTED'

    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        approval: true,
        department: true,
        project: { include: { company: { include: { user: true } } } }
      }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const isApproved = decision === 'APPROVED';
    const finalStatus = isApproved ? 'APPROVED' : 'REJECTED';
    const certUrl = isApproved
      ? `/certificates/SANCTION_${application.applicationNumber}.pdf`
      : null;

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: {
        status: finalStatus,
        currentStage: isApproved ? 'Sanctioned & Issued' : 'Application Rejected',
        certificateUrl: certUrl
      }
    });

    // If approved, initialize post-approval compliance & renewal items
    if (isApproved) {
      const now = new Date();
      // Add renewal record
      const expiryDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      await prisma.renewal.create({
        data: {
          projectId: application.projectId,
          approvalId: application.approvalId,
          licenseName: application.approval.name,
          licenseNumber: `LIC-MH-${Math.floor(100000 + Math.random() * 900000)}`,
          issueDate: now,
          expiryDate,
          renewalWindowDays: 60,
          status: 'ACTIVE'
        }
      });

      // Add periodic compliance
      await prisma.compliance.create({
        data: {
          projectId: application.projectId,
          approvalId: application.approvalId,
          name: `Annual Environmental / Factory Compliance Audit (${application.approval.name})`,
          department: application.department.name,
          frequency: 'Annual',
          dueDate: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000), // 6 months
          status: 'UPCOMING',
          documentRequired: 'Audit Verification Report'
        }
      });
    }

    await prisma.applicationTimeline.create({
      data: {
        applicationId: application.id,
        stage: 'Final Determination',
        status: finalStatus,
        remarks: remarks || `Application ${isApproved ? 'Approved and Sanction Certificate Generated' : 'Rejected by Department'}.`,
        actorName: req.user!.name,
        actorRole: req.user!.role
      }
    });

    // Notify Entrepreneur
    if (application.project.company.user) {
      await prisma.notification.create({
        data: {
          userId: application.project.company.user.id,
          title: `Decision on Application: ${application.applicationNumber}`,
          message: isApproved
            ? `Congratulations! Your application for ${application.approval.name} has been APPROVED by ${application.department.name}. Certificate is now accessible.`
            : `Your application ${application.applicationNumber} was not approved. Remarks: "${remarks}"`,
          type: 'APPROVAL',
          link: `/applications/${application.id}`
        }
      });
    }

    await logAuditAction({
      userId: req.user!.id,
      userName: req.user!.name,
      action: isApproved ? 'APPLICATION_APPROVED' : 'APPLICATION_REJECTED',
      entityType: 'APPLICATION',
      entityId: application.id,
      details: { remarks, decision }
    });

    res.json(updated);
  } catch (error) {
    console.error('Decision error:', error);
    res.status(500).json({ message: 'Failed to record application decision' });
  }
});

export default router;
