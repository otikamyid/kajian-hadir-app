
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import LandingPage from '@/pages/LandingPage';
import Auth from '@/pages/Auth';
import AdminAuth from '@/pages/AdminAuth';
import AdminRegister from '@/pages/AdminRegister';
import AdminDashboard from '@/pages/AdminDashboard';
import Sessions from '@/pages/Sessions';
import Participants from '@/pages/Participants';
import ScanQR from '@/pages/ScanQR';
import AttendanceHistory from '@/pages/AttendanceHistory';
import ProfileEdit from '@/pages/ProfileEdit';
import ParticipantDashboard from '@/pages/ParticipantDashboard';
import NotFound from '@/pages/NotFound';
import { Navbar } from '@/components/Navbar';
import AdminSettings from '@/pages/AdminSettings';
import ParticipantCheckIn from '@/pages/ParticipantCheckIn';

interface Props {
  children: React.ReactNode;
}

function Layout({ children }: Props) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requireRole="admin">
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute requireRole="admin">
              <Layout>
                <AdminSettings />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Protected Participant Routes */}
          <Route path="/participant/dashboard" element={
            <ProtectedRoute requireRole="participant">
              <Layout>
                <ParticipantDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/participant/checkin" element={
            <ProtectedRoute requireRole="participant">
              <Layout>
                <ParticipantCheckIn />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Shared Protected Routes */}
          <Route path="/sessions" element={
            <ProtectedRoute>
              <Layout>
                <Sessions />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/participants" element={
            <ProtectedRoute requireRole="admin">
              <Layout>
                <Participants />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/scan" element={
            <ProtectedRoute>
              <Layout>
                <ScanQR />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/attendance" element={
            <ProtectedRoute>
              <Layout>
                <AttendanceHistory />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile/edit" element={
            <ProtectedRoute>
              <Layout>
                <ProfileEdit />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
