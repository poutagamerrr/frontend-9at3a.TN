import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCart } from '../store/slices/cartSlice.js';
import { createOrder } from '../store/slices/orderSlice.js';
import { fetchProducts } from '../store/slices/productSlice.js';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate stock availability before creating order
    for (const item of items) {
      const available = item.product?.stockQuantity ?? 0;
      if (available < item.quantity) {
        alert(`Not enough stock for ${item.product?.name || 'an item'}. Available: ${available}`);
        return;
      }
    }

    const resultAction = await dispatch(createOrder({ shippingAddress, paymentMethod }));
    if (createOrder.fulfilled.match(resultAction)) {
      // refresh products and cart so stock and UI reflect the purchase
      dispatch(fetchProducts());
      dispatch(fetchCart());
      navigate('/orders');
    }
  };

  return (
    <div className="page checkout">
      <div className="section-header">
        <h2>Checkout</h2>
      </div>
      <div className="checkout-layout">
        <form className="card checkout-form" onSubmit={handleSubmit}>
          <label>
            Shipping address
            <textarea
              required
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
            />
          </label>
          <label>
            Payment method
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="cash_on_delivery">Cash on delivery</option>
              <option value="bank_transfer">Bank transfer</option>
            </select>
          </label>
          <button className="btn primary" type="submit" disabled={items.length === 0}>
            Confirm Order
          </button>
        </form>
        <aside className="card order-summary">
          <h3>Order summary</h3>
          {items.map((item) => (
            <div key={item.product._id} className="summary-item">
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <span>{computePrice(item.product) * item.quantity} TND</span>
            </div>
          ))}
          <hr />
          <p>
            Total: <strong>{total} TND</strong>
          </p>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;

