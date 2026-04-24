import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [stats, setStats] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliveryAgents, setDeliveryAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setError('');

    const [restaurantsResult, usersResult, ordersResult, deliveryAgentsResult] = await Promise.allSettled([
      api.get('/api/restaurants'),
      api.get('/api/users'),
      api.get('/api/orders'),
      api.get('/api/users?role=delivery')
    ]);

    const restaurantsData = restaurantsResult.status === 'fulfilled'
      ? (restaurantsResult.value.data.restaurants || [])
      : [];
    const usersData = usersResult.status === 'fulfilled'
      ? (usersResult.value.data.users || [])
      : [];
    const ordersData = ordersResult.status === 'fulfilled'
      ? (ordersResult.value.data.orders || [])
      : [];
    const deliveryAgentsData = deliveryAgentsResult.status === 'fulfilled'
      ? (deliveryAgentsResult.value.data.users || [])
      : [];

    setRestaurants(restaurantsData);
    setUsers(usersData);
    setOrders(ordersData);
    setDeliveryAgents(deliveryAgentsData);
    setSelectedAgents(
      Object.fromEntries(
        ordersData.map((order) => [order._id, order.deliveryAgent?._id || ''])
      )
    );
    setStats({
      totalRestaurants: restaurantsResult.status === 'fulfilled'
        ? (restaurantsResult.value.data.total || restaurantsData.length)
        : restaurantsData.length,
      totalUsers: usersResult.status === 'fulfilled'
        ? (usersResult.value.data.total || usersData.length)
        : usersData.length,
      totalOrders: ordersResult.status === 'fulfilled'
        ? (ordersResult.value.data.total || ordersData.length)
        : ordersData.length,
      totalRevenue: ordersData.reduce((sum, order) => sum + order.total, 0)
    });

    const failures = [
      ['restaurants', restaurantsResult],
      ['users', usersResult],
      ['orders', ordersResult],
      ['delivery agents', deliveryAgentsResult]
    ].filter(([, result]) => result.status === 'rejected');

    if (failures.length > 0) {
      console.error('Admin dashboard partial load failure', failures);
      setError(`Some admin data failed to load: ${failures.map(([name]) => name).join(', ')}`);
    }
  };

  const handleAssignDeliveryAgent = async (orderId) => {
    const agentId = selectedAgents[orderId];
    if (!agentId) {
      alert('Please select a delivery agent first.');
      return;
    }

    try {
      await api.put(`/api/admin/orders/${orderId}/assign`, { agentId });
      fetchDashboardData();
    } catch (err) {
      alert(`Failed to assign delivery agent: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="container" style={styles.container}>
      <h1 style={styles.title}>Admin Dashboard</h1>
      {error ? <p style={styles.error}>{error}</p> : null}

      <div style={styles.statsGrid}>
        <div className="card" style={styles.statCard}>
          <div style={styles.statIcon}>{'\uD83C\uDFEA'}</div>
          <div style={styles.statValue}>{stats?.totalRestaurants || 0}</div>
          <div style={styles.statLabel}>Restaurants</div>
        </div>
        <div className="card" style={styles.statCard}>
          <div style={styles.statIcon}>{'\uD83D\uDC65'}</div>
          <div style={styles.statValue}>{stats?.totalUsers || 0}</div>
          <div style={styles.statLabel}>Users</div>
        </div>
        <div className="card" style={styles.statCard}>
          <div style={styles.statIcon}>{'\uD83D\uDCE6'}</div>
          <div style={styles.statValue}>{stats?.totalOrders || 0}</div>
          <div style={styles.statLabel}>Orders</div>
        </div>
        <div className="card" style={styles.statCard}>
          <div style={styles.statIcon}>{'\uD83D\uDCB0'}</div>
          <div style={styles.statValue}>{'\u20B9'}{(stats?.totalRevenue || 0).toFixed(0)}</div>
          <div style={styles.statLabel}>Revenue</div>
        </div>
      </div>

      <div style={styles.tabs}>
        <button onClick={() => setActiveTab('orders')} style={{ ...styles.tab, ...(activeTab === 'orders' ? styles.activeTab : {}) }}>Orders</button>
        <button onClick={() => setActiveTab('restaurants')} style={{ ...styles.tab, ...(activeTab === 'restaurants' ? styles.activeTab : {}) }}>Restaurants</button>
        <button onClick={() => setActiveTab('users')} style={{ ...styles.tab, ...(activeTab === 'users' ? styles.activeTab : {}) }}>Users</button>
      </div>

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
                <th>Delivery Agent</th>
                <th>Assign</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((order) => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-6)}</td>
                  <td>{order.customer?.name || 'N/A'}</td>
                  <td>{order.restaurant?.name || 'N/A'}</td>
                  <td>{'\u20B9'}{order.total.toFixed(2)}</td>
                  <td><span style={{ ...styles.badge, background: getStatusColor(order.status) }}>{order.status}</span></td>
                  <td>{order.deliveryAgent?.name || 'Unassigned'}</td>
                  <td>
                    <div style={styles.assignControls}>
                      <select
                        value={selectedAgents[order._id] || ''}
                        onChange={(event) => setSelectedAgents((current) => ({
                          ...current,
                          [order._id]: event.target.value
                        }))}
                        style={styles.select}
                      >
                        <option value="">Select agent</option>
                        {deliveryAgents.map((agent) => (
                          <option key={agent._id} value={agent._id}>{agent.name}</option>
                        ))}
                      </select>
                      <button style={styles.assignBtn} onClick={() => handleAssignDeliveryAgent(order._id)}>
                        Assign
                      </button>
                    </div>
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
              {restaurants.map((restaurant) => (
                <tr key={restaurant._id}>
                  <td>{restaurant.name}</td>
                  <td>{restaurant.cuisine?.join(', ')}</td>
                  <td>{`\u2605 ${restaurant.rating.toFixed(1)}`}</td>
                  <td><span style={{ ...styles.badge, background: restaurant.isOpen ? '#00b894' : '#d63031' }}>{restaurant.isOpen ? 'Open' : 'Closed'}</span></td>
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
              {users.slice(0, 20).map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td><span style={styles.roleBadge}>{user.role}</span></td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const getStatusColor = (status) => ({
  pending: '#fdcb6e',
  confirmed: '#74b9ff',
  preparing: '#a29bfe',
  'out-for-delivery': '#00cec9',
  delivered: '#00b894',
  cancelled: '#d63031'
}[status] || '#636e72');

const styles = {
  container: { padding: '40px 20px' },
  title: { fontSize: '2rem', marginBottom: '30px' },
  error: { color: '#d63031', marginBottom: '16px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
  statCard: { padding: '25px', textAlign: 'center' },
  statIcon: { fontSize: '2.5rem', marginBottom: '10px' },
  statValue: { fontSize: '2rem', fontWeight: 'bold', color: '#ff6b35' },
  statLabel: { color: '#636e72', marginTop: '5px' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
  tab: { padding: '12px 24px', background: 'white', border: '2px solid #dfe6e9', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s' },
  activeTab: { background: '#ff6b35', color: 'white', borderColor: '#ff6b35' },
  tabContent: { padding: '20px' },
  contentTitle: { fontSize: '1.3rem', marginBottom: '20px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  assignControls: { display: 'flex', gap: '8px', alignItems: 'center' },
  select: { padding: '6px 10px', border: '1px solid #dfe6e9', borderRadius: '6px' },
  assignBtn: { padding: '6px 10px', border: 'none', borderRadius: '6px', background: '#ff6b35', color: 'white', cursor: 'pointer' },
  badge: { padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', color: 'white', fontWeight: '600' },
  roleBadge: { padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', background: '#f8f9fa', textTransform: 'capitalize' }
};

export default AdminDashboard;
