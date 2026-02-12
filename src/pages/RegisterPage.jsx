import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../store/slices/authSlice.js';



const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [specialClientCode, setSpecialClientCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(register({ name, email, phone, password, adminCode, specialClientCode }));
    if (!result.error) {
      navigate('/');
    }
  };

  return (
    <div className="page auth">
      <div className="card auth-card">
        <h2>Create account</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input required value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label>
            Admin registration code (optional)
            <input value={adminCode} onChange={(e) => setAdminCode(e.target.value)} />
          </label>
          <label>
            VIP client code (optional)
            <input
              value={specialClientCode}
              onChange={(e) => setSpecialClientCode(e.target.value)}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>
        <p className="muted">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

