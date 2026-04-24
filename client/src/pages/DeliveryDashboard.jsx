import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const fetchAssignedOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/orders/delivery/myorders');
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to fetch delivery orders', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      await api.put(`/api/orders/${orderId}/status`, { status });
      fetchAssignedOrders();
    } catch (error) {
      alert(`Failed to update order: ${error.response?.data?.message || 'Unknown error'}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const activeOrders = orders.filter((order) => !['delivered', 'cancelled'].includes(order.status));
  const deliveredOrders = orders.filter((order) => order.status === 'delivered');

  if (loading) {
    return <div className="container" style={styles.loading}>Loading delivery dashboard...</div>;
  }

  return (
    <div className="container" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Delivery Dashboard</h1>
        <p style={styles.subtitle}>View and update your assigned deliveries</p>
      </div>

      <div style={styles.statsGrid}>
        <StatCard icon="🚚" value={orders.length} label="Assigned" />
        <StatCard icon="⏳" value={activeOrders.length} label="Active" />
        <StatCard icon="✅" value={deliveredOrders.length} label="Delivered" />
      </div>

      {orders.length === 0 ? (
        <div className="card" style={styles.emptyState}>No assigned orders yet.</div>
      ) : (
        <div style={styles.ordersList}>
          {orders.map((order) => (
            <div key={order._id} className="card" style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <div>
                  <div style={styles.orderId}>Order #{order._id.slice(-6)}</div>
                  <div style={styles.orderMeta}>
                    {order.restaurant?.name || 'Restaurant'} • {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
                <span style={{ ...styles.badge, background: getStatusColor(order.status) }}>{order.status}</span>
              </div>

              <div style={styles.section}>
                <strong>Customer:</strong> {order.customer?.name || 'N/A'}
                {order.customer?.phone ? ` • ${order.customer.phone}` : ''}
              </div>

              <div style={styles.section}>
                <strong>Delivery Address:</strong> {formatAddress(order.deliveryAddress)}
              </div>

              <div style={styles.section}>
                <strong>Items:</strong>
                <ul style={styles.itemsList}>
                  {order.items.map((item, index) => (
                    <li key={`${order._id}-${index}`}>{item.quantity}x {item.name}</li>
                  ))}
                </ul>
              </div>

              <div style={styles.footer}>
                <span style={styles.total}>₹{order.total?.toFixed(2) || '0.00'}</span>
                <div style={styles.actions}>
                  {order.status !== 'out-for-delivery' && order.status !== 'delivered' ? (
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleStatusUpdate(order._id, 'out-for-delivery')}
                      disabled={updatingOrderId === order._id}
                    >
                      Mark Out for Delivery
                    </button>
                  ) : null}
                  {order.status !== 'delivered' ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleStatusUpdate(order._id, 'delivered')}
                      disabled={updatingOrderId === order._id}
                    >
                      Mark Delivered
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, value, label }) => (
  <div className="card" style={styles.statCard}>
    <div style={styles.statIcon}>{icon}</div>
    <div style={styles.statValue}>{value}</div>
    <div style={styles.statLabel}>{label}</div>
  </div>
);

const formatAddress = (address) => {
  if (!address) return 'N/A';
  return [address.street, address.city, address.state, address.zipCode].filter(Boolean).join(', ');
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
  container: { padding: '40px 20px', paddingBottom: '60px' },
  loading: { padding: '60px', textAlign: 'center' },
  header: { marginBottom: '30px' },
  title: { fontSize: '2rem', marginBottom: '6px' },
  subtitle: { color: '#636e72' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px' },
  statCard: { padding: '20px', textAlign: 'center' },
  statIcon: { fontSize: '2rem', marginBottom: '8px' },
  statValue: { fontSize: '1.8rem', fontWeight: 'bold', color: '#ff6b35' },
  statLabel: { color: '#636e72' },
  emptyState: { padding: '30px', textAlign: 'center', color: '#636e72' },
  ordersList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  orderCard: { padding: '20px' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  orderId: { fontWeight: 'bold', fontSize: '1.1rem' },
  orderMeta: { color: '#636e72', fontSize: '0.9rem', marginTop: '4px' },
  badge: { padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', color: 'white', fontWeight: '600', textTransform: 'capitalize' },
  section: { marginBottom: '12px' },
  itemsList: { margin: '8px 0 0 18px' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #dfe6e9', paddingTop: '15px', marginTop: '16px' },
  total: { fontWeight: 'bold', color: '#ff6b35', fontSize: '1.1rem' },
  actions: { display: 'flex', gap: '10px', flexWrap: 'wrap' }
};

export default DeliveryDashboard;
