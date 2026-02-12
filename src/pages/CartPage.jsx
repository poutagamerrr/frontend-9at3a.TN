import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchCart, updateCartItem, removeCartItem } from '../store/slices/cartSlice.js';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, loading } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const computePrice = (product) => {
    if (!product?.pricing) return 0;
    if (user?.userType === 'admin') return product.pricing.admin_price;
    if (user?.userType === 'vip_customer') return product.pricing.vip_customer_price;
    return product.pricing.customer_price;
  };

  const items = cart?.products || [];
  const total = items.reduce((sum, item) => {
    const price = computePrice(item.product);
    return sum + price * item.quantity;
  }, 0);

  const handleQtyChange = (productId, qty) => {
    dispatch(updateCartItem({ productId, quantity: Number(qty) }));
  };

  const handleRemove = (productId) => {
    dispatch(removeCartItem(productId));
  };

  if (loading) {
    return (
      <div className="page">
        <p>Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="section-header">
        <h2>Your Cart</h2>
      </div>
      {items.length === 0 ? (
        <p>
          Your cart is empty. <Link to="/products">Browse products</Link>
        </p>
      ) : (
        <div className="cart-layout">
          <div className="cards-grid cart-items">
            {items.map((item) => (
              <div key={item.product._id} className="card cart-item">
                <div className="cart-item-info">
                  <h3>{item.product.name}</h3>
                  <p>{item.product.category}</p>
                  <p className="price">{computePrice(item.product)} TND</p>
                </div>
                <div className="cart-item-actions">
                  <label>
                    Qty
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQtyChange(item.product._id, e.target.value)}
                    />
                  </label>
                  <button className="btn ghost" onClick={() => handleRemove(item.product._id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <aside className="cart-summary card">
            <h3>Summary</h3>
            <p>
              Items: <strong>{items.length}</strong>
            </p>
            <p>
              Total: <strong>{total} TND</strong>
            </p>
            <button className="btn primary" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
          </aside>
        </div>
      )}
    </div>
  );
};

export default CartPage;

