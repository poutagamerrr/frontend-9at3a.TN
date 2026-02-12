import React, { useEffect, useState } from 'react';
import api from '../../utils/api.js';

const AdminDashboard = () => {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    description: '',
    admin_price: '',
    vip_customer_price: '',
    customer_price: '',
    image: null,
    imagePreview: null,
  });
  const [imageError, setImageError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [prodRes, userRes, orderRes, analyticsRes] = await Promise.all([
        api.get('/products'),
        api.get('/users'),
        api.get('/orders'),
        api.get('/orders/analytics/summary'),
      ]);
      setProducts(prodRes.data);
      setUsers(userRes.data);
      setOrders(orderRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Admin load error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageError('');
    
    if (!file) {
      setNewProduct({ ...newProduct, image: null, imagePreview: null });
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError('Only JPG, PNG, and WebP images are allowed');
      e.target.value = '';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be less than 5MB');
      e.target.value = '';
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setNewProduct({
        ...newProduct,
        image: base64,
        imagePreview: base64,
      });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    
    if (!newProduct.image) {
      setImageError('Product image is required');
      return;
    }

    try {
      const payload = {
        name: newProduct.name,
        category: newProduct.category,
        description: newProduct.description,
        images: newProduct.image ? [newProduct.image] : [],
        pricing: {
          admin_price: Number(newProduct.admin_price),
          vip_customer_price: Number(newProduct.vip_customer_price),
          customer_price: Number(newProduct.customer_price),
        },
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setNewProduct({
        name: '',
        category: '',
        description: '',
        admin_price: '',
        vip_customer_price: '',
        customer_price: '',
        image: null,
        imagePreview: null,
      });
      setEditingId(null);
      setImageError('');
      loadAll();
    } catch (err) {
      console.error('Create product failed', err);
    }
  };

  const handleEditProduct = (product) => {
    setEditingId(product._id || product.id);
    setNewProduct({
      name: product.name || '',
      category: product.category || '',
      description: product.description || '',
      admin_price: product.pricing?.admin_price ?? '',
      vip_customer_price: product.pricing?.vip_customer_price ?? '',
      customer_price: product.pricing?.customer_price ?? '',
      image: null,
      imagePreview: null,
    });
    setTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (productId, productName) => {
    try {
      await api.delete(`/products/${productId}`);
      setMessage({
        type: 'success',
        text: `✓ Product "${productName}" deleted successfully`,
      });
      setDeleteConfirm(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      loadAll();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete product';
      setMessage({
        type: 'error',
        text: `✗ ${errorMsg}`,
      });
      setDeleteConfirm(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      console.error('Delete product failed', err);
    }
  };

  const handleMakeVip = async (userId) => {
    await api.put(`/users/${userId}/vip`, { specialClientCode: 'VIP' });
    loadAll();
  };

  const handleStatusChange = async (orderId, status) => {
    await api.put(`/orders/${orderId}/status`, { status });
    loadAll();
  };

  // compute total potential profit (if all stock is sold)
  const totalPotentialProfit = products.reduce((sum, p) => {
    const admin = p.pricing?.admin_price ?? 0;
    const customer = p.pricing?.customer_price ?? 0;
    const profitPerUnit = customer - admin;
    const qty = p.stockQuantity ?? p.stock ?? 0;
    return sum + profitPerUnit * qty;
  }, 0);

  return (
    <div className="page admin">
      <div className="section-header">
        <h2>Admin dashboard</h2>
      </div>
      <div className="tabs">
        <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>
          Products
        </button>
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>
          Users
        </button>
        <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>
          Orders & Analytics
        </button>
      </div>
      {loading && <p>Loading admin data...</p>}

      {!loading && tab === 'products' && (
        <div className="admin-section">
          {message.text && (
            <div
              style={{
                padding: '1rem',
                marginBottom: '1rem',
                borderRadius: '6px',
                backgroundColor:
                  message.type === 'success'
                    ? 'rgba(74, 222, 128, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                color: message.type === 'success' ? '#4ade80' : '#ef4444',
                border: `1px solid ${
                  message.type === 'success'
                    ? 'rgba(74, 222, 128, 0.3)'
                    : 'rgba(239, 68, 68, 0.3)'
                }`,
              }}
            >
              {message.text}
            </div>
          )}
          <form className="card inline-form" onSubmit={handleCreateProduct}>
            <h3>Create product</h3>
            <div className="inline-grid">
              <label>
                Name
                <input
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </label>
              <label>
                Category
                <input
                  required
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                />
              </label>
              <label>
                Description
                <input
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </label>
              <label>
                Admin price
                <input
                  type="number"
                  required
                  value={newProduct.admin_price}
                  onChange={(e) => setNewProduct({ ...newProduct, admin_price: e.target.value })}
                />
              </label>
              <label>
                VIP price
                <input
                  type="number"
                  required
                  value={newProduct.vip_customer_price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, vip_customer_price: e.target.value })
                  }
                />
              </label>
              <label>
                Customer price
                <input
                  type="number"
                  required
                  value={newProduct.customer_price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, customer_price: e.target.value })
                  }
                />
              </label>
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <strong>Product Image *</strong>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: '#020617',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    color: 'var(--text)',
                    cursor: 'pointer',
                  }}
                />
                {imageError && (
                  <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>🚫 {imageError}</span>
                )}
              </label>
              
              {newProduct.imagePreview && (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Image Preview:</p>
                  <img
                    src={newProduct.imagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: '150px',
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                    }}
                  />
                </div>
              )}
            </div>

            <button className="btn primary" type="submit" style={{ marginTop: '1rem' }}>
              Save
            </button>
          </form>

          <h3>Existing products</h3>
          <div className="admin-products-wrap">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Cost Price</th>
                  <th>Selling Price</th>
                  <th>VIP Price</th>
                  <th>Stock Quantity</th>
                  <th>Profit</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const admin = p.pricing?.admin_price ?? 0;
                  const customer = p.pricing?.customer_price ?? 0;
                  const profit = customer - admin;
                  const qty = p.stockQuantity ?? p.stock ?? 0;
                  return (
                    <tr key={p._id || p.id}>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td>{admin} TND</td>
                      <td>{customer} TND</td>
                      <td>{p.pricing?.vip_customer_price ?? '-'} TND</td>
                      <td>{qty}</td>
                      <td style={{ color: profit >= 0 ? 'var(--muted)' : 'var(--danger)', fontWeight: 700 }}>
                        {profit} TND
                      </td>
                      <td>
                        <div className="admin-products-actions">
                          <button className="btn ghost" onClick={() => handleEditProduct(p)}>
                            ✏️ Edit
                          </button>
                          <button className="btn ghost" onClick={() => setDeleteConfirm({ id: p._id || p.id, name: p.name })}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="admin-products-total" style={{ padding: '0.75rem' }}>
              <div>
                Total potential profit if all stock sold:
              </div>
              <div>{totalPotentialProfit} TND</div>
            </div>
          </div>
        </div>
      )}

      {!loading && tab === 'users' && (
        <div className="admin-section">
          <h3>Users</h3>
          <div className="grid">
            {users.map((u) => (
              <div key={u._id} className="card">
                <h3>{u.name}</h3>
                <p>{u.email}</p>
                <p>
                  Role: <strong>{u.userType}</strong>
                </p>
                <p>VIP code: {u.specialClientCode || '-'}</p>
                {u.userType !== 'admin' && (
                  <button className="btn primary" onClick={() => handleMakeVip(u._id)}>
                    Make VIP
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && tab === 'orders' && (
        <div className="admin-section">
          <h3>Orders</h3>
          <div className="orders-list">
            {orders.map((o) => (
              <div key={o._id} className="card order-card">
                <div className="order-header">
                  <span>#{o._id.slice(-6)}</span>
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o._id, e.target.value)}
                  >
                    <option value="pending">pending</option>
                    <option value="processing">processing</option>
                    <option value="shipped">shipped</option>
                    <option value="delivered">delivered</option>
                  </select>
                </div>

                {o.user && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Client:</strong> {o.user.name} — <span style={{ color: 'var(--muted)' }}>{o.user.email}</span>
                  </div>
                )}

                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Items:</strong>
                  <ul style={{ marginTop: '0.5rem' }}>
                    {o.products.map((it, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>
                        {it.product?.name || 'Product'} x {it.quantity} — {it.priceAtPurchase} TND
                      </li>
                    ))}
                  </ul>
                </div>

                <p>
                  Total: <strong>{o.totalPrice} TND</strong>
                </p>
                <p>
                  Tier: <strong>{o.userType_at_purchase}</strong>
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  Ordered: {new Date(o.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <h3>Sales analytics</h3>
          {analytics && (
            <div className="card">
              <p>
                Total sales: <strong>{analytics.totalSales} TND</strong>
              </p>
              <p>
                Orders: <strong>{analytics.ordersCount}</strong>
              </p>
              <ul>
                {Object.entries(analytics.byStatus).map(([status, count]) => (
                  <li key={status}>
                    {status}: <strong>{count}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {deleteConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '2rem',
              maxWidth: '400px',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>🗑️ Delete Product?</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                className="btn ghost"
                onClick={() => setDeleteConfirm(null)}
                style={{ padding: '0.7rem 1.5rem' }}
              >
                Cancel
              </button>
              <button
                className="btn primary"
                onClick={() => handleDeleteProduct(deleteConfirm.id, deleteConfirm.name)}
                style={{
                  padding: '0.7rem 1.5rem',
                  backgroundColor: '#dc2626',
                  backgroundImage: 'linear-gradient(to right, #dc2626, #b91c1c)',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

