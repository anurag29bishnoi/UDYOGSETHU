import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { CONFIG } from '../config';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { logAuditAction } from '../middleware/audit';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, mobile, password, companyName, companyType } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        mobile,
        passwordHash,
        role: 'ENTREPRENEUR',
        companies: companyName
          ? {
              create: {
                name: companyName,
                companyType: companyType || 'Private Limited',
                verificationStatus: 'NEEDS_REVIEW'
              }
            }
          : undefined
      },
      include: { companies: true }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      CONFIG.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logAuditAction({
      userId: user.id,
      userName: user.name,
      action: 'USER_REGISTER',
      entityType: 'AUTH',
      details: { email: user.email, company: companyName }
    });

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      company: user.companies[0] || null
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { companies: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        departmentCode: user.departmentCode
      },
      CONFIG.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logAuditAction({
      userId: user.id,
      userName: user.name,
      action: 'USER_LOGIN',
      entityType: 'AUTH',
      details: { role: user.role }
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        departmentCode: user.departmentCode
      },
      company: user.companies[0] || null
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during sign in.' });
  }
});

// POST /api/auth/demo-switch (Allows instant switching between demo roles for SIH presentation)
router.post('/demo-switch', async (req: Request, res: Response) => {
  try {
    const { role, email } = req.body;

    let targetUser;
    if (email) {
      targetUser = await prisma.user.findUnique({ where: { email }, include: { companies: true } });
    } else if (role) {
      targetUser = await prisma.user.findFirst({ where: { role }, include: { companies: true } });
    }

    if (!targetUser) {
      return res.status(404).json({ message: 'Demo user not found. Please run database seed.' });
    }

    const token = jwt.sign(
      {
        id: targetUser.id,
        email: targetUser.email,
        role: targetUser.role,
        name: targetUser.name,
        departmentCode: targetUser.departmentCode
      },
      CONFIG.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        designation: targetUser.designation,
        departmentCode: targetUser.departmentCode
      },
      company: targetUser.companies[0] || null
    });
  } catch (error) {
    res.status(500).json({ message: 'Demo switch failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        companies: {
          include: {
            projects: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        designation: user.designation,
        departmentCode: user.departmentCode
      },
      companies: user.companies
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve profile' });
  }
});

export default router;
