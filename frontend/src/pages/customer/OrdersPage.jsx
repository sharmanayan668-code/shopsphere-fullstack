import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Reserved inventory will be automatically restored.')) {
      return;
    }
    try {
      setCancellingId(orderId);
      await api.post(`/orders/${orderId}/cancel`, { reason: 'Customer requested cancellation' });
      fetchOrders();
      alert('Order cancelled successfully! Stock has been restored.');
    } catch (err) {
      alert(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <div className="container" style={{ padding: '80px', textAlign: 'center' }}>Loading your orders...</div>;

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '24px', color: 'var(--primary)' }}>
        My Order History
      </h1>

      {orders.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <Package size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <h3>No Orders Placed Yet</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '8px 0 20px' }}>Your ordered items and invoices will appear here.</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((o) => (
            <div key={o._id} className="card" style={{ padding: '24px' }}>
              
              {/* Order Header */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Order ID:</span>{' '}
                  <strong style={{ fontSize: '15px' }}>{o.orderNumber}</strong>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Placed on: {new Date(o.createdAt).toLocaleDateString()} at {new Date(o.createdAt).toLocaleTimeString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`badge ${
                    o.orderStatus === 'delivered' ? 'badge-success' :
                    o.orderStatus === 'cancelled' ? 'badge-danger' :
                    o.orderStatus === 'confirmed' ? 'badge-info' : 'badge-warning'
                  }`}>
                    Status: {o.orderStatus}
                  </span>

                  <span className={`badge ${o.paymentStatus === 'successful' ? 'badge-success' : 'badge-warning'}`}>
                    Pay: {o.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {o.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                        alt={item.name}
                        style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                    <strong>₹{item.subtotal.toLocaleString('en-IN')}</strong>
                  </div>
                ))}
              </div>

              {/* Footer / Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Paid / Payable: </span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>
                    ₹{o.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {o.paymentStatus === 'pending' && (
                    <Link to={`/payment/${o._id}`} className="btn btn-primary btn-sm">
                      Complete Payment
                    </Link>
                  )}

                  {!['shipped', 'delivered', 'cancelled'].includes(o.orderStatus) && (
                    <button
                      onClick={() => handleCancelOrder(o._id)}
                      disabled={cancellingId === o._id}
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--error)', borderColor: '#FECACA' }}
                    >
                      {cancellingId === o._id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}