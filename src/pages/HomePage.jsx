import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../store/slices/productSlice.js';

const HomePage = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const featured = items.slice(0, 4);

  return (
    <div className="page home">
      <section className="hero">
        <div>
          <h1>9at3a.TN – Phone Parts Marketplace</h1>
          <p>
            High-quality LCDs, batteries, FPCs, sub-boards and more – optimized pricing for{' '}
            <strong>admins</strong>, <strong>customers</strong>, and <strong>VIP clients</strong>.
          </p>
          {user?.userType === 'vip_customer' && (
            <p className="vip-highlight">
              You are a <strong>VIP client</strong>. Your personalized pricing and dedicated support
              are active on all products.
            </p>
          )}
          <div className="hero-actions">
            <Link className="btn primary" to="/products">
              Browse Parts
            </Link>
            <Link className="btn ghost" to="/cart">
              View Cart
            </Link>
          </div>
        </div>
        <div className="hero-panel">
          <h3>VIP Support</h3>
          <p>VIP clients get priority handling, faster order processing, and dedicated WhatsApp support.</p>
          <p>
            Contact: <strong>+216 52798186</strong>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Featured Products</h2>
          <Link to="/products">See all</Link>
        </div>
        {loading && <p>Loading products...</p>}
        {!loading && featured.length === 0 && <p>No products yet.</p>}
        <div className="grid">
          {featured.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="card product-card">
              <div className="product-thumb">
                <span>{p.category}</span>
              </div>
              <h3>{p.name}</h3>
              <p className="price">{p.price != null ? `${p.price} TND` : 'Contact for price'}</p>
              <p className="description">{p.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;

