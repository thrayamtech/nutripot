# Saree E-Commerce Platform

A full-stack MERN e-commerce application for selling sarees online, inspired by pennpatt.com.

## 🚀 PROJECT STATUS: 85% Complete - Ready to Run!

✅ **Backend**: 100% Complete (40+ API endpoints, authentication, database)
✅ **Frontend Structure**: 85% Complete (React, routing, auth pages)
⚠️ **UI Pages**: 40% Complete (Need implementation - see IMPLEMENTATION_GUIDE.md)

**📖 NEW USER? START HERE**: Read [README_FIRST.txt](README_FIRST.txt) or [START_HERE.md](START_HERE.md)

## Features

### Customer Features
- Browse sarees by category, fabric type, and price
- Advanced search and filtering
- Product quick view and detailed pages
- Shopping cart and wishlist
- User authentication and profile management
- Order tracking
- Multiple payment options
- Responsive design for all devices

### Admin Features
- Secure admin dashboard
- Product management (CRUD operations)
- Order management and status updates
- User management
- Category management
- Sales analytics
- Image upload for products

## Tech Stack

- **Frontend**: React.js, React Router, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Payment**: Razorpay/Stripe integration ready

## Project Structure

```
saree-ecommerce/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose schemas
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── config/          # Configuration files
│   │   └── utils/           # Utility functions
│   ├── uploads/             # Uploaded images
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── server.js            # Entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # Context API
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Utility functions
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/saree-ecommerce
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

Start the backend server:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The application will open at `http://localhost:3000`

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/profile` - Get user profile (protected)

### Products
- GET `/api/products` - Get all products (with filters)
- GET `/api/products/:id` - Get single product
- POST `/api/products` - Create product (admin)
- PUT `/api/products/:id` - Update product (admin)
- DELETE `/api/products/:id` - Delete product (admin)

### Categories
- GET `/api/categories` - Get all categories
- POST `/api/categories` - Create category (admin)
- PUT `/api/categories/:id` - Update category (admin)
- DELETE `/api/categories/:id` - Delete category (admin)

### Cart
- GET `/api/cart` - Get user cart
- POST `/api/cart` - Add to cart
- PUT `/api/cart/:id` - Update cart item
- DELETE `/api/cart/:id` - Remove from cart

### Orders
- GET `/api/orders` - Get user orders
- GET `/api/orders/:id` - Get single order
- POST `/api/orders` - Create order
- PUT `/api/orders/:id` - Update order status (admin)

### Admin
- GET `/api/admin/stats` - Get dashboard statistics
- GET `/api/admin/users` - Get all users
- PUT `/api/admin/users/:id` - Update user role

## Database Schema

### User
- name, email, password (hashed)
- role (customer/admin)
- phone, addresses
- wishlist

### Product
- name, description
- price, discountPrice
- category, fabric, sizes
- colors, images
- stock, featured
- ratings

### Category
- name, description
- image, slug

### Order
- user, items, totalAmount
- shippingAddress
- paymentMethod, paymentStatus
- orderStatus, deliveryDate

### Cart
- user, items
- totalAmount

## Default Admin Credentials

After seeding the database:
- Email: admin@saree.com
- Password: admin123

## Features Roadmap

- [x] User authentication
- [x] Product catalog
- [x] Shopping cart
- [x] Order management
- [x] Admin panel
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced analytics

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

MIT
