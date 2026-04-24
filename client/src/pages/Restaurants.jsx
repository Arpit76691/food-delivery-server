import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchRestaurants();
  }, [searchParams]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError('');
      const cuisine = searchParams.get('cuisine');
      const url = cuisine ? `/api/restaurants?cuisine=${cuisine}` : '/api/restaurants';

      const response = await api.get(url);
      setRestaurants(response.data.restaurants || []);
    } catch (err) {
      setError('Failed to load restaurants');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={styles.loading}>
        <div>Loading restaurants...</div>
      </div>
    );
  }

  return (
    <div className="container" style={styles.container}>
      <h1 style={styles.title}>All Restaurants</h1>

      {error && <p style={styles.error}>{error}</p>}

      {restaurants.length === 0 ? (
        <p style={styles.empty}>No restaurants found</p>
      ) : (
        <div style={styles.grid}>
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant._id}
              to={`/restaurant/${restaurant._id}`}
              className="card"
              style={styles.card}
            >
              <img
                src={restaurant.image}
                alt={restaurant.name}
                style={styles.image}
              />
              <div style={styles.content}>
                <h3 style={styles.name}>{restaurant.name}</h3>
                <p style={styles.description}>{restaurant.description}</p>
                <div style={styles.meta}>
                  <span style={styles.rating}>
                    {`★ ${restaurant.rating.toFixed(1)}`}
                  </span>
                  <span style={styles.time}>{`🕐 ${restaurant.deliveryTime}`}</span>
                  <span style={styles.price}>{restaurant.priceRange}</span>
                </div>
                <div style={styles.cuisines}>
                  {restaurant.cuisine?.slice(0, 3).map((cuisine) => (
                    <span key={cuisine} style={styles.cuisineTag}>{cuisine}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '40px 20px'
  },
  title: {
    fontSize: '2rem',
    marginBottom: '30px',
    color: '#2d3436'
  },
  loading: {
    padding: '60px',
    textAlign: 'center',
    fontSize: '1.2rem'
  },
  error: {
    color: '#d63031',
    marginBottom: '16px'
  },
  empty: {
    textAlign: 'center',
    color: '#636e72',
    padding: '40px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '25px'
  },
  card: {
    transition: 'transform 0.3s, box-shadow 0.3s'
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover'
  },
  content: {
    padding: '20px'
  },
  name: {
    fontSize: '1.3rem',
    marginBottom: '8px',
    color: '#2d3436'
  },
  description: {
    color: '#636e72',
    fontSize: '0.9rem',
    marginBottom: '12px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
  },
  meta: {
    display: 'flex',
    gap: '15px',
    marginBottom: '12px'
  },
  rating: {
    background: '#00b894',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: '600',
    fontSize: '0.85rem'
  },
  time: {
    color: '#636e72',
    fontSize: '0.85rem'
  },
  price: {
    color: '#ff6b35',
    fontWeight: '600'
  },
  cuisines: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  cuisineTag: {
    background: '#f8f9fa',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    color: '#636e72'
  }
};

export default Restaurants;
