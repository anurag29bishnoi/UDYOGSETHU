import prisma from '../prisma';
import { logAuditAction } from '../middleware/audit';

export interface SLACalculation {
  statutoryDays: number;
  elapsedDays: number;
  remainingDays: number;
  status: 'ON_TRACK' | 'APPROACHING_DEADLINE' | 'BREACHED';
  isBreached: boolean;
  dueDate: Date;
}

export function calculateSLA(submittedAt: Date, slaDueDate: Date, statutoryDays: number): SLACalculation {
  const now = new Date();
  const totalMs = slaDueDate.getTime() - submittedAt.getTime();
  const elapsedMs = now.getTime() - submittedAt.getTime();
  const remainingMs = slaDueDate.getTime() - now.getTime();

  const elapsedDays = Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)));
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

  let status: 'ON_TRACK' | 'APPROACHING_DEADLINE' | 'BREACHED' = 'ON_TRACK';
  let isBreached = false;

  if (remainingDays < 0) {
    status = 'BREACHED';
    isBreached = true;
  } else if (remainingDays <= Math.max(2, Math.floor(statutoryDays * 0.25))) {
    status = 'APPROACHING_DEADLINE';
  }

  return {
    statutoryDays,
    elapsedDays,
    remainingDays,
    status,
    isBreached,
    dueDate: slaDueDate
  };
}

/**
 * Checks all active applications and triggers automated escalations when breaches occur
 */
export async function checkAndTriggerSLAEscalations() {
  const now = new Date();
  const activeApplications = await prisma.application.findMany({
    where: {
      status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'QUERY_RAISED', 'INSPECTION_SCHEDULED'] }
    },
    include: {
      approval: true,
      department: true,
      project: { include: { company: { include: { user: true } } } }
    }
  });

  for (const app of activeApplications) {
    const sla = calculateSLA(app.submittedAt, app.slaDueDate, app.approval.statutoryDaysSLA);

    if (sla.isBreached && app.slaStatus !== 'BREACHED') {
      // 1. Update Application status
      await prisma.application.update({
        where: { id: app.id },
        data: {
          slaStatus: 'BREACHED',
          status: 'SLA_BREACHED'
        }
      });

      // 2. Add to Timeline
      await prisma.applicationTimeline.create({
        data: {
          applicationId: app.id,
          stage: 'Escalation',
          status: 'SLA_BREACHED',
          remarks: `Statutory SLA of ${app.approval.statutoryDaysSLA} days breached. Auto-escalated to Senior Officer and Department Head under Maharashtra Right to Public Services Act.`,
          actorName: 'UdyogSetu Statutory SLA Engine',
          actorRole: 'SYSTEM'
        }
      });

      // 3. Notify Senior Officers
      const seniorOfficers = await prisma.user.findMany({
        where: { role: 'SENIOR_OFFICER' }
      });

      for (const senior of seniorOfficers) {
        await prisma.notification.create({
          data: {
            userId: senior.id,
            title: `CRITICAL SLA BREACH: ${app.applicationNumber}`,
            message: `Application ${app.applicationNumber} for ${app.approval.name} (${app.department.name}) has breached its statutory deadline. Intervention required.`,
            type: 'SLA_BREACH',
            link: `/officer/escalations`
          }
        });
      }

      // 4. Notify Entrepreneur
      if (app.project.company.user) {
        await prisma.notification.create({
          data: {
            userId: app.project.company.user.id,
            title: `SLA Alert: Application Escalated`,
            message: `Your application ${app.applicationNumber} has exceeded department review timelines and has been automatically escalated to Senior Supervisory Officers for priority clearance.`,
            type: 'SLA_BREACH',
            link: `/applications/${app.id}`
          }
        });
      }

      // 5. Immutable Audit Log
      await logAuditAction({
        action: 'SLA_ESCALATION_TRIGGERED',
        entityType: 'APPLICATION',
        entityId: app.id,
        details: {
          applicationNumber: app.applicationNumber,
          department: app.department.name,
          statutoryDays: app.approval.statutoryDaysSLA,
          elapsedDays: sla.elapsedDays
        }
      });
    } else if (sla.status === 'APPROACHING_DEADLINE' && app.slaStatus !== 'APPROACHING_DEADLINE') {
      await prisma.application.update({
        where: { id: app.id },
        data: { slaStatus: 'APPROACHING_DEADLINE' }
      });
    }
  }
}
