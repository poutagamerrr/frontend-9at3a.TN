import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../store/slices/productSlice.js';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  const [category, setCategory] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const categories = useMemo(() => {
    const categoryMap = {
      'LCD Screen': '📱 LCD Screen',
      'Battery': '🔋 Battery',
      'Sub-board': '🔌 Sub-board',
      'FPC': '📌 Flex Cable',
    };
    const set = new Set(items.map((p) => p.category));
    return ['all', ...Array.from(set).sort()];
  }, [items]);

  const isVipOrAdmin = user?.userType === 'vip_customer' || user?.userType === 'admin';

  const filtered = items.filter((p) => {
    const inCategory = category === 'all' || p.category === category;
    const price = p.price ?? 0;
    const aboveMin = minPrice === '' || price >= Number(minPrice);
    const belowMax = maxPrice === '' || price <= Number(maxPrice);
    return inCategory && aboveMin && belowMax;
  });

  const getCategoryIcon = (cat) => {
    const icons = {
      'LCD Screen': '📱',
      'Battery': '🔋',
      'Sub-board': '🔌',
      'FPC': '📌',
    };
    return icons[cat] || '📦';
  };

  return (
    <div className="page">
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2>Premium Phone Parts</h2>
          {isVipOrAdmin && (
            <span className="vip-tag">
              {user?.userType === 'admin' ? '👨‍💼 Admin' : '⭐ VIP Member'}
            </span>
          )}
        </div>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
          {filtered.length} products available
        </p>
      </div>

      <div className="filters-container">
        <div className="filters">
          <label>
            <strong>Category</strong>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.filter(c => c !== 'all').map((c) => (
                <option key={c} value={c}>
                  {getCategoryIcon(c)} {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            <strong>Min Price (TND)</strong>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
            />
          </label>
          <label>
            <strong>Max Price (TND)</strong>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="500"
            />
          </label>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>⏳ Loading premium products...</p>
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
          <p>No products match your filters.</p>
        </div>
      )}

      <div className="cards-grid">
        {filtered.map((p) => (
          <div key={p.id} className="product-card-compact">
            <Link to={`/products/${p.id}`} className="product-card-link">
              <div className="compact-image">
                <img src={p.images?.[0]} alt={p.name} onError={(e) => (e.target.src = 'https://via.placeholder.com/300?text=Product')} />
              </div>
              <div className="compact-body">
                <div className="compact-top">
                  <h4 className="compact-name">{p.name}</h4>
                  <span className="compact-category">{getCategoryIcon(p.category)} {p.category}</span>
                </div>
                <p className="compact-desc">{p.description}</p>
                <div className="compact-bottom">
                  <div className="compact-price">
                    <span className="current-price">{p.price != null ? `${p.price} TND` : 'Contact'}</span>
                    {isVipOrAdmin && user?.userType === 'vip_customer' && (
                      <span className="vip-price compact-vip">✨ VIP</span>
                    )}
                  </div>
                  <div className="compact-meta">
                    <span className="stock-info">{p.stockQuantity > 0 ? `✓ ${p.stockQuantity}` : 'Out of stock'}</span>
                    <div className="compact-actions">
                      <button className="btn primary compact-btn">Add</button>
                      <Link to={`/products/${p.id}`} className="btn ghost compact-btn">View</Link>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;

