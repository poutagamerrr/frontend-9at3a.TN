import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { adminLogin, login } from '../store/slices/authSlice.js';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [asAdmin, setAsAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const thunk = asAdmin ? adminLogin : login;
    const payload = asAdmin ? { email, password, adminCode } : { email, password };
    const result = await dispatch(thunk(payload));
    if (!result.error) {
      navigate('/');
    }
  };

  return (
    <div className="page auth">
      <div className="card auth-card">
        <h2>Login</h2>
        <label className="toggle">
          <input type="checkbox" checked={asAdmin} onChange={(e) => setAsAdmin(e.target.checked)} />
          <span>Login as admin</span>
        </label>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {asAdmin && (
            <label>
              Admin code
              <input
                type="password"
                required
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
              />
            </label>
          )}
          {error && <p className="error">{error}</p>}
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="muted">
          No account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

