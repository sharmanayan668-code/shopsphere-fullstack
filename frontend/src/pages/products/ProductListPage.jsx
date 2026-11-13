import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import ProductCard from '../../components/products/ProductCard';
import { Filter, Search, RotateCcw } from 'lucide-react';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const keyword = searchParams.get('keyword') || '';
  const selectedCat = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams);
        const res = await api.get(`/products?${params.toString()}`);
        setProducts(res.data || []);
        setTotal(res.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const updateFilter = (key, val) => {
    const newParams = new URLSearchParams(searchParams);
    if (val) newParams.set(key, val);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)' }}>
          {keyword ? `Search Results for "${keyword}"` : 'All Products Catalog'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Showing {products.length} of {total} available items
        </p>
      </div>

      <div className="responsive-catalog-split">
        <aside className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={18} /> Filters
            </h3>
            <button onClick={clearFilters} style={{ fontSize: '12px', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ fontWeight: '600' }}>Category</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="cat"
                  checked={!selectedCat}
                  onChange={() => updateFilter('category', '')}
                />
                All Categories
              </label>
              {categories.map((c) => (
                <label key={c._id} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="cat"
                    checked={selectedCat === c._id}
                    onChange={() => updateFilter('category', c._id)}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ fontWeight: '600' }}>Price Range (₹)</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                className="form-input"
                style={{ padding: '6px 8px' }}
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="form-input"
                style={{ padding: '6px 8px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '600' }}>Sort By</label>
            <select
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="form-input"
            >
              <option value="">Featured (Newest)</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </aside>

        <main>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
              Loading products from database...
            </div>
          ) : products.length === 0 ? (
            <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
              <Search size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>No products found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                Try adjusting your search query or reset the filters.
              </p>
              <button onClick={clearFilters} className="btn btn-outline btn-sm" style={{ marginTop: '20px' }}>
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}