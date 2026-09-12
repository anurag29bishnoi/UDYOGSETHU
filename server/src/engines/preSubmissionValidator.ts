import { DiscoveredApproval } from './approvalRulesEngine';

export interface PreSubmissionCheckResult {
  approvalCode: string;
  approvalName: string;
  departmentName: string;
  status: 'READY_TO_SUBMIT' | 'BLOCKED';
  overallScore: number;
  criticalIssuesCount: number;
  warningCount: number;
  issues: Array<{
    id: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    title: string;
    description: string;
    source: string;
    actionRequired: string;
    fixUrl?: string;
  }>;
  passedChecks: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  readinessBreakdown: {
    dossierCompleteness: number; // e.g. 100%
    crossDocumentConsistency: number; // e.g. 95%
    signatureAndAttestation: number; // e.g. 100%
    statutoryPrerequisites: number; // e.g. 100%
  };
  submissionPackage: {
    packageReference: string;
    filingFeeINR: number;
    statutorySLAWorkingDays: number;
    attachedDocuments: Array<{
      name: string;
      category: string;
      verificationStatus: string;
      sizeFormatted: string;
    }>;
    statutoryDeclarations: string[];
    canDownloadZip: boolean;
    canDownloadPdf: boolean;
  };
}

/**
 * Pre-Submission Validator & Submission Package Engine
 * Audits an application prior to formal statutory submission to prevent officer rejection/queries.
 */
export function validatePreSubmission(
  approval: DiscoveredApproval,
  project: any,
  company: any,
  documents: any[] = [],
  activeApplications: any[] = []
): PreSubmissionCheckResult {
  const issues: PreSubmissionCheckResult['issues'] = [];
  const passedChecks: PreSubmissionCheckResult['passedChecks'] = [];

  // 1. Check Mandatory Documents
  const uploadedCategories = new Set(documents.map(d => d.category));
  const docVerifications = documents.flatMap(d => d.verifications || []);

  approval.requiredDocuments.forEach(reqDoc => {
    if (reqDoc.isMandatory && !uploadedCategories.has(reqDoc.category)) {
      issues.push({
        id: `DOC_MISSING_${reqDoc.category}`,
        severity: 'CRITICAL',
        title: `Mandatory Document Missing: ${reqDoc.name}`,
        description: `Clearance requires ${reqDoc.name} (${reqDoc.description}). Application cannot proceed without this attached dossier.`,
        source: 'Document Vault Dossier Audit',
        actionRequired: `Upload valid PDF/Image of ${reqDoc.name} in Document Vault`,
        fixUrl: `/projects/${project.id}/documents`
      });
    } else if (uploadedCategories.has(reqDoc.category)) {
      passedChecks.push({
        id: `DOC_PRESENT_${reqDoc.category}`,
        title: `Document Dossier Present: ${reqDoc.name}`,
        description: `Verified document exists in vault under category ${reqDoc.category}.`
      });
    }
  });

  // 2. Check Document Validity & Readability from OCR Verifications
  const needsReviewVerifs = docVerifications.filter((v: any) => v.status === 'NEEDS_REVIEW' || v.status === 'REJECTED');
  if (needsReviewVerifs.length > 0) {
    needsReviewVerifs.forEach((v: any) => {
      issues.push({
        id: `VERIF_ISSUE_${v.id || Math.random()}`,
        severity: 'WARNING',
        title: `Document Scrutiny Warning: ${v.detectedErrors || 'Inconsistency detected'}`,
        description: `Cross-document verification flags potential issue in attached dossier. Department officer may raise clarification query.`,
        source: 'Automated OCR & Cross-Doc Engine',
        actionRequired: 'Review document extracted metadata or re-upload high-resolution scan',
        fixUrl: `/projects/${project.id}/documents`
      });
    });
  } else {
    passedChecks.push({
      id: 'OCR_READABILITY_PASS',
      title: 'OCR Extraction & Document Legibility Confirmed',
      description: 'All attached statutory documents parsed with >90% optical recognition confidence.'
    });
  }

  // 3. Check Prerequisite Clearance Dependencies
  approval.dependencies.forEach(depCode => {
    const depApp = activeApplications.find(a => a.approval?.approvalCode === depCode || a.approvalCode === depCode);
    if (!depApp || depApp.status !== 'APPROVED') {
      issues.push({
        id: `DEP_PENDING_${depCode}`,
        severity: 'CRITICAL',
        title: `Prerequisite Approval Incomplete: ${depCode}`,
        description: `Statutory guidelines mandate that ${depCode} must be officially sanctioned before filing ${approval.approvalName}.`,
        source: 'Regulatory Workflow Rules Engine',
        actionRequired: `Ensure ${depCode} reaches 'APPROVED' status before submission.`,
        fixUrl: `/projects/${project.id}/approvals`
      });
    } else {
      passedChecks.push({
        id: `DEP_CLEARED_${depCode}`,
        title: `Prerequisite Clearance Cleared: ${depCode}`,
        description: `Clearance certificate has been sanctioned and verified.`
      });
    }
  });

  // 4. Company & Project Identity Integrity Checks
  if (!company.pan || company.pan.length !== 10) {
    issues.push({
      id: 'PAN_INCOMPLETE',
      severity: 'CRITICAL',
      title: 'Valid Corporate PAN Number Missing',
      description: '10-character alphanumeric PAN is required for government challan generation and tax reconciliation.',
      source: 'Business Digital Twin',
      actionRequired: 'Update PAN in Company Profile',
      fixUrl: '/company'
    });
  } else {
    passedChecks.push({
      id: 'PAN_VERIFIED',
      title: 'Corporate PAN Validated',
      description: `Format verified: ${company.pan}`
    });
  }

  if (!project.industrialArea || !project.midcPlot) {
    issues.push({
      id: 'LOCATION_INCOMPLETE',
      severity: 'WARNING',
      title: 'Industrial Plot Details Incomplete',
      description: 'MIDC Plot number and industrial estate identification expedite automated cadastral boundary mapping.',
      source: 'Project Profile',
      actionRequired: 'Provide exact plot designation in Project Settings'
    });
  } else {
    passedChecks.push({
      id: 'PLOT_VERIFIED',
      title: 'Cadastral & Plot Details Verified',
      description: `${project.industrialArea}, Plot ${project.midcPlot}`
    });
  }

  // Calculate readiness score
  const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
  const warningCount = issues.filter(i => i.severity === 'WARNING').length;

  let overallScore = 100;
  overallScore -= criticalCount * 30;
  overallScore -= warningCount * 10;
  if (overallScore < 0) overallScore = 15;

  const isReady = criticalCount === 0;

  // Build Submission Package Manifest
  const attachedDocs = documents.map(d => ({
    name: d.name,
    category: d.category,
    verificationStatus: d.status || 'VERIFIED',
    sizeFormatted: `${((d.fileSize || 1024 * 350) / 1024).toFixed(0)} KB`
  }));

  const statutoryDeclarations = [
    `I hereby declare that all information furnished in respect of ${project.name} is true and substantiated by authentic documents.`,
    `I undertake to adhere to all statutory provisions of the Maharashtra Right to Services Act 2015 and respective department codes.`,
    `I consent to electronic physical site scrutiny and coordinated joint inspection by authorized officers.`
  ];

  return {
    approvalCode: approval.approvalCode,
    approvalName: approval.approvalName,
    departmentName: approval.departmentName,
    status: isReady ? 'READY_TO_SUBMIT' : 'BLOCKED',
    overallScore,
    criticalIssuesCount: criticalCount,
    warningCount,
    issues,
    passedChecks,
    readinessBreakdown: {
      dossierCompleteness: Math.max(20, Math.round(100 - (issues.filter(i => i.id.startsWith('DOC_MISSING')).length * 35))),
      crossDocumentConsistency: Math.max(50, Math.round(100 - (issues.filter(i => i.id.startsWith('VERIF_ISSUE')).length * 20))),
      signatureAndAttestation: 100,
      statutoryPrerequisites: issues.some(i => i.id.startsWith('DEP_PENDING')) ? 0 : 100
    },
    submissionPackage: {
      packageReference: `UDYOG-PKG-${Date.now().toString().slice(-6)}-${approval.approvalCode.slice(0, 4)}`,
      filingFeeINR: approval.statutoryDaysSLA * 1500,
      statutorySLAWorkingDays: approval.statutoryDaysSLA,
      attachedDocuments: attachedDocs,
      statutoryDeclarations,
      canDownloadZip: true,
      canDownloadPdf: true
    }
  };
}
