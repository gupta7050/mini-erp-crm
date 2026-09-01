import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Layout/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { CustomerDetail } from './pages/CustomerDetail';
import { Products } from './pages/Products';
import { StockMovements } from './pages/StockMovements';
import { Challans } from './pages/Challans';
import { CreateChallan } from './pages/CreateChallan';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-semibold">
        Restoring Apex ERP Session...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/customers" element={<ProtectedLayout><Customers /></ProtectedLayout>} />
          <Route path="/customers/:id" element={<ProtectedLayout><CustomerDetail /></ProtectedLayout>} />
          <Route path="/products" element={<ProtectedLayout><Products /></ProtectedLayout>} />
          <Route path="/stock-movements" element={<ProtectedLayout><StockMovements /></ProtectedLayout>} />
          <Route path="/challans" element={<ProtectedLayout><Challans /></ProtectedLayout>} />
          <Route path="/challans/new" element={<ProtectedLayout><CreateChallan /></ProtectedLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
