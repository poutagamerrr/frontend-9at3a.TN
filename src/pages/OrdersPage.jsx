import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../store/slices/orderSlice.js';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <div className="page">
      <div className="section-header">
        <h2>Your orders</h2>
      </div>
      {loading && <p>Loading orders...</p>}
      {!loading && items.length === 0 && <p>No orders yet.</p>}
      <div className="cards-grid orders-list">
        {items.map((o) => (
          <div key={o._id} className="card order-card">
            <div className="order-header">
              <span>#{o._id.slice(-6)}</span>
              <span className={`status ${o.status}`}>{o.status}</span>
            </div>
            <p>
              Total: <strong>{o.totalPrice} TND</strong>
            </p>
            <p>
              Price tier: <strong>{o.userType_at_purchase}</strong>
            </p>
            <p className="muted">
              {new Date(o.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;

