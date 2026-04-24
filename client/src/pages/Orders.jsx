import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders/customer/myorders');
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => ({
    pending: '#fdcb6e',
    confirmed: '#74b9ff',
    preparing: '#a29bfe',
    'out-for-delivery': '#00cec9',
    delivered: '#00b894',
    cancelled: '#d63031'
  }[status] || '#636e72');

  const getStatusIcon = (status) => ({
    pending: '📝',
    confirmed: '✅',
    preparing: '👨‍🍳',
    'out-for-delivery': '🚚',
    delivered: '✅',
    cancelled: '❌'
  }[status] || '📦');

  if (loading) {
    return <div className="container" style={styles.loading}>Loading orders...</div>;
  }

  return (
    <div className="container" style={styles.container}>
      <h1 style={styles.title}>My Orders</h1>

      {orders.length === 0 ? (
        <div style={styles.empty}>
          <p>You haven't placed any orders yet</p>
        </div>
      ) : (
        <div style={styles.ordersList}>
          {orders.map((order) => (
            <div
              key={order._id}
              className="card"
              style={styles.orderCard}
              onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
            >
              <div style={styles.orderHeader}>
                <div style={styles.orderInfo}>
                  <h3 style={styles.restaurantName}>{order.restaurant?.name}</h3>
                  <span style={styles.orderId}>Order #{order._id.slice(-6)}</span>
                </div>
                <span style={{ ...styles.statusBadge, background: getStatusColor(order.status) }}>
                  {getStatusIcon(order.status)} {order.status.replace('-', ' ')}
                </span>
              </div>

              <div style={styles.orderDetails}>
                <div style={styles.detailRow}>
                  <span style={styles.label}>Date:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.label}>Total:</span>
                  <span style={styles.total}>₹{order.total.toFixed(2)}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.label}>Items:</span>
                  <span>{order.items.length} item(s)</span>
                </div>
              </div>

              {selectedOrder?._id === order._id && (
                <div style={styles.expandedDetails}>
                  <h4 style={styles.itemsTitle}>Order Items:</h4>
                  {order.items.map((item, index) => (
                    <div key={index} style={styles.expandedItem}>
                      <span>{item.name} x {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}

                  {order.deliveryAddress && (
                    <div style={styles.addressSection}>
                      <h4>Delivery Address:</h4>
                      <p>
                        {order.deliveryAddress.street}, {order.deliveryAddress.city},
                        {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '40px 20px' },
  title: { fontSize: '2rem', marginBottom: '30px' },
  loading: { padding: '60px', textAlign: 'center' },
  empty: { textAlign: 'center', padding: '60px', color: '#636e72' },
  ordersList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  orderCard: { padding: '20px', cursor: 'pointer', transition: 'box-shadow 0.3s' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  orderInfo: { flex: 1 },
  restaurantName: { fontSize: '1.2rem', marginBottom: '5px' },
  orderId: { color: '#636e72', fontSize: '0.85rem' },
  statusBadge: { padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', color: 'white' },
  orderDetails: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', padding: '15px 0', borderTop: '1px solid #dfe6e9' },
  detailRow: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { color: '#636e72', fontSize: '0.85rem' },
  total: { fontWeight: 'bold', color: '#ff6b35', fontSize: '1.1rem' },
  expandedDetails: { marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #dfe6e9' },
  itemsTitle: { fontSize: '1rem', marginBottom: '10px' },
  expandedItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.9rem' },
  addressSection: { marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #dfe6e9' }
};

export default Orders;
