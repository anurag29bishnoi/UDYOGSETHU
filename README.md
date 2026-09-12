# UDYOGSETU 360 (उद्योगसेतु ३६०)
### *"Start Any Business. Know Every Requirement. Stay Compliant."*
#### *"One Business Profile. Every Approval. Every Document. Every Compliance. Every Opportunity."*

**Smart India Hackathon 2026 — Problem Statement 26130**  
*Title: Efficiency in streamlining industrial approvals, compliance processes, and access to government support services*

---

## 🏛️ Executive Summary

**UDYOGSETU 360** is a comprehensive full-stack business setup, regulatory approval, document intelligence, government scheme discovery, and compliance orchestration platform.

Rather than being restricted to a single industrial segment, **UDYOGSETU 360** scales dynamically to support **ANY business in India** — with deep-dive live production engines for **Food & Agro-Processing Ventures** (FSSAI, NABL Potable Water Testing, Schedule 4 layouts, PMFME, PMKSY) alongside multi-sector taxonomy (Petrol Pumps, Hotels, Hospitals, Textile Mills, IT Companies, and Pharmacies).

The platform unifies:
1. **Dynamic Business Taxonomy & Guided Setup Wizard (`/start-business`)**: Dynamic questionnaire tailored specifically to the chosen business with live sector rules and Phase 2 notifications.
2. **Universal "Know Your Approvals" (KYA) Directory (`/know-your-approvals`)**: Central, State, Local, and Sector-Specific clearance roadmaps with explicit "Why Required" legal rationale.
3. **Business Digital Twin & Data Provenance**: Master profile tracking parameters with transparent audit badges (`[Manual Entry]`, `[Uploaded Doc]`, `[OCR Extracted]`, `[Officer Verified]`).
4. **Document Vault & 20-Point Error Scrutiny**: OCR entity extraction, 20-point error detection, and cross-document reconciliation.
5. **Approval Graph, Pipeline Compiler & Critical Path Engine**: Executable DAG calculating fastest theoretical statutory duration under the Maharashtra Right to Public Services Act (RTSA 2015).
6. **Change Impact Simulator ("What If I Change My Project?")**: Interactive what-if simulator testing shifts in capital outlay, workforce, or hazardous substances with live database commit.
7. **Government Scheme Optimizer**: Deterministic 100-point scored matching against Maharashtra PSI 2019, PMFME, PMKSY CEFPPC, PM MITRA, MoFPI, and MSME capital incentives.
8. **Pre-Submission Validator & Submission Package**: Audit gatekeeper preventing rejection before official submission with PDF/ZIP package generation.
9. **Departmental Workflow, Joint Inspections & Statutory Escalations**: Multi-department tracking with synchronized joint inspections and auto-escalations upon SLA breach.
10. **ComplianceOS & Statutory Renewals**: Post-approval recurring returns calendar and 90/60/30/7-day proactive renewal countdowns.

---

## ⚡ Quick Demo Access (1-Click Evaluator Personas)

The platform includes an instant **Demo Persona Switcher Bar** in the header. You can also sign in manually using:

| Role | Demo Email | Password | Scope & Responsibilities |
|---|---|---|---|
| **Entrepreneur** | `demo@udyogsetu.in` | `Demo@123` | ABC Industries Pvt Ltd (₹25 Cr Textile / Food Unit, Baramati MIDC, Pune) |
| **MPCB Field Officer** | `officer@udyogsetu.in` | `Demo@123` | Desk Scrutiny Queue, Consent to Establish (CTE), Joint Inspections |
| **Fire Safety Officer** | `fire.officer@udyogsetu.in` | `Demo@123` | Provisional Fire Safety NOC, Hydrant & Static Tank verification |
| **Senior Officer (IAS)** | `senior@udyogsetu.in` | `Demo@123` | State Appellate Authority, Statutory SLA Breach Escalation Desk |
| **System Admin** | `admin@udyogsetu.in` | `Demo@123` | Dynamic Rule Builder, Immutable Audit Trail, Demo Simulation Suite |

---

## 🏗️ System Architecture

```
                                USER / APPLICANT
                                       │
                                       ▼
                        5-STEP BUSINESS SETUP WIZARD
                                       │
                                       ▼
                         INTELLIGENT DOCUMENT VAULT
                       (OCR + 20-Point Error Scrutiny)
                                       │
               ┌───────────────────────┴───────────────────────┐
               ▼                                               ▼
     APPROVAL DISCOVERY ENGINE                       SCHEME MATCHING ENGINE
 (Deterministic Legal Rules)                     (100-Point Scored Eligibility)
               │                                               │
               ▼                                               ▼
       Statutory Roadmap &                           PMFME, PMKSY, PSI 2019,
   Parallel Department Dossiers                         PM MITRA & MoFPI
               │                                               │
               ▼                                               ▼
   PARALLEL CLEARANCES WORKFLOW                    PRE-ELIGIBILITY DOSSIER
    (MPCB, Fire, DISH, MSEDCL)                     (With Document Evidence)
               │
               ▼
   SYNCHRONIZED JOINT INSPECTION
       (Common Officer Squad)
               │
               ▼
    RTSA 2015 SLA & AUTO-ESCALATION
   (Senior Officer / IAS Intervention)
               │
               ▼
      CONSOLIDATED SANCTION &
   POST-APPROVAL COMPLIANCE CENTER
   (Returns & 90/60/30/7d Renewals)
```

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18, Vite, TypeScript
  - Tailwind CSS (Government Enterprise Color Palette: Deep Navy `#0F172A`, Slate `#334155`, Emerald `#047857`)
  - Lucide React (Icons), Recharts (Bottleneck Analytics), Canvas-confetti
- **Backend API**:
  - Node.js, Express.js, TypeScript
  - Multer (Local & Cloud Encrypted Document Storage abstraction)
  - JWT Authentication, BCrypt, Helmet, CORS
- **Database & ORM**:
  - Prisma ORM
  - SQLite (Default for zero-config local run)
  - PostgreSQL (Production schema & `docker-compose.yml` included)
- **Document & Rules Intelligence**:
  - OCR Abstraction Layer with structured data extraction
  - Deterministic 20-point error & cross-document consistency engine
  - 100-point transparent scheme eligibility scorer

---

## 🚀 Installation & Local Setup

### Prerequisites
- Node.js (v18+ or v20+)
- npm or yarn

### Step 1: Install Backend Dependencies & Database Setup
```bash
cd server
npm install
npx prisma db push
npm run seed
```
*Note: The database seed initializes realistic Maharashtra industrial records, test documents, active applications, joint inspections, and demo accounts.*

### Step 2: Install Frontend Dependencies
```bash
cd ../client
npm install
```

### Step 3: Run the Application
In terminal 1 (Backend):
```bash
cd server
npm run dev
# Running on http://localhost:5000
```

In terminal 2 (Frontend):
```bash
cd client
npm run dev
# Running on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🐳 Docker Deployment (Optional)

To spin up the entire full-stack system with PostgreSQL in Docker containers:
```bash
docker-compose up --build -d
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`

---

## 🛡️ Legal & Ethical Compliance

1. **Statutory Non-Discretionary Clearances**: Final legal sanction certificates remain vested with competent administrative authorities.
2. **Transparent AI & Rules**: All clearances and scheme incentives are evaluated deterministically using codified state gazettes without LLM hallucinations.
3. **Immutable Audit Trail**: All officer, entrepreneur, and admin actions are cryptographically sequenced in audit logs.

---

*Developed for Smart India Hackathon 2026 • Government of Maharashtra Single Window Service Framework*
