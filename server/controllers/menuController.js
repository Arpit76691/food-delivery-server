import MenuItem from '../models/MenuItem.js';

export const getMenuItems = async (req, res) => {
  try {
    const { restaurant, category, search, page = 1, limit = 20 } = req.query;
    let query = { isAvailable: true };

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
      currentPage: page,
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

    Object.assign(menuItem, req.body);
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

    await menuItem.deleteOne();
    res.json({ message: 'Menu item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
