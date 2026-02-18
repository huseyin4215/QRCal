import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import FacultyAppointment from './pages/FacultyAppointment';
import FacultyList from './pages/FacultyList';
import AdminDashboard from './pages/AdminDashboard';
import AppointmentHistory from './pages/AppointmentHistory';
import QrCodePage from './pages/QrCodePage';
import Debug from './pages/Debug';
import GoogleAuthCallback from './pages/GoogleAuthCallback';
import GoogleConnect from './pages/GoogleConnect';
import GoogleRegister from './pages/GoogleRegister';
import Help from './pages/Help';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import CookiePolicy from './pages/CookiePolicy';
import Footer from './components/Footer/Footer';
import './styles/globals.css';

function AppContent() {
  const { redirectTo, setRedirectTo, user } = useAuth();

  // Handle redirect
  useEffect(() => {
    if (redirectTo) {
      setRedirectTo(null); // Clear redirect
    }
  }, [redirectTo, setRedirectTo]);

  const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    // Show loading while checking authentication
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      );
    }
    
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    // Show loading while checking authentication
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      );
    }
    
    // Check if user exists and has admin role
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    if (user.role !== 'admin') {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  const FacultyRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user || (user.role !== 'faculty' && user.role !== 'admin')) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  const StudentRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // Show loading while checking authentication
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      );
    }

    // Only students can access
    if (!user || user.role !== 'student') {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  const StudentOnlyRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    // Show loading while checking authentication
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      );
    }
    
    // Only students can access
    if (!user || user.role !== 'student') {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  const PublicRoute = ({ children }) => {
    const { user } = useAuth();
    
    if (user) {
      // Redirect based on user role
      if (user.role === 'admin') {
        return <Navigate to="/admin-dashboard" replace />;
      } else if (user.role === 'faculty') {
        return <Navigate to="/faculty-dashboard" replace />;
      } else if (user.role === 'student') {
        return <Navigate to="/student-dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
    return children;
  };

  const ChangePasswordRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ChangePasswordRoute>
                <ChangePassword />
              </ChangePasswordRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-dashboard"
            element={
              <StudentRoute>
                <StudentDashboard />
              </StudentRoute>
            }
          />
          <Route
            path="/faculty-dashboard"
            element={
              <FacultyRoute>
                <FacultyDashboard />
              </FacultyRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/qr-code"
            element={
              <ProtectedRoute>
                <QrCodePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty-list"
            element={<FacultyList />}
          />
          <Route
            path="/appointment/:slug"
            element={
              <StudentRoute>
                <FacultyAppointment />
              </StudentRoute>
            }
          />
          <Route
            path="/appointment-history/:userId"
            element={
              <ProtectedRoute>
                <AppointmentHistory />
              </ProtectedRoute>
            }
          />
          {import.meta.env.DEV && (
            <Route
              path="/debug"
              element={<Debug />}
            />
          )}
          <Route
            path="/auth-success"
            element={<GoogleAuthCallback />}
          />
          <Route
            path="/auth-error"
            element={<GoogleAuthCallback />}
          />
          <Route
            path="/auth/google/callback"
            element={<GoogleAuthCallback />}
          />
          <Route
            path="/google-auth-callback"
            element={<GoogleAuthCallback />}
          />
          <Route
            path="/google-connect"
            element={
              <ProtectedRoute>
                <GoogleConnect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/google-register"
            element={
              <PublicRoute>
                <GoogleRegister />
              </PublicRoute>
            }
          />
          <Route
            path="/help"
            element={<Help />}
          />
          <Route
            path="/privacy"
            element={<PrivacyPolicy />}
          />
          <Route
            path="/terms"
            element={<TermsOfUse />}
          />
          <Route
            path="/cookies"
            element={<CookiePolicy />}
          />
          <Route
            path="/"
            element={
              redirectTo ? (
                <Navigate to={redirectTo} replace />
              ) : user ? (
                // If user is logged in, redirect to appropriate dashboard
                (() => {
                  switch (user.role) {
                    case 'admin':
                      return <Navigate to="/admin-dashboard" replace />;
                    case 'faculty':
                      return <Navigate to="/faculty-dashboard" replace />;
                    case 'student':
                      return <Navigate to="/student-dashboard" replace />;
                    default:
                      return <Navigate to="/dashboard" replace />;
                  }
                })()
              ) : (
                // If no user, redirect to login
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
      {/* Show Footer on all pages */}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
