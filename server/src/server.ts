import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { CONFIG } from './config';
import { checkAndTriggerSLAEscalations } from './engines/slaEscalationEngine';

// Import route modules
import authRoutes from './routes/auth.routes';
import companyRoutes from './routes/company.routes';
import projectRoutes from './routes/project.routes';
import documentRoutes from './routes/document.routes';
import approvalRoutes from './routes/approval.routes';
import applicationRoutes from './routes/application.routes';
import inspectionRoutes from './routes/inspection.routes';
import schemeRoutes from './routes/scheme.routes';
import complianceRoutes from './routes/compliance.routes';
import grievanceRoutes from './routes/grievance.routes';
import officerRoutes from './routes/officer.routes';
import adminRoutes from './routes/admin.routes';
import assistantRoutes from './routes/assistant.routes';
import analyticsRoutes from './routes/analytics.routes';
import businessRoutes from './routes/business.routes';

const app = express();

// Ensure upload and certificates directories exist
const uploadDir = CONFIG.STORAGE_PATH;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const certDir = path.resolve(__dirname, '../../uploads/certificates');
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static file hosting for uploaded files and certificates
app.use('/uploads', express.static(CONFIG.STORAGE_PATH));
app.use('/certificates', express.static(certDir));

// Root healthcheck & API info
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    name: 'UDYOGSETU API',
    tagline: 'One Industrial Journey. Every Approval. Every Benefit.',
    status: 'ONLINE',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/officer', officerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/business', businessRoutes);
app.use('/api', businessRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'We could not process this request right now. Please try again later.'
  });
});

// Periodic SLA & Escalation Engine Checker (Runs every 60 seconds)
setInterval(async () => {
  try {
    await checkAndTriggerSLAEscalations();
  } catch (err) {
    console.error('Error running automated SLA background check:', err);
  }
}, 60 * 1000);

// Start HTTP Server
const server = app.listen(CONFIG.PORT, () => {
  console.log(`=======================================================`);
  console.log(`🏛️  UDYOGSETU - Industrial Approvals & Single Window API`);
  console.log(`   Running on http://localhost:${CONFIG.PORT}`);
  console.log(`   Environment: ${CONFIG.NODE_ENV}`);
  console.log(`=======================================================`);
});

export default app;
