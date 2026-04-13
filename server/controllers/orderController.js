import Order from '../models/Order.js';

export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate('restaurant', 'name')
      .populate('deliveryAgent', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, specialInstructions, estimatedDeliveryTime } = req.body;

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = subtotal >= parseFloat(process.env.FREE_DELIVERY_THRESHOLD || 500)
      ? 0
      : parseFloat(process.env.DELIVERY_FEE || 5);
    const tax = subtotal * parseFloat(process.env.TAX_RATE || 0.08);
    const total = subtotal + deliveryFee + tax;

    const order = await Order.create({
      customer: req.user._id,
      items,
      deliveryAddress,
      paymentMethod: paymentMethod || 'cash',
      specialInstructions,
      estimatedDeliveryTime,
      subtotal,
      deliveryFee,
      tax,
      total,
      status: 'pending'
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name')
      .populate('items.menuItem', 'name image');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('restaurant', 'name image')
      .populate('items.menuItem', 'name image')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRestaurantOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { restaurant: req.params.restaurantId };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('items.menuItem', 'name')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name image')
      .populate('deliveryAgent', 'name phone')
      .populate('items.menuItem', 'name image price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name')
      .populate('items.menuItem', 'name');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignDeliveryAgent = async (req, res) => {
  try {
    const { agentId } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.deliveryAgent = agentId;
    order.status = 'out-for-delivery';

    const updated = await order.save();
    const populated = await Order.findById(updated._id)
      .populate('deliveryAgent', 'name phone');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDeliveryAgentOrders = async (req, res) => {
  try {
    const orders = await Order.find({ deliveryAgent: req.user._id })
      .populate('customer', 'name email phone')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
