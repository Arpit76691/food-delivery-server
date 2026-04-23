import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Restaurant from './models/Restaurant.js';
import MenuItem from './models/MenuItem.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // Clear existing data
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('Cleared existing data');

    // Create Admin User
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@foodhub.com',
      password: 'admin123',
      phone: '1234567890',
      role: 'admin'
    });

    // Create Customer User
    const customer = await User.create({
      name: 'John Doe',
      email: 'customer@foodhub.com',
      password: 'customer123',
      phone: '0987654321',
      role: 'customer',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      }
    });

    // Create Restaurant Owner
    const restaurantOwner = await User.create({
      name: 'Restaurant Owner',
      email: 'restaurant@foodhub.com',
      password: 'restaurant123',
      phone: '1122334455',
      role: 'restaurant'
    });

    // Create Delivery Agent
    const deliveryAgent = await User.create({
      name: 'Delivery Agent',
      email: 'delivery@foodhub.com',
      password: 'delivery123',
      phone: '5566778899',
      role: 'delivery'
    });

    console.log('Users created');

    // Create Restaurants
    const pizzaPalace = await Restaurant.create({
      name: 'Pizza Palace',
      description: 'Authentic Italian pizza with fresh ingredients',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      cuisine: ['Italian', 'Pizza', 'Fast Food'],
      address: { street: '456 Pizza Lane', city: 'New York', state: 'NY', zipCode: '10002' },
      rating: 4.5,
      totalReviews: 120,
      priceRange: '$$',
      deliveryTime: '25-35 mins',
      owner: restaurantOwner._id
    });

    const burgerHouse = await Restaurant.create({
      name: 'Burger House',
      description: 'Juicy burgers and crispy fries',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      cuisine: ['American', 'Burgers', 'Fast Food'],
      address: { street: '789 Burger Blvd', city: 'New York', state: 'NY', zipCode: '10003' },
      rating: 4.3,
      totalReviews: 95,
      priceRange: '$',
      deliveryTime: '20-30 mins',
      owner: restaurantOwner._id
    });

    const sushiZen = await Restaurant.create({
      name: 'Sushi Zen',
      description: 'Fresh sushi and Japanese cuisine',
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
      cuisine: ['Japanese', 'Sushi', 'Asian'],
      address: { street: '321 Sushi St', city: 'New York', state: 'NY', zipCode: '10004' },
      rating: 4.7,
      totalReviews: 200,
      priceRange: '$$$',
      deliveryTime: '35-45 mins',
      owner: restaurantOwner._id
    });

    const curryKing = await Restaurant.create({
      name: 'Curry King',
      description: 'Authentic Indian curries and tandoori',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
      cuisine: ['Indian', 'Curry', 'Asian'],
      address: { street: '555 Curry Road', city: 'New York', state: 'NY', zipCode: '10005' },
      rating: 4.4,
      totalReviews: 150,
      priceRange: '$$',
      deliveryTime: '30-40 mins',
      owner: restaurantOwner._id
    });

    console.log('Restaurants created');

    // Create Menu Items for Pizza Palace
    await MenuItem.insertMany([
      {
        restaurant: pizzaPalace._id,
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300',
        price: 12.99,
        category: 'main',
        isVegetarian: true,
        preparationTime: 20
      },
      {
        restaurant: pizzaPalace._id,
        name: 'Pepperoni Pizza',
        description: 'Loaded with pepperoni and mozzarella cheese',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300',
        price: 14.99,
        category: 'main',
        isVegetarian: false,
        preparationTime: 20
      },
      {
        restaurant: pizzaPalace._id,
        name: 'Garlic Bread',
        description: 'Toasted bread with garlic butter and herbs',
        image: 'https://images.unsplash.com/photo-1573140247632-f84660f67126?w=300',
        price: 5.99,
        category: 'appetizer',
        isVegetarian: true,
        preparationTime: 10
      },
      {
        restaurant: pizzaPalace._id,
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee and mascarpone',
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300',
        price: 6.99,
        category: 'dessert',
        isVegetarian: true,
        preparationTime: 5
      }
    ]);

    // Create Menu Items for Burger House
    await MenuItem.insertMany([
      {
        restaurant: burgerHouse._id,
        name: 'Classic Cheeseburger',
        description: 'Beef patty with cheese, lettuce, tomato, and special sauce',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300',
        price: 9.99,
        category: 'main',
        isVegetarian: false,
        preparationTime: 15
      },
      {
        restaurant: burgerHouse._id,
        name: 'Veggie Burger',
        description: 'Plant-based patty with fresh vegetables',
        image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=300',
        price: 8.99,
        category: 'main',
        isVegetarian: true,
        preparationTime: 15
      },
      {
        restaurant: burgerHouse._id,
        name: 'French Fries',
        description: 'Crispy golden fries with sea salt',
        image: 'https://images.unsplash.com/photo-1573080496987-a199f8cd75ec?w=300',
        price: 3.99,
        category: 'side',
        isVegetarian: true,
        preparationTime: 8
      },
      {
        restaurant: burgerHouse._id,
        name: 'Chocolate Shake',
        description: 'Rich chocolate milkshake with whipped cream',
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300',
        price: 4.99,
        category: 'beverage',
        isVegetarian: true,
        preparationTime: 5
      }
    ]);

    // Create Menu Items for Sushi Zen
    await MenuItem.insertMany([
      {
        restaurant: sushiZen._id,
        name: 'California Roll',
        description: 'Crab, avocado, and cucumber wrapped in rice and seaweed',
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300',
        price: 11.99,
        category: 'main',
        isVegetarian: false,
        preparationTime: 15
      },
      {
        restaurant: sushiZen._id,
        name: 'Salmon Nigiri',
        description: 'Fresh salmon over pressed sushi rice',
        image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=300',
        price: 8.99,
        category: 'main',
        isVegetarian: false,
        preparationTime: 10
      },
      {
        restaurant: sushiZen._id,
        name: 'Miso Soup',
        description: 'Traditional Japanese soup with tofu and seaweed',
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300',
        price: 3.99,
        category: 'appetizer',
        isVegetarian: true,
        preparationTime: 5
      }
    ]);

    // Create Menu Items for Curry King
    await MenuItem.insertMany([
      {
        restaurant: curryKing._id,
        name: 'Butter Chicken',
        description: 'Tender chicken in creamy tomato sauce',
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300',
        price: 13.99,
        category: 'main',
        isVegetarian: false,
        preparationTime: 25
      },
      {
        restaurant: curryKing._id,
        name: 'Paneer Tikka Masala',
        description: 'Grilled cottage cheese in spiced gravy',
        image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300',
        price: 11.99,
        category: 'main',
        isVegetarian: true,
        preparationTime: 20
      },
      {
        restaurant: curryKing._id,
        name: 'Garlic Naan',
        description: 'Freshly baked naan with garlic butter',
        image: 'https://images.unsplash.com/photo-1606491956689-2ea28c67465d?w=300',
        price: 2.99,
        category: 'side',
        isVegetarian: true,
        preparationTime: 10
      },
      {
        restaurant: curryKing._id,
        name: 'Mango Lassi',
        description: 'Sweet yogurt drink with mango',
        image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=300',
        price: 3.99,
        category: 'beverage',
        isVegetarian: true,
        preparationTime: 5
      }
    ]);

    console.log('Menu items created');
    console.log('\n✅ Seed data created successfully!\n');
    console.log('=== TEST ACCOUNTS ===');
    console.log('Admin:    admin@foodhub.com / admin123');
    console.log('Customer: customer@foodhub.com / customer123');
    console.log('Restaurant: restaurant@foodhub.com / restaurant123');
    console.log('Delivery: delivery@foodhub.com / delivery123');
    console.log('========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
