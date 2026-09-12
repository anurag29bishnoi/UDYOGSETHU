import { ExtractedDocData } from '../utils/fileParser';

export interface DocumentIssue {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'CONSISTENCY' | 'VALIDITY' | 'READABILITY' | 'SIGNATURE' | 'REQUIRED_DOC' | 'FORMAT';
  title: string;
  description: string;
  field?: string;
  suggestedAction: string;
}

export interface DocumentHealthReport {
  overallScore: number;
  completeness: number;
  readability: number;
  consistency: number;
  validity: number;
  requiredDocsRatio: number;
  issues: DocumentIssue[];
  status: 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED';
}

export interface CrossDocComparisonResult {
  isConsistent: boolean;
  mismatches: DocumentIssue[];
  verifiedFields: {
    companyName: boolean;
    pan: boolean;
    gstin: boolean;
    address: boolean;
    investment: boolean;
  };
}

/**
 * Validates a single document against statutory and structural requirements.
 */
export function analyzeDocument(
  category: string,
  docName: string,
  extracted: ExtractedDocData,
  fileSize: number
): { issues: DocumentIssue[]; healthScore: number; status: 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED' } {
  const issues: DocumentIssue[] = [];

  // Check 1: File readability & size
  if (!extracted.isReadable || fileSize < 100) {
    issues.push({
      id: 'READABILITY_FAIL',
      severity: 'HIGH',
      category: 'READABILITY',
      title: 'Unreadable or corrupt document',
      description: 'The uploaded file could not be read clearly or appears truncated.',
      suggestedAction: 'Please re-upload a clear scanned PDF, PNG, or JPG copy.'
    });
  }

  // Check 2: Missing signature / stamp on technical/factory plans
  if (extracted.isSigned === false) {
    issues.push({
      id: 'MISSING_SIGNATURE',
      severity: 'HIGH',
      category: 'SIGNATURE',
      title: 'Authorized signature / seal missing',
      description: 'The document appears to lack the mandatory signature of the authorized signatory or licensed architect.',
      suggestedAction: 'Upload a signed and stamped copy of the document.'
    });
  }

  // Check 3: Expiry date check
  if (extracted.expiryDate) {
    const exp = new Date(extracted.expiryDate);
    const now = new Date();
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      issues.push({
        id: 'EXPIRED_DOCUMENT',
        severity: 'HIGH',
        category: 'VALIDITY',
        title: 'Document has expired',
        description: `This document expired on ${extracted.expiryDate}. Expired certificates cannot be submitted for statutory scrutiny.`,
        suggestedAction: 'Upload the latest renewed certificate.'
      });
    } else if (diffDays <= 60) {
      issues.push({
        id: 'EXPIRING_SOON',
        severity: 'MEDIUM',
        category: 'VALIDITY',
        title: 'Document expiring soon',
        description: `This document is valid until ${extracted.expiryDate} (expires in ${diffDays} days).`,
        suggestedAction: 'Ensure renewal is initiated before submission to prevent department delays.'
      });
    }
  }

  // Check 4: PAN / GST format validation
  if (extracted.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(extracted.pan)) {
    issues.push({
      id: 'INVALID_PAN_FORMAT',
      severity: 'HIGH',
      category: 'FORMAT',
      title: 'Invalid PAN number format',
      description: `Extracted PAN ${extracted.pan} does not match the statutory 10-character alphanumeric format.`,
      suggestedAction: 'Review document and verify PAN number.'
    });
  }

  if (extracted.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(extracted.gstin)) {
    issues.push({
      id: 'INVALID_GSTIN_FORMAT',
      severity: 'HIGH',
      category: 'FORMAT',
      title: 'Invalid GSTIN number format',
      description: `Extracted GSTIN ${extracted.gstin} does not conform to the 15-character statutory GST format.`,
      suggestedAction: 'Verify registration document.'
    });
  }

  // Compute individual score
  let score = 100;
  issues.forEach(issue => {
    if (issue.severity === 'HIGH') score -= 25;
    else if (issue.severity === 'MEDIUM') score -= 15;
    else score -= 5;
  });
  score = Math.max(10, Math.min(100, score));

  let status: 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED' = 'VERIFIED';
  if (issues.some(i => i.severity === 'HIGH')) {
    status = 'NEEDS_REVIEW';
  } else if (issues.length > 0) {
    status = 'NEEDS_REVIEW';
  }

  return { issues, healthScore: score, status };
}

/**
 * Cross-Document Consistency Engine:
 * Compares data across multiple uploaded files and against project declaration.
 */
export function runCrossDocumentConsistency(
  documents: Array<{ category: string; name: string; extractedData?: string | null; issuesJson?: string | null }>,
  project?: { totalInvestment?: number; name?: string; district?: string } | null,
  company?: { name?: string | null; pan?: string | null; gstin?: string | null } | null
): CrossDocComparisonResult {
  const mismatches: DocumentIssue[] = [];
  const verifiedFields = {
    companyName: true,
    pan: true,
    gstin: true,
    address: true,
    investment: true
  };

  const parsedDocs: ExtractedDocData[] = [];
  documents.forEach(doc => {
    if (doc.extractedData) {
      try {
        const parsed = JSON.parse(doc.extractedData);
        parsedDocs.push(parsed);
      } catch (e) {}
    }
  });

  // Check 1: Entity Name fuzzy consistency across all documents
  const names = parsedDocs.map(d => d.companyName).filter(Boolean) as string[];
  if (company?.name) names.push(company.name);

  if (names.length > 1) {
    const normalize = (str: string) =>
      str.toLowerCase().replace(/private/g, 'pvt').replace(/limited/g, 'ltd').replace(/[^a-z0-9]/g, '');
    const firstNorm = normalize(names[0]);
    const hasNameMismatch = names.some(n => normalize(n) !== firstNorm);

    if (hasNameMismatch) {
      verifiedFields.companyName = false;
      mismatches.push({
        id: 'NAME_MISMATCH',
        severity: 'MEDIUM',
        category: 'CONSISTENCY',
        title: 'Company name variation detected across documents',
        description: `Name appears as '${names[0]}' in some records and '${names[1]}' in others (e.g. 'Private Limited' vs 'Pvt Ltd').`,
        suggestedAction: 'Verify that the legal entity name matches exactly across PAN, GST, and Incorporation certificates.'
      });
    }
  }

  // Check 2: Investment amount comparison (Project declared vs CA Certificate)
  const financialDoc = parsedDocs.find(d => d.investmentAmount !== undefined && d.investmentAmount !== null);
  if (financialDoc && project?.totalInvestment) {
    // Check discrepancy
    const declared = project.totalInvestment;
    const certified = financialDoc.investmentAmount!;
    const diff = Math.abs(declared - certified);

    if (diff > 1.0) {
      verifiedFields.investment = false;
      mismatches.push({
        id: 'INVESTMENT_MISMATCH',
        severity: 'HIGH',
        category: 'CONSISTENCY',
        title: 'Investment figure mismatch with CA Certificate',
        description: `Project profile declares ₹${declared} Cr total investment, whereas uploaded CA certificate indicates ₹${certified} Cr.`,
        suggestedAction: 'Ensure project profile capital outlay aligns with the Chartered Accountant certified project appraisal report.'
      });
    }
  }

  // Check 3: PAN consistency across documents
  const pans = parsedDocs.map(d => d.pan).filter(Boolean) as string[];
  if (company?.pan) pans.push(company.pan);
  if (pans.length > 1) {
    const firstPan = pans[0].trim().toUpperCase();
    if (pans.some(p => p.trim().toUpperCase() !== firstPan)) {
      verifiedFields.pan = false;
      mismatches.push({
        id: 'PAN_MISMATCH',
        severity: 'HIGH',
        category: 'CONSISTENCY',
        title: 'PAN number mismatch across uploaded files',
        description: 'Discrepancy detected in PAN numbers between identity and tax certificates.',
        suggestedAction: 'Ensure all uploaded certificates belong to the same registered PAN entity.'
      });
    }
  }

  return {
    isConsistent: mismatches.length === 0,
    mismatches,
    verifiedFields
  };
}

/**
 * Calculates the comprehensive Document Health Score (0-100%)
 */
export function calculateOverallDocumentHealth(
  documents: Array<{ category: string; name: string; healthScore: number; status: string; issuesJson?: string | null }>,
  crossCheck: CrossDocComparisonResult
): DocumentHealthReport {
  if (documents.length === 0) {
    return {
      overallScore: 0,
      completeness: 0,
      readability: 100,
      consistency: 100,
      validity: 100,
      requiredDocsRatio: 0,
      issues: [
        {
          id: 'NO_DOCS',
          severity: 'HIGH',
          category: 'REQUIRED_DOC',
          title: 'No documents uploaded yet',
          description: 'Upload key business documents (PAN, GST, Incorporation, Land deed, Factory layout) to establish document health.',
          suggestedAction: 'Upload company and project documents in Document Vault.'
        }
      ],
      status: 'NEEDS_REVIEW'
    };
  }

  // Mandatory categories check
  const requiredCategories = ['Identity', 'Tax', 'Company', 'Land', 'Environmental', 'Factory'];
  const uploadedCategories = new Set(documents.map(d => d.category));
  let presentCount = 0;
  requiredCategories.forEach(cat => {
    if (uploadedCategories.has(cat)) presentCount++;
  });
  const completeness = Math.round((presentCount / requiredCategories.length) * 100);

  // Aggregate individual document issues
  const allIssues: DocumentIssue[] = [...crossCheck.mismatches];
  documents.forEach(doc => {
    if (doc.issuesJson) {
      try {
        const issues: DocumentIssue[] = JSON.parse(doc.issuesJson);
        allIssues.push(...issues);
      } catch (e) {}
    }
  });

  const readabilityIssues = allIssues.filter(i => i.category === 'READABILITY');
  const readability = Math.max(20, 100 - readabilityIssues.length * 40);

  const consistencyIssues = allIssues.filter(i => i.category === 'CONSISTENCY');
  const consistency = Math.max(20, 100 - consistencyIssues.length * 25);

  const validityIssues = allIssues.filter(i => i.category === 'VALIDITY' || i.category === 'SIGNATURE');
  const validity = Math.max(20, 100 - validityIssues.length * 30);

  const requiredDocsRatio = completeness;

  // Weighted overall score:
  // Completeness (30%), Consistency (25%), Validity (25%), Readability (20%)
  const overallScore = Math.round(
    completeness * 0.3 + consistency * 0.25 + validity * 0.25 + readability * 0.2
  );

  let status: 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED' = 'VERIFIED';
  if (allIssues.some(i => i.severity === 'HIGH') || overallScore < 75) {
    status = 'NEEDS_REVIEW';
  }

  return {
    overallScore,
    completeness,
    readability,
    consistency,
    validity,
    requiredDocsRatio,
    issues: allIssues,
    status
  };
}
