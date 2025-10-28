# Almasdar Security - Backend API

Complete e-commerce backend for security systems store.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication (access + refresh tokens)
- Role-based access control (Admin, Staff, Customer)
- Password encryption with bcrypt
- Password reset functionality

### Product Management
- Full CRUD operations
- Advanced filtering & search
- Stock management
- Product categories
- SKU tracking
- Product specifications & documents

### Shopping Experience
- Shopping cart
- Wishlist
- Product reviews & ratings
- Coupon/discount codes

### Order Management
- Order creation from cart
- Order tracking
- Status updates
- Order history
- Cancellation

### User Management
- User profiles
- Multiple addresses
- Order history
- Password change

### Admin Features
- Dashboard analytics
- Sales reports
- Product performance
- Customer analytics
- Inventory reports
- Review management

### File Upload
- Product images (up to 5 per product)
- Product documents (PDF, DOC, etc.)
- User avatars

## 📦 Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Security**: Helmet, CORS, bcrypt, rate-limiting
- **File Upload**: Multer
- **Language**: TypeScript

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts              # MongoDB connection
│   │   └── env.ts             # Environment variables
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT authentication & authorization
│   │   ├── errorHandler.ts     # Error handling
│   │   ├── rateLimit.middleware.ts # Rate limiting
│   │   ├── upload.middleware.ts    # File upload
│   │   └── validate.ts         # Zod validation
│   ├── models/
│   │   ├── cart.model.ts       # Shopping cart
│   │   ├── coupon.model.ts     # Discount coupons
│   │   ├── order.model.ts      # Orders
│   │   ├── product.model.ts    # Products
│   │   ├── review.model.ts     # Product reviews
│   │   ├── user.model.ts       # Users
│   │   ├── wishlist.model.ts   # Wishlist
│   │   └── types.ts            # TypeScript types
│   ├── routes/
│   │   ├── admin.routes.ts     # Admin analytics
│   │   ├── auth.routes.ts      # Authentication
│   │   ├── cart.routes.ts      # Shopping cart
│   │   ├── coupon.routes.ts    # Coupons
│   │   ├── health.routes.ts    # Health check
│   │   ├── order.routes.ts     # Orders
│   │   ├── product.routes.ts   # Products
│   │   ├── review.routes.ts    # Reviews
│   │   ├── upload.routes.ts    # File uploads
│   │   ├── user.routes.ts      # User profile
│   │   └── wishlist.routes.ts  # Wishlist
│   ├── services/
│   │   ├── auth.service.ts     # Auth business logic
│   │   └── email.service.ts    # Email notifications
│   ├── utils/
│   │   └── logger.ts           # Logging utility
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
├── tests/
│   └── health.spec.ts          # Tests
├── Dockerfile                  # Docker build
├── package.json
└── tsconfig.json
```

## 🔐 Environment Variables

Create `.env` file:

```env
NODE_ENV=development
PORT=8080
MONGO_URI=mongodb://root:rootpass@mongodb:27017/almasdar?authSource=admin
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CORS_ORIGIN=http://localhost:4200
UPLOAD_DIR=uploads
```

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login
POST   /api/auth/refresh-token     # Refresh access token
```

### Products
```
GET    /api/products               # List products (with filters)
GET    /api/products/:id           # Get single product
POST   /api/products               # Create product (admin/staff)
PUT    /api/products/:id           # Update product (admin/staff)
DELETE /api/products/:id           # Delete product (admin)
PATCH  /api/products/:id/stock     # Update stock (admin/staff)
GET    /api/products/meta/categories # Get categories
```

### Cart
```
GET    /api/cart                   # Get user's cart
POST   /api/cart                   # Add item to cart
PUT    /api/cart/:productId        # Update item quantity
DELETE /api/cart/:productId        # Remove item
DELETE /api/cart                   # Clear cart
```

### Orders
```
POST   /api/orders                 # Create order from cart
GET    /api/orders                 # Get user's orders
GET    /api/orders/:id             # Get single order
POST   /api/orders/:id/cancel      # Cancel order
GET    /api/orders/admin/all       # Get all orders (admin/staff)
PUT    /api/orders/:id/status      # Update order status (admin/staff)
```

### Wishlist
```
GET    /api/wishlist               # Get user's wishlist
POST   /api/wishlist               # Add product to wishlist
DELETE /api/wishlist/:productId    # Remove from wishlist
DELETE /api/wishlist               # Clear wishlist
```

### Reviews
```
GET    /api/reviews/product/:productId  # Get product reviews
POST   /api/reviews                     # Create review
PUT    /api/reviews/:id                 # Update review
DELETE /api/reviews/:id                 # Delete review
POST   /api/reviews/:id/helpful         # Mark review helpful
GET    /api/reviews/my-reviews          # Get user's reviews
```

### User Profile
```
GET    /api/users/profile               # Get current user
PUT    /api/users/profile               # Update profile
GET    /api/users/addresses             # Get addresses
POST   /api/users/addresses             # Add address
PUT    /api/users/addresses/:addressId  # Update address
DELETE /api/users/addresses/:addressId  # Delete address
POST   /api/users/change-password       # Change password
```

### File Upload
```
POST   /api/upload/image                # Upload single image
POST   /api/upload/images               # Upload multiple images
POST   /api/upload/document             # Upload document (admin/staff)
```

### Coupons
```
POST   /api/coupons/validate            # Validate coupon code
POST   /api/coupons                     # Create coupon (admin)
GET    /api/coupons                     # List coupons (admin/staff)
GET    /api/coupons/:id                 # Get coupon (admin/staff)
PUT    /api/coupons/:id                 # Update coupon (admin)
DELETE /api/coupons/:id                 # Delete coupon (admin)
PATCH  /api/coupons/:id/deactivate      # Deactivate coupon (admin)
```

### Admin Analytics
```
GET    /api/admin/dashboard             # Dashboard stats
GET    /api/admin/sales                 # Sales report
GET    /api/admin/products/performance  # Product performance
GET    /api/admin/customers/analytics   # Customer analytics
GET    /api/admin/inventory             # Inventory report
GET    /api/admin/reviews/analytics     # Reviews analytics
```

## 🛡️ Security Features

- **Rate Limiting**: 
  - General API: 100 req/15min
  - Auth endpoints: 5 req/hour
  - Product operations: 100 req/hour
- **Helmet**: Security headers
- **CORS**: Configurable origins
- **JWT**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Zod schemas

## 🚀 Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Start MongoDB (Docker)
docker-compose up mongodb -d

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

### With Docker

```bash
# Build and start all services
docker-compose up --build

# Stop services
docker-compose down
```

## 📊 Database Models

### User
- Email, password (hashed)
- Role: admin | customer | staff
- Profile: firstName, lastName, phone, company, avatar
- Multiple addresses
- Password reset tokens

### Product
- Name, description, price
- Category, SKU, brand
- Images (array)
- Specifications, features
- Stock, status
- Technical details, documents

### Order
- Customer reference
- Items (product, quantity, price)
- Shipping & billing addresses
- Status: pending | confirmed | shipped | delivered | cancelled
- Payment status: pending | paid | refunded | failed
- Tracking number
- Totals (subtotal, tax, shipping, total)

### Cart
- User reference
- Items (product, quantity, price, name, image, SKU)
- Auto-calculated subtotal

### Review
- Product & user references
- Rating (1-5)
- Title, comment
- Verified purchase flag
- Helpful count

### Wishlist
- User reference
- Array of product references

### Coupon
- Code (unique)
- Discount type: percentage | fixed
- Min purchase, max discount
- Valid dates
- Usage limits

## 📝 Notes

- All authenticated routes require `Authorization: Bearer <token>` header
- Admin/staff routes have additional role checks
- File uploads are stored in `/uploads` directory
- Email service is logged in development, ready for production integration
- Pagination is available on list endpoints (page, limit params)

## 🔄 Next Steps for Frontend

1. **Authentication Pages**: Login, Register, Password Reset
2. **Product Catalog**: Grid/List view, Filters, Search
3. **Product Details**: Images, Specs, Reviews, Add to Cart
4. **Shopping Cart**: View, Update quantities, Checkout
5. **Checkout Process**: Shipping info, Payment, Order confirmation
6. **User Dashboard**: Profile, Orders, Wishlist, Addresses
7. **Admin Dashboard**: Analytics, Product management, Order management
8. **Reviews**: Submit and view reviews
9. **Responsive Design**: Mobile-first approach

## 📦 Production Deployment

1. Set secure JWT secrets
2. Configure production MongoDB
3. Set up email service (SendGrid, AWS SES, etc.)
4. Configure file storage (S3, Cloudinary, etc.)
5. Set up SSL/HTTPS
6. Configure production CORS origins
7. Set up monitoring and logging
8. Configure backup strategy
