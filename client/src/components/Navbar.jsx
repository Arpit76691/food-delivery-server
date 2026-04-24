import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.navbar}>
      <div className="container" style={styles.container}>
        <Link to="/" style={styles.logo}>
          🍔 FoodHub
        </Link>

        <div style={styles.links}>
          <Link to="/restaurants" style={styles.link}>Restaurants</Link>

          {isAuthenticated ? (
            <>
              {user.role === 'customer' && (
                <Link to="/cart" style={styles.link}>
                  🛒 Cart
                </Link>
              )}

              {user.role === 'customer' && (
                <Link to="/orders" style={styles.link}>
                  My Orders
                </Link>
              )}

              {user.role === 'admin' && (
                <Link to="/admin" style={styles.link}>
                  Dashboard
                </Link>
              )}

              {user.role === 'restaurant' && (
                <Link to="/restaurant-dashboard" style={styles.link}>
                  Restaurant Dashboard
                </Link>
              )}

              {user.role === 'delivery' && (
                <Link to="/delivery-dashboard" style={styles.link}>
                  Delivery Dashboard
                </Link>
              )}

              <span style={styles.userName}>Hi, {user.name}</span>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register" style={styles.btn}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    background: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '1rem 0',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#ff6b35'
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  link: {
    color: '#2d3436',
    fontSize: '1rem',
    transition: 'color 0.3s'
  },
  userName: {
    color: '#636e72'
  },
  logoutBtn: {
    background: 'transparent',
    color: '#d63031',
    border: '2px solid #d63031',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '600'
  },
  btn: {
    background: '#ff6b35',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '600'
  }
};

export default Navbar;
