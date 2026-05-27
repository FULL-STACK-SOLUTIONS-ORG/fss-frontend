import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminProtectedRoute from "./components/admin/ProtectedRoute";
import AuthProtectedRoute from "./components/auth/ProtectedRoute";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import LoadingSpinner from "./components/common/LoadingSpinner";
const Home = React.lazy(() => import("./pages/Home"));
const Roadmap = React.lazy(() => import("./pages/Roadmap"));
const LearningTracker = React.lazy(() => import("./pages/LearningTracker"));
const Mentorship = React.lazy(() => import("./pages/Mentorship"));
const Signup = React.lazy(() => import("./pages/Signup"));
const Login = React.lazy(() => import("./pages/Login"));
const VerifyOTP = React.lazy(() => import("./pages/VerifyOTP"));
const AdminLogin = React.lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const StudentDashboard = React.lazy(() => import("./pages/StudentDashboard"));
const Development = React.lazy(() => import("./pages/Development"));
const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
        {}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        {}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } 
        />
        {}
        <Route path="/" element={
          <>
            <Navbar />
            <Home />
            <Footer />
          </>
        } />
        <Route path="/roadmap" element={
          <>
            <Navbar />
            <Roadmap />
          </>
        } />
        <Route path="/mentorship" element={
          <>
            <Navbar />
            <Mentorship />
          </>
        } />
        {}
        <Route path="/tick2test" element={
          <>
            <Navbar />
            <LearningTracker />
          </>
        } />
        <Route path="/development" element={
          <>
            <Navbar />
            <Development />
            <Footer />
          </>
        } />
        <Route path="/dashboard" element={
          <>
            <Navbar />
            <StudentDashboard />
          </>
        } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
export default App;
