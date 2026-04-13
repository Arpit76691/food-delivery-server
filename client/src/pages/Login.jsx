import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="card" style={styles.card}>
        <h1 style={styles.title}>Welcome Back!</h1>
        <p style={styles.subtitle}>Login to continue ordering</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={styles.btn} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account? <Link to="/register" style={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  card: {
    maxWidth: '400px',
    width: '100%',
    padding: '40px'
  },
  title: {
    fontSize: '1.8rem',
    textAlign: 'center',
    marginBottom: '10px',
    color: '#2d3436'
  },
  subtitle: {
    textAlign: 'center',
    color: '#636e72',
    marginBottom: '30px'
  },
  error: {
    background: '#ffebee',
    color: '#d63031',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  btn: {
    width: '100%',
    marginTop: '10px'
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#636e72'
  },
  link: {
    color: '#ff6b35',
    fontWeight: '600'
  }
};

export default Login;
