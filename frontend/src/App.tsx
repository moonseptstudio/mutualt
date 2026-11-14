import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layouts
import WebLayout from './layouts/WebLayout';
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';

// Web Pages
import HomePage from './pages/web/HomePage';
import AboutPage from './pages/web/AboutPage';
import PricingPage from './pages/web/PricingPage';
import ContactPage from './pages/web/ContactPage';
import LoginPage from './pages/web/LoginPage';
import RegisterPage from './pages/web/RegisterPage';
import ForgotPasswordPage from './pages/web/ForgotPasswordPage';
import NotFoundPage from './pages/web/NotFoundPage';

// Client Pages
import ClientDashboard from './pages/client/ClientDashboard';
import Preferences from './pages/client/Preferences';
import Matches from './pages/client/Matches';
import Profile from './pages/client/Profile';
import Settings from './pages/client/Settings';
import Requests from './pages/client/Requests';
import Messages from './pages/client/Messages';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import StationManagement from './pages/admin/StationManagement';
import JobCategoryManagement from './pages/admin/JobCategoryManagement';
import FieldManagement from './pages/admin/FieldManagement';

import AdminLoginPage from './pages/web/AdminLoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

/**
 * Keeps the stored user (package, name, avatar...) in sync with the server.
 * Runs once after login / page load and when the tab regains focus - NOT on
 * every route change, which used to delay every page switch.
 */
const SessionSync = () => {
  const { refreshSession, isAuthenticated } = useAuth();
  const lastSyncRef = useRef(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    const sync = () => {
      const now = Date.now();
      if (now - lastSyncRef.current < 30_000) return;
      lastSyncRef.current = now;
      refreshSession();
    };

    sync();
    window.addEventListener('focus', sync);
    return () => window.removeEventListener('focus', sync);
  }, [isAuthenticated]);

  return null;
};

function App() {
  return (
    <Router>
      <SessionSync />
      <Toaster position="top-right" />
      <Routes>
        {/* Truly Public Routes (Accessible to everyone) */}
        <Route element={<WebLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Guest-Only Routes (Redirect to dashboard if logged in) */}
        <Route element={<PublicRoute />}>
          <Route element={<WebLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
          {/* Admin Login Route without WebLayout */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
        </Route>

        {/* Client/User Dashboard Routes */}
        <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
          <Route element={<ClientLayout />}>
            <Route path="/dashboard" element={<ClientDashboard />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/messages" element={<Messages />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/fields" element={<FieldManagement />} />
            <Route path="/admin/categories" element={<JobCategoryManagement />} />
            <Route path="/admin/stations" element={<StationManagement />} />
          </Route>
        </Route>

        {/* 404 - a real not-found page inside the public layout. Do NOT redirect
            unknown URLs to "/": that returns HTTP 200 with homepage content and
            search engines treat it as a soft 404, so broken and outdated links
            end up competing with the real homepage. */}
        <Route element={<WebLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
