import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { CURATED_SCHEMES, evaluateSchemeEligibility } from '../engines/schemeMatchingEngine';
import { logAuditAction } from '../middleware/audit';

const router = Router();

// GET /api/schemes (Master Scheme Catalog with filtering)
router.get('/', async (req, res) => {
  try {
    const { sector, schemeType, search } = req.query;

    let schemes = CURATED_SCHEMES;

    if (sector && typeof sector === 'string' && sector !== 'ALL') {
      schemes = schemes.filter(s => s.eligibleSectors.includes('ALL') || s.eligibleSectors.includes(sector));
    }

    if (schemeType && typeof schemeType === 'string' && schemeType !== 'ALL') {
      schemes = schemes.filter(s => s.schemeType.toLowerCase().includes(schemeType.toLowerCase()));
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      schemes = schemes.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q) ||
          s.benefitsSummary.toLowerCase().includes(q)
      );
    }

    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve government schemes' });
  }
});

// POST /api/schemes/evaluate (Standalone Evaluation for any project parameters)
router.post('/evaluate', async (req, res) => {
  try {
    const { sector, state, district, totalInvestment, employeeCount, companyType, uploadedDocCategories } = req.body;
    const matches = evaluateSchemeEligibility(
      {
        id: 'DEMO_PROJ',
        name: 'Evaluation Profile',
        projectType: 'NEW',
        sector: sector || 'General Manufacturing',
        state: state || 'Maharashtra',
        district: district || 'Pune',
        totalInvestment: parseFloat(totalInvestment || 2.5),
        employeeCount: parseInt(employeeCount || 25, 10),
        waterReq: 10,
        powerReq: 50,
        wastewater: 0,
        hazardousMaterials: false,
        hazardousWaste: false,
        buildingRequired: true,
        factoryRequired: false,
        fireRisk: 'Medium',
        buildingArea: 1000
      },
      { companyType: companyType || 'Private Limited' },
      uploadedDocCategories || []
    );
    res.json(matches);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to evaluate schemes', error: err.message });
  }
});

// GET /api/schemes/match/:projectId (Match project profile against schemes)
router.get('/match/:projectId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      include: {
        company: true,
        documents: true,
        schemeApplications: true
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const docCategories = project.documents.map(d => d.category);

    const matches = evaluateSchemeEligibility(
      {
        id: project.id,
        name: project.name,
        projectType: project.projectType,
        sector: project.sector,
        state: project.state,
        district: project.district,
        totalInvestment: project.totalInvestment,
        employeeCount: project.employeeCount,
        waterReq: project.waterReq,
        powerReq: project.powerReq,
        wastewater: project.wastewater,
        hazardousMaterials: project.hazardousMaterials,
        hazardousWaste: project.hazardousWaste,
        buildingRequired: project.buildingRequired,
        factoryRequired: project.factoryRequired,
        fireRisk: project.fireRisk,
        buildingArea: project.buildingArea
      },
      project.company,
      docCategories
    );

    // Attach applied status
    const appliedSchemeIds = new Set(project.schemeApplications.map(sa => sa.schemeId));
    const enriched = matches.map(m => ({
      ...m,
      isApplied: appliedSchemeIds.has(m.schemeId)
    }));

    res.json(enriched);
  } catch (error) {
    console.error('Error matching schemes:', error);
    res.status(500).json({ message: 'Failed to evaluate scheme eligibility' });
  }
});

// POST /api/schemes/apply (Submit Scheme Interest Application)
router.post('/apply', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { projectId, schemeCode, matchScore, matchBreakdown } = req.body;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { company: true }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check or create scheme record in database
    let dbScheme = await prisma.scheme.findUnique({ where: { code: schemeCode } });
    if (!dbScheme) {
      const def = CURATED_SCHEMES.find(s => s.code === schemeCode) || CURATED_SCHEMES[0];
      dbScheme = await prisma.scheme.create({
        data: {
          code: def.code,
          name: def.name,
          department: def.department,
          schemeType: def.schemeType,
          minInvestment: def.minInvestment,
          eligibleSectorsJson: JSON.stringify(def.eligibleSectors),
          eligibleLocationsJson: JSON.stringify(def.eligibleLocations),
          eligibleCompanyTypesJson: JSON.stringify(def.eligibleCompanyTypes),
          benefitsSummary: def.benefitsSummary,
          officialSourceUrl: def.officialSourceUrl,
          lastVerifiedDate: def.lastVerifiedDate
        }
      });
    }

    const application = await prisma.schemeApplication.create({
      data: {
        projectId: project.id,
        schemeId: dbScheme.id,
        matchScore: matchScore || 85,
        matchBreakdownJson: matchBreakdown ? JSON.stringify(matchBreakdown) : null,
        status: 'APPLIED'
      }
    });

    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: `Scheme Docket Generated: ${dbScheme.name}`,
        message: `Your pre-eligibility dossier (Score: ${matchScore}%) has been compiled with verified documents and registered with the Directorate of Industries.`,
        type: 'SCHEME_RECOMMENDATION',
        link: `/schemes`
      }
    });

    await logAuditAction({
      userId: req.user!.id,
      userName: req.user!.name,
      action: 'SCHEME_APPLIED',
      entityType: 'SCHEME',
      entityId: dbScheme.id,
      details: { schemeName: dbScheme.name, matchScore }
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('Scheme apply error:', error);
    res.status(500).json({ message: 'Failed to record scheme application' });
  }
});

export default router;
