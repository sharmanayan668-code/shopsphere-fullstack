import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, CheckCircle } from 'lucide-react';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  if (!user) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <ShoppingBag size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
        <h2>Your Shopping Cart is Waiting</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Please login to view or checkout your items.</p>
        <Link to="/login" className="btn btn-primary">Login Now</Link>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <ShoppingBag size={56} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '8px 0 24px' }}>Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="btn btn-primary">Discover Products</Link>
      </div>
    );
  }

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError('');
    try {
      const res = await api.get(`/coupons/validate/${couponCode.trim()}?subtotal=${cart.subtotal}`);
      setAppliedCoupon(res.data);
    } catch (err) {
      setCouponError(err.message);
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingFee = cart.subtotal > 1500 ? 0 : 99;
  const taxAmount = Math.round((cart.subtotal - discountAmount) * 0.05);
  const totalAmount = Math.max(0, cart.subtotal - discountAmount + shippingFee + taxAmount);

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '24px', color: 'var(--primary)' }}>
        Shopping Cart ({cart.itemCount} items)
      </h1>

      <div className="responsive-split-2">
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cart.items.map((item) => (
              <div key={item.product._id} className="card" style={{ padding: '16px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <img
                  src={item.product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'}
                  alt={item.product.name}
                  style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px' }}
                />

                <div style={{ flex: 1 }}>
                  <Link to={`/products/${item.product._id}`}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>
                      {item.product.name}
                    </h3>
                  </Link>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    SKU: {item.product.sku}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)' }}>
                    ₹{item.unitPrice.toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '6px' }}>
                  <button
                    onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                    style={{ padding: '6px 10px' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ padding: '6px 12px', fontWeight: '600', fontSize: '14px' }}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    style={{ padding: '6px 10px' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div style={{ fontSize: '16px', fontWeight: '700', width: '90px', textAlign: 'right' }}>
                  ₹{item.itemTotal.toLocaleString('en-IN')}
                </div>

                <button
                  onClick={() => removeFromCart(item.product._id)}
                  style={{ color: 'var(--error)', padding: '6px' }}
                  title="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <Link to="/products" className="btn btn-outline btn-sm">← Continue Shopping</Link>
            <button onClick={clearCart} className="btn btn-outline btn-sm" style={{ color: 'var(--error)' }}>
              Clear Cart
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Order Summary</h2>

          <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Promo code (e.g. WELCOME10)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="form-input"
              style={{ padding: '8px 12px' }}
            />
            <button type="submit" disabled={validatingCoupon} className="btn btn-outline btn-sm">
              Apply
            </button>
          </form>

          {appliedCoupon && (
            <div style={{ backgroundColor: 'var(--success-bg)', border: '1px solid #A7F3D0', color: 'var(--success)', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <CheckCircle size={16} /> Code <strong>{appliedCoupon.code}</strong> applied (-₹{appliedCoupon.discountAmount})
            </div>
          )}

          {couponError && (
            <div style={{ color: 'var(--error)', fontSize: '13px', marginBottom: '16px' }}>
              {couponError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Items Subtotal</span>
              <span>₹{cart.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {appliedCoupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                <span>Coupon Discount</span>
                <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Estimated Shipping</span>
              <span>{shippingFee === 0 ? <strong style={{ color: 'var(--success)' }}>FREE</strong> : `₹${shippingFee}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Tax (5% GST)</span>
              <span>₹{taxAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', marginBottom: '24px', color: 'var(--primary)' }}>
            <span>Total Amount</span>
            <span>₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>

          <button
            onClick={() => navigate('/checkout', { state: { couponCode: appliedCoupon?.code } })}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', backgroundColor: 'var(--secondary)' }}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}