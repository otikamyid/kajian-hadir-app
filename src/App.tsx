import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
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
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin/auth" element={<AdminAuth />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        
        {/* Protected routes */}
        <Route path="/admin/dashboard" element={
          <Layout>
            <AdminDashboard />
          </Layout>
        } />
        <Route path="/admin/settings" element={
          <Layout>
            <AdminSettings />
          </Layout>
        } />
        <Route path="/participant/dashboard" element={
          <Layout>
            <ParticipantDashboard />
          </Layout>
        } />
        <Route path="/participant/checkin" element={
          <Layout>
            <ParticipantCheckIn />
          </Layout>
        } />
        <Route path="/sessions" element={
          <Layout>
            <Sessions />
          </Layout>
        } />
        <Route path="/participants" element={
          <Layout>
            <Participants />
          </Layout>
        } />
        <Route path="/scan" element={
          <Layout>
            <ScanQR />
          </Layout>
        } />
        <Route path="/attendance" element={
          <Layout>
            <AttendanceHistory />
          </Layout>
        } />
        <Route path="/profile/edit" element={
          <Layout>
            <ProfileEdit />
          </Layout>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
