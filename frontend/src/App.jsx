import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/client/Dashboard';
import PropertyDetail from './pages/client/PropertyDetail';
import Profile from './pages/client/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminLogin from './pages/admin/AdminLogin';
import ClientList from './pages/admin/ClientList';
import ClientDetail from './pages/admin/ClientDetail';
import AdminPropertyDetail from './pages/admin/AdminPropertyDetail';
import Responses from './pages/admin/Responses';
import BuyerBriefs from './pages/admin/BuyerBriefs';

function App() {
  return (
    <ToastProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/client/login" replace />} />
        <Route path="/client/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Client Routes */}
        <Route 
          path="/client/dashboard" 
          element={
            <ProtectedRoute role="CLIENT">
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/client/property/:id" 
          element={
            <ProtectedRoute role="CLIENT">
              <PropertyDetail />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/client/profile" 
          element={
            <ProtectedRoute role="CLIENT">
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={<Navigate to="/admin/clients" replace />}
        />

        <Route 
          path="/admin/clients" 
          element={
            <ProtectedRoute role="ADMIN">
              <ClientList />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/client/:id" 
          element={
            <ProtectedRoute role="ADMIN">
              <ClientDetail />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/admin/client/:clientId/property/:propertyId"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminPropertyDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/buyers"
          element={
            <ProtectedRoute role="ADMIN">
              <BuyerBriefs />
            </ProtectedRoute>
          } 
        />

        <Route path="/admin/buyer-briefs" element={<Navigate to="/admin/buyers" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/client/login" replace />} />
      </Routes>
    </Router>
    </ToastProvider>
  );
}

export default App;
