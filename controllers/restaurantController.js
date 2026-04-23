import Restaurant from '../models/Restaurant.js';
import MenuItem from '../models/MenuItem.js';

const canManageRestaurant = (restaurant, user) => (
  user.role === 'admin' || restaurant.owner?.toString() === user._id.toString()
);

export const getRestaurants = async (req, res) => {
  try {
    const { cuisine, search, minRating, owner, page = 1, limit = 10 } = req.query;
    const query = {};

    if (cuisine) {
      query.cuisine = cuisine;
    }
    if (owner) {
      query.owner = owner;
    }
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const restaurants = await Restaurant.find(query)
      .sort({ rating: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Restaurant.countDocuments(query);

    res.json({
      restaurants,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRestaurantMenu = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({
      restaurant: req.params.id,
      isAvailable: true
    }).sort({ category: 1, name: 1 });

    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createRestaurant = async (req, res) => {
  try {
    const restaurantData = {
      ...req.body,
      owner: req.user._id
    };

    const restaurant = await Restaurant.create(restaurantData);
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (!canManageRestaurant(restaurant, req.user)) {
      return res.status(403).json({ message: 'Not authorized to manage this restaurant' });
    }

    const allowedFields = ['name', 'description', 'deliveryTime', 'priceRange', 'image', 'address'];

    allowedFields.forEach((field) => {
      if (typeof req.body[field] !== 'undefined') {
        restaurant[field] = req.body[field];
      }
    });

    if (typeof req.body.cuisine !== 'undefined') {
      restaurant.cuisine = Array.isArray(req.body.cuisine)
        ? req.body.cuisine
        : [req.body.cuisine];
    }

    const updated = await restaurant.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (!canManageRestaurant(restaurant, req.user)) {
      return res.status(403).json({ message: 'Not authorized to manage this restaurant' });
    }

    await MenuItem.deleteMany({ restaurant: req.params.id });
    await restaurant.deleteOne();

    res.json({ message: 'Restaurant removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
