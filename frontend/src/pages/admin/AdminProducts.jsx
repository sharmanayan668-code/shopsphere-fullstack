import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Trash2, Package } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New product state
  const [newProd, setNewProd] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    price: 999,
    discountPrice: 799,
    stock: 20,
    reorderThreshold: 5,
    images: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'
  });

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        api.get('/products?limit=50'),
        api.get('/categories')
      ]);
      setProducts(pRes.data || []);
      setCategories(cRes.data || []);
      if (cRes.data?.length > 0 && !newProd.category) {
        setNewProd((prev) => ({ ...prev, category: cRes.data[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        ...newProd,
        images: [newProd.images]
      });
      setShowModal(false);
      fetchData();
      alert('Product created successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--primary)' }}>Product Catalog</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Add, update, or remove store products</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} /> Add New Product
        </button>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80'} alt="" style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                      <strong>{p.name}</strong>
                    </div>
                  </td>
                  <td><code>{p.sku}</code></td>
                  <td>₹{p.price}</td>
                  <td>{p.stock}</td>
                  <td>{p.category?.name || 'General'}</td>
                  <td>
                    <button onClick={() => handleDelete(p._id)} style={{ color: 'var(--error)', padding: '6px' }} title="Delete product">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '540px', padding: '28px', backgroundColor: '#fff', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Add New Product</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input type="text" required value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} className="form-input" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input type="text" required value={newProd.sku} onChange={(e) => setNewProd({ ...newProd, sku: e.target.value.toUpperCase() })} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select value={newProd.category} onChange={(e) => setNewProd({ ...newProd, category: e.target.value })} className="form-input">
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input type="number" required value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: Number(e.target.value) })} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Price (₹)</label>
                  <input type="number" value={newProd.discountPrice} onChange={(e) => setNewProd({ ...newProd, discountPrice: Number(e.target.value) })} className="form-input" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Initial Stock</label>
                  <input type="number" required value={newProd.stock} onChange={(e) => setNewProd({ ...newProd, stock: Number(e.target.value) })} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Low Stock Threshold</label>
                  <input type="number" value={newProd.reorderThreshold} onChange={(e) => setNewProd({ ...newProd, reorderThreshold: Number(e.target.value) })} className="form-input" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input type="text" value={newProd.images} onChange={(e) => setNewProd({ ...newProd, images: e.target.value })} className="form-input" />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Description</label>
                <textarea rows={3} required value={newProd.description} onChange={(e) => setNewProd({ ...newProd, description: e.target.value })} className="form-input" />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}