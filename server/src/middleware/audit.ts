import prisma from '../prisma';

export interface AuditParams {
  userId?: string | null;
  userName?: string | null;
  action: string;
  entityType: 'APPLICATION' | 'DOCUMENT' | 'PROJECT' | 'RULE' | 'SCHEME' | 'INSPECTION' | 'AUTH' | 'GRIEVANCE';
  entityId?: string | null;
  details?: Record<string, any>;
  ipAddress?: string;
}

export const logAuditAction = async (params: AuditParams) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        userName: params.userName || 'System',
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        detailsJson: params.details ? JSON.stringify(params.details) : null,
        ipAddress: params.ipAddress || '127.0.0.1'
      }
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
};
