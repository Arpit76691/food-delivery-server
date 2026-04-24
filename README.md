# FoodHub - Food Delivery Application

A full-stack food delivery web application built with React, Node.js, Express, and MongoDB.

## Features

### Customer Features
- Browse restaurants by cuisine
- View restaurant menus with categories
- Add items to cart
- Place orders with delivery address
- Multiple payment options (Cash, Card, UPI)
- Track order history
- Real-time order status

### Restaurant Features
- Menu management (CRUD operations)
- View incoming orders
- Update order status

### Admin Features
- Dashboard with statistics
- Manage restaurants
- Manage users
- View all orders

### Delivery Agent Features
- View assigned orders
- Update delivery status

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Styling | CSS3 (Custom) |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcrypt |
| API | REST API |

## Project Structure

```
food-delivery-app/
├── server/
│   ├── config/        # Database configuration
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Auth middleware
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── .env           # Environment variables
│   └── server.js      # Entry point
├── client/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context (Auth)
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utilities (API)
│   │   └── main.jsx     # Entry point
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to server folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (already created):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/food-delivery
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   ```

4. Start MongoDB (if running locally):
   ```bash
   mongod
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to client folder:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open browser at `http://localhost:3000`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/profile | Get user profile |
| PUT | /api/auth/profile | Update profile |

### Restaurants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/restaurants | Get all restaurants |
| GET | /api/restaurants/:id | Get restaurant by ID |
| GET | /api/restaurants/:id/menu | Get restaurant menu |
| POST | /api/restaurants | Create restaurant |
| PUT | /api/restaurants/:id | Update restaurant |
| DELETE | /api/restaurants/:id | Delete restaurant |

### Menu Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/menu | Get all menu items |
| GET | /api/menu/:id | Get menu item by ID |
| POST | /api/menu | Create menu item |
| PUT | /api/menu/:id | Update menu item |
| DELETE | /api/menu/:id | Delete menu item |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/orders | Create order |
| GET | /api/orders/customer/myorders | Get customer orders |
| GET | /api/orders/restaurant/:id | Get restaurant orders |
| GET | /api/orders/:id | Get order by ID |
| PUT | /api/orders/:id/status | Update order status |

## User Roles

| Role | Description |
|------|-------------|
| customer | Browse, order, track orders |
| restaurant | Manage menu, process orders |
| delivery | View and deliver orders |
| admin | Full dashboard access |

## Default Test Accounts

Create these via the registration page:

1. **Customer Account**
   - Role: Customer
   - Browse and order food

2. **Restaurant Account**
   - Role: Restaurant
   - Add restaurants and menu items

3. **Admin Account**
   - Role: Admin
   - Access admin dashboard

## Screenshots

### Home Page
- Hero section with CTA
- Features section
- Popular cuisines

### Restaurant Listing
- Filter by cuisine
- Rating and delivery time
- Price range display

### Order Tracking
- Real-time status updates
- Order history
- Detailed order view

## Future Enhancements

- [ ] Real-time order tracking with Socket.io
- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] Push notifications
- [ ] Reviews and ratings
- [ ] Search functionality
- [ ] Advanced analytics dashboard
- [ ] Mobile app version

## License

MIT License - This project is for educational purposes.

## Developer

Built as a college capstone project.
