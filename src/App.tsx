
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { usePagePerformance, useMemoryMonitoring } from "@/hooks/usePerformance";
import { logger } from "@/utils/logger";
import React, { useEffect } from 'react';

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const AdminAuth = lazy(() => import("./pages/AdminAuth"));
const AdminRegister = lazy(() => import("./pages/AdminRegister"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const ParticipantDashboard = lazy(() => import("./pages/ParticipantDashboard"));
const Sessions = lazy(() => import("./pages/Sessions"));
const Participants = lazy(() => import("./pages/Participants"));
const ScanQR = lazy(() => import("./pages/ScanQR"));
const ParticipantCheckIn = lazy(() => import("./pages/ParticipantCheckIn"));
const AttendanceHistory = lazy(() => import("./pages/AttendanceHistory"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Create a stable query client instance with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2; // Reduced from 3 to 2
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000), // Reduced max delay
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
    },
  },
});

// App performance monitoring component
const AppPerformanceMonitor = React.memo(() => {
  usePagePerformance('App');
  useMemoryMonitoring(60000); // Check memory every minute
  return null;
});

// Loading fallback component with better UX
const PageLoadingFallback = React.memo(() => {
  return <LoadingSpinner size="lg" text="Loading page..." fullScreen />;
});

// Memoized route components to prevent unnecessary re-renders
const MemoizedProtectedRoute = React.memo(ProtectedRoute);

function App() {
  // Log app initialization
  useEffect(() => {
    logger.info('Application starting', {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  }, []);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        logger.error('Top-level application error', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack
        });
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppPerformanceMonitor />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin/auth" element={<AdminAuth />} />
                <Route path="/admin/register" element={<AdminRegister />} />
                <Route path="/participant/checkin/:sessionId" element={<ParticipantCheckIn />} />

                {/* Protected admin routes */}
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <MemoizedProtectedRoute requireRole="admin">
                      <AdminDashboard />
                    </MemoizedProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/sessions" 
                  element={
                    <MemoizedProtectedRoute requireRole="admin">
                      <Sessions />
                    </MemoizedProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/participants" 
                  element={
                    <MemoizedProtectedRoute requireRole="admin">
                      <Participants />
                    </MemoizedProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/attendance" 
                  element={
                    <MemoizedProtectedRoute requireRole="admin">
                      <AttendanceHistory />
                    </MemoizedProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/settings" 
                  element={
                    <MemoizedProtectedRoute requireRole="admin">
                      <AdminSettings />
                    </MemoizedProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/scan" 
                  element={
                    <MemoizedProtectedRoute requireRole="admin">
                      <ScanQR />
                    </MemoizedProtectedRoute>
                  } 
                />

                {/* Protected participant routes */}
                <Route 
                  path="/participant/dashboard" 
                  element={
                    <MemoizedProtectedRoute requireRole="participant">
                      <ParticipantDashboard />
                    </MemoizedProtectedRoute>
                  } 
                />
                <Route 
                  path="/participant/profile" 
                  element={
                    <MemoizedProtectedRoute requireRole="participant">
                      <ProfileEdit />
                    </MemoizedProtectedRoute>
                  } 
                />

                {/* Catch-all route */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default React.memo(App);
