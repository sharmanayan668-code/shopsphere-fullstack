import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ShoppingBag, RefreshCw } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      alert(`Order status updated to ${newStatus}`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--primary)' }}>Customer Orders Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Track and progress order fulfillment lifecycles</p>
        </div>
        <button onClick={fetchOrders} className="btn btn-outline btn-sm">
          <RefreshCw size={14} /> Refresh Orders
        </button>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Order Lifecycle Status</th>
                <th>Placed At</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td><strong>{o.orderNumber}</strong></td>
                  <td>
                    <div>{o.user?.name || 'Customer'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{o.user?.email}</div>
                  </td>
                  <td>{o.items?.length} items</td>
                  <td><strong>₹{o.totalAmount?.toLocaleString('en-IN')}</strong></td>
                  <td>
                    <span className={`badge ${o.paymentStatus === 'successful' ? 'badge-success' : 'badge-warning'}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <select
                      value={o.orderStatus}
                      onChange={(e) => handleStatusChange(o._id, e.target.value)}
                      className="form-input"
                      style={{ padding: '4px 8px', fontSize: '13px', width: 'auto' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled (Restores Stock)</option>
                    </select>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}