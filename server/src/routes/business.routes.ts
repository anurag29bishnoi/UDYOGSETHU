import { Router, Request, Response } from 'express';
import {
  MASTER_CATEGORIES,
  MASTER_BUSINESS_TYPES,
  DYNAMIC_QUESTIONS,
  discoverBusinessRequirements
} from '../engines/businessTaxonomyEngine';

const router = Router();

// GET /api/business-types/categories
router.get('/categories', (req: Request, res: Response) => {
  res.json(MASTER_CATEGORIES);
});

// GET /api/business-types (List & Search)
router.get('/business-types', (req: Request, res: Response) => {
  const { query, category } = req.query;
  let types = [...MASTER_BUSINESS_TYPES];

  if (category && typeof category === 'string') {
    types = types.filter(t => t.categoryCode.toLowerCase() === category.toLowerCase());
  }

  if (query && typeof query === 'string') {
    const q = query.toLowerCase().trim();
    types = types.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.keywords.some(k => k.toLowerCase().includes(q))
    );
  }

  res.json(types);
});

// GET /api/business-types/:code
router.get('/business-types/:code', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const bType = MASTER_BUSINESS_TYPES.find(b => b.code === code);
  if (!bType) {
    return res.status(404).json({ message: 'Business type not found' });
  }

  const category = MASTER_CATEGORIES.find(c => c.code === bType.categoryCode);
  const questions = DYNAMIC_QUESTIONS[code] || [];

  res.json({
    ...bType,
    category,
    questionsCount: questions.length
  });
});

// GET /api/business-types/:code/questions
router.get('/business-types/:code/questions', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const questions = DYNAMIC_QUESTIONS[code] || [];
  res.json(questions);
});

// POST /api/business/business-types (Register New Business Type via Admin)
router.post('/business-types', (req: Request, res: Response) => {
  try {
    const { code, name, categoryCode, description, icon, isHazardous, typicalInvestmentRange, governingActs, keywords } = req.body;
    if (!code || !name || !categoryCode) {
      return res.status(400).json({ message: 'code, name, and categoryCode are required' });
    }

    const cleanCode = code.toUpperCase().trim().replace(/[^A-Z0-9_]/g, '_');
    const existing = MASTER_BUSINESS_TYPES.find(b => b.code === cleanCode);
    if (existing) {
      return res.status(400).json({ message: `Business type ${cleanCode} already exists` });
    }

    const newType = {
      code: cleanCode,
      name,
      categoryCode,
      description: description || `Commercial operations and statutory setup for ${name}`,
      icon: icon || 'Building2',
      isHazardous: Boolean(isHazardous),
      typicalInvestmentRange: typicalInvestmentRange || '₹1.0 Cr - ₹10.0 Cr',
      governingActs: governingActs || 'Factories Act, Shops & Establishments Act, State Industrial Policies',
      keywords: Array.isArray(keywords) ? keywords : [name.toLowerCase(), categoryCode.toLowerCase()]
    };

    MASTER_BUSINESS_TYPES.push(newType);
    if (!DYNAMIC_QUESTIONS[cleanCode]) {
      DYNAMIC_QUESTIONS[cleanCode] = [];
    }

    res.status(201).json({ message: 'Business type registered successfully', businessType: newType });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create business type', error: error.message });
  }
});

// POST /api/business/business-types/:code/questions (Add dynamic question via Admin)
router.post('/business-types/:code/questions', (req: Request, res: Response) => {
  try {
    const code = req.params.code.toUpperCase();
    const { questionCode, questionText, helpText, inputType, options, isRequired, sortOrder } = req.body;

    if (!questionCode || !questionText) {
      return res.status(400).json({ message: 'questionCode and questionText are required' });
    }

    if (!DYNAMIC_QUESTIONS[code]) {
      DYNAMIC_QUESTIONS[code] = [];
    }

    const newQuestion = {
      code: questionCode.toUpperCase().trim(),
      businessTypeCode: code,
      questionText,
      helpText: helpText || '',
      inputType: inputType || 'BOOLEAN',
      options: options || [],
      isRequired: isRequired !== false,
      sortOrder: sortOrder || (DYNAMIC_QUESTIONS[code].length + 1) * 10
    };

    DYNAMIC_QUESTIONS[code].push(newQuestion);
    res.status(201).json({ message: 'Dynamic question added successfully', question: newQuestion });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to add dynamic question', error: error.message });
  }
});

// GET /api/business/stats
router.get('/stats', (req: Request, res: Response) => {
  const totalQuestions = Object.values(DYNAMIC_QUESTIONS).reduce((acc, curr) => acc + curr.length, 0);
  res.json({
    totalCategories: MASTER_CATEGORIES.length,
    totalBusinessTypes: MASTER_BUSINESS_TYPES.length,
    totalDynamicQuestions: totalQuestions,
    supportedSectors: MASTER_CATEGORIES.map(c => c.name),
    lastEngineSync: new Date().toISOString()
  });
});

// POST /api/business/discover-requirements (Universal Know Your Approvals)
router.post('/discover-requirements', (req: Request, res: Response) => {
  try {
    const {
      businessTypeCode,
      location,
      projectStage,
      answers,
      investmentCr,
      employeeCount
    } = req.body;

    if (!businessTypeCode) {
      return res.status(400).json({ message: 'businessTypeCode is required' });
    }

    const defaultLoc = location || {
      state: 'Maharashtra',
      district: 'Pune',
      cityOrTaluka: 'Baramati'
    };

    const discovery = discoverBusinessRequirements(
      businessTypeCode,
      defaultLoc,
      projectStage || 'Planning',
      answers || {},
      parseFloat(investmentCr || 2),
      parseInt(employeeCount || 25, 10)
    );

    res.json(discovery);
  } catch (error: any) {
    console.error('Error discovering business requirements:', error);
    res.status(500).json({ message: 'Failed to discover requirements for business type' });
  }
});

export default router;
