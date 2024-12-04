import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminOrders from './pages/Admin/AdminOrders';
import MenuManagement from './pages/Admin/MenuManagement';
import SalesReport from './pages/Admin/SalesReport';
import CategoryManagement from './pages/Admin/CategoryManagement';
import { AuthProvider,AuthContext } from './context/AuthContext';
import AdminSignUp from './pages/Admin/AdminSignUp';


const App: React.FC = () => {
  
  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext) || {};
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />;
};


  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminOrders />
            </ProtectedRoute>
          } />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignUp />} />
          <Route path="/admin/menu" element={
            <ProtectedRoute>
              <MenuManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/sales" element={
            <ProtectedRoute>
              <SalesReport />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute>
              <CategoryManagement />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
