import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const RestaurantDashboard = () => {
  const { user, isRestaurant } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);

  // Menu form state
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'main',
    isVegetarian: false,
    image: ''
  });

  // Restaurant form state
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    description: '',
    cuisine: [],
    deliveryTime: '',
    priceRange: '',
    image: ''
  });

  useEffect(() => {
    if (!isRestaurant) {
      return;
    }
    fetchDashboardData();
  }, [isRestaurant]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Get restaurant details
      const restaurantRes = await api.get(`/api/restaurants?owner=${user._id}`);
      const restaurantData = restaurantRes.data[0] || restaurantRes.data;
      setRestaurant(restaurantData);
      setRestaurantForm({
        name: restaurantData.name || '',
        description: restaurantData.description || '',
        cuisine: restaurantData.cuisine || [],
        deliveryTime: restaurantData.deliveryTime || '',
        priceRange: restaurantData.priceRange || '',
        image: restaurantData.image || ''
      });

      // Get menu items
      const menuRes = await api.get(`/api/menu?restaurant=${restaurantData._id}`);
      setMenuItems(menuRes.data);

      // Get restaurant orders
      const ordersRes = await api.get(`/api/orders/restaurant/${restaurantData._id}`);
      setOrders(ordersRes.data);

      // Calculate stats
      const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const completedOrders = orders.filter(o => o.status === 'delivered').length;

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        completedOrders,
        totalMenuItems: menuItems.length
      });
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        ...menuForm,
        price: parseFloat(menuForm.price),
        restaurant: restaurant._id
      };

      if (editingItem) {
        await api.put(`/api/menu/${editingItem._id}`, formData);
      } else {
        await api.post('/api/menu', formData);
      }

      fetchDashboardData();
      resetMenuForm();
    } catch (err) {
      alert('Failed to save menu item: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/api/menu/${itemId}`);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to delete menu item');
    }
  };

  const handleEditMenuItem = (item) => {
    setEditingItem(item);
    setMenuForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      isVegetarian: item.isVegetarian,
      image: item.image
    });
    setShowMenuForm(true);
  };

  const resetMenuForm = () => {
    setMenuForm({
      name: '',
      description: '',
      price: '',
      category: 'main',
      isVegetarian: false,
      image: ''
    });
    setEditingItem(null);
    setShowMenuForm(false);
  };

  const handleRestaurantUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/restaurants/${restaurant._id}`, restaurantForm);
      alert('Restaurant updated successfully!');
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update restaurant: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      alert('Order status updated!');
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const handleCuisineChange = (cuisineType) => {
    if (restaurantForm.cuisine.includes(cuisineType)) {
      setRestaurantForm({
        ...restaurantForm,
        cuisine: restaurantForm.cuisine.filter(c => c !== cuisineType)
      });
    } else {
      setRestaurantForm({
        ...restaurantForm,
        cuisine: [...restaurantForm.cuisine, cuisineType]
      });
    }
  };

  const cuisineOptions = ['Italian', 'Chinese', 'Indian', 'Mexican', 'American', 'Thai', 'Japanese', 'Mediterranean'];

  if (loading) {
    return (
      <div className="container" style={styles.loading}>
        <div className="spinner">Loading dashboard...</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container" style={styles.setupContainer}>
        <h1 style={styles.title}>Set Up Your Restaurant</h1>
        <p style={styles.subtitle}>Create your restaurant profile to start receiving orders</p>
        <form onSubmit={handleRestaurantUpdate} style={styles.setupForm}>
          <div className="input-group">
            <label>Restaurant Name</label>
            <input
              type="text"
              value={restaurantForm.name}
              onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
              placeholder="Enter restaurant name"
              required
            />
          </div>
          <div className="input-group">
            <label>Description</label>
            <textarea
              value={restaurantForm.description}
              onChange={(e) => setRestaurantForm({ ...restaurantForm, description: e.target.value })}
              placeholder="Describe your restaurant"
              rows="3"
              required
            />
          </div>
          <div className="input-group">
            <label>Cuisine Types</label>
            <div style={styles.cuisineGrid}>
              {cuisineOptions.map((cuisine) => (
                <label key={cuisine} style={styles.cuisineCheckbox}>
                  <input
                    type="checkbox"
                    checked={restaurantForm.cuisine.includes(cuisine)}
                    onChange={() => handleCuisineChange(cuisine)}
                  />
                  {cuisine}
                </label>
              ))}
            </div>
          </div>
          <div style={styles.row}>
            <div className="input-group">
              <label>Delivery Time</label>
              <input
                type="text"
                value={restaurantForm.deliveryTime}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, deliveryTime: e.target.value })}
                placeholder="e.g., 30-40 mins"
                required
              />
            </div>
            <div className="input-group">
              <label>Price Range</label>
              <select
                value={restaurantForm.priceRange}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, priceRange: e.target.value })}
                required
              >
                <option value="">Select</option>
                <option value="₹">₹ - Budget Friendly</option>
                <option value="₹₹">₹₹ - Moderate</option>
                <option value="₹₹₹">₹₹₹ - Expensive</option>
                <option value="₹₹₹₹">₹₹₹₹ - Fine Dining</option>
              </select>
            </div>
          </div>
          <div className="input-group">
            <label>Restaurant Image URL</label>
            <input
              type="url"
              value={restaurantForm.image}
              onChange={(e) => setRestaurantForm({ ...restaurantForm, image: e.target.value })}
              placeholder="https://example.com/restaurant.jpg"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={styles.submitBtn}>
            Create Restaurant
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{restaurant.name}</h1>
          <p style={styles.subtitle}>Restaurant Owner Dashboard</p>
        </div>
        <button
          onClick={() => setActiveTab('menu')}
          className="btn btn-primary"
          style={styles.addMenuBtn}
        >
          + Add Menu Item
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div className="card" style={styles.statCard}>
          <div style={styles.statIcon}>📦</div>
          <div style={styles.statValue}>{stats?.totalOrders || 0}</div>
          <div style={styles.statLabel}>Total Orders</div>
        </div>
        <div className="card" style={styles.statCard}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statValue}>{stats?.pendingOrders || 0}</div>
          <div style={styles.statLabel}>Pending Orders</div>
        </div>
        <div className="card" style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statValue}>{stats?.completedOrders || 0}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div className="card" style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statValue}>₹{(stats?.totalRevenue || 0).toFixed(0)}</div>
          <div style={styles.statLabel}>Total Revenue</div>
        </div>
        <div className="card" style={styles.statCard}>
          <div style={styles.statIcon}>🍽️</div>
          <div style={styles.statValue}>{stats?.totalMenuItems || 0}</div>
          <div style={styles.statLabel}>Menu Items</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{ ...styles.tab, ...(activeTab === 'overview' ? styles.activeTab : {}) }}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{ ...styles.tab, ...(activeTab === 'orders' ? styles.activeTab : {}) }}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          style={{ ...styles.tab, ...(activeTab === 'menu' ? styles.activeTab : {}) }}
        >
          Menu
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          style={{ ...styles.tab, ...(activeTab === 'settings' ? styles.activeTab : {}) }}
        >
          Settings
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="card" style={styles.tabContent}>
          <h2 style={styles.contentTitle}>Recent Activity</h2>
          {orders.length === 0 ? (
            <p style={styles.empty}>No orders yet. Start by adding menu items!</p>
          ) : (
            <div style={styles.recentOrders}>
              {orders.slice(0, 5).map((order) => (
                <div key={order._id} style={styles.orderCard}>
                  <div style={styles.orderHeader}>
                    <span style={styles.orderId}>#{order._id.slice(-6)}</span>
                    <span style={{
                      ...styles.badge,
                      background: getStatusColor(order.status)
                    }}>
                      {order.status}
                    </span>
                  </div>
                  <div style={styles.orderItems}>
                    {order.items.map((item, idx) => (
                      <span key={idx}>{item.quantity}x {item.name}</span>
                    ))}
                  </div>
                  <div style={styles.orderTotal}>₹{order.total?.toFixed(2) || '0.00'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="card" style={styles.tabContent}>
          <h2 style={styles.contentTitle}>All Orders</h2>
          {orders.length === 0 ? (
            <p style={styles.empty}>No orders yet</p>
          ) : (
            <div style={styles.ordersList}>
              {orders.map((order) => (
                <div key={order._id} className="card" style={styles.orderDetailCard}>
                  <div style={styles.orderDetailHeader}>
                    <div>
                      <span style={styles.orderId}>Order #{order._id.slice(-6)}</span>
                      <span style={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <span style={{
                      ...styles.badge,
                      background: getStatusColor(order.status)
                    }}>
                      {order.status}
                    </span>
                  </div>
                  <div style={styles.customerInfo}>
                    <strong>Customer:</strong> {order.customer?.name || 'N/A'}
                    <br />
                    <strong>Address:</strong> {order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.zipCode}
                  </div>
                  <div style={styles.orderItemsList}>
                    <strong>Items:</strong>
                    <ul>
                      {order.items.map((item, idx) => (
                        <li key={idx}>{item.quantity}x {item.name} - ₹{item.price}</li>
                      ))}
                    </ul>
                  </div>
                  {order.specialInstructions && (
                    <div style={styles.instructions}>
                      <strong>Instructions:</strong> {order.specialInstructions}
                    </div>
                  )}
                  <div style={styles.orderFooter}>
                    <span style={styles.orderTotal}>Total: ₹{order.total?.toFixed(2) || '0.00'}</span>
                    <select
                      value={order.status}
                      onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                      style={styles.statusSelect}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="out-for-delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Menu Tab */}
      {activeTab === 'menu' && (
        <div className="card" style={styles.tabContent}>
          <h2 style={styles.contentTitle}>Menu Items</h2>

          {/* Menu Form Modal */}
          {showMenuForm && (
            <div style={styles.modalOverlay}>
              <div className="card" style={styles.modal}>
                <h3 style={styles.modalTitle}>
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <form onSubmit={handleMenuSubmit}>
                  <div className="input-group">
                    <label>Item Name</label>
                    <input
                      type="text"
                      value={menuForm.name}
                      onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                      placeholder="e.g., Margherita Pizza"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Description</label>
                    <textarea
                      value={menuForm.description}
                      onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                      placeholder="Describe the item"
                      rows="3"
                      required
                    />
                  </div>
                  <div style={styles.row}>
                    <div className="input-group">
                      <label>Price (₹)</label>
                      <input
                        type="number"
                        value={menuForm.price}
                        onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                        placeholder="99"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label>Category</label>
                      <select
                        value={menuForm.category}
                        onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                        required
                      >
                        <option value="appetizer">Appetizer</option>
                        <option value="main">Main Course</option>
                        <option value="dessert">Dessert</option>
                        <option value="beverage">Beverage</option>
                        <option value="side">Side Dish</option>
                      </select>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Image URL</label>
                    <input
                      type="url"
                      value={menuForm.image}
                      onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
                      placeholder="https://example.com/item.jpg"
                      required
                    />
                  </div>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={menuForm.isVegetarian}
                      onChange={(e) => setMenuForm({ ...menuForm, isVegetarian: e.target.checked })}
                    />
                    Vegetarian
                  </label>
                  <div style={styles.modalActions}>
                    <button
                      type="button"
                      onClick={resetMenuForm}
                      className="btn btn-secondary"
                      style={styles.cancelBtn}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingItem ? 'Update' : 'Add'} Item
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Menu Items Grid */}
          <div style={styles.menuGrid}>
            {menuItems.map((item) => (
              <div key={item._id} className="card" style={styles.menuItemCard}>
                <img src={item.image} alt={item.name} style={styles.menuItemImage} />
                <div style={styles.menuItemContent}>
                  <div style={styles.menuItemHeader}>
                    <h4 style={styles.menuItemName}>{item.name}</h4>
                    {item.isVegetarian && <span style={styles.vegBadge}>🟢 Veg</span>}
                  </div>
                  <p style={styles.menuItemDesc}>{item.description}</p>
                  <div style={styles.menuItemFooter}>
                    <span style={styles.menuItemPrice}>₹{item.price}</span>
                    <span style={styles.menuItemCategory}>{item.category}</span>
                  </div>
                  <div style={styles.menuItemActions}>
                    <button
                      onClick={() => handleEditMenuItem(item)}
                      className="btn btn-secondary"
                      style={styles.editBtn}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMenuItem(item._id)}
                      className="btn btn-danger"
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="card" style={styles.tabContent}>
          <h2 style={styles.contentTitle}>Restaurant Settings</h2>
          <form onSubmit={handleRestaurantUpdate} style={styles.settingsForm}>
            <div className="input-group">
              <label>Restaurant Name</label>
              <input
                type="text"
                value={restaurantForm.name}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea
                value={restaurantForm.description}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, description: e.target.value })}
                rows="3"
                required
              />
            </div>
            <div className="input-group">
              <label>Cuisine Types</label>
              <div style={styles.cuisineGrid}>
                {cuisineOptions.map((cuisine) => (
                  <label key={cuisine} style={styles.cuisineCheckbox}>
                    <input
                      type="checkbox"
                      checked={restaurantForm.cuisine.includes(cuisine)}
                      onChange={() => handleCuisineChange(cuisine)}
                    />
                    {cuisine}
                  </label>
                ))}
              </div>
            </div>
            <div style={styles.row}>
              <div className="input-group">
                <label>Delivery Time</label>
                <input
                  type="text"
                  value={restaurantForm.deliveryTime}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, deliveryTime: e.target.value })}
                  required
                />
              </div>
              <div className="input-group">
                <label>Price Range</label>
                <select
                  value={restaurantForm.priceRange}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, priceRange: e.target.value })}
                  required
                >
                  <option value="₹">₹ - Budget Friendly</option>
                  <option value="₹₹">₹₹ - Moderate</option>
                  <option value="₹₹₹">₹₹₹ - Expensive</option>
                  <option value="₹₹₹₹">₹₹₹₹ - Fine Dining</option>
                </select>
              </div>
            </div>
            <div className="input-group">
              <label>Restaurant Image URL</label>
              <input
                type="url"
                value={restaurantForm.image}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, image: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={styles.saveBtn}>
              Save Changes
            </button>
          </form>
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
    padding: '40px 20px',
    paddingBottom: '60px'
  },
  loading: {
    padding: '80px',
    textAlign: 'center'
  },
  setupContainer: {
    padding: '40px 20px',
    maxWidth: '600px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  title: {
    fontSize: '2rem',
    marginBottom: '5px'
  },
  subtitle: {
    color: '#636e72',
    fontSize: '1rem'
  },
  addMenuBtn: {
    padding: '12px 24px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    padding: '20px',
    textAlign: 'center'
  },
  statIcon: {
    fontSize: '2rem',
    marginBottom: '8px'
  },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#ff6b35'
  },
  statLabel: {
    color: '#636e72',
    marginTop: '5px',
    fontSize: '0.9rem'
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap'
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
  empty: {
    textAlign: 'center',
    color: '#636e72',
    padding: '40px'
  },
  recentOrders: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  orderCard: {
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  orderId: {
    fontWeight: 'bold',
    fontSize: '1.1rem'
  },
  orderDate: {
    color: '#636e72',
    fontSize: '0.85rem',
    marginLeft: '10px'
  },
  orderItems: {
    color: '#636e72',
    fontSize: '0.9rem',
    marginBottom: '10px'
  },
  orderTotal: {
    fontWeight: 'bold',
    color: '#ff6b35',
    fontSize: '1.1rem'
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  orderDetailCard: {
    padding: '20px'
  },
  orderDetailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  customerInfo: {
    marginBottom: '15px',
    padding: '10px',
    background: '#f8f9fa',
    borderRadius: '4px'
  },
  orderItemsList: {
    marginBottom: '15px'
  },
  instructions: {
    padding: '10px',
    background: '#fff3cd',
    borderRadius: '4px',
    marginBottom: '15px'
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #dfe6e9',
    paddingTop: '15px'
  },
  statusSelect: {
    padding: '8px 16px',
    borderRadius: '4px',
    border: '1px solid #dfe6e9',
    fontSize: '0.9rem'
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px'
  },
  menuItemCard: {
    overflow: 'hidden'
  },
  menuItemImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover'
  },
  menuItemContent: {
    padding: '15px'
  },
  menuItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  menuItemName: {
    fontSize: '1.1rem',
    fontWeight: '600'
  },
  menuItemDesc: {
    color: '#636e72',
    fontSize: '0.85rem',
    marginBottom: '10px',
    lineHeight: '1.4'
  },
  menuItemFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  menuItemPrice: {
    fontWeight: 'bold',
    color: '#ff6b35',
    fontSize: '1.1rem'
  },
  menuItemCategory: {
    fontSize: '0.75rem',
    color: '#636e72',
    textTransform: 'capitalize',
    background: '#f8f9fa',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  menuItemActions: {
    display: 'flex',
    gap: '10px'
  },
  editBtn: {
    flex: 1,
    padding: '8px'
  },
  deleteBtn: {
    flex: 1,
    padding: '8px',
    background: '#d63031',
    color: 'white',
    border: 'none'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalTitle: {
    fontSize: '1.3rem',
    marginBottom: '20px'
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  cancelBtn: {
    flex: 1
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '10px',
    cursor: 'pointer'
  },
  settingsForm: {
    maxWidth: '600px'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  cuisineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '10px'
  },
  cuisineCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    background: '#f8f9fa',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  saveBtn: {
    marginTop: '20px',
    padding: '12px 24px'
  },
  setupForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  submitBtn: {
    padding: '15px',
    fontSize: '1.1rem'
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    color: 'white',
    fontWeight: '600'
  },
  vegBadge: {
    fontSize: '0.75rem',
    color: '#00b894'
  }
};

export default RestaurantDashboard;
