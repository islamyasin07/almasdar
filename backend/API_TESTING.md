# API Testing Guide

## Quick Test Commands (using curl or REST client)

### 1. Health Check
```bash
curl http://localhost:8080/api/health
```

### 2. Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "Test123!@#",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890"
    }
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "Test123!@#"
  }'
```

Save the `accessToken` from response for authenticated requests.

### 4. Create Product (Admin)
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "HD Security Camera",
    "description": "High definition security camera with night vision",
    "price": 299.99,
    "category": "cameras",
    "images": ["https://example.com/camera.jpg"],
    "specifications": {
      "resolution": "1080p",
      "nightVision": "Yes",
      "waterproof": "IP67"
    },
    "stock": 50,
    "sku": "CAM-HD-001",
    "brand": "SecureTech",
    "features": ["Night Vision", "Motion Detection", "Cloud Storage"],
    "warranty": "2 years"
  }'
```

### 5. List Products
```bash
curl http://localhost:8080/api/products?category=cameras&page=1&limit=10
```

### 6. Add to Cart
```bash
curl -X POST http://localhost:8080/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "productId": "PRODUCT_ID_HERE",
    "quantity": 2
  }'
```

### 7. Create Order
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    },
    "billingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    },
    "paymentMethod": "credit_card"
  }'
```

### 8. Add Review
```bash
curl -X POST http://localhost:8080/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "productId": "PRODUCT_ID_HERE",
    "rating": 5,
    "title": "Excellent camera!",
    "comment": "Great quality and easy to install. Night vision works perfectly."
  }'
```

### 9. Validate Coupon
```bash
curl -X POST http://localhost:8080/api/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SAVE10",
    "cartTotal": 500
  }'
```

### 10. Admin Dashboard
```bash
curl http://localhost:8080/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Test Data Seeds

### Create Admin User
First, manually register a user, then update in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@almasdar.com" },
  { $set: { role: "admin" } }
)
```

### Sample Product Categories
- cameras
- alarm-systems
- access-control
- video-doorbells
- smart-locks
- sensors
- nvr-dvr
- cables-accessories

### Sample Coupon
```json
{
  "code": "SAVE10",
  "discountType": "percentage",
  "discountValue": 10,
  "minPurchase": 100,
  "validFrom": "2025-01-01",
  "validTo": "2025-12-31",
  "usageLimit": 100
}
```

## Testing Tools

### Recommended
- **Postman**: Import API collection
- **Thunder Client**: VS Code extension
- **REST Client**: VS Code extension
- **curl**: Command line

### VS Code REST Client Example

Create `test.http` file:

```http
### Health Check
GET http://localhost:8080/api/health

### Register
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!@#",
  "profile": {
    "firstName": "Test",
    "lastName": "User"
  }
}

### Login
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!@#"
}

### List Products
GET http://localhost:8080/api/products
```

## Common Issues

### 1. MongoDB Connection
- Ensure MongoDB is running: `docker-compose up mongodb -d`
- Check connection string in `.env`

### 2. JWT Errors
- Token expired: Get new token via login
- Invalid token: Check Authorization header format

### 3. Rate Limiting
- Too many requests: Wait 15 minutes or adjust rate limits

### 4. File Upload
- Ensure `uploads/` directory exists
- Check file size limits (5MB for images, 10MB for docs)

### 5. CORS Errors
- Configure `CORS_ORIGIN` in `.env`
- Check frontend origin matches
