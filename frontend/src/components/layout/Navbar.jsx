
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  LogOut,
  Shield,
  Package,
  Menu,
  X
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();

  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();

    if (searchTerm.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    setMobileMenuOpen(false);
  };

  return (
    <header
      style={{
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '72px',
          gap: '16px'
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexShrink: 0
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--secondary)',
              color: '#fff',
              padding: '8px',
              borderRadius: '10px',
              display: 'flex'
            }}
          >
            <ShoppingBag size={20} />
          </div>

          <span
            style={{
              fontSize: '18px',
              fontWeight: '800',
              letterSpacing: '-0.5px',
              color: 'var(--primary)'
            }}
          >
            Shop<span style={{ color: 'var(--secondary)' }}>Sphere</span>
          </span>
        </Link>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: '1 1 380px',
            maxWidth: '420px',
            position: 'relative'
          }}
        >
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{
              paddingLeft: '38px',
              borderRadius: 'var(--radius-full)',
              fontSize: '13px',
              height: '38px'
            }}
          />

          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--text-secondary)'
            }}
          />
        </form>

        {/* Desktop Navigation */}
        <nav
          className="desktop-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <Link to="/products">Store</Link>

          <Link
            to="/cart"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShoppingBag size={18} />
            Cart
            <span className="cart-badge">{itemCount}</span>
          </Link>

          {user ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Link to="/orders" className="btn btn-outline btn-sm">
                <Package size={14} />
                My Orders
              </Link>

              {isAdmin && (
                <Link to="/admin" className="btn btn-primary btn-sm">
                  <Shield size={14} />
                  Admin
                </Link>
              )}

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="btn btn-outline btn-sm"
                title="Logout"
                type="button"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Cart + Hamburger */}
        <div
          className="mobile-nav-actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <Link to="/cart" className="mobile-cart-btn">
            <ShoppingBag size={20} />
            <span className="cart-badge">{itemCount}</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-toggle"
            type="button"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
          >
            All Products Catalog
          </Link>

          <Link
            to="/cart"
            onClick={() => setMobileMenuOpen(false)}
          >
            My Shopping Cart
          </Link>

          {user ? (
            <>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Orders History
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Control Portal
                </Link>
              )}

              <div style={{ padding: '12px 0' }}>
                <span>
                  Signed in as <strong>{user.name}</strong>
                </span>

                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="btn btn-outline btn-sm"
                  type="button"
                  style={{ marginLeft: '12px' }}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '15px', padding: '12px 0' }}>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Logout Confirmation Popup */}
      {showLogoutConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            style={{
              backgroundColor: 'var(--surface)',
              padding: '28px',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '380px',
              textAlign: 'center',
              boxShadow: '0 15px 40px rgba(0,0,0,0.2)'
            }}
          >
            <LogOut size={35} color="var(--error)" />

            <h3
              id="logout-title"
              style={{ margin: '15px 0 8px' }}
            >
              Confirm Logout
            </h3>

            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '14px'
              }}
            >
              Are you sure you want to logout from your account?
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '24px'
              }}
            >
              <button
                className="btn btn-outline"
                onClick={() => setShowLogoutConfirm(false)}
                type="button"
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                onClick={handleLogout}
                type="button"
                style={{ backgroundColor: 'var(--error)' }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
