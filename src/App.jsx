import React, { Suspense, lazy, useEffect } from 'react';
    import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
    import { HelmetProvider } from 'react-helmet-async';
    import { Toaster } from '@/components/ui/toaster';
    import { AuthProvider, useAuth } from '@/contexts/SupabaseAuthContext.jsx';
    import { ProjectProvider } from '@/contexts/ProjectContext.jsx';
    import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext.jsx';
    import CurrencyProvider from '@/contexts/CurrencyProvider.jsx';
    import GlobalNavbar from '@/components/GlobalNavbar';
    import Footer from '@/components/Footer';
    import PwaInstallPrompt from '@/components/PwaInstallPrompt';
    import ShoppingCart from '@/components/ShoppingCart.jsx';
    import { CartProvider } from '@/hooks/useCart.jsx';
    import DashboardLayout from '@/components/dashboard/DashboardLayout.jsx';
    import AccountLayout from '@/components/AccountLayout.jsx';
    import AuthBootstrap from '@/components/dashboard/AuthBootstrap.jsx';
    import GlobalErrorHandler from '@/components/GlobalErrorHandler.jsx';
    import AuthGuard from '@/components/dashboard/AuthGuard.jsx';
    import Overview from '@/pages/Overview.jsx';

    const HomePage = lazy(() => import('@/pages/HomePage.jsx'));
    const FeaturesPage = lazy(() => import('@/pages/FeaturesPage.jsx'));
    const ToolkitsPage = lazy(() => import('@/pages/ToolkitsPage.jsx'));
    const AboutPage = lazy(() => import('@/pages/AboutPage.jsx'));
    const PricingPage = lazy(() => import('@/pages/PricingPage.jsx'));
    const ContactPage = lazy(() => import('@/pages/ContactPage.jsx'));
    const RequestDemoPage = lazy(() => import('@/pages/RequestDemoPage.jsx'));
    const ProjectManagementPage = lazy(() => import('@/pages/ProjectManagementPage.jsx'));
    const LoginPage = lazy(() => import('@/pages/LoginPage.jsx'));
    const SignUpPage = lazy(() => import('@/pages/SignUpPage.jsx'));
    const ProfilePage = lazy(() => import('@/pages/ProfilePage.jsx'));
    const BillingPage = lazy(() => import('@/pages/BillingPage.jsx'));
    const SettingsPage = lazy(() => import('@/pages/SettingsPage.jsx'));
    const ProjectSettingsPage = lazy(() => import('@/pages/ProjectSettingsPage.jsx'));
    const OrgSettingsPage = lazy(() => import('@/pages/OrgSettingsPage.jsx'));
    const CheckoutPage = lazy(() => import('@/pages/CheckoutPage.jsx'));
    const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage.jsx'));
    const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage.jsx'));
    const StorePage = lazy(() => import('@/pages/StorePage.jsx'));
    const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage.jsx'));
    const SuccessPage = lazy(() => import('@/pages/SuccessPage.jsx'));
    const SelectRolePage = lazy(() => import('@/pages/SelectRolePage.jsx'));
    const HomeBuilderFeaturesPage = lazy(() => import('@/pages/HomeBuilderFeaturesPage.jsx'));
    const RenovationExpertsFeaturesPage = lazy(() => import('@/pages/RenovationExpertsFeaturesPage.jsx'));
    const SpecialtyContractorsFeaturesPage = lazy(() => import('@/pages/SpecialtyContractorsFeaturesPage.jsx'));
    const UserPermissionsPage = lazy(() => import('@/pages/UserPermissionsPage.jsx'));
    const SuppliersPage = lazy(() => import('@/pages/SuppliersPage.jsx'));
    const InventoryPage = lazy(() => import('@/pages/InventoryPage.jsx'));
    const MaterialPurchasesPage = lazy(() => import('@/pages/MaterialPurchasesPage.jsx'));
    const GoodsReceivedNotesPage = lazy(() => import('@/pages/GoodsReceivedNotesPage.jsx'));
    const GoodsIssueNotesPage = lazy(() => import('@/pages/GoodsIssueNotesPage.jsx'));
    const StockMovementsPage = lazy(() => import('@/pages/StockMovementsPage.jsx'));
    const ConstructionProcessPage = lazy(() => import('@/pages/ConstructionProcessPage.jsx'));
    const ConstructionWorkflowPage = lazy(() => import('@/pages/ConstructionWorkflowPage.jsx'));
    const CalendarPage = lazy(() => import('@/pages/CalendarPage.jsx'));
    const WorkflowTemplatesPage = lazy(() => import('@/pages/WorkflowTemplatesPage.jsx'));
    const PayrollApprovalPage = lazy(() => import('@/pages/PayrollApprovalPage.jsx'));
    const AutomationsPage = lazy(() => import('@/pages/AutomationsPage.jsx'));
    const ProjectMaterialsPage = lazy(() => import('@/pages/ProjectMaterialsPage.jsx'));
    const FinancialLedgerPage = lazy(() => import('@/pages/FinancialLedgerPage.jsx'));
    const ProjectsPage = lazy(() => import('@/pages/ProjectsPage.jsx'));
    const ProjectDetailsPage = lazy(() => import('@/pages/ProjectDetailsPage.jsx'));
    const BalanceDigestsPage = lazy(() => import('@/pages/BalanceDigestsPage.jsx'));
    const ReconciliationPage = lazy(() => import('@/pages/ReconciliationPage.jsx'));
    const ReportsPage = lazy(() => import('@/pages/ReportsPage.jsx'));
    const WorkersPage = lazy(() => import('@/pages/WorkersPage.jsx'));
    const WorkforcePage = lazy(() => import('@/pages/WorkforcePage.jsx'));
    const FinancialsPage = lazy(() => import('@/pages/FinancialsPage.jsx'));
    const SupplyChainPage = lazy(() => import('@/pages/SupplyChainPage.jsx'));
    const PayrollPage = lazy(() => import('@/pages/PayrollPage.jsx'));
    const ApprovalsPage = lazy(() => import('@/pages/ApprovalsPage.jsx'));
    const TeamDirectoryPage = lazy(() => import('@/pages/TeamDirectoryPage.jsx'));
    const TrialRequestsPage = lazy(() => import('@/pages/admin/TrialRequestsPage.jsx'));
    const TrialsDemosPage = lazy(() => import('@/pages/admin/TrialsDemosPage.jsx'));
    const NewProjectPage = lazy(() => import('@/pages/NewProjectPage.jsx'));
    const AskBuilderPage = lazy(() => import('@/pages/AskBuilderPage.jsx'));
    const AiMonitoringPage = lazy(() => import('@/pages/AiMonitoringPage.jsx'));
    const AiMaterialsPage = lazy(() => import('@/pages/AiMaterialsPage.jsx'));
    const AiCostsPage = lazy(() => import('@/pages/AiCostsPage.jsx'));
    const AiDesignPage = lazy(() => import('@/pages/AiDesignPage.jsx'));
    const AiCompliancePage = lazy(() => import('@/pages/AiCompliancePage.jsx'));
    const AiCommsPage = lazy(() => import('@/pages/AiCommsPage.jsx'));
    const AiAlertsPage = lazy(() => import('@/pages/AiAlertsPage.jsx'));
    const AiLogPage = lazy(() => import('@/pages/AiLogPage.jsx'));
    const KnowledgeBasePage = lazy(() => import('@/pages/KnowledgeBasePage.jsx'));
    const MediaLogsPage = lazy(() => import('@/pages/MediaLogsPage.jsx'));
    const FXRatesPage = lazy(() => import('@/pages/FXRatesPage.jsx'));
    const AlertsPage = lazy(() => import('@/pages/Alerts.jsx')); 
    const TasksPage = lazy(() => import('@/pages/TasksPage.jsx'));
    const SourcingPage = lazy(() => import('@/pages/dashboard/SourcingPage.jsx'));
    const MediaPage = lazy(() => import('@/pages/dashboard/MediaPage.jsx'));
    const MilestonesPage = lazy(() => import('@/pages/dashboard/MilestonesPage.jsx'));
    const CommunicationPage = lazy(() => import('@/pages/dashboard/CommunicationPage.jsx'));
    const ContingencyPage = lazy(() => import('@/pages/dashboard/ContingencyPage.jsx'));
    const LoansPage = lazy(() => import('@/pages/dashboard/LoansPage.jsx'));
    const WbsImportPage = lazy(() => import('@/pages/WbsImportPage.jsx'));
    const WbsPage = lazy(() => import('@/pages/WbsPage.jsx'));

    const LoadingFallback = () => (
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-700">Loading App...</h2>
        </div>
      </div>
    );

    const PrivateRoute = ({ children }) => {
      const { user, loading } = useAuth();
      const location = useLocation();

      if (loading) {
        return <LoadingFallback />;
      }

      if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
      }
      
      return <AuthBootstrap>{children}</AuthBootstrap>;
    };

    const PublicLayout = () => {
      const location = useLocation();
      const isHomePage = location.pathname === '/';

      const mainContent = (
        <Suspense fallback={<LoadingFallback />}>
          <Outlet />
        </Suspense>
      );

      return (
        <div className="min-h-screen flex flex-col bg-slate-50">
          <GlobalNavbar />
          <PwaInstallPrompt />
          <main className="flex-grow pt-16">
            {isHomePage ? (
              mainContent
            ) : (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {mainContent}
              </div>
            )}
          </main>
          <Footer />
        </div>
      );
    };

    const AuthLayout = ({children}) => {
        return (
            <div className="min-h-screen flex flex-col bg-slate-50">
               <main className="flex-grow">
                 <Suspense fallback={<LoadingFallback />}>
                    {children}
                 </Suspense>
               </main>
            </div>
        )
    }
    
    const DashboardRoutes = () => {
        return (
            <Routes>
                <Route index element={<Navigate to="/dashboard/overview" replace />} />
                <Route path="overview" element={<Overview />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="projects/:id/*" element={<ProjectDetailsPage />} />
                <Route path="projects/:id/wbs" element={<WbsPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="workforce" element={<WorkforcePage />} />
                <Route path="financials" element={<FinancialsPage />} />
                <Route path="supply-chain" element={<SupplyChainPage />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="project-management" element={<ProjectManagementPage />} />
                <Route path="ask-brain" element={<AskBuilderPage />} />
                <Route path="ai-log" element={<AiLogPage />} />
                <Route path="workers" element={<WorkersPage />} />
                <Route path="payroll" element={<PayrollPage />} />
                <Route path="approvals" element={<ApprovalsPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="construction-process" element={<ConstructionProcessPage />} />
                <Route path="workflow-templates" element={<WorkflowTemplatesPage />} />
                <Route path="payroll-approval" element={<PayrollApprovalPage />} />
                <Route path="automations" element={<AutomationsPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="suppliers" element={<SuppliersPage />} />
                <Route path="purchases" element={<MaterialPurchasesPage />} />
                <Route path="grn" element={<GoodsReceivedNotesPage />} />
                <Route path="gin" element={<GoodsIssueNotesPage />} />
                <Route path="stock-movements" element={<StockMovementsPage />} />
                <Route path="project-materials" element={<ProjectMaterialsPage />} />
                <Route path="financial-ledger" element={<FinancialLedgerPage />} />
                <Route path="balance-digests" element={<BalanceDigestsPage />} />
                <Route path="reconciliation" element={<ReconciliationPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="project-settings" element={<ProjectSettingsPage />} />
                <Route path="team" element={<TeamDirectoryPage />} />
                <Route path="media-logs" element={<MediaLogsPage />} />
                <Route path="fx-rates" element={<FXRatesPage />} />
                <Route path="sourcing" element={<SourcingPage />} />
                <Route path="media" element={<MediaPage />} />
                <Route path="milestones" element={<MilestonesPage />} />
                <Route path="communication" element={<CommunicationPage />} />
                <Route path="contingency" element={<ContingencyPage />} />
                <Route path="loans" element={<LoansPage />} />
                <Route path="wbs-import" element={<WbsImportPage />} />
                <Route path=":tab" element={<Overview />} />
            </Routes>
        );
    };

    const AppContent = () => {
      const { user, loading } = useAuth();
      const location = useLocation();

      if (loading) {
        return <LoadingFallback />;
      }

      if (user && (location.pathname === '/login' || location.pathname === '/signup')) {
        return <Navigate to="/dashboard" replace />;
      }
      
      return (
        <>
          <GlobalErrorHandler />
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/toolkits" element={<ToolkitsPage />} />
              <Route path="/features/home-builders" element={<HomeBuilderFeaturesPage />} />
              <Route path="/features/renovation-experts" element={<RenovationExpertsFeaturesPage />} />
              <Route path="/features/specialty-contractors" element={<SpecialtyContractorsFeaturesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/request-demo" element={<RequestDemoPage />} />
              <Route path="/store" element={<StorePage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/success" element={<SuccessPage />} />
            </Route>
            
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/select-role" element={<SelectRolePage />} />
            
            <Route path="/projects/new" element={<PrivateRoute><AuthLayout><NewProjectPage /></AuthLayout></PrivateRoute>} />

            <Route 
              path="/dashboard/*" 
              element={
                <PrivateRoute>
                  <DashboardProvider>
                    <DashboardLayout>
                      <DashboardRoutes />
                    </DashboardLayout>
                  </DashboardProvider>
                </PrivateRoute>
              }
            />
            
            <Route path="/ask-builder" element={<Navigate to="/ask-brain" replace />} />
            <Route path="/ask-brain/*"
              element={
                <PrivateRoute>
                  <AuthGuard roles={['manager', 'integrator', 'owner']}>
                    <DashboardProvider>
                      <DashboardLayout>
                        <Outlet />
                      </DashboardLayout>
                    </DashboardProvider>
                  </AuthGuard>
                </PrivateRoute>
              }>
              <Route index element={<Navigate to="/dashboard/ask-brain" replace />} />
              <Route path="kb" element={<KnowledgeBasePage />} />
              <Route path="monitoring" element={<AiMonitoringPage />} />
              <Route path="materials" element={<AiMaterialsPage />} />
              <Route path="costs" element={<AiCostsPage />} />
              <Route path="design" element={<AiDesignPage />} />
              <Route path="compliance" element={<AiCompliancePage />} />
              <Route path="comms" element={<AiCommsPage />} />
              <Route path="alerts" element={<AiAlertsPage />} />
            </Route>

            <Route 
              path="/admin/*"
              element={
                <PrivateRoute>
                  <DashboardProvider>
                    <DashboardLayout>
                       <Outlet />
                    </DashboardLayout>
                  </DashboardProvider>
                </PrivateRoute>
              }
            >
              <Route path="trials-requests" element={<TrialRequestsPage />} />
              <Route path="trials" element={<TrialsDemosPage />} />
            </Route>
            
            <Route path="/account/*" element={
              <PrivateRoute>
                <AccountLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="billing" element={<BillingPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="org-settings" element={<OrgSettingsPage />} />
                        <Route path="permissions" element={<UserPermissionsPage />} />
                    </Routes>
                  </Suspense>
                </AccountLayout>
              </PrivateRoute>
            } />
            
            <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
          </Routes>
          <Toaster />
        </>
      );
    };

    function App() {
      return (
        <HelmetProvider>
          <Router>
            <AuthProvider>
              <ProjectProvider>
                <CartProvider>
                  <CurrencyProvider>
                    <Suspense fallback={<LoadingFallback />}>
                      <AppContent />
                    </Suspense>
                  </CurrencyProvider>
                </CartProvider>
              </ProjectProvider>
            </AuthProvider>
          </Router>
        </HelmetProvider>
      );
    }

    export default App;