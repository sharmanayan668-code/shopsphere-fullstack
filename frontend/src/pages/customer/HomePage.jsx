import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Zap, Shield, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import ProductCard from '../../components/products/ProductCard';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?limit=8'),
          api.get('/categories')
        ]);
        setFeaturedProducts(prodRes.data || []);
        setCategories(catRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <section style={{ backgroundColor: 'var(--primary)', color: '#fff', padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '40px' }}>
          <div style={{ flex: '1 1 500px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>
              <Sparkles size={14} /> Next-Gen E-Commerce & Inventory Platform
            </span>
            <h1 style={{ fontSize: '46px', fontWeight: '800', lineHeight: '1.15', marginBottom: '20px', letterSpacing: '-1px' }}>
              Premium Products, <br />
              <span style={{ color: 'var(--accent)' }}>Real-Time Inventory</span> Control.
            </h1>
            <p style={{ fontSize: '17px', color: '#94A3B8', marginBottom: '32px', maxWidth: '540px' }}>
              Explore certified top-brand gadgets, apparel, and lifestyle gear with instant checkout, live stock audit trails, and mock payment simulations.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link to="/products" className="btn btn-primary btn-lg" style={{ backgroundColor: 'var(--secondary)' }}>
                Shop Catalog <ArrowRight size={18} />
              </Link>
              <Link to="/admin" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: '#334155' }}>
                Admin Dashboard
              </Link>
            </div>
          </div>

          <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
              alt="Hero Headphone"
              style={{ width: '100%', maxWidth: '450px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid #1E293B' }}
            />
          </div>
        </div>
      </section>

      <section style={{ padding: '50px 0', backgroundColor: 'var(--surface)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Browse Categories</h2>
            <Link to="/products" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--secondary)' }}>
              View All →
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '10px' }}>
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className="card"
                style={{ padding: '16px 24px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', border: '1px solid var(--border)' }}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--secondary)' }} />
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--primary)' }}>Trending Products</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Hand-picked top-rated products from our active database</p>
            </div>
            <Link to="/products" className="btn btn-outline btn-sm">
              Explore All Products
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading catalog...</div>
          ) : (
            <div className="grid grid-cols-4">
              {featuredProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ padding: '40px 0' }}>
        <div className="container">
          <div style={{ backgroundColor: 'var(--accent-light)', border: '1px solid #BFDBFE', borderRadius: 'var(--radius-lg)', padding: '36px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: '8px' }}>LIMITED TIME OFFER</span>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)', marginBottom: '6px' }}>
                Use Code <span style={{ color: 'var(--secondary)', letterSpacing: '1px' }}>WELCOME10</span> for 10% Extra OFF
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Or use code <strong>FLAT200</strong> on orders above ₹1,500. Valid across all electronics and apparel.
              </p>
            </div>
            <Link to="/products" className="btn btn-primary" style={{ backgroundColor: 'var(--secondary)' }}>
              Start Shopping
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}