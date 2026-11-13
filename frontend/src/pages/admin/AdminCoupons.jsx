import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Ticket, Plus, Trash2 } from 'lucide-react';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 1000,
    maxDiscount: 500,
    expiryDate: '2026-12-31',
    usageLimit: 100
  });

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coupons', newCoupon);
      setShowModal(false);
      fetchCoupons();
      alert('Coupon created successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--primary)' }}>Promotional Coupons</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Manage discounts and customer promotion codes</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} /> Create New Coupon
        </button>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Max Discount</th>
                <th>Used / Limit</th>
                <th>Expires</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td><code style={{ fontSize: '15px', fontWeight: '700' }}>{c.code}</code></td>
                  <td>{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue} Flat`}</td>
                  <td>₹{c.minOrderAmount}</td>
                  <td>{c.maxDiscount ? `₹${c.maxDiscount}` : 'No Cap'}</td>
                  <td>{c.usedCount} / {c.usageLimit}</td>
                  <td>{new Date(c.expiryDate).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleDelete(c._id)} style={{ color: 'var(--error)', padding: '6px' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '480px', padding: '28px', backgroundColor: '#fff' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Create Promo Coupon</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Coupon Code</label>
                <input type="text" required value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} placeholder="e.g. FESTIVE20" className="form-input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select value={newCoupon.discountType} onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })} className="form-input">
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Value</label>
                  <input type="number" required value={newCoupon.discountValue} onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })} className="form-input" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Min Order (₹)</label>
                  <input type="number" value={newCoupon.minOrderAmount} onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: Number(e.target.value) })} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Discount (₹)</label>
                  <input type="number" value={newCoupon.maxDiscount} onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: Number(e.target.value) })} className="form-input" />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Expiry Date</label>
                <input type="date" required value={newCoupon.expiryDate} onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })} className="form-input" />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}