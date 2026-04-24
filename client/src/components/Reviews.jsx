import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Reviews = ({ restaurantId, orderId }) => {
  const { isCustomer } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    foodRating: 5,
    deliveryRating: 5
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [restaurantId, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/reviews/restaurant/${restaurantId}?page=${currentPage}&limit=10`);
      setReviews(response.data.reviews);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/api/reviews/restaurant/${restaurantId}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch review stats', error);
    }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    try {
      await api.post('/api/reviews', {
        ...reviewForm,
        restaurant: restaurantId,
        order: orderId
      });
      alert('Review submitted successfully!');
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: '', foodRating: 5, deliveryRating: 5 });
      fetchReviews();
      fetchStats();
    } catch (error) {
      alert(`Failed to submit review: ${error.response?.data?.message || 'Unknown error'}`);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await api.post(`/api/reviews/${reviewId}/helpful`);
      fetchReviews();
    } catch (error) {
      console.error('Failed to mark review as helpful', error);
    }
  };

  const renderStars = (rating, interactive = false, setRating = null) => (
    <div style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => interactive && setRating(star)}
          style={{
            ...styles.star,
            cursor: interactive ? 'pointer' : 'default',
            color: star <= rating ? '#ffd700' : '#dfe6e9'
          }}
        >
          ★
        </span>
      ))}
    </div>
  );

  const renderRatingDistribution = () => {
    if (!stats || !stats.ratingDistribution) return null;

    return (
      <div style={styles.distribution}>
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution.find((item) => item._id === rating)?.count || 0;
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

          return (
            <div key={rating} style={styles.distributionRow}>
              <span style={styles.distributionLabel}>{rating} ★</span>
              <div style={styles.distributionBar}>
                <div style={{ ...styles.distributionFill, width: `${percentage}%` }} />
              </div>
              <span style={styles.distributionCount}>{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading && !reviews.length) {
    return <div style={styles.loading}>Loading reviews...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Customer Reviews</h2>

      {stats && (
        <div style={styles.summary}>
          <div style={styles.summaryLeft}>
            <div style={styles.averageRating}>{stats.averageRating.toFixed(1)}</div>
            {renderStars(Math.round(stats.averageRating))}
            <div style={styles.totalReviews}>{stats.totalReviews} reviews</div>
          </div>
          <div style={styles.summaryRight}>{renderRatingDistribution()}</div>
        </div>
      )}

      {isCustomer && orderId && !showReviewForm && (
        <button onClick={() => setShowReviewForm(true)} className="btn btn-primary" style={styles.writeReviewBtn}>
          Write a Review
        </button>
      )}

      {showReviewForm && (
        <div className="card" style={styles.reviewForm}>
          <h3 style={styles.formTitle}>Write Your Review</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="input-group">
              <label>Overall Rating</label>
              {renderStars(reviewForm.rating, true, (rating) => setReviewForm({ ...reviewForm, rating }))}
            </div>

            <div className="input-group">
              <label>Food Quality</label>
              {renderStars(reviewForm.foodRating, true, (rating) => setReviewForm({ ...reviewForm, foodRating: rating }))}
            </div>

            <div className="input-group">
              <label>Delivery Experience</label>
              {renderStars(reviewForm.deliveryRating, true, (rating) => setReviewForm({ ...reviewForm, deliveryRating: rating }))}
            </div>

            <div className="input-group">
              <label>Your Review</label>
              <textarea
                value={reviewForm.comment}
                onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })}
                placeholder="Share your experience with this restaurant..."
                rows="4"
                required
                maxLength={500}
              />
              <span style={styles.charCount}>{reviewForm.comment.length}/500</span>
            </div>

            <div style={styles.formActions}>
              <button type="button" onClick={() => setShowReviewForm(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">Submit Review</button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.reviewsList}>
        {reviews.length === 0 ? (
          <p style={styles.noReviews}>No reviews yet. Be the first to review this restaurant!</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="card" style={styles.reviewCard}>
              <div style={styles.reviewHeader}>
                <div style={styles.reviewer}>
                  <div style={styles.avatar}>{review.user?.name?.charAt(0) || 'U'}</div>
                  <div>
                    <div style={styles.reviewerName}>{review.user?.name || 'Anonymous'}</div>
                    <div style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style={styles.ratings}>
                  <div style={styles.ratingRow}>
                    <span style={styles.ratingLabel}>Overall:</span>
                    {renderStars(review.rating)}
                  </div>
                  {review.foodRating && (
                    <div style={styles.ratingRow}>
                      <span style={styles.ratingLabel}>Food:</span>
                      {renderStars(review.foodRating)}
                    </div>
                  )}
                  {review.deliveryRating && (
                    <div style={styles.ratingRow}>
                      <span style={styles.ratingLabel}>Delivery:</span>
                      {renderStars(review.deliveryRating)}
                    </div>
                  )}
                </div>
              </div>

              <p style={styles.reviewComment}>{review.comment}</p>

              <div style={styles.reviewFooter}>
                <button onClick={() => handleMarkHelpful(review._id)} style={styles.helpfulBtn}>
                  👍 Helpful ({review.helpful})
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary"
            style={{ ...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            Previous
          </button>
          <span style={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
            style={{ ...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { marginTop: '40px', padding: '20px 0' },
  title: { fontSize: '1.5rem', marginBottom: '20px', borderBottom: '2px solid #ff6b35', paddingBottom: '10px' },
  loading: { textAlign: 'center', padding: '40px', color: '#636e72' },
  summary: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '30px' },
  summaryLeft: { textAlign: 'center', padding: '20px' },
  averageRating: { fontSize: '3rem', fontWeight: 'bold', color: '#ff6b35' },
  totalReviews: { color: '#636e72', marginTop: '10px' },
  summaryRight: { padding: '20px 0' },
  distribution: { display: 'flex', flexDirection: 'column', gap: '8px' },
  distributionRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  distributionLabel: { width: '30px', fontWeight: '600' },
  distributionBar: { flex: 1, height: '8px', background: '#dfe6e9', borderRadius: '4px', overflow: 'hidden' },
  distributionFill: { height: '100%', background: '#ff6b35', transition: 'width 0.3s' },
  distributionCount: { width: '30px', textAlign: 'right', color: '#636e72' },
  writeReviewBtn: { marginBottom: '20px' },
  reviewForm: { marginBottom: '30px' },
  formTitle: { fontSize: '1.2rem', marginBottom: '20px' },
  charCount: { fontSize: '0.8rem', color: '#636e72', textAlign: 'right', marginTop: '4px' },
  formActions: { display: 'flex', gap: '10px', marginTop: '20px' },
  reviewsList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  noReviews: { textAlign: 'center', color: '#636e72', padding: '40px' },
  reviewCard: { padding: '20px' },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' },
  reviewer: { display: 'flex', gap: '12px', alignItems: 'center' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#ff6b35', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  reviewerName: { fontWeight: '600' },
  reviewDate: { fontSize: '0.85rem', color: '#636e72' },
  ratings: { display: 'flex', flexDirection: 'column', gap: '5px' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  ratingLabel: { fontSize: '0.85rem', color: '#636e72' },
  stars: { display: 'flex', gap: '2px' },
  star: { fontSize: '1.2rem' },
  reviewComment: { color: '#2d3436', lineHeight: '1.6', marginBottom: '15px' },
  reviewFooter: { borderTop: '1px solid #dfe6e9', paddingTop: '15px' },
  helpfulBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: '#636e72', fontSize: '0.9rem', padding: '5px 10px', borderRadius: '4px', transition: 'all 0.3s' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '30px' },
  pageBtn: { padding: '10px 20px' },
  pageInfo: { color: '#636e72' }
};

export default Reviews;
