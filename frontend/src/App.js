import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Admin
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminCompanies from './pages/admin/Companies';
import AdminJobs from './pages/admin/Jobs';
import AdminDrives from './pages/admin/Drives';
import AdminApplications from './pages/admin/Applications';
import AdminStudents from './pages/admin/Students';
import AdminMaterials from './pages/admin/Materials';
import AdminAnalytics from './pages/admin/Analytics';
import AdminChat from './pages/admin/Chat';
import AdminTests from './pages/admin/Tests';
import AdminAuditLogs from './pages/admin/AuditLogs';
import AdminReports from './pages/admin/Reports';
import AdminExperiences from './pages/admin/Experiences';
import AdminBulkImport from './pages/admin/BulkImport';

// Student
import StudentLayout from './components/student/StudentLayout';
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentDrives from './pages/student/Drives';
import StudentCompanies from './pages/student/Companies';
import StudentApplications from './pages/student/Applications';
import StudentMaterials from './pages/student/Materials';
import DriveDetail from './pages/student/DriveDetail';
import StudentAnalytics from './pages/student/Analytics';
import StudentCalendar from './pages/student/Calendar';
import StudentExperiences from './pages/student/Experiences';
import StudentTests from './pages/student/Tests';
import StudentMockTests from './pages/student/MockTests';
import StudentOfferLetter from './pages/student/OfferLetter';
import StudentResumeBuilder from './pages/student/ResumeBuilder';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/student'} /> : <Navigate to="/login" />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/student'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/student" /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="companies" element={<AdminCompanies />} />
        <Route path="jobs" element={<AdminJobs />} />
        <Route path="drives" element={<AdminDrives />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="materials" element={<AdminMaterials />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="chat" element={<AdminChat />} />
        <Route path="tests" element={<AdminTests />} />
        <Route path="auditlogs" element={<AdminAuditLogs />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="experiences" element={<AdminExperiences />} />
        <Route path="bulk-import" element={<AdminBulkImport />} />
      </Route>

      <Route path="/student" element={<ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="drives" element={<StudentDrives />} />
        <Route path="drives/:id" element={<DriveDetail />} />
        <Route path="companies" element={<StudentCompanies />} />
        <Route path="applications" element={<StudentApplications />} />
        <Route path="materials" element={<StudentMaterials />} />
        <Route path="analytics" element={<StudentAnalytics />} />
        <Route path="calendar" element={<StudentCalendar />} />
        <Route path="experiences" element={<StudentExperiences />} />
        <Route path="tests" element={<StudentTests />} />
        <Route path="mock-tests" element={<StudentMockTests />} />
        <Route path="offer-letter" element={<StudentOfferLetter />} />
        <Route path="resume-builder" element={<StudentResumeBuilder />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/student') : '/login'} />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1e2230', color: '#e8eaf2', border: '1px solid #2a2f42', fontSize: '0.875rem' },
        }} />
      </BrowserRouter>
    </AuthProvider>
  );
}