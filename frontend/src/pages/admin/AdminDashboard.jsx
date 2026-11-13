import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading real-time database analytics...</div>;
  if (!data) return <div>Failed to load analytics</div>;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--primary)' }}>Business Analytics & Overview</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Real-time statistics derived directly from MongoDB records</p>
      </div>

      {/* Low Stock Warning Banner if any */}
      {data.lowStockCount > 0 && (
        <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', color: '#B45309', padding: '16px 20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} />
            <strong>{data.lowStockCount} products are running low on inventory!</strong>
          </div>
          <Link to="/admin/inventory" className="btn btn-sm" style={{ backgroundColor: '#F59E0B', color: '#fff' }}>
            Review Stock Now →
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>TOTAL REVENUE</span>
            <DollarSign size={20} color="var(--success)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary)' }}>
            ₹{data.totalRevenue?.toLocaleString('en-IN') || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Paid orders revenue</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>TOTAL ORDERS</span>
            <ShoppingCart size={20} color="var(--secondary)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary)' }}>
            {data.totalOrders}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{data.paidOrders} confirmed & paid</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>ACTIVE PRODUCTS</span>
            <Package size={20} color="var(--accent)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary)' }}>
            {data.totalProducts}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>In 5 active categories</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>TOTAL CUSTOMERS</span>
            <Users size={20} color="#8B5CF6" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary)' }}>
            {data.totalCustomers}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Registered buyers</div>
        </div>
      </div>

      {/* Recent Orders & Top Sellers */}
      <div className="responsive-dashboard-split">
        
        {/* Recent Orders */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Recent Customer Orders</h3>
            <Link to="/admin/orders" style={{ fontSize: '13px', color: 'var(--secondary)', fontWeight: '600' }}>View All →</Link>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order No</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td><strong>{o.orderNumber}</strong></td>
                    <td>{o.user?.name || 'Customer'}</td>
                    <td>₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge ${o.orderStatus === 'confirmed' ? 'badge-info' : o.orderStatus === 'delivered' ? 'badge-success' : 'badge-warning'}`}>
                        {o.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '18px' }}>Top Selling Items</h3>
          {data.topProducts?.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Place demo orders to see real-time sales volume.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {data.topProducts.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <div>
                    <strong>{p.name}</strong>
                    <div style={{ color: 'var(--text-muted)' }}>{p.totalSold} units sold</div>
                  </div>
                  <strong style={{ color: 'var(--primary)' }}>₹{p.totalRevenue?.toLocaleString('en-IN')}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}