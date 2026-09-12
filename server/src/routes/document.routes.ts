import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { CONFIG } from '../config';
import { extractDocumentData } from '../utils/fileParser';
import {
  analyzeDocument,
  runCrossDocumentConsistency,
  calculateOverallDocumentHealth
} from '../engines/documentIntelligence';
import { logAuditAction } from '../middleware/audit';

const router = Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = CONFIG.STORAGE_PATH;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, JPEG, PNG, DOCX, and TXT files are permitted.'));
    }
  }
});

// GET /api/documents (Get all vault documents for company/project)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId } = req.query;

    const company = await prisma.company.findFirst({
      where: { userId: req.user!.id }
    });

    if (!company) {
      return res.json({ documents: [], health: null });
    }

    const whereClause: any = { companyId: company.id };
    if (projectId) {
      whereClause.projectId = String(projectId);
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
      include: { verifications: true },
      orderBy: { uploadedAt: 'desc' }
    });

    const project = projectId
      ? await prisma.project.findUnique({ where: { id: String(projectId) } })
      : null;

    // Run cross-doc consistency
    const crossCheck = runCrossDocumentConsistency(documents, project, company);
    const health = calculateOverallDocumentHealth(documents, crossCheck);

    res.json({
      documents,
      crossCheck,
      health
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Failed to retrieve documents' });
  }
});

// POST /api/documents/upload (Upload file + OCR extraction + 20-Point Scrutiny)
router.post(
  '/upload',
  authenticateToken,
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const file = req.file;
      const { category, name, projectId } = req.body;

      if (!file) {
        return res.status(400).json({ message: 'Please upload a valid document file.' });
      }

      let company = await prisma.company.findFirst({
        where: { userId: req.user!.id }
      });

      if (!company) {
        company = await prisma.company.create({
          data: {
            userId: req.user!.id,
            name: 'Registered Industrial Entity',
            companyType: 'Private Limited'
          }
        });
      }

      const docName = name || file.originalname.replace(path.extname(file.originalname), '');
      const docCategory = category || 'Other';

      // 1. OCR / Metadata extraction
      const extracted = await extractDocumentData(file.path, docCategory, docName);

      // 2. 20-Point document error analysis
      const analysis = analyzeDocument(docCategory, docName, extracted, file.size);

      // 3. Save to database
      const document = await prisma.document.create({
        data: {
          companyId: company.id,
          projectId: projectId || null,
          category: docCategory,
          name: docName,
          filePath: `/uploads/${file.filename}`,
          originalFileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          extractedData: JSON.stringify(extracted),
          status: analysis.status,
          issuesJson: JSON.stringify(analysis.issues),
          healthScore: analysis.healthScore
        }
      });

      // 4. Record verifications
      for (const issue of analysis.issues) {
        await prisma.documentVerification.create({
          data: {
            documentId: document.id,
            checkType: issue.category,
            status: issue.severity === 'HIGH' ? 'FAIL' : 'WARNING',
            message: `${issue.title}: ${issue.description}`
          }
        });
      }

      if (analysis.issues.length === 0) {
        await prisma.documentVerification.create({
          data: {
            documentId: document.id,
            checkType: 'STRUCTURE_AND_AUTHENTICITY',
            status: 'PASS',
            message: 'Document structure, format, and mandatory identifiers verified successfully.'
          }
        });
      }

      // 5. Audit Log
      await logAuditAction({
        userId: req.user!.id,
        userName: req.user!.name,
        action: 'DOCUMENT_UPLOAD',
        entityType: 'DOCUMENT',
        entityId: document.id,
        details: { name: document.name, category: document.category, healthScore: analysis.healthScore }
      });

      res.status(201).json({
        document,
        extracted,
        analysis
      });
    } catch (error: any) {
      console.error('Document upload error:', error);
      res.status(500).json({ message: error.message || 'Error processing document upload' });
    }
  }
);

// POST /api/documents/:id/resolve-issue (Resolve or mark an issue as verified)
router.post('/:id/resolve-issue', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { issueId } = req.body;
    const document = await prisma.document.findUnique({ where: { id: req.params.id } });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    let issues: any[] = [];
    if (document.issuesJson) {
      try {
        issues = JSON.parse(document.issuesJson);
      } catch (e) {}
    }

    const updatedIssues = issues.filter(i => i.id !== issueId);
    const newStatus = updatedIssues.length === 0 ? 'VERIFIED' : 'NEEDS_REVIEW';
    const newScore = Math.min(100, document.healthScore + 25);

    const updated = await prisma.document.update({
      where: { id: document.id },
      data: {
        issuesJson: JSON.stringify(updatedIssues),
        status: newStatus,
        healthScore: newScore
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update issue status' });
  }
});

// DELETE /api/documents/:id
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const document = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Attempt to delete physical file
    const absolutePath = path.join(CONFIG.STORAGE_PATH, path.basename(document.filePath));
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (e) {}
    }

    await prisma.document.delete({ where: { id: req.params.id } });

    await logAuditAction({
      userId: req.user!.id,
      userName: req.user!.name,
      action: 'DOCUMENT_DELETE',
      entityType: 'DOCUMENT',
      entityId: req.params.id
    });

    res.json({ message: 'Document removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete document' });
  }
});

export default router;
