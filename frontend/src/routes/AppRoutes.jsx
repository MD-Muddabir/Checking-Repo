/**
 * Application Routes
 * Defines all routes with role-based access control
 * Implements lazy loading for performance optimization
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./ProtectedRoute";
import LoadingSpinner from "../components/common/LoadingSpinner";

// Lazy load pages for code splitting
// Public Pages
const Home = lazy(() => import("../pages/public/Home"));
const Pricing = lazy(() => import("../pages/public/PricingPage")); // Updated to PricingPage
const Contact = lazy(() => import("../pages/public/ContactPage")); // Added Contact
const PaymentAndCheckout = lazy(() => import("../pages/public/PaymentPage")); // Added Payment

// Auth Pages
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/public/RegisterPage")); // Use Public Register Page
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));

// Super Admin Pages
const SuperAdminDashboard = lazy(() => import("../pages/superadmin/Dashboard"));
const Institutes = lazy(() => import("../pages/superadmin/Institutes"));
const Plans = lazy(() => import("../pages/superadmin/Plans"));
const Subscriptions = lazy(() => import("../pages/superadmin/Subscriptions"));
const Analytics = lazy(() => import("../pages/superadmin/Analytics"));
const Revenue = lazy(() => import("../pages/superadmin/Revenue"));
const SuperAdminSettings = lazy(() => import("../pages/superadmin/Settings"));

// Admin Pages
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard"));
const Students = lazy(() => import("../pages/admin/Students"));
const Faculty = lazy(() => import("../pages/admin/Faculty"));
const Classes = lazy(() => import("../pages/admin/Classes"));
const Subjects = lazy(() => import("../pages/admin/Subjects"));
const Attendance = lazy(() => import("../pages/admin/Attendance"));
const Reports = lazy(() => import("../pages/admin/Reports"));
const Fees = lazy(() => import("../pages/admin/Fees"));
const Announcements = lazy(() => import("../pages/admin/Announcements"));
const Settings = lazy(() => import("../pages/admin/Settings"));
const Profile = lazy(() => import("../pages/admin/Profile"));

// Faculty Pages
const FacultyDashboard = lazy(() => import("../pages/faculty/Dashboard"));
const MarkAttendance = lazy(() => import("../pages/faculty/MarkAttendance"));
const EnterMarks = lazy(() => import("../pages/faculty/EnterMarks"));
const ViewStudents = lazy(() => import("../pages/faculty/ViewStudents"));

// Student Pages
const StudentDashboard = lazy(() => import("../pages/student/Dashboard"));
const ViewAttendance = lazy(() => import("../pages/student/ViewAttendance"));
const ViewMarks = lazy(() => import("../pages/student/ViewMarks"));
const ViewAnnouncements = lazy(() => import("../pages/student/ViewAnnouncements"));

// Common Pages
const NotFound = lazy(() => import("../pages/common/NotFound"));
const Unauthorized = lazy(() => import("../pages/common/Unauthorized"));

/**
 * Loading fallback component
 */
const PageLoader = () => (
  <div className="page-loader">
    <LoadingSpinner />
  </div>
);

/**
 * Main routing configuration
 */
function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/renew-plan" element={<Pricing />} /> {/* Renewal Flow */}
        <Route path="/checkout" element={<PaymentAndCheckout />} /> {/* Payment Flow */}
        <Route path="/features" element={<Home />} />
        <Route path="/about" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Super Admin Routes */}
        <Route
          path="/superadmin/*"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <Routes>
                <Route path="dashboard" element={<SuperAdminDashboard />} />
                <Route path="institutes" element={<Institutes />} />
                <Route path="plans" element={<Plans />} />
                <Route path="subscriptions" element={<Subscriptions />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="revenue" element={<Revenue />} />
                <Route path="settings" element={<SuperAdminSettings />} />
                <Route path="*" element={<Navigate to="/superadmin/dashboard" />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="students" element={<Students />} />
                <Route path="faculty" element={<Faculty />} />
                <Route path="classes" element={<Classes />} />
                <Route path="subjects" element={<Subjects />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="reports" element={<Reports />} />
                <Route path="fees" element={<Fees />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* Faculty Routes */}
        <Route
          path="/faculty/*"
          element={
            <ProtectedRoute allowedRoles={["faculty"]}>
              <Routes>
                <Route path="dashboard" element={<FacultyDashboard />} />
                <Route path="attendance" element={<MarkAttendance />} />
                <Route path="marks" element={<EnterMarks />} />
                <Route path="students" element={<ViewStudents />} />
                <Route path="profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/faculty/dashboard" />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="attendance" element={<ViewAttendance />} />
                <Route path="marks" element={<ViewMarks />} />
                <Route path="announcements" element={<ViewAnnouncements />} />
                <Route path="profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/student/dashboard" />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* Default Route - Redirect based on role */}


        {/* Error Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
