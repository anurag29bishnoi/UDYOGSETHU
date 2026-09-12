import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { logAuditAction } from '../middleware/audit';

const router = Router();

// GET /api/company
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const company = await prisma.company.findFirst({
      where: { userId: req.user!.id },
      include: {
        projects: true,
        documents: true
      }
    });

    if (!company) {
      return res.status(404).json({ message: 'No company registered for this user.' });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch company profile' });
  }
});

// PUT /api/company
router.put('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      cin,
      pan,
      gstin,
      udyam,
      companyType,
      dateOfIncorporation,
      registeredAddress,
      district,
      taluka,
      industrialArea,
      directors,
      employeeCount,
      annualTurnover,
      businessSector
    } = req.body;

    let company = await prisma.company.findFirst({
      where: { userId: req.user!.id }
    });

    // Verification check: If PAN, GSTIN, and CIN are present, mark VERIFIED, else NEEDS_REVIEW
    let verificationStatus = 'NEEDS_REVIEW';
    if (pan && gstin && name) {
      verificationStatus = 'VERIFIED';
    }

    if (company) {
      company = await prisma.company.update({
        where: { id: company.id },
        data: {
          name,
          cin,
          pan,
          gstin,
          udyam,
          companyType,
          dateOfIncorporation,
          registeredAddress,
          district,
          taluka,
          industrialArea,
          directors,
          employeeCount: employeeCount ? parseInt(employeeCount, 10) : company.employeeCount,
          annualTurnover: annualTurnover ? parseFloat(annualTurnover) : company.annualTurnover,
          businessSector,
          verificationStatus
        }
      });
    } else {
      company = await prisma.company.create({
        data: {
          userId: req.user!.id,
          name: name || 'My Enterprise',
          cin,
          pan,
          gstin,
          udyam,
          companyType: companyType || 'Private Limited',
          dateOfIncorporation,
          registeredAddress,
          district,
          taluka,
          industrialArea,
          directors,
          employeeCount: employeeCount ? parseInt(employeeCount, 10) : 0,
          annualTurnover: annualTurnover ? parseFloat(annualTurnover) : 0,
          businessSector,
          verificationStatus
        }
      });
    }

    await logAuditAction({
      userId: req.user!.id,
      userName: req.user!.name,
      action: 'UPDATE_COMPANY',
      entityType: 'PROJECT',
      entityId: company.id,
      details: { verificationStatus }
    });

    res.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ message: 'Failed to update company profile' });
  }
});

export default router;
