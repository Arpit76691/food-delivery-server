import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  foodRating: {
    type: Number,
    min: 1,
    max: 5
  },
  deliveryRating: {
    type: Number,
    min: 1,
    max: 5
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  helpful: {
    type: Number,
    default: 0
  },
  images: [{
    type: String
  }]
}, {
  timestamps: true
});

// Prevent duplicate reviews for the same order
reviewSchema.index({ user: 1, order: 1 }, { unique: true });

// Index for efficient queries
reviewSchema.index({ restaurant: 1, createdAt: -1 });
reviewSchema.index({ restaurant: 1, rating: -1 });

// Static method to calculate average rating for a restaurant
reviewSchema.statics.calculateAverageRating = async function(restaurantId) {
  const stats = await this.aggregate([
    {
      $match: { restaurant: restaurantId, isApproved: true }
    },
    {
      $group: {
        _id: '$restaurant',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  return stats[0] || { averageRating: 0, totalReviews: 0 };
};

// Middleware to update restaurant rating after review is saved
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  const stats = await Review.calculateAverageRating(this.restaurant);

  await this.model('Restaurant').findByIdAndUpdate(this.restaurant, {
    rating: stats.averageRating,
    totalReviews: stats.totalReviews
  });
});

// Middleware to update restaurant rating after review is deleted
reviewSchema.post('deleteOne', async function() {
  const Review = this.constructor;
  const stats = await Review.calculateAverageRating(this.restaurant);

  await this.model('Restaurant').findByIdAndUpdate(this.restaurant, {
    rating: stats.averageRating,
    totalReviews: stats.totalReviews
  });
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
