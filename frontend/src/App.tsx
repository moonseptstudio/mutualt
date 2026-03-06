import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import WebLayout from './layouts/WebLayout';
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';

// Web Pages
import HomePage from './pages/web/HomePage';
import AboutPage from './pages/web/AboutPage';
import PricingPage from './pages/web/PricingPage';
import LoginPage from './pages/web/LoginPage';
import RegisterPage from './pages/web/RegisterPage';

// Client Pages
import ClientDashboard from './pages/client/ClientDashboard';
import Preferences from './pages/client/Preferences';
import Matches from './pages/client/Matches';
import Profile from './pages/client/Profile';
import Settings from './pages/client/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import StationManagement from './pages/admin/StationManagement';
import JobCategoryManagement from './pages/admin/JobCategoryManagement';
import SystemCycles from './pages/admin/SystemCycles';

import AdminLoginPage from './pages/web/AdminLoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Website Routes */}
        <Route element={<WebLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Admin Login Route without WebLayout */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Client/User Dashboard Routes */}
        <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
          <Route element={<ClientLayout />}>
            <Route path="/dashboard" element={<ClientDashboard />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/categories" element={<JobCategoryManagement />} />
            <Route path="/admin/stations" element={<StationManagement />} />
            <Route path="/admin/cycles" element={<SystemCycles />} />
          </Route>
        </Route>

        {/* Redirects */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
