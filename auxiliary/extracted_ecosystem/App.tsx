// App.tsx - Main Application Entry Point
// Nexus-HUB57 MMN AI-to-AI Platform

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import pages
import Home from './pages/Home';
import Orquestrador from './pages/Orquestrador';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import Governance from './pages/Governance';
import Marketplace from './pages/Marketplace';
import Moltbook from './pages/Moltbook';
import Terminal from './pages/Terminal';

// Import components
import ProtectedRoute from './ProtectedRoute';

// Import styles
import './index.css';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Mock authentication - in production, use proper auth provider
const useAuth = () => {
  const [user, setUser] = React.useState<{ id: string; name: string; role: 'user' | 'admin' } | null>(null);

  const login = (role: 'user' | 'admin') => {
    setUser({ id: '1', name: 'User', role });
  };

  const logout = () => {
    setUser(null);
  };

  return { user, login, logout };
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Home />} />

          {/* Protected Routes - User */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Admin */}
          <Route
            path="/agents"
            element={
              <ProtectedRoute requiredRole="admin">
                <Agents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/governance"
            element={
              <ProtectedRoute requiredRole="admin">
                <Governance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute requiredRole="user">
                <Marketplace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/moltbook"
            element={
              <ProtectedRoute requiredRole="user">
                <Moltbook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/terminal"
            element={
              <ProtectedRoute requiredRole="admin">
                <Terminal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orquestrador"
            element={
              <ProtectedRoute requiredRole="admin">
                <Orquestrador />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;