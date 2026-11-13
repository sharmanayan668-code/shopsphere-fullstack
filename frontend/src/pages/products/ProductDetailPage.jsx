import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Star, ShieldCheck, Truck, RefreshCw, ShoppingBag, Plus, Minus } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState('');

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProduct = async () => {
    try {
      const [prodRes, revRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/reviews/product/${id}`)
      ]);
      setProduct(prodRes.data);
      setReviews(revRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading) return <div className="container" style={{ padding: '80px', textAlign: 'center' }}>Loading product details...</div>;
  if (!product) return <div className="container" style={{ padding: '80px', textAlign: 'center' }}>Product not found</div>;

  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to purchase or add items to your cart');
      return;
    }
    try {
      setAdding(true);
      await addToCart(product._id, quantity);
      setMsg('Added to Cart Successfully! ✓');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to submit a review');
      return;
    }
    try {
      setSubmittingReview(true);
      await api.post(`/reviews/product/${id}`, { rating, comment });
      setComment('');
      fetchProduct();
      alert('Thank you! Your review has been recorded.');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        <Link to="/">Home</Link> / <Link to="/products">Store</Link> / <span>{product.name}</span>
      </div>

      <div className="responsive-detail-grid">
        <div style={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <img
            src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}
            alt={product.name}
            style={{ width: '100%', height: '420px', objectFit: 'cover' }}
          />
        </div>

        <div>
          <span className="badge badge-info" style={{ marginBottom: '12px' }}>
            {product.category?.name || 'General Category'}
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary)', lineHeight: '1.25', marginBottom: '8px' }}>
            {product.name}
          </h1>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            SKU: <strong style={{ color: 'var(--text-main)' }}>{product.sku}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
              <strong style={{ fontSize: '15px' }}>{product.rating || '4.5'}</strong>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              ({reviews.length} customer reviews)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '24px' }}>
            <span style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)' }}>
              ₹{displayPrice.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span style={{ fontSize: '18px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
            {hasDiscount && (
              <span className="badge badge-danger">
                Save ₹{(product.price - product.discountPrice).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            {product.stock > 0 ? (
              <span style={{ color: 'var(--success)', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ✓ In Stock ({product.stock} units ready to ship)
              </span>
            ) : (
              <span style={{ color: 'var(--error)', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ✕ Out of stock
              </span>
            )}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
            {product.description}
          </p>

          {product.stock > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface)' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '10px 14px' }}
                >
                  <Minus size={16} />
                </button>
                <span style={{ padding: '10px 16px', fontWeight: '700', fontSize: '15px' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  style={{ padding: '10px 14px' }}
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn btn-primary btn-lg"
                style={{ flex: 1, backgroundColor: 'var(--secondary)' }}
              >
                <ShoppingBag size={20} />
                {adding ? 'Adding...' : (msg || 'Add To Cart')}
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
              <Truck size={20} style={{ margin: '0 auto 4px', color: 'var(--secondary)' }} />
              <div>Fast Shipping</div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
              <ShieldCheck size={20} style={{ margin: '0 auto 4px', color: 'var(--secondary)' }} />
              <div>Idempotent Mock Pay</div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
              <RefreshCw size={20} style={{ margin: '0 auto 4px', color: 'var(--secondary)' }} />
              <div>Easy Cancellations</div>
            </div>
          </div>
        </div>
      </div>

      <section style={{ marginTop: '70px', paddingTop: '40px', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '24px' }}>Customer Reviews</h2>
        <div className="responsive-split-2">
          <div>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No reviews yet. Be the first to share your thoughts!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviews.map((r) => (
                  <div key={r._id} className="card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '14px' }}>{r.user?.name || 'Verified Buyer'}</strong>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Leave a Review</h3>
            {user ? (
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="form-input">
                    <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                    <option value={3}>⭐⭐⭐ (3 - Average)</option>
                    <option value={2}>⭐⭐ (2 - Poor)</option>
                    <option value={1}>⭐ (1 - Terrible)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Comment</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tell us about the build quality, performance..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="form-input"
                  />
                </div>
                <button type="submit" disabled={submittingReview} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Please <Link to="/login" style={{ color: 'var(--secondary)', fontWeight: '600' }}>login</Link> to post a review.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}