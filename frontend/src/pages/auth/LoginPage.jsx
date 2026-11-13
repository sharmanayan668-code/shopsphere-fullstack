import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/products');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@shopsphere.com');
      setPassword('admin123');
    } else {
      setEmail('customer@shopsphere.com');
      setPassword('customer123');
    }
  };

  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '440px' }}>
      <div className="card" style={{ padding: '36px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ backgroundColor: 'var(--secondary)', color: '#fff', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <ShoppingBag size={24} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Login to your ShopSphere customer or admin account
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', border: '1px solid #FECACA', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '18px' }}>
            {error}
          </div>
        )}

        {/* Quick Demo Pre-fills */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => fillDemo('admin')}
            className="btn btn-outline btn-sm"
            style={{ flex: 1, fontSize: '11px', backgroundColor: 'var(--surface-alt)' }}
          >
            ⚡ Demo Admin
          </button>
          <button
            type="button"
            onClick={() => fillDemo('customer')}
            className="btn btn-outline btn-sm"
            style={{ flex: 1, fontSize: '11px', backgroundColor: 'var(--surface-alt)' }}
          >
            ⚡ Demo Customer
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', backgroundColor: 'var(--secondary)' }}
          >
            {loading ? 'Logging in...' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)', marginTop: '24px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--secondary)', fontWeight: '600' }}>
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
}