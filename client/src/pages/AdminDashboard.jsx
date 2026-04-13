import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [restaurantsRes, usersRes, ordersRes] = await Promise.all([
        api.get('/api/restaurants'),
        api.get('/api/users'),
        api.get('/api/orders')
      ]);

      setRestaurants(restaurantsRes.data);
      // Handle paginated response from users endpoint
      setUsers(usersRes.data.users || usersRes.data);
      // Handle paginated response from orders endpoint
      setOrders(ordersRes.data.orders || ordersRes.data);

      const ordersData = ordersRes.data.orders || ordersRes.data;
      setStats({
        totalRestaurants: restaurantsRes.data.length,
        totalUsers: usersRes.data.total || (usersRes.data.users || usersRes.data).length,
        totalOrders: ordersRes.data.total || (ordersRes.data.orders || ordersRes.data).length,
        totalRevenue: ordersData.reduce((sum, o) => sum + o.total, 0)
      });
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    }
  };

  return (
    <div className="container" style={styles.container}>
      <h1 style={styles.title}>Admin Dashboard</h1>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div className="card" style={styles.statCard}>
          <div style={styles.statIcon}>🏪</div>
          <div style={styles.statValue}>{stats?.totalRestaurants || 0}</div>
          <div style={styles.statLabel}>Restaurants</div>
        </div>
        <div className="card" style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statValue}>{stats?.totalUsers || 0}</div>
          <div style={styles.statLabel}>Users</div>
        </div>
        <div className="card" style={styles.statCard}>
          <div style={styles.statIcon}>📦</div>
          <div style={styles.statValue}>{stats?.totalOrders || 0}</div>
          <div style={styles.statLabel}>Orders</div>
        </div>
        <div className="card" style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statValue}>₹{(stats?.totalRevenue || 0).toFixed(0)}</div>
          <div style={styles.statLabel}>Revenue</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{ ...styles.tab, ...(activeTab === 'orders' ? styles.activeTab : {}) }}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab('restaurants')}
          style={{ ...styles.tab, ...(activeTab === 'restaurants' ? styles.activeTab : {}) }}
        >
          Restaurants
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{ ...styles.tab, ...(activeTab === 'users' ? styles.activeTab : {}) }}
        >
          Users
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'orders' && (
        <div className="card" style={styles.tabContent}>
          <h2 style={styles.contentTitle}>Recent Orders</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Restaurant</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((order) => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-6)}</td>
                  <td>{order.customer?.name || 'N/A'}</td>
                  <td>{order.restaurant?.name || 'N/A'}</td>
                  <td>₹{order.total.toFixed(2)}</td>
                  <td>
                    <span style={{
                      ...styles.badge,
                      background: getStatusColor(order.status)
                    }}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'restaurants' && (
        <div className="card" style={styles.tabContent}>
          <h2 style={styles.contentTitle}>Registered Restaurants</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Cuisine</th>
                <th>Rating</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((r) => (
                <tr key={r._id}>
                  <td>{r.name}</td>
                  <td>{r.cuisine?.join(', ')}</td>
                  <td>⭐ {r.rating.toFixed(1)}</td>
                  <td>
                    <span style={{
                      ...styles.badge,
                      background: r.isOpen ? '#00b894' : '#d63031'
                    }}>
                      {r.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card" style={styles.tabContent}>
          <h2 style={styles.contentTitle}>Registered Users</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 20).map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span style={styles.roleBadge}>{u.role}</span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    pending: '#fdcb6e',
    confirmed: '#74b9ff',
    preparing: '#a29bfe',
    'out-for-delivery': '#00cec9',
    delivered: '#00b894',
    cancelled: '#d63031'
  };
  return colors[status] || '#636e72';
};

const styles = {
  container: {
    padding: '40px 20px'
  },
  title: {
    fontSize: '2rem',
    marginBottom: '30px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    padding: '25px',
    textAlign: 'center'
  },
  statIcon: {
    fontSize: '2.5rem',
    marginBottom: '10px'
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#ff6b35'
  },
  statLabel: {
    color: '#636e72',
    marginTop: '5px'
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  tab: {
    padding: '12px 24px',
    background: 'white',
    border: '2px solid #dfe6e9',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  activeTab: {
    background: '#ff6b35',
    color: 'white',
    borderColor: '#ff6b35'
  },
  tabContent: {
    padding: '20px'
  },
  contentTitle: {
    fontSize: '1.3rem',
    marginBottom: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    color: 'white',
    fontWeight: '600'
  },
  roleBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    background: '#f8f9fa',
    textTransform: 'capitalize'
  }
};

export default AdminDashboard;
