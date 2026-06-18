import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';

const AgencyDashboard = lazy(() => import('./pages/AgencyDashboard'));
const AgencyLogin = lazy(() => import('./pages/AgencyLogin'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const Login = lazy(() => import('./pages/Login'));
const LandingPage = lazy(() => import('./pages/marketing/LandingPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const TablesManager = lazy(() => import('./pages/admin/TablesManager'));
const ReservationsManager = lazy(() => import('./pages/admin/ReservationsManager'));
const OutletsDeliveryManager = lazy(() => import('./pages/admin/OutletsDeliveryManager'));
const VenueReservationsManager = lazy(() => import('./pages/admin/VenueReservationsManager'));
const MenuManager = lazy(() => import('./pages/admin/MenuManager'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const StaffSettings = lazy(() => import('./pages/admin/StaffSettings'));
const StaffManager = lazy(() => import('./pages/admin/StaffManager'));
const CustomerDirectory = lazy(() => import('./pages/admin/CustomerDirectory'));
const CouponsManager = lazy(() => import('./pages/admin/CouponsManager'));
const MoneyManager = lazy(() => import('./pages/admin/MoneyManager'));
const ExpensesManager = lazy(() => import('./pages/admin/ExpensesManager'));
const InventoryManager = lazy(() => import('./pages/admin/InventoryManager'));
const RMSPOS = lazy(() => import('./pages/rms/POS'));
const RMSInventory = lazy(() => import('./pages/rms/Inventory'));
const RMSAI = lazy(() => import('./pages/rms/AIAnalytics'));
const QRPrintPage = lazy(() => import('./components/QR/QRPrintPage'));
const StaffMobileApps = lazy(() => import('./pages/admin/StaffMobileApps'));
const WaiterDashboard = lazy(() => import('./pages/waiter/WaiterDashboard'));
const CounterDashboard = lazy(() => import('./pages/counter/CounterDashboard'));
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'));
const SelfOrder = lazy(() => import('./pages/customer/SelfOrder'));
const CashierDashboard = lazy(() => import('./pages/cashier/CashierDashboard'));
const PWAInstallLanding = lazy(() => import('./components/PWAInstallLanding'));

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

import './pages/marketing/marketing.css';

// Shared Components
import FloatingWhatsApp from './components/shared/FloatingWhatsApp';

// Agency auth route guard
function AgencyProtectedRoute({ children }) {
  const token = localStorage.getItem('agency_token');
  if (!token) {
    return <Navigate to="/app/login" replace />;
  }
  return children;
}

// Route Guard for staff / admin roles
function ProtectedRoute({ allowedRoles, children }) {
  const { restaurantId } = useParams();
  const location = useLocation();
  const sessionStr = localStorage.getItem('session');
  
  if (!sessionStr) {
    let roleParam = 'waiter';
    if (location.pathname.endsWith('/waiter')) roleParam = 'waiter';
    else if (location.pathname.endsWith('/counter')) roleParam = 'counter';
    else if (location.pathname.endsWith('/cashier')) roleParam = 'cashier';
    else if (location.pathname.includes('/admin')) roleParam = 'admin';
    return <Navigate to={`/r/${restaurantId}/login?role=${roleParam}&redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  try {
    const session = JSON.parse(sessionStr);
    
    // Check if session belongs to this restaurant
    if (session.restaurantId !== restaurantId) {
      return <Navigate to={`/r/${restaurantId}/login`} replace />;
    }

    // Check if role is allowed
    if (!allowedRoles.includes(session.role)) {
      // If customer role mismatch, go to customer page, else go to login
      if (session.role === 'customer') {
        return <Navigate to={`/r/${restaurantId}/customer`} replace />;
      }
      return <Navigate to={`/r/${restaurantId}/login`} replace />;
    }

    return children;
  } catch {
    return <Navigate to={`/r/${restaurantId}/login`} replace />;
  }
}

export default function App() {
  const location = useLocation();
  const isMarketingRoute = !location.pathname.startsWith('/r/') && !location.pathname.startsWith('/app');

  // Trigger Intersection Observer for element scroll reveal animations on all subpages
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

    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.reveal');
      elements.forEach((el) => observer.observe(el));
    }, 400);

    // Scroll window back to top on page navigation
    window.scrollTo(0, 0);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [location.pathname]);

  return (
    <>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-slate-50 text-indigo-650 font-display font-semibold text-xs tracking-wider uppercase animate-pulse">
          Loading Bhoj360...
        </div>
      }>
        <Routes>
          {/* SaaS Marketing Portal */}
          <Route path="/" element={<LandingPage />} />

          {/* Marketing Sub-pages */}
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

          {/* Public Contact Form */}
          <Route path="/contact" element={<ContactPage />} />

          {/* Agency Auth */}
          <Route path="/app/login" element={<AgencyLogin />} />

          {/* Agency Dashboard (protected) */}
          <Route
            path="/app"
            element={
              <AgencyProtectedRoute>
                <AgencyDashboard />
              </AgencyProtectedRoute>
            }
          />


        {/* Auth Route */}
        <Route path="/r/:restaurantId/login" element={<Login />} />

        {/* Admin Dashboard Protected Routes */}
        <Route
          path="/r/:restaurantId/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/r/:restaurantId/admin/tables"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TablesManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/r/:restaurantId/admin/reservations"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ReservationsManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/r/:restaurantId/admin/outlets"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <OutletsDeliveryManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/r/:restaurantId/admin/venues"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <VenueReservationsManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/r/:restaurantId/admin/menu"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MenuManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/r/:restaurantId/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/r/:restaurantId/admin/print-qr"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <QRPrintPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/r/:restaurantId/admin/staff-apps"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StaffMobileApps />
            </ProtectedRoute>
          }
        />
        <Route
          path="/r/:restaurantId/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StaffSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/r/:restaurantId/admin/staff"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StaffManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/r/:restaurantId/admin/customers"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CustomerDirectory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/r/:restaurantId/admin/coupons"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CouponsManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/r/:restaurantId/admin/money"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MoneyManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/r/:restaurantId/admin/expenses"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ExpensesManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/r/:restaurantId/admin/inventory"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <InventoryManager />
            </ProtectedRoute>
          }
        />

        {/* RMS Specific Routes */}
        <Route
          path="/r/:restaurantId/rms/pos"
          element={
            <ProtectedRoute allowedRoles={['admin', 'cashier', 'waiter']}>
              <RMSPOS />
            </ProtectedRoute>
          }
        />
        <Route
          path="/r/:restaurantId/rms/inventory"
          element={
            <ProtectedRoute allowedRoles={['admin', 'counter']}>
              <RMSInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/r/:restaurantId/rms/ai"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RMSAI />
            </ProtectedRoute>
          }
        />

        {/* Waiter Dashboard Protected Route */}
        <Route
          path="/r/:restaurantId/waiter"
          element={
            <ProtectedRoute allowedRoles={['admin', 'waiter']}>
              <WaiterDashboard />
            </ProtectedRoute>
          }
        />

        {/* Counter/Kitchen Dashboard Protected Route */}
        <Route
          path="/r/:restaurantId/counter"
          element={
            <ProtectedRoute allowedRoles={['admin', 'counter']}>
              <CounterDashboard />
            </ProtectedRoute>
          }
        />

        {/* Cashier Dashboard Protected Route */}
        <Route
          path="/r/:restaurantId/cashier"
          element={
            <ProtectedRoute allowedRoles={['admin', 'cashier']}>
              <CashierDashboard />
            </ProtectedRoute>
          }
        />

        {/* Customer Dashboard Seating Guard Route */}
        <Route
          path="/r/:restaurantId/customer"
          element={<CustomerDashboard />}
        />

        {/* Self-Ordering Public Landing QR Page */}
        <Route path="/r/:restaurantId/menu" element={<SelfOrder />} />

        {/* Catch-all Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
    {isMarketingRoute && <FloatingWhatsApp />}
    </>
  );
}
