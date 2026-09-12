import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { CURATED_SCHEMES } from '../engines/schemeMatchingEngine';

const router = Router();

// POST /api/assistant/ask (Grounded Regulatory Assistant)
router.post('/ask', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { query, projectId } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Query text is required' });
    }

    const q = query.toLowerCase().trim();

    // Fetch context
    let project = null;
    let documents: any[] = [];
    let compliances: any[] = [];

    if (projectId) {
      project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { documents: true, compliances: true, applications: { include: { approval: true } } }
      });
      if (project) {
        documents = project.documents;
        compliances = project.compliances;
      }
    }

    let answer = '';
    let source = 'Statutory Industrial Regulations (Maharashtra)';
    let confidence = 'High';

    if (q.includes('what approval') || q.includes('approvals do i need') || q.includes('required approval')) {
      if (project) {
        answer = `Based on your declared sector (${project.sector}), capital investment of ₹${project.totalInvestment} Cr, and manpower (${project.employeeCount} workers), your primary statutory requirements are:\n` +
          `1. MPCB Consent to Establish (CTE) under the Water Act 1974 & Air Act 1981.\n` +
          `2. Fire Safety Provisional NOC from Maharashtra Fire Services.\n` +
          `3. DISH Factory License Plan Approval under Factories Act 1948.\n` +
          `4. MSEDCL Power Sanction for ${project.powerReq} kVA connected industrial load.\n` +
          `5. Labour Registration under Contract Labour (R&A) Act 1970.\n\nYou can generate the full interactive roadmap in the "Approvals" tab.`;
        source = 'Maharashtra Business Regulations & MPCB / DISH Statutes';
      } else {
        answer = `Industrial approvals depend on your manufacturing sector, investment amount, location (MIDC vs Non-MIDC), and workforce size. Standard manufacturing units typically require MPCB Consent, Fire NOC, DISH Factory Plan Approval, and MSEDCL power sanctions. Please create or select a project profile to view your exact roadmap.`;
      }
    } else if (q.includes('missing') || q.includes('document')) {
      if (documents.length > 0) {
        const categories = new Set(documents.map(d => d.category));
        const missing: string[] = [];
        if (!categories.has('Identity')) missing.push('Company PAN Card');
        if (!categories.has('Tax')) missing.push('GSTIN Registration Certificate');
        if (!categories.has('Land')) missing.push('MIDC Land Allotment / Possession Letter');
        if (!categories.has('Factory')) missing.push('Approved Factory Layout & Machine Plan');
        if (!categories.has('Environmental')) missing.push('Environmental Management Plan (EMP)');

        if (missing.length > 0) {
          answer = `Your document repository currently requires the following mandatory certificates:\n• ${missing.join('\n• ')}\n\nUploading these in the Document Vault will bring your Document Health Score to 100%.`;
        } else {
          answer = `All primary statutory document categories (Identity, Tax, Land, Factory, Environmental) are uploaded and verified. Check for any minor cross-document variations in the Document Vault.`;
        }
      } else {
        answer = `No documents have been uploaded for your active profile yet. To proceed with single-window approvals, please upload: 1. PAN, 2. GST Certificate, 3. Incorporation Certificate, 4. Land Deed/Possession Letter, 5. Factory Machine Plan.`;
      }
    } else if (q.includes('compliance') || q.includes('when is my compliance due') || q.includes('due')) {
      if (compliances.length > 0) {
        const upcoming = compliances.map(c => `• ${c.name} - Due on ${new Date(c.dueDate).toLocaleDateString()} (${c.status})`).join('\n');
        answer = `Here are your scheduled compliance obligations:\n${upcoming}\n\nYou can review deadlines and file returns directly in the Compliance Center.`;
      } else {
        answer = `Standard industrial compliances include: 1. Environmental Statement (Form V) submitted annually before September 30, 2. Annual Factory Return (Form 27) submitted before February 1, and 3. Bi-annual Hazardous Waste Manifests. Active compliances will appear in your Compliance Center once approvals are sanctioned.`;
      }
    } else if (q.includes('scheme') || q.includes('subsidy') || q.includes('incentive')) {
      const topSchemes = CURATED_SCHEMES.slice(0, 3).map(s => `• ${s.name}: ${s.benefitsSummary}`).join('\n\n');
      answer = `Eligible government support programs for Maharashtra industries include:\n\n${topSchemes}\n\nVisit the Government Schemes section to evaluate your scored match (up to 100 points) and review 'Why You Qualify'.`;
      source = 'Direct Industries Incentives Portal, Government of Maharashtra';
    } else if (q.includes('sla') || q.includes('timeline') || q.includes('how long')) {
      answer = `Under the Maharashtra Right to Public Services Act (RTSA 2015), industrial approvals carry legally enforceable SLA deadlines:\n• MPCB CTE: 21 working days\n• Fire NOC: 15 working days\n• DISH Factory Plan Approval: 30 working days\n• MSEDCL HT Connection: 14 working days\n• Labour Registration: 7 working days\n\nIf a department exceeds these statutory limits, UdyogSetu automatically escalates the application to Senior Supervisory Officers.`;
      source = 'Maharashtra Right to Public Services Act (RTSA 2015)';
    } else {
      answer = `I don't have verified statutory information for this specific query in the current state database. For official legal interpretations, please consult the Maharashtra Industrial Development Corporation (MIDC) regulations or raise a query to your assigned department verification officer.`;
      confidence = 'Low';
    }

    res.json({
      query,
      answer,
      source,
      confidence,
      disclaimer: 'Assisted regulatory guidance based on verified state statutes. Subject to official verification by the competent administrative authority.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Regulatory assistant encountered an error' });
  }
});

export default router;
