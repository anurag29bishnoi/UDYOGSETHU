import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EntrepreneurDashboard } from './pages/EntrepreneurDashboard';
import { BusinessReadinessPage } from './pages/BusinessReadinessPage';
import { ProjectWizardPage } from './pages/ProjectWizardPage';
import { DocumentVaultPage } from './pages/DocumentVaultPage';
import { ApprovalRoadmapPage } from './pages/ApprovalRoadmapPage';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage';
import { SchemeDiscoveryPage } from './pages/SchemeDiscoveryPage';
import { ComplianceCenterPage } from './pages/ComplianceCenterPage';
import { GrievancesPage } from './pages/GrievancesPage';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { SeniorOfficerDashboard } from './pages/SeniorOfficerDashboard';
import { AdminPortal } from './pages/AdminPortal';
import { OfficerAnalyticsPage } from './pages/OfficerAnalyticsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { StartBusinessWizardPage } from './pages/StartBusinessWizardPage';
import { KnowYourApprovalsPage } from './pages/KnowYourApprovalsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-500 text-xs">
        Loading session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Auth */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="about" element={<LandingPage />} />
            <Route path="how-it-works" element={<LandingPage />} />
            <Route path="faq" element={<LandingPage />} />
            <Route path="contact" element={<LandingPage />} />
            <Route path="start-business" element={<StartBusinessWizardPage />} />
            <Route path="know-your-approvals" element={<KnowYourApprovalsPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* Entrepreneur Routes */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <EntrepreneurDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="readiness"
              element={
                <ProtectedRoute>
                  <BusinessReadinessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="projects"
              element={
                <ProtectedRoute>
                  <EntrepreneurDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="projects/new"
              element={
                <ProtectedRoute>
                  <ProjectWizardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="projects/:id"
              element={
                <ProtectedRoute>
                  <ProjectDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="documents"
              element={
                <ProtectedRoute>
                  <DocumentVaultPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="approvals"
              element={
                <ProtectedRoute>
                  <ApprovalRoadmapPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="applications"
              element={
                <ProtectedRoute>
                  <EntrepreneurDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="applications/:id"
              element={
                <ProtectedRoute>
                  <ApplicationDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="schemes"
              element={
                <ProtectedRoute>
                  <SchemeDiscoveryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="compliance"
              element={
                <ProtectedRoute>
                  <ComplianceCenterPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="grievances"
              element={
                <ProtectedRoute>
                  <GrievancesPage />
                </ProtectedRoute>
              }
            />

            {/* Officer Routes */}
            <Route
              path="officer"
              element={
                <ProtectedRoute allowedRoles={['DEPARTMENT_OFFICER', 'SENIOR_OFFICER', 'ADMIN']}>
                  <OfficerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="officer/inspections"
              element={
                <ProtectedRoute allowedRoles={['DEPARTMENT_OFFICER', 'SENIOR_OFFICER', 'ADMIN']}>
                  <OfficerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="officer/analytics"
              element={
                <ProtectedRoute allowedRoles={['DEPARTMENT_OFFICER', 'SENIOR_OFFICER', 'ADMIN']}>
                  <OfficerAnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* Senior Officer Routes */}
            <Route
              path="senior"
              element={
                <ProtectedRoute allowedRoles={['SENIOR_OFFICER', 'ADMIN']}>
                  <SeniorOfficerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminPortal />
                </ProtectedRoute>
              }
            />

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
