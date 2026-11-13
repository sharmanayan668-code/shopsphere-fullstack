import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState('');

  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
  const isLowStock = product.stock > 0 && product.stock <= (product.reorderThreshold || 5);
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to add items to your cart');
      return;
    }
    try {
      setAdding(true);
      await addToCart(product._id, 1);
      setMsg('Added! ✓');
      setTimeout(() => setMsg(''), 1500);
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Link to={`/products/${product._id}`} style={{ position: 'relative', width: '100%', paddingTop: '80%', backgroundColor: '#f1f5f9', display: 'block' }}>
        <img
          src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
          alt={product.name}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {hasDiscount && (
          <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'var(--error)', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px' }}>
            -{discountPercent}%
          </span>
        )}
        {isLowStock && (
          <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'var(--warning)', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <AlertCircle size={12} /> Only ${product.stock} left
          </span>
        )}
        {isOutOfStock && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '14px' }}>
            OUT OF STOCK
          </div>
        )}
      </Link>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {product.category?.name || 'General'}
          </span>
          <Link to={`/products/${product._id}`}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)', marginTop: '4px', marginBottom: '8px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {product.name}
            </h3>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '12px' }}>
            <Star size={14} fill="#F59E0B" color="#F59E0B" />
            <span style={{ fontSize: '13px', fontWeight: '600' }}>{product.rating || '4.5'}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({product.numReviews || 12})</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>
              ₹{displayPrice.toLocaleString('en-IN')}
            </div>
            {hasDiscount && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </div>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className={`btn btn-sm ${isOutOfStock ? 'btn-outline' : 'btn-primary'}`}
            style={{ opacity: isOutOfStock ? 0.6 : 1 }}
          >
            <ShoppingBag size={14} />
            {adding ? '...' : (msg || 'Add')}
          </button>
        </div>
      </div>
    </div>
  );
}