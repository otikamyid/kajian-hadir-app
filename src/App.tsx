
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/AuthForm";
import { Navbar } from "@/components/Navbar";
import LandingPage from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import ParticipantDashboard from "./pages/ParticipantDashboard";
import Sessions from "./pages/Sessions";
import ScanQR from "./pages/ScanQR";
import Participants from "./pages/Participants";
import ProfileEdit from "./pages/ProfileEdit";
import AdminAuth from "./pages/AdminAuth";
import AdminRegister from "./pages/AdminRegister";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Helper function to determine the correct dashboard route
  const getDashboardRoute = () => {
    if (profile?.role === 'admin') {
      return '/admin/dashboard';
    }
    return '/participant/dashboard';
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={user ? <Navigate to={getDashboardRoute()} replace /> : <AuthForm />} />
      <Route path="/admin/auth" element={user ? <Navigate to={getDashboardRoute()} replace /> : <AdminAuth />} />
      <Route path="/admin/register" element={user ? <Navigate to={getDashboardRoute()} replace /> : <AdminRegister />} />
      
      {/* Protected routes */}
      {user ? (
        <>
          {/* Admin Dashboard */}
          <Route path="/admin/dashboard" element={
            profile?.role === 'admin' ? (
              <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <AdminDashboard />
                </main>
              </div>
            ) : (
              <Navigate to="/participant/dashboard" replace />
            )
          } />
          
          {/* Participant Dashboard */}
          <Route path="/participant/dashboard" element={
            profile?.role === 'participant' ? (
              <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <ParticipantDashboard />
                </main>
              </div>
            ) : (
              <Navigate to="/admin/dashboard" replace />
            )
          } />
          
          {/* Legacy dashboard route - redirect to appropriate dashboard */}
          <Route path="/dashboard" element={<Navigate to={getDashboardRoute()} replace />} />
          
          <Route path="/sessions" element={
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Sessions />
              </main>
            </div>
          } />
          <Route path="/scan" element={
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ScanQR />
              </main>
            </div>
          } />
          <Route path="/participants" element={
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Participants />
              </main>
            </div>
          } />
          <Route path="/profile/edit" element={
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ProfileEdit />
              </main>
            </div>
          } />
        </>
      ) : (
        /* Redirect to auth if not logged in and trying to access protected routes */
        <>
          <Route path="/admin/dashboard" element={<Navigate to="/auth" replace />} />
          <Route path="/participant/dashboard" element={<Navigate to="/auth" replace />} />
          <Route path="/dashboard" element={<Navigate to="/auth" replace />} />
          <Route path="/sessions" element={<Navigate to="/auth" replace />} />
          <Route path="/scan" element={<Navigate to="/auth" replace />} />
          <Route path="/participants" element={<Navigate to="/auth" replace />} />
          <Route path="/profile/edit" element={<Navigate to="/auth" replace />} />
        </>
      )}
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
