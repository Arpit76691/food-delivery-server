# FoodHub - Food Delivery App

## Project Overview
A full-stack food delivery web application built with the MERN stack (MongoDB, Express.js, React, Node.js). Supports 4 user roles: Customer, Restaurant Owner, Delivery Agent, and Administrator.

---

## Tech Stack

### Frontend
- **React 18.2** - UI framework with hooks
- **React Router DOM 6.21** - Client-side routing
- **Axios 1.6** - HTTP client with interceptors
- **Vite 5.0** - Build tool/dev server
- **React Toastify 9.1** - Notifications

### Backend
- **Node.js + Express 4.18** - Web framework
- **MongoDB + Mongoose 8.0** - Database
- **JWT (jsonwebtoken 9.0)** - Authentication
- **bcryptjs 2.4** - Password hashing
- **express-validator 7.0** - Input validation
- **express-rate-limit 8.3** - Rate limiting

---

## Project Structure

```
food-delivery-app/
├── client/src/
│   ├── components/      # Navbar.jsx, Reviews.jsx
│   ├── context/         # AuthContext.jsx, CartContext.jsx
│   ├── pages/           # 10 page components
│   ├── utils/api.js     # Axios instance
│   └── App.jsx          # Main app with routing
└── server/
    ├── config/db.js     # MongoDB connection
    ├── controllers/     # 7 controllers
    ├── middleware/      # auth.js, rateLimiter.js, validate.js
    ├── models/          # 5 Mongoose schemas
    ├── routes/          # 7 route files
    ├── validators/      # 4 validator schemas
    └── server.js        # Express entry point
```

---

## User Roles

| Role | Permissions |
|------|-------------|
| **customer** | Browse, order, review, track orders |
| **restaurant** | Create/manage restaurant, CRUD menu, view/update orders |
| **delivery** | View assigned orders, update delivery status |
| **admin** | Full access: manage users, restaurants, orders, reviews |

---

## Database Models

### User
```javascript
{ name, email, password (hashed), phone, address, 
  role: 'customer'|'restaurant'|'delivery'|'admin', 
  isApproved, timestamps }
```

### Restaurant
```javascript
{ name, description, image, cuisine[], address,
  rating (0-5), totalReviews, priceRange, deliveryTime,
  isOpen, owner (ref: User), timestamps }
```

### MenuItem
```javascript
{ restaurant (ref), name, description, image, price,
  category: 'appetizer'|'main'|'dessert'|'beverage'|'side',
  isVegetarian, isAvailable, preparationTime, timestamps }
```

### Order
```javascript
{ customer (ref), restaurant (ref), deliveryAgent (ref),
  items[], deliveryAddress, subtotal, deliveryFee, tax, total,
  paymentMethod, paymentStatus, 
  status: 'pending'|'confirmed'|'preparing'|'out-for-delivery'|'delivered'|'cancelled',
  timestamps }
```

### Review
```javascript
{ user (ref), restaurant (ref), order (ref),
  rating (1-5), comment, foodRating, deliveryRating,
  isApproved, helpful, images[], timestamps }
// Auto-updates restaurant rating on save/delete
```

---

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /profile` - Get user profile (Protected)
- `PUT /profile` - Update profile (Protected)

### Restaurants (`/api/restaurants`)
- `GET /` - Get all restaurants (filters: cuisine, search, minRating, page, limit)
- `GET /:id` - Get restaurant by ID
- `GET /:id/menu` - Get restaurant menu
- `POST /` - Create restaurant (Protected: restaurant, admin)
- `PUT /:id` - Update restaurant (Protected)
- `DELETE /:id` - Delete restaurant (Protected)

### Menu (`/api/menu`)
- `GET /` - Get menu items (filters: restaurant, category, search)
- `GET /:id` - Get menu item by ID
- `POST /` - Create menu item (Protected)
- `PUT /:id` - Update menu item (Protected)
- `DELETE /:id` - Delete menu item (Protected)

### Orders (`/api/orders`)
- `POST /` - Create order (Protected)
- `GET /customer/myorders` - Get customer orders (Protected)
- `GET /restaurant/:id` - Get restaurant orders (Protected)
- `GET /delivery/myorders` - Get delivery orders (Protected)
- `GET /:id` - Get order by ID (Protected)
- `PUT /:id/status` - Update order status (Protected)
- `PUT /:id/assign` - Assign delivery agent (Protected: admin)

### Reviews (`/api/reviews`)
- `GET /restaurant/:id` - Get restaurant reviews
- `GET /restaurant/:id/stats` - Get review statistics
- `POST /` - Create review (Protected: customer)
- `PUT /:id` - Update review (Protected: owner)
- `DELETE /:id` - Delete review (Protected)
- `POST /:id/helpful` - Mark helpful (Protected)

### Admin (`/api/admin`)
- `GET /dashboard/stats` - Dashboard statistics
- `GET /analytics` - Analytics data
- `GET /users` - All users
- `PUT /users/:id` - Update user role
- `DELETE /users/:id` - Delete user
- `GET /restaurants` - All restaurants
- `PUT /restaurants/:id/approve` - Approve restaurant
- `GET /orders` - All orders
- `PUT /orders/:id/assign` - Assign delivery

---

## Authentication Flow

1. **Registration**: Email/password → bcrypt hash (salt: 10) → JWT token (30 days)
2. **Login**: Validate credentials → Generate JWT → Store in localStorage
3. **Protected Routes**: Axios interceptor adds `Authorization: Bearer <token>`
4. **Middleware**: `protect` verifies JWT, `authorize(...roles)` checks role

---

## State Management

### AuthContext
- Manages: user, loading, isAuthenticated
- Methods: login(), register(), logout(), updateUser()
- Persists: token + user to localStorage

### CartContext
- Manages: cart array, isCartOpen
- Methods: addToCart(), removeFromCart(), updateQuantity(), clearCart()
- Persists: cart to localStorage
- Enforces: single-restaurant policy

---

## Order Status Flow

```
pending → confirmed → preparing → out-for-delivery → delivered
                                    ↑
                               (cancelled)
```

**Permissions:**
- Restaurant: pending → confirmed → preparing → out-for-delivery
- Delivery: out-for-delivery → delivered
- Admin/Customer: Any → cancelled (if pending)

---

## Security Features

- JWT authentication (30-day expiry)
- bcrypt password hashing (10 salt rounds)
- Rate limiting: 100 req/15min (general), 100/min (auth), 5 orders/5min
- Input validation with express-validator
- Role-based authorization middleware
- CORS enabled

---

## Pages/Routes

| Route | Component | Access |
|-------|-----------|--------|
| `/` | Home.jsx | Public |
| `/restaurants` | Restaurants.jsx | Public |
| `/restaurant/:id` | RestaurantDetail.jsx | Public |
| `/cart` | Cart.jsx | Public |
| `/login` | Login.jsx | Public |
| `/register` | Register.jsx | Public |
| `/orders` | Orders.jsx | Customer only |
| `/admin` | AdminDashboard.jsx | Admin only |
| `/restaurant-dashboard` | RestaurantDashboard.jsx | Restaurant only |
| `/delivery-dashboard` | DeliveryDashboard.jsx | Delivery only |

---

## Running the Application

### Backend Setup
```bash
cd server
npm install
npm run dev  # Runs on port 5000
```

### Frontend Setup
```bash
cd client
npm install
npm run dev  # Runs on port 3000
```

### Environment Variables (server/.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/food-delivery
JWT_SECRET=your-secret-key
NODE_ENV=development
```

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@foodhub.com | admin123 |
| Customer | customer@foodhub.com | customer123 |
| Restaurant | restaurant@foodhub.com | restaurant123 |
| Delivery | delivery@foodhub.com | delivery123 |

---

## Current Progress

### Completed
- ✅ Full backend API with all CRUD operations
- ✅ React frontend with 10 pages
- ✅ JWT authentication system
- ✅ Role-based access control
- ✅ Cart management with Context API
- ✅ Order placement and tracking
- ✅ Review system with approval workflow
- ✅ 4 role-specific dashboards
- ✅ Rate limiting and input validation
- ✅ Database seeding script

### Modified Files (Current Session)
- `client/src/App.jsx`
- `client/src/components/Navbar.jsx`
- `client/src/components/Reviews.jsx`
- `client/src/context/CartContext.jsx`
- `client/src/pages/AdminDashboard.jsx`
- `client/src/pages/Cart.jsx`
- `client/src/pages/Orders.jsx`
- `client/src/pages/RestaurantDashboard.jsx`
- `client/src/pages/RestaurantDetail.jsx`
- `client/src/pages/Restaurants.jsx`
- `client/src/utils/api.js`
- `server/controllers/menuController.js`
- `server/controllers/orderController.js`
- `server/controllers/restaurantController.js`
- `server/models/Restaurant.js`
- `server/routes/orderRoutes.js`
- `server/server.js`
- `server/validators/restaurantValidator.js`
- `client/src/pages/DeliveryDashboard.jsx` (new)

### Generated Reports
- ✅ `FoodHub_Project_Report.docx` - Comprehensive project report with 9 sections

---

## Key Implementation Details

### Cart Single-Restaurant Policy
When adding an item from a different restaurant, the cart clears and shows a notification.

### Review System
- One review per order (unique index on user+order)
- Reviews can be approved by admin before display
- Helpful counter for reviews
- Auto-updates restaurant rating on save/delete

### Rate Limiting
- General API: 100 requests per 15 minutes
- Auth endpoints: 100 requests per minute
- Order creation: 5 requests per 5 minutes

---

## Future Enhancements

1. WebSocket for real-time order tracking
2. Payment gateway integration (Stripe/Razorpay)
3. Push notifications
4. Mobile app (React Native)
5. Advanced analytics dashboard
6. Elasticsearch for better search
7. Live delivery tracking with GPS
8. Group ordering for events
9. Loyalty points system
10. OAuth integration (Google, Facebook)
