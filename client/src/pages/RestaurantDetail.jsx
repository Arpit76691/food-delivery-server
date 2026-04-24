import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Reviews from '../components/Reviews';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, getCartCount } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveredOrder, setDeliveredOrder] = useState(null);

  useEffect(() => {
    fetchRestaurantData();
  }, [id]);

  useEffect(() => {
    fetchDeliveredOrder();
  }, [id, user?._id]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const [restaurantRes, menuRes] = await Promise.all([
        api.get(`/api/restaurants/${id}`),
        api.get(`/api/menu?restaurant=${id}`)
      ]);

      setRestaurant(restaurantRes.data);
      setMenuItems(menuRes.data.menuItems || []);
    } catch (err) {
      console.error('Failed to load data', err);
      setRestaurant(null);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveredOrder = async () => {
    if (!user) {
      setDeliveredOrder(null);
      return;
    }

    try {
      const response = await api.get('/api/orders/customer/myorders');
      const orders = response.data || [];
      const deliveredOrderForRestaurant = orders.find(
        (order) => order.restaurant?._id === id && order.status === 'delivered'
      );
      setDeliveredOrder(deliveredOrderForRestaurant || null);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  };

  if (loading) {
    return <div className="container" style={styles.loading}>Loading...</div>;
  }

  if (!restaurant) {
    return <div className="container" style={styles.error}>Restaurant not found</div>;
  }

  const menuByCategory = menuItems.reduce((accumulator, item) => {
    if (!accumulator[item.category]) {
      accumulator[item.category] = [];
    }
    accumulator[item.category].push(item);
    return accumulator;
  }, {});

  return (
    <div className="container" style={styles.container}>
      <div className="card" style={styles.header}>
        <img src={restaurant.image} alt={restaurant.name} style={styles.banner} />
        <div style={styles.info}>
          <h1 style={styles.name}>{restaurant.name}</h1>
          <p style={styles.description}>{restaurant.description}</p>
          <div style={styles.meta}>
            <span>{`★ ${restaurant.rating.toFixed(1)}`}</span>
            <span>{`🕐 ${restaurant.deliveryTime}`}</span>
            <span>{restaurant.priceRange}</span>
          </div>
        </div>
      </div>

      <div style={styles.menu}>
        <h2 style={styles.sectionTitle}>Menu</h2>

        {Object.keys(menuByCategory).length === 0 ? (
          <p style={styles.empty}>No menu items available</p>
        ) : (
          Object.entries(menuByCategory).map(([category, items]) => (
            <div key={category} style={styles.category}>
              <h3 style={styles.categoryTitle}>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
              <div style={styles.itemsGrid}>
                {items.map((item) => (
                  <div key={item._id} className="card" style={styles.itemCard}>
                    <div style={styles.itemContent}>
                      <h4 style={styles.itemName}>{item.name}</h4>
                      <p style={styles.itemDesc}>{item.description}</p>
                      <div style={styles.itemFooter}>
                        <span style={styles.price}>₹{item.price}</span>
                        {item.isVegetarian && <span style={styles.veg}>🟢 Veg</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const result = addToCart(item);
                        if (result?.ok === false) {
                          alert(result.message);
                        }
                      }}
                      className="btn btn-primary"
                      style={styles.addBtn}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {getCartCount() > 0 && (
        <div className="card" style={styles.cartSummary}>
          <div style={styles.cartInfo}>
            <span>{`🛒 ${getCartCount()} items in cart`}</span>
          </div>
          <button onClick={() => navigate('/cart')} className="btn btn-primary">
            View Cart
          </button>
        </div>
      )}

      <Reviews restaurantId={id} orderId={deliveredOrder?._id} />
    </div>
  );
};

const styles = {
  container: { padding: '20px', paddingBottom: '100px' },
  loading: { padding: '60px', textAlign: 'center' },
  error: { padding: '60px', textAlign: 'center', color: '#d63031' },
  header: { marginBottom: '20px' },
  banner: { width: '100%', height: '250px', objectFit: 'cover' },
  info: { padding: '20px' },
  name: { fontSize: '2rem', marginBottom: '10px' },
  description: { color: '#636e72', marginBottom: '10px' },
  meta: { display: 'flex', gap: '20px', fontWeight: '600' },
  menu: { marginTop: '30px' },
  sectionTitle: { fontSize: '1.5rem', marginBottom: '20px' },
  empty: { textAlign: 'center', color: '#636e72', padding: '40px' },
  category: { marginBottom: '30px' },
  categoryTitle: { fontSize: '1.3rem', marginBottom: '15px', color: '#ff6b35', borderBottom: '2px solid #ff6b35', paddingBottom: '8px' },
  itemsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  itemCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px' },
  itemContent: { flex: 1 },
  itemName: { fontSize: '1.1rem', marginBottom: '5px' },
  itemDesc: { fontSize: '0.85rem', color: '#636e72', marginBottom: '8px' },
  itemFooter: { display: 'flex', gap: '10px', alignItems: 'center' },
  price: { fontWeight: 'bold', color: '#2d3436' },
  veg: { fontSize: '0.75rem', color: '#00b894' },
  addBtn: { padding: '8px 20px', fontSize: '0.9rem' },
  cartSummary: { position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '600px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
  cartInfo: { fontWeight: '600' }
};

export default RestaurantDetail;
