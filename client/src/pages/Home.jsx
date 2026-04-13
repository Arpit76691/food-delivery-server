import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div className="container" style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Delicious Food,<br />Delivered To You</h1>
          <p style={styles.heroSubtitle}>Order from the best local restaurants</p>
          <Link to="/restaurants" className="btn btn-primary" style={styles.heroBtn}>
            Order Now
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container" style={styles.features}>
        <h2 style={styles.sectionTitle}>Why Choose FoodHub?</h2>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🚀</div>
            <h3>Fast Delivery</h3>
            <p>Get your food delivered in 30 minutes</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>⭐</div>
            <h3>Quality Food</h3>
            <p>Best restaurants and curated menus</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>💳</div>
            <h3>Easy Payment</h3>
            <p>Multiple payment options available</p>
          </div>
        </div>
      </section>

      {/* Popular Cuisines */}
      <section className="container" style={styles.cuisines}>
        <h2 style={styles.sectionTitle}>Popular Cuisines</h2>
        <div style={styles.cuisinesGrid}>
          {['Pizza', 'Burgers', 'Chinese', 'Indian', 'Thai', 'Desserts'].map((cuisine) => (
            <Link
              key={cuisine}
              to={`/restaurants?cuisine=${cuisine}`}
              style={styles.cuisineCard}
            >
              <span style={styles.cuisineEmoji}>🍕</span>
              <span>{cuisine}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

const styles = {
  hero: {
    background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)',
    color: 'white',
    padding: '80px 0',
    textAlign: 'center'
  },
  heroContent: {
    maxWidth: '600px'
  },
  heroTitle: {
    fontSize: '3rem',
    marginBottom: '1rem',
    lineHeight: 1.2
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    marginBottom: '2rem',
    opacity: 0.9
  },
  heroBtn: {
    fontSize: '1.1rem',
    padding: '15px 40px'
  },
  features: {
    padding: '60px 20px'
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: '2rem',
    marginBottom: '40px',
    color: '#2d3436'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px'
  },
  featureCard: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  featureIcon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  cuisines: {
    padding: '60px 20px',
    background: '#f8f9fa'
  },
  cuisinesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px'
  },
  cuisineCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s'
  },
  cuisineEmoji: {
    display: 'block',
    fontSize: '2.5rem',
    marginBottom: '0.5rem'
  }
};

export default Home;
