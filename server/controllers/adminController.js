import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('customer', 'name email')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Top restaurants by orders
    const topRestaurants = await Order.aggregate([
      { $group: { _id: '$restaurant', orderCount: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $sort: { orderCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'restaurants', localField: '_id', foreignField: '_id', as: 'restaurant' } }
    ]);

    res.json({
      totalUsers,
      totalRestaurants,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersByStatus,
      recentOrders,
      topRestaurants
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { name, phone, address, role, isApproved } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.role = role || user.role;
    user.isApproved = isApproved !== undefined ? isApproved : user.isApproved;

    const updated = await user.save();
    res.json({ ...updated.toObject(), password: undefined });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all restaurants (including pending approval)
export const getAllRestaurants = async (req, res) => {
  try {
    const { isApproved, search } = req.query;
    let query = {};

    if (isApproved !== undefined) {
      query.isApproved = isApproved === 'true';
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const restaurants = await Restaurant.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve/reject restaurant
export const approveRestaurant = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    restaurant.isApproved = isApproved;
    const updated = await restaurant.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete restaurant
export const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Delete associated menu items
    await MenuItem.deleteMany({ restaurant: req.params.id });
    await restaurant.deleteOne();

    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let query = {};

    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name')
      .populate('deliveryAgent', 'name phone')
      .populate('items.menuItem', 'name')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update any order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    const updated = await order.save();
    const populated = await Order.findById(updated._id)
      .populate('customer', 'name email')
      .populate('restaurant', 'name')
      .populate('deliveryAgent', 'name phone');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign delivery agent to order
export const assignDeliveryAgent = async (req, res) => {
  try {
    const { agentId } = req.body;

    // Verify agent exists and has delivery role
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'delivery') {
      return res.status(400).json({ message: 'Invalid delivery agent' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.deliveryAgent = agentId;
    order.status = 'out-for-delivery';

    const updated = await order.save();
    const populated = await Order.findById(updated._id)
      .populate('deliveryAgent', 'name phone email');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all menu items
export const getAllMenuItems = async (req, res) => {
  try {
    const { restaurant, search } = req.query;
    let query = {};

    if (restaurant) query.restaurant = restaurant;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const menuItems = await MenuItem.find(query)
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });

    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create menu item (admin)
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

// Update menu item (admin)
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

// Delete menu item (admin)
export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    await menuItem.deleteOne();
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get analytics data
export const getAnalytics = async (req, res) => {
  try {
    const { period = '7' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Orders in period
    const ordersInPeriod = await Order.find({
      createdAt: { $gte: startDate }
    });

    // Revenue in period
    const revenueData = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Orders per day
    const ordersPerDay = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Most popular items
    const popularItems = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.menuItem', totalQuantity: { $sum: '$items.quantity' } } },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'menuitems', localField: '_id', foreignField: '_id', as: 'item' } }
    ]);

    res.json({
      totalOrders: ordersInPeriod.length,
      totalRevenue: revenueData[0]?.total || 0,
      ordersPerDay,
      popularItems
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
