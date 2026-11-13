import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Ticket,
  MessageSquare,
  ArrowLeft,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({ onNavigate }) {
  const { logout, user } = useAuth();

  const links = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/inventory', label: 'Inventory & Stock', icon: Layers },
    { to: '/admin/products', label: 'Product Catalog', icon: Package },
    { to: '/admin/orders', label: 'Customer Orders', icon: ShoppingBag },
    { to: '/admin/coupons', label: 'Promo Coupons', icon: Ticket },
  ];

  const handleLinkClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <aside style={{ width: '260px', backgroundColor: 'var(--primary)', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Brand */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ backgroundColor: 'var(--secondary)', color: '#fff', padding: '6px', borderRadius: '8px' }}>
          <ShieldAlert size={20} />
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '800' }}>ShopSphere</div>
          <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: '600' }}>ADMIN CONTROL</div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={handleLinkClick}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: isActive ? '#fff' : '#94A3B8',
                backgroundColor: isActive ? 'var(--secondary)' : 'transparent',
                transition: 'all 0.2s ease'
              })}
            >
              <Icon size={18} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Switcher */}
      <div style={{ padding: '20px 16px', borderTop: '1px solid #1E293B' }}>
        <Link
          to="/"
          onClick={handleLinkClick}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94A3B8', fontSize: '13px', padding: '8px 10px', borderRadius: '6px', marginBottom: '8px' }}
        >
          <ArrowLeft size={16} /> Back to Storefront
        </Link>
        <button
          onClick={() => { logout(); handleLinkClick(); }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--error)', fontSize: '13px', padding: '8px 10px', borderRadius: '6px', textAlign: 'left' }}
        >
          <LogOut size={16} /> Sign Out ({user?.name?.split(' ')[0]})
        </button>
      </div>
    </aside>
  );
}