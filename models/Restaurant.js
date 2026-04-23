import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide restaurant name'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/400x200?text=Restaurant'
  },
  cuisine: [{
    type: String
  }],
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  priceRange: {
    type: String,
    enum: ['\u20B9', '\u20B9\u20B9', '\u20B9\u20B9\u20B9', '\u20B9\u20B9\u20B9\u20B9'],
    default: '\u20B9\u20B9'
  },
  deliveryTime: {
    type: String,
    default: '30-40 mins'
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

export default Restaurant;
