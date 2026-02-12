import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice.js';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isVip = user?.userType === 'vip_customer';

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="logo">
          9at3a.<span>TN</span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/cart">Cart</NavLink>
          <NavLink to="/orders">Orders</NavLink>
          {user?.userType === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <div className="auth-section">
          {user ? (
            <>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className={`badge ${user.userType}`}>
                  {user.userType === 'admin' && 'Admin'}
                  {user.userType === 'customer' && 'Customer'}
                  {user.userType === 'vip_customer' && 'VIP'}
                </span>
              </div>
              {isVip && <span className="vip-tag">VIP Support 24/7</span>}
              <button className="btn ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn ghost" to="/login">
                Login
              </Link>
              <Link className="btn primary" to="/register">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} 9at3a.TN – Premium phone parts in Tunisia.</p>
      </footer>
    </div>
  );
};

export default Layout;

