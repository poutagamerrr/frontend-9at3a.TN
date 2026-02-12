import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchProductById } from '../store/slices/productSlice.js';
import { addToCart } from '../store/slices/cartSlice.js';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: product, loading } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  const handleAddToCart = () => {
    dispatch(addToCart({ productId: id, quantity }));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const isVipOrAdmin = user?.userType === 'vip_customer' || user?.userType === 'admin';
  const userTypeLabel = user?.userType === 'admin' ? '👨‍💼 Admin' : 
                        user?.userType === 'vip_customer' ? '⭐ VIP' : 
                        'Regular Customer';

  const getCategoryIcon = (cat) => {
    const icons = {
      'LCD Screen': '📱',
      'Battery': '🔋',
      'Sub-board': '🔌',
      'FPC': '📌',
    };
    return icons[cat] || '📦';
  };

  if (loading || !product) {
    return (
      <div className="page">
        <p style={{ textAlign: 'center', padding: '2rem' }}>⏳ Loading product...</p>
      </div>
    );
  }

  const savings = product.pricing && isVipOrAdmin 
    ? Math.round((product.pricing.customer_price - product.price) * 10) / 10
    : 0;

  return (
    <div className="page product-detail">
      <button 
        onClick={() => window.history.back()} 
        className="btn ghost" 
        style={{ marginBottom: '1rem' }}
      >
        ← Go Back
      </button>

      <div className="product-detail-main">
        <div className="product-detail-image">
          <img 
            src={product.images?.[0]} 
            alt={product.name}
            onError={(e) => e.target.src = 'https://via.placeholder.com/400?text=Product'}
            style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '1rem' }}
          />
          <div className="product-stock-indicator" style={{
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: product.stockQuantity > 20 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: product.stockQuantity > 20 ? '#4ade80' : '#ef4444',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            {product.stockQuantity > 0 ? (
              <>Stock: {product.stockQuantity} units</>
            ) : (
              <>Out of Stock</>
            )}
          </div>
        </div>

        <div className="product-detail-info">
          <div className="breadcrumb" style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
            <span>{getCategoryIcon(product.category)} {product.category}</span>
          </div>

          <h2 style={{ marginBottom: '0.5rem' }}>{product.name}</h2>
          
          {isVipOrAdmin && (
            <div style={{
              display: 'inline-block',
              padding: '0.3rem 0.7rem',
              backgroundColor: 'rgba(250, 204, 21, 0.15)',
              color: '#facc15',
              borderRadius: '999px',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              fontWeight: '500'
            }}>
              {userTypeLabel}
            </div>
          )}

          <p className="description" style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
            {product.description}
          </p>

          {/* Pricing Section */}
          <div className="pricing-section" style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <div className="price-comparison">
              {product.pricing && isVipOrAdmin ? (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Regular Price</p>
                    <p style={{ 
                      color: 'var(--muted)', 
                      textDecoration: 'line-through',
                      fontSize: '1.2rem'
                    }}>
                      {product.pricing.customer_price} TND
                    </p>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{
                      color: '#facc15',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      marginBottom: '0.3rem'
                    }}>Your {userTypeLabel} Price</p>
                    <p style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#facc15',
                      marginBottom: '0.3rem'
                    }}>
                      {product.price} TND
                    </p>
                    <p style={{
                      color: '#4ade80',
                      fontSize: '0.95rem',
                      fontWeight: '500'
                    }}>
                      💰 You save {savings} TND ({Math.round((savings / product.pricing.customer_price) * 100)}%)
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Price</p>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                    {product.price != null ? `${product.price} TND` : 'Contact for price'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Add to Cart Section */}
          <div className="quantity-row" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
            <label style={{ flex: 1 }}>
              <strong>Quantity</strong>
              <input
                type="number"
                min="1"
                max={product.stockQuantity || 1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                disabled={product.stockQuantity === 0}
                style={{ width: '100%' }}
              />
            </label>
            <button 
              className="btn primary" 
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              style={{ marginTop: '1.5rem', flex: 1 }}
            >
              {addedToCart ? '✓ Added!' : '🛒 Add to Cart'}
            </button>
          </div>

          {addedToCart && (
            <div style={{
              padding: '0.8rem',
              backgroundColor: 'rgba(74, 222, 128, 0.15)',
              color: '#4ade80',
              borderRadius: '4px',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              ✓ Item added to cart successfully!
            </div>
          )}
        </div>
      </div>

      {/* Specifications Section */}
      <div className="product-specs" style={{ marginTop: '2rem' }}>
        <h3>📋 Specifications & Details</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          {product.specifications?.compatible_models?.length > 0 && (
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px'
            }}>
              <h4>📱 Compatible Models</h4>
              <p style={{ color: 'var(--muted)' }}>
                {product.specifications.compatible_models.join(', ')}
              </p>
            </div>
          )}
          {product.specifications?.color && (
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px'
            }}>
              <h4>🎨 Color</h4>
              <p style={{ color: 'var(--muted)' }}>
                {product.specifications.color}
              </p>
            </div>
          )}
          {product.specifications?.other && (
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px'
            }}>
              <h4>⚙️ Features</h4>
              <p style={{ color: 'var(--muted)' }}>
                {product.specifications.other}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

