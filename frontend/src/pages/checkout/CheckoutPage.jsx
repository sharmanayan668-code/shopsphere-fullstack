import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ShieldCheck, Truck, Lock, ArrowRight } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const couponCode = location.state?.couponCode || '';

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: '9876543210',
    addressLine1: '402, Lotus Tech Park, Link Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400069',
    country: 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState('mock_card');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>No items to checkout</h2>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '16px' }}>Go to Store</Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Server recalculates all prices, validates stock and coupon
      const res = await api.post('/orders', {
        shippingAddress: address,
        couponCode: couponCode || undefined,
        paymentMethod
      });

      const order = res.data;
      await refreshCart(); // Cart is now empty in backend

      // Navigate to Mock Payment Simulation page
      navigate(`/payment/${order._id}`, { state: { order } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '24px', color: 'var(--primary)' }}>
        Complete Your Order
      </h1>

      {error && (
        <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', border: '1px solid #FECACA', padding: '14px 18px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="responsive-split-2">
        
        {/* Left: Shipping Address & Payment Selection */}
        <div>
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={20} color="var(--secondary)" /> 1. Shipping Address
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Street / Flat / Area</label>
              <input
                type="text"
                required
                value={address.addressLine1}
                onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                className="form-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  required
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal / PIN Code</label>
                <input
                  type="text"
                  required
                  value={address.postalCode}
                  onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={20} color="var(--secondary)" /> 2. Payment Method
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="pay"
                  value="mock_card"
                  checked={paymentMethod === 'mock_card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div>
                  <strong>Mock Credit / Debit Card (Simulation)</strong>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Instant simulated payment verification</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="pay"
                  value="mock_upi"
                  checked={paymentMethod === 'mock_upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div>
                  <strong>Mock UPI / QR (Simulation)</strong>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Simulate Google Pay / PhonePe / Paytm</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Review & Submit */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Review Items</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '240px', overflowY: 'auto', marginBottom: '20px' }}>
            {cart.items.map((i) => (
              <div key={i.product._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {i.quantity}x {i.product.name}
                </span>
                <strong>₹{i.itemTotal.toLocaleString('en-IN')}</strong>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginBottom: '24px' }}>
            {couponCode && (
              <div style={{ fontSize: '13px', color: 'var(--success)', marginBottom: '8px' }}>
                Coupon Applied: <strong>{couponCode}</strong>
              </div>
            )}
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Final amount & taxes are recalculated on the server.
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', backgroundColor: 'var(--secondary)' }}
          >
            {submitting ? 'Creating Order...' : 'Confirm & Proceed to Pay'} <ArrowRight size={18} />
          </button>
        </div>

      </form>
    </div>
  );
}