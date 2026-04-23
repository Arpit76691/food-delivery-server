import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';

// @desc    Get all reviews for a restaurant
// @route   GET /api/reviews/restaurant/:restaurantId
// @access  Public
export const getRestaurantReviews = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 10, rating, sortBy = 'createdAt', order = 'desc' } = req.query;

    let query = { restaurant: restaurantId, isApproved: true };

    if (rating) {
      query.rating = parseInt(rating);
    }

    const reviews = await Review.find(query)
      .populate('user', 'name image')
      .sort({ [sortBy]: order })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Review.countDocuments(query);

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { restaurant: restaurantId, isApproved: true } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
      ratingDistribution
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews by a user
// @route   GET /api/reviews/my-reviews
// @access  Private
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('restaurant', 'name image')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Customers only)
export const createReview = async (req, res) => {
  try {
    const { restaurant, order, rating, comment, foodRating, deliveryRating, images } = req.body;

    // Check if order exists and belongs to user
    const existingOrder = await Order.findOne({
      _id: order,
      customer: req.user._id
    });

    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found or does not belong to you' });
    }

    // Check if order is delivered (only delivered orders can be reviewed)
    if (existingOrder.status !== 'delivered') {
      return res.status(400).json({
        message: 'You can only review delivered orders'
      });
    }

    // Check if user already reviewed this order
    const existingReview = await Review.findOne({
      user: req.user._id,
      order: order
    });

    if (existingReview) {
      return res.status(400).json({
        message: 'You have already reviewed this order'
      });
    }

    const review = await Review.create({
      user: req.user._id,
      restaurant,
      order,
      rating,
      comment,
      foodRating,
      deliveryRating,
      images: images || [],
      isApproved: true
    });

    // Populate the created review
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name image');

    res.status(201).json(populatedReview);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this order' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Review owner only)
export const updateReview = async (req, res) => {
  try {
    const { rating, comment, foodRating, deliveryRating } = req.body;

    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.foodRating = foodRating || review.foodRating;
    review.deliveryRating = deliveryRating || review.deliveryRating;

    const updated = await review.save();
    const populated = await Review.findById(updated._id).populate('user', 'name image');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Review owner or Admin)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!review && req.user.role !== 'admin') {
      return res.status(404).json({ message: 'Review not found' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
export const markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.helpful += 1;
    await review.save();

    res.json({ helpful: review.helpful });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending reviews (for admin)
// @route   GET /api/reviews/admin/pending
// @access  Private (Admin only)
export const getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: false })
      .populate('user', 'name email')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a review
// @route   PUT /api/reviews/:id/approve
// @access  Private (Admin only)
export const approveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get review statistics for a restaurant
// @route   GET /api/reviews/restaurant/:restaurantId/stats
// @access  Public
export const getReviewStats = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const stats = await Review.aggregate([
      { $match: { restaurant: restaurantId, isApproved: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          avgFoodRating: { $avg: '$foodRating' },
          avgDeliveryRating: { $avg: '$deliveryRating' }
        }
      }
    ]);

    const ratingDistribution = await Review.aggregate([
      { $match: { restaurant: restaurantId, isApproved: true } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      averageRating: stats[0]?.averageRating || 0,
      totalReviews: stats[0]?.totalReviews || 0,
      avgFoodRating: stats[0]?.avgFoodRating || 0,
      avgDeliveryRating: stats[0]?.avgDeliveryRating || 0,
      ratingDistribution
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
