import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';

// Marketing & Agency
const LandingPage = lazy(() => import('./pages/marketing/LandingPage'));
const AgencyDashboard = lazy(() => import('./pages/AgencyDashboard'));
const AgencyLogin = lazy(() => import('./pages/AgencyLogin'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const Login = lazy(() => import('./pages/Login'));

// Generic Admin / Management
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const TablesManager = lazy(() => import('./pages/admin/TablesManager'));
const ReservationsManager = lazy(() => import('./pages/admin/ReservationsManager'));
const OutletsDeliveryManager = lazy(() => import('./pages/admin/OutletsDeliveryManager'));
const MenuManager = lazy(() => import('./pages/admin/MenuManager'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const StaffSettings = lazy(() => import('./pages/admin/StaffSettings'));
const StaffManager = lazy(() => import('./pages/admin/StaffManager'));
const CustomerDirectory = lazy(() => import('./pages/admin/CustomerDirectory'));
const CouponsManager = lazy(() => import('./pages/admin/CouponsManager'));
const MoneyManager = lazy(() => import('./pages/admin/MoneyManager'));
const ExpensesManager = lazy(() => import('./pages/admin/ExpensesManager'));
const InventoryManager = lazy(() => import('./pages/admin/InventoryManager'));
const StaffMobileApps = lazy(() => import('./pages/admin/StaffMobileApps'));

// Vertical: Restaurant / RMS
const RMSPOS = lazy(() => import('./pages/rms/POS'));
const RMSInventory = lazy(() => import('./pages/rms/Inventory'));
const RMSAI = lazy(() => import('./pages/rms/AIAnalytics'));
const WaiterDashboard = lazy(() => import('./pages/waiter/WaiterDashboard'));
const CounterDashboard = lazy(() => import('./pages/counter/CounterDashboard'));
const CashierDashboard = lazy(() => import('./pages/cashier/CashierDashboard'));
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'));
const SelfOrder = lazy(() => import('./pages/customer/SelfOrder'));

// Vertical: GMS (Gym)
const GmsDashboard = lazy(() => import('./pages/gms/GmsDashboard'));
const GmsMemberManagement = lazy(() => import('./pages/gms/GmsMemberManagement'));
const GmsWorkoutDietPlans = lazy(() => import('./pages/gms/GmsWorkoutDietPlans'));
const GmsCrmManager = lazy(() => import('./pages/gms/GmsCrmManager'));
const GmsFacilityManager = lazy(() => import('./pages/gms/GmsFacilityManager'));
const GmsPosTerminal = lazy(() => import('./pages/gms/GmsPosTerminal'));

// Vertical: HMS (Hospital)
const HMSDashboard = lazy(() => import('./pages/hms/HMSDashboard'));
const Lab = lazy(() => import('./pages/hms/Lab'));
const Pharmacy = lazy(() => import('./pages/hms/Pharmacy'));
const Patients = lazy(() => import('./pages/hms/Patients'));
const PatientDetails = lazy(() => import('./pages/hms/PatientDetails'));
const Appointments = lazy(() => import('./pages/hms/Appointments'));
const PatientRegistration = lazy(() => import('./pages/hms/PatientRegistration'));
const EMRDashboard = lazy(() => import('./pages/hms/EMRDashboard'));
const AIMedicalAssistant = lazy(() => import('./pages/hms/AIMedicalAssistant'));

// Vertical: PMS (Property)
const PMSDashboard = lazy(() => import('./pages/pms/PMSDashboard'));
const PropertyManager = lazy(() => import('./pages/pms/PropertyManager'));
const LeaseManager = lazy(() => import('./pages/pms/LeaseManager'));
const BillingManager = lazy(() => import('./pages/pms/BillingManager'));
const MaintenanceManager = lazy(() => import('./pages/pms/MaintenanceManager'));
const PMSLayout = lazy(() => import('./pages/pms/PMSLayout'));

// Vertical: TMS (Travel)
const TMSDashboard = lazy(() => import('./pages/tms/TMSDashboard'));
const TravelRequestForm = lazy(() => import('./pages/tms/TravelRequestForm'));
const ExpenseManager = lazy(() => import('./pages/tms/ExpenseManager'));
const TMSLogin = lazy(() => import('./pages/tms/TMSLogin'));

// Vertical: Spa & Wellness
const SpaDashboard = lazy(() => import('./pages/spa/SpaDashboard'));
const SpaPOS = lazy(() => import('./pages/spa/SpaPOS'));
const AppointmentBooking = lazy(() => import('./pages/spa/AppointmentBooking'));
const TherapistManagement = lazy(() => import('./pages/spa/TherapistManagement'));
const MembershipsPackages = lazy(() => import('./pages/spa/MembershipsPackages'));
const CustomerCRM = lazy(() => import('./pages/spa/CustomerCRM'));
const SpaInventory = lazy(() => import('./pages/spa/SpaInventory'));
const CustomerFeedback = lazy(() => import('./pages/spa/CustomerFeedback'));
const EnterprisePortals = lazy(() => import('./pages/spa/EnterprisePortals'));
const SpecializedPortals = lazy(() => import('./pages/spa/SpecializedPortals'));
const MarketingLoyalty = lazy(() => import('./pages/spa/MarketingLoyalty'));

// Vertical: MES (Manufacturing)
const ProductionPlanning = lazy(() => import('./pages/mes/ProductionPlanning'));
const InventoryWarehouse = lazy(() => import('./pages/mes/InventoryWarehouse'));
const MachineMonitoring = lazy(() => import('./pages/mes/MachineMonitoring'));
const QualityControl = lazy(() => import('./pages/mes/QualityControl'));
const SalesOrders = lazy(() => import('./pages/mes/SalesOrders'));
const FinanceHR = lazy(() => import('./pages/mes/FinanceHR'));

// Vertical: WMS (Warehouse)
const WMOSDashboard = lazy(() => import('./pages/warehouse/WMOSDashboard'));
const WarehouseInventory = lazy(() => import('./pages/warehouse/InventoryManager'));
const LogisticsManager = lazy(() => import('./pages/warehouse/LogisticsManager'));
const OperationsManager = lazy(() => import('./pages/warehouse/OperationsManager'));

// Vertical: EMS (Events) - Standalone
const EMSDashboardShell = lazy(() => import('./components/ems/EMSDashboardShell'));
const EventPlanner = lazy(() => import('./pages/admin/EventPlanner'));
const TicketingSystem = lazy(() => import('./pages/admin/TicketingSystem'));
const AttendeeManager = lazy(() => import('./pages/admin/AttendeeManager'));
const VendorManager = lazy(() => import('./pages/admin/VendorManager'));
const CateringManager = lazy(() => import('./pages/admin/CateringManager'));
const AccountingReports = lazy(() => import('./pages/admin/AccountingReports'));
const MarketingCRM = lazy(() => import('./pages/admin/MarketingCRM'));

// Marketing Subpages
const AboutPage = lazy(() => import('./pages/marketing/AboutPage'));
const FeaturesPage = lazy(() => import('./pages/marketing/FeaturesPage'));
const ShowcasePage = lazy(() => import('./pages/marketing/ShowcasePage'));
const PricingPage = lazy(() => import('./pages/marketing/PricingPage'));
const CareerPage = lazy(() => import('./pages/marketing/CareerPage'));
const BlogPage = lazy(() => import('./pages/marketing/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/marketing/BlogPostPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/marketing/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/marketing/TermsPage'));
const RefundPolicyPage = lazy(() => import('./pages/marketing/RefundPolicyPage'));

// Shared Components
const QRPrintPage = lazy(() => import('./components/QR/QRPrintPage'));
import FloatingWhatsApp from './components/shared/FloatingWhatsApp';

import './pages/marketing/marketing.css';

// ─── Route Guards ──────────────────────────────────────────

function AgencyProtectedRoute({ children }) {
  const token = localStorage.getItem('agency_token');
  if (!token) return <Navigate to="/app/login" replace />;
  return children;
}

function EMSProtectedRoute({ children }) {
  const { tenantId } = useParams();
  const sessionStr = localStorage.getItem('ems_session');
  if (!sessionStr) return <Navigate to={`/e/${tenantId}/login`} replace />;
  try {
    const session = JSON.parse(sessionStr);
    if (session.tenantId !== tenantId) return <Navigate to={`/e/${tenantId}/login`} replace />;
    return children;
  } catch {
    return <Navigate to={`/e/${tenantId}/login`} replace />;
  }
}

function ProtectedRoute({ allowedRoles, children }) {
  const params = useParams();
  const tenantId = params.tenantId || params.gymId || params.restaurantId;
  const location = useLocation();
  const sessionStr = localStorage.getItem('session');
  
  const prefix = tenantId ? 'r' : (gymId ? 'gym' : 't');

  if (!sessionStr) {
    let roleParam = 'admin';
    if (location.pathname.includes('/waiter')) roleParam = 'waiter';
    else if (location.pathname.includes('/counter')) roleParam = 'counter';
    else if (location.pathname.includes('/cashier')) roleParam = 'cashier';

    return <Navigate to={`/${prefix}/${tenantId}/login?role=${roleParam}&redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  try {
    const session = JSON.parse(sessionStr);
    const sid = session.tenantId || session.restaurantId || session.gymId;
    if (sid !== tenantId) {
      return <Navigate to={`/${prefix}/${tenantId}/login`} replace />;
    }
    if (allowedRoles && !allowedRoles.includes(session.role)) {
      return <Navigate to={`/${prefix}/${tenantId}/login`} replace />;
    }
    return children;
  } catch {
    return <Navigate to={`/${prefix}/${tenantId}/login`} replace />;
  }
}

// ─── Main App Component ─────────────────────────────────────

export default function App() {
  const location = useLocation();
  const isMarketingRoute = !location.pathname.startsWith('/r/') &&
                           !location.pathname.startsWith('/gym/') &&
                           !location.pathname.startsWith('/t/') &&
                           !location.pathname.startsWith('/e/') &&
                           !location.pathname.startsWith('/app');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
    );
    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));
    window.scrollTo(0, 0);
    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-amber-500 font-mono text-xs tracking-widest uppercase animate-pulse">
          Initializing Multi-OS Platform...
        </div>
      }>
        <Routes>
          {/* Public Marketing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/career" element={<CareerPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cancellation-refund" element={<RefundPolicyPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Agency Central Management */}
          <Route path="/app/login" element={<AgencyLogin />} />
          <Route path="/app" element={<AgencyProtectedRoute><AgencyDashboard /></AgencyProtectedRoute>} />

          {/* Vertical: Restaurant / Universal Routes */}
          <Route path="/r/:tenantId/login" element={<Login />} />
          <Route path="/r/:tenantId/customer" element={<CustomerDashboard />} />
          <Route path="/r/:tenantId/menu" element={<SelfOrder />} />

          <Route path="/r/:tenantId/waiter" element={<ProtectedRoute allowedRoles={['admin', 'waiter']}><WaiterDashboard /></ProtectedRoute>} />
          <Route path="/r/:tenantId/counter" element={<ProtectedRoute allowedRoles={['admin', 'counter']}><CounterDashboard /></ProtectedRoute>} />
          <Route path="/r/:tenantId/cashier" element={<ProtectedRoute allowedRoles={['admin', 'cashier']}><CashierDashboard /></ProtectedRoute>} />

          <Route path="/r/:tenantId/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/r/:tenantId/admin/tables" element={<ProtectedRoute allowedRoles={['admin']}><TablesManager /></ProtectedRoute>} />
          <Route path="/r/:tenantId/admin/reservations" element={<ProtectedRoute allowedRoles={['admin']}><ReservationsManager /></ProtectedRoute>} />
          <Route path="/r/:tenantId/admin/menu" element={<ProtectedRoute allowedRoles={['admin']}><MenuManager /></ProtectedRoute>} />
          <Route path="/r/:tenantId/admin/inventory" element={<ProtectedRoute allowedRoles={['admin']}><InventoryManager /></ProtectedRoute>} />
          <Route path="/r/:tenantId/admin/staff" element={<ProtectedRoute allowedRoles={['admin']}><StaffManager /></ProtectedRoute>} />
          <Route path="/r/:tenantId/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><Analytics /></ProtectedRoute>} />
          <Route path="/r/:tenantId/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><StaffSettings /></ProtectedRoute>} />

          {/* Vertical: RMS (Retail) */}
          <Route path="/r/:tenantId/rms/pos" element={<ProtectedRoute allowedRoles={['admin', 'cashier']}><RMSPOS /></ProtectedRoute>} />
          <Route path="/r/:tenantId/rms/inventory" element={<ProtectedRoute allowedRoles={['admin']}><RMSInventory /></ProtectedRoute>} />
          <Route path="/r/:tenantId/rms/ai" element={<ProtectedRoute allowedRoles={['admin']}><RMSAI /></ProtectedRoute>} />

          {/* Vertical: HMS (Hospital) */}
          <Route path="/r/:tenantId/hms" element={<ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse']}><HMSDashboard /></ProtectedRoute>} />
          <Route path="/r/:tenantId/hms/patients" element={<ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse']}><Patients /></ProtectedRoute>} />
          <Route path="/r/:tenantId/hms/patients/:patientId" element={<ProtectedRoute allowedRoles={['admin', 'doctor']}><PatientDetails /></ProtectedRoute>} />
          <Route path="/r/:tenantId/hms/appointments" element={<ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist']}><Appointments /></ProtectedRoute>} />
          <Route path="/r/:tenantId/hms/lab" element={<ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse']}><Lab /></ProtectedRoute>} />
          <Route path="/r/:tenantId/hms/pharmacy" element={<ProtectedRoute allowedRoles={['admin', 'pharmacist']}><Pharmacy /></ProtectedRoute>} />
          <Route path="/r/:tenantId/hms/registration" element={<ProtectedRoute allowedRoles={['admin', 'receptionist']}><PatientRegistration /></ProtectedRoute>} />
          <Route path="/r/:tenantId/hms/emr" element={<ProtectedRoute allowedRoles={['admin', 'doctor']}><EMRDashboard /></ProtectedRoute>} />
          <Route path="/r/:tenantId/hms/ai" element={<ProtectedRoute allowedRoles={['admin', 'doctor']}><AIMedicalAssistant /></ProtectedRoute>} />

          {/* Vertical: Spa & Wellness */}
          <Route path="/r/:tenantId/spa" element={<ProtectedRoute allowedRoles={['admin', 'receptionist']}><SpaDashboard /></ProtectedRoute>} />
          <Route path="/r/:tenantId/spa/pos" element={<ProtectedRoute allowedRoles={['admin', 'receptionist', 'cashier']}><SpaPOS /></ProtectedRoute>} />
          <Route path="/r/:tenantId/spa/bookings" element={<ProtectedRoute allowedRoles={['admin', 'receptionist']}><AppointmentBooking /></ProtectedRoute>} />
          <Route path="/r/:tenantId/spa/therapists" element={<ProtectedRoute allowedRoles={['admin']}><TherapistManagement /></ProtectedRoute>} />
          <Route path="/r/:tenantId/spa/crm" element={<ProtectedRoute allowedRoles={['admin', 'receptionist']}><CustomerCRM /></ProtectedRoute>} />
          <Route path="/r/:tenantId/spa/inventory" element={<ProtectedRoute allowedRoles={['admin']}><SpaInventory /></ProtectedRoute>} />
          <Route path="/r/:tenantId/spa/enterprise" element={<ProtectedRoute allowedRoles={['admin']}><EnterprisePortals /></ProtectedRoute>} />
          <Route path="/r/:tenantId/spa/specialized" element={<ProtectedRoute allowedRoles={['admin', 'therapist', 'doctor']}><SpecializedPortals /></ProtectedRoute>} />

          {/* Vertical: PMS (Property) */}
          <Route path="/r/:tenantId/pms" element={<ProtectedRoute allowedRoles={['admin']}><PMSLayout /></ProtectedRoute>}>
            <Route index element={<PMSDashboard />} />
            <Route path="properties" element={<PropertyManager />} />
            <Route path="leases" element={<LeaseManager />} />
            <Route path="billing" element={<BillingManager />} />
            <Route path="maintenance" element={<MaintenanceManager />} />
          </Route>

          {/* Vertical: GMS (Gym) */}
          <Route path="/gym/:gymId/login" element={<Login />} />
          <Route path="/gym/:gymId/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><GmsDashboard /></ProtectedRoute>} />
          <Route path="/gym/:gymId/members" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><GmsMemberManagement /></ProtectedRoute>} />
          <Route path="/gym/:gymId/plans" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><GmsWorkoutDietPlans /></ProtectedRoute>} />
          <Route path="/gym/:gymId/pos" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><GmsPosTerminal /></ProtectedRoute>} />

          {/* Vertical: TMS (Travel) */}
          <Route path="/t/:tenantId/login" element={<TMSLogin />} />
          <Route path="/t/:tenantId" element={<ProtectedRoute allowedRoles={['admin', 'employee']}><TMSDashboard /></ProtectedRoute>} />
          <Route path="/t/:tenantId/request" element={<ProtectedRoute allowedRoles={['admin', 'employee']}><TravelRequestForm /></ProtectedRoute>} />
          <Route path="/t/:tenantId/expenses" element={<ProtectedRoute allowedRoles={['admin', 'employee']}><ExpenseManager /></ProtectedRoute>} />

          {/* Vertical: MES (Manufacturing) */}
          <Route path="/r/:tenantId/mes" element={<ProtectedRoute allowedRoles={['admin']}><ProductionPlanning /></ProtectedRoute>} />
          <Route path="/r/:tenantId/mes/inventory" element={<ProtectedRoute allowedRoles={['admin']}><InventoryWarehouse /></ProtectedRoute>} />
          <Route path="/r/:tenantId/mes/monitoring" element={<ProtectedRoute allowedRoles={['admin']}><MachineMonitoring /></ProtectedRoute>} />
          <Route path="/r/:tenantId/mes/quality" element={<ProtectedRoute allowedRoles={['admin']}><QualityControl /></ProtectedRoute>} />
          <Route path="/r/:tenantId/mes/sales" element={<ProtectedRoute allowedRoles={['admin']}><SalesOrders /></ProtectedRoute>} />
          <Route path="/r/:tenantId/mes/finance" element={<ProtectedRoute allowedRoles={['admin']}><FinanceHR /></ProtectedRoute>} />

          {/* Vertical: WMS (Warehouse) */}
          <Route path="/r/:tenantId/wms" element={<ProtectedRoute allowedRoles={['admin']}><WMOSDashboard /></ProtectedRoute>} />
          <Route path="/r/:tenantId/wms/inventory" element={<ProtectedRoute allowedRoles={['admin']}><WarehouseInventory /></ProtectedRoute>} />
          <Route path="/r/:tenantId/wms/logistics" element={<ProtectedRoute allowedRoles={['admin']}><LogisticsManager /></ProtectedRoute>} />
          <Route path="/r/:tenantId/wms/operations" element={<ProtectedRoute allowedRoles={['admin']}><OperationsManager /></ProtectedRoute>} />

          {/* Vertical: EMS (Standalone Events) */}
          <Route path="/e/:tenantId/login" element={<Login isEMS={true} />} />
          <Route path="/e/:tenantId" element={<EMSProtectedRoute><EMSDashboardShell /></EMSProtectedRoute>}>
            <Route path="dashboard" element={<AdminDashboard isEMS={true} />} />
            <Route path="planner" element={<EventPlanner />} />
            <Route path="ticketing" element={<TicketingSystem />} />
            <Route path="attendees" element={<AttendeeManager />} />
            <Route path="vendors" element={<VendorManager />} />
            <Route path="reports" element={<AccountingReports />} />
            <Route path="crm" element={<MarketingCRM />} />
            <Route path="settings" element={<StaffSettings isEMS={true} />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      {isMarketingRoute && <FloatingWhatsApp />}
    </>
  );
}
