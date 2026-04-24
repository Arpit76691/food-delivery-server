import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();

  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!deliveryAddress.street || !deliveryAddress.city) {
      alert('Please enter delivery address');
      return;
    }

    const restaurantIds = new Set(
      cart.map((item) => item.restaurant?._id || item.restaurant).filter(Boolean)
    );

    if (restaurantIds.size > 1) {
      alert('Your cart contains items from multiple restaurants. Please keep one restaurant per order.');
      return;
    }

    try {
      const orderData = {
        items: cart.map((item) => ({
          menuItem: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        deliveryAddress,
        paymentMethod,
        specialInstructions,
        estimatedDeliveryTime: new Date(Date.now() + 40 * 60000)
      };

      await api.post('/api/orders', orderData);
      clearCart();
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      alert(`Failed to place order: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };

  const totals = getCartTotal();

  if (cart.length === 0) {
    return (
      <div className="container" style={styles.empty}>
        <h2>Your cart is empty</h2>
        <p>Add some delicious items from our restaurants!</p>
        <button onClick={() => navigate('/restaurants')} className="btn btn-primary">
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={styles.container}>
      <h1 style={styles.title}>Shopping Cart</h1>

      <div style={styles.grid}>
        <div className="card" style={styles.cartSection}>
          <h2 style={styles.sectionTitle}>Items</h2>
          {cart.map((item) => (
            <div key={item._id} style={styles.cartItem}>
              <div style={styles.itemInfo}>
                <h4 style={styles.itemName}>{item.name}</h4>
                <span style={styles.itemPrice}>₹{item.price}</span>
              </div>
              <div style={styles.quantityControls}>
                <button onClick={() => updateQuantity(item._id, -1)} style={styles.qtyBtn}>-</button>
                <span style={styles.qty}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item._id, 1)} style={styles.qtyBtn}>+</button>
                <button onClick={() => removeFromCart(item._id)} style={styles.removeBtn} aria-label={`Remove ${item.name}`}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={styles.checkoutSection}>
          <h2 style={styles.sectionTitle}>Checkout</h2>

          <div className="input-group">
            <label>Street Address</label>
            <input
              type="text"
              value={deliveryAddress.street}
              onChange={(event) => setDeliveryAddress({ ...deliveryAddress, street: event.target.value })}
              placeholder="Enter street address"
            />
          </div>

          <div style={styles.row}>
            <div className="input-group">
              <label>City</label>
              <input
                type="text"
                value={deliveryAddress.city}
                onChange={(event) => setDeliveryAddress({ ...deliveryAddress, city: event.target.value })}
                placeholder="City"
              />
            </div>
            <div className="input-group">
              <label>State</label>
              <input
                type="text"
                value={deliveryAddress.state}
                onChange={(event) => setDeliveryAddress({ ...deliveryAddress, state: event.target.value })}
                placeholder="State"
              />
            </div>
          </div>

          <div className="input-group">
            <label>ZIP Code</label>
            <input
              type="text"
              value={deliveryAddress.zipCode}
              onChange={(event) => setDeliveryAddress({ ...deliveryAddress, zipCode: event.target.value })}
              placeholder="ZIP Code"
            />
          </div>

          <div className="input-group">
            <label>Payment Method</label>
            <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
              <option value="cash">Cash on Delivery</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
            </select>
          </div>

          <div className="input-group">
            <label>Special Instructions</label>
            <textarea
              value={specialInstructions}
              onChange={(event) => setSpecialInstructions(event.target.value)}
              placeholder="Any special instructions for delivery?"
              rows="3"
            />
          </div>

          <div style={styles.summary}>
            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Delivery Fee</span>
              <span>₹{totals.deliveryFee.toFixed(2)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Tax (8%)</span>
              <span>₹{totals.tax.toFixed(2)}</span>
            </div>
            <div style={{ ...styles.summaryRow, ...styles.totalRow }}>
              <span>Total</span>
              <span>₹{totals.total.toFixed(2)}</span>
            </div>
          </div>

          <button onClick={handleCheckout} className="btn btn-primary" style={styles.checkoutBtn}>
            Place Order - ₹{totals.total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '40px 20px' },
  empty: { textAlign: 'center', padding: '80px 20px' },
  title: { fontSize: '2rem', marginBottom: '30px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' },
  cartSection: { padding: '20px' },
  checkoutSection: { padding: '20px', height: 'fit-content' },
  sectionTitle: { fontSize: '1.3rem', marginBottom: '20px', borderBottom: '2px solid #ff6b35', paddingBottom: '10px' },
  cartItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #dfe6e9' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: '1rem', marginBottom: '5px' },
  itemPrice: { color: '#ff6b35', fontWeight: '600' },
  quantityControls: { display: 'flex', alignItems: 'center', gap: '10px' },
  qtyBtn: { width: '32px', height: '32px', borderRadius: '50%', background: '#f8f9fa', border: '1px solid #dfe6e9', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qty: { minWidth: '24px', textAlign: 'center', fontWeight: '600' },
  removeBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  summary: { background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginTop: '20px' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0' },
  totalRow: { borderTop: '2px solid #dfe6e9', marginTop: '8px', paddingTop: '12px', fontWeight: 'bold', fontSize: '1.2rem' },
  checkoutBtn: { width: '100%', marginTop: '20px', padding: '15px', fontSize: '1.1rem' }
};

export default Cart;
