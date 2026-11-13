import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Layers, AlertTriangle, RefreshCw, Plus, Minus, History } from 'lucide-react';

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLowStock, setFilterLowStock] = useState(false);

  // Adjustment Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [changeQty, setChangeQty] = useState(5);
  const [reason, setReason] = useState('Stock replenishing from distributor');
  const [adjusting, setAdjusting] = useState(false);

  const fetchInventory = async () => {
    try {
      const [invRes, movRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/inventory/movements?limit=15')
      ]);
      setItems(invRes.data || []);
      setMovements(movRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('A valid reason is required for audit logs');
      return;
    }
    setAdjusting(true);
    try {
      await api.post(`/inventory/${selectedProduct._id}/adjust`, {
        changeQuantity: Number(changeQty),
        reason
      });
      setSelectedProduct(null);
      fetchInventory();
      alert('Stock successfully adjusted and logged into InventoryMovement!');
    } catch (err) {
      alert(err.message);
    } finally {
      setAdjusting(false);
    }
  };

  const displayedItems = filterLowStock ? items.filter((i) => i.status === 'low_stock' || i.status === 'out_of_stock') : items;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--primary)' }}>Inventory & Audit Trail</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Manage stock levels with mandatory enterprise audit logs</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`btn btn-sm ${filterLowStock ? 'btn-danger' : 'btn-outline'}`}
          >
            <AlertTriangle size={14} /> {filterLowStock ? 'Showing Low Stock Only' : 'Filter Low Stock'}
          </button>
          <button onClick={fetchInventory} className="btn btn-outline btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card" style={{ padding: '20px', marginBottom: '40px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Current Product Stock Overview</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Threshold</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedItems.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80'} alt="" style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                      <strong>{item.name}</strong>
                    </div>
                  </td>
                  <td><code>{item.sku}</code></td>
                  <td>{item.category}</td>
                  <td><strong style={{ fontSize: '16px' }}>{item.stock}</strong> units</td>
                  <td>{item.reorderThreshold}</td>
                  <td>
                    <span className={`badge ${item.status === 'in_stock' ? 'badge-success' : item.status === 'low_stock' ? 'badge-warning' : 'badge-danger'}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedProduct(item)}
                      className="btn btn-primary btn-sm"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement Audit History */}
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={18} /> Recent Stock Movement Logs (Audit Trail)
        </h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Change</th>
                <th>Previous → New</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m._id}>
                  <td><strong>{m.product?.name || 'Product'}</strong></td>
                  <td>
                    <strong style={{ color: m.changeQuantity > 0 ? 'var(--success)' : 'var(--error)' }}>
                      {m.changeQuantity > 0 ? `+${m.changeQuantity}` : m.changeQuantity}
                    </strong>
                  </td>
                  <td>{m.previousStock} → {m.newStock}</td>
                  <td><span className="badge badge-info">{m.movementType}</span></td>
                  <td style={{ fontSize: '13px' }}>{m.reason}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(m.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '480px', padding: '28px', backgroundColor: '#fff' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '10px' }}>
              Adjust Stock: {selectedProduct.name}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Current stock: <strong>{selectedProduct.stock}</strong> units
            </p>

            <form onSubmit={handleAdjust}>
              <div className="form-group">
                <label className="form-label">Stock Change Quantity (+ or -)</label>
                <input
                  type="number"
                  required
                  value={changeQty}
                  onChange={(e) => setChangeQty(e.target.value)}
                  className="form-input"
                />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Enter positive (e.g. 10) to add stock, or negative (e.g. -2) to deduct.
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Audit Reason (Mandatory)</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setSelectedProduct(null)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={adjusting} className="btn btn-primary">
                  {adjusting ? 'Saving...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}