import MenuItem from '../models/MenuItem.js';
import Restaurant from '../models/Restaurant.js';

const ensureRestaurantAccess = async (restaurantId, user) => {
  const restaurant = await Restaurant.findById(restaurantId).select('owner');

  if (!restaurant) {
    return { error: { status: 404, message: 'Restaurant not found' } };
  }

  if (user.role !== 'admin' && restaurant.owner?.toString() !== user._id.toString()) {
    return { error: { status: 403, message: 'Not authorized to manage this restaurant' } };
  }

  return { restaurant };
};

export const getMenuItems = async (req, res) => {
  try {
    const { restaurant, category, search, page = 1, limit = 20 } = req.query;
    const query = { isAvailable: true };

    if (restaurant) {
      query.restaurant = restaurant;
    }
    if (category) {
      query.category = category;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const menuItems = await MenuItem.find(query)
      .populate('restaurant', 'name')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await MenuItem.countDocuments(query);

    res.json({
      menuItems,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)
      .populate('restaurant', 'name');

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMenuItem = async (req, res) => {
  try {
    const access = await ensureRestaurantAccess(req.body.restaurant, req.user);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    const menuItem = await MenuItem.create(req.body);
    const populated = await MenuItem.findById(menuItem._id)
      .populate('restaurant', 'name');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const access = await ensureRestaurantAccess(menuItem.restaurant, req.user);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    const allowedFields = [
      'name',
      'description',
      'price',
      'category',
      'image',
      'preparationTime',
      'isVegetarian',
      'isAvailable'
    ];

    allowedFields.forEach((field) => {
      if (typeof req.body[field] !== 'undefined') {
        menuItem[field] = req.body[field];
      }
    });

    const updated = await menuItem.save();
    const populated = await MenuItem.findById(updated._id)
      .populate('restaurant', 'name');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const access = await ensureRestaurantAccess(menuItem.restaurant, req.user);
    if (access.error) {
      return res.status(access.error.status).json({ message: access.error.message });
    }

    await menuItem.deleteOne();
    res.json({ message: 'Menu item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
