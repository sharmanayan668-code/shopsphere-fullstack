import React, { useState } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import AdminSidebar from '../components/layout/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ArrowLeft } from 'lucide-react';

export default function AdminLayout() {
  const { user, loading, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Authenticating admin access...</div>;
  }

  if (!user || !isAdmin) {
    alert('Access Denied: Administrator role required');
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', position: 'relative' }}>
      
      {/* Sidebar with mobile toggle support */}
      <div className={`admin-sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
        <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="admin-backdrop"
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ height: '64px', backgroundColor: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="admin-mobile-toggle"
              style={{ padding: '6px', color: 'var(--text-main)', display: 'none' }}
              aria-label="Toggle Sidebar"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Admin: <strong>{user?.name}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to="/" className="btn btn-outline btn-sm" style={{ fontSize: '12px' }}>
              <ArrowLeft size={14} /> Storefront
            </Link>
          </div>
        </header>

        <main style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}