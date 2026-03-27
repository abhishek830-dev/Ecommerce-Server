# Backend-Ecomm Setup Guide

## Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Setup Database

```bash
npm run seed
```

This creates the SQLite database and loads products from `products.json`.

### Step 3: Start Server

```bash
npm run dev
```

### Step 4: Access APIs

- **API Base**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/docs
- **Health Check**: http://localhost:3001/health
- **Statistics**: http://localhost:3001/statistics

---

## Architecture Overview

### Three Main Files

1. **server.js** (Main API)
   - Fastify server with all routes
   - Routes organized by feature:
     - General products (CRUD, filters, search)
     - Category-specific operations
     - Statistics endpoints
   - Swagger documentation with proper tagging

2. **db.js** (Database Layer)
   - SQLite operations
   - Query builders
   - Database initialization
   - Transaction support
   - Bulk operations for seeding

3. **seed.js** (Data Loading)
   - Loads `products.json`
   - Initializes database schema
   - Bulk inserts product data
   - Clears old data before re-seeding

### Database Schema

```
products (main table)
├── id (PRIMARY KEY)
├── title
├── description
├── price
├── category (indexed for fast filtering)
├── rating
├── stock
├── brand
├── createdAt
├── updatedAt

Indexes:
├── idx_products_category → Fast category queries
├── idx_products_price → Fast price range queries
├── idx_products_title → Fast search/LIKE queries
```

---

## API Usage Examples

### Get All Products

```bash
curl "http://localhost:3001/products"
```

### Filter by Category

```bash
curl "http://localhost:3001/categories/electronics/products"
```

### Search Products

```bash
curl "http://localhost:3001/products?search=laptop"
```

### Price Range Filter

```bash
curl "http://localhost:3001/products?minPrice=100&maxPrice=500"
```

### Get Category Stats

```bash
curl "http://localhost:3001/categories/beauty/stats"
```

### Create Product

```bash
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "iPhone 15",
    "description": "Latest iPhone model",
    "price": 999,
    "category": "Electronics",
    "brand": "Apple",
    "rating": 5,
    "stock": 50
  }'
```

### Update Product

```bash
curl -X PUT http://localhost:3001/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price": 899, "stock": 45}'
```

### Delete Product

```bash
curl -X DELETE http://localhost:3001/products/1
```

---

## Available Categories

- Electronics
- Clothing
- Books
- Sports
- Home
- Beauty
- Toys

Each category has dedicated endpoints:

- `/categories/{category}/products` - Get products
- `/categories/{category}/stats` - Get statistics
- `/categories/{category}/products` - Create product

---

## Database Operations Reference

All operations are in `db.js`:

```javascript
// Get products with filtering
getProducts({
  page: 1,
  limit: 10,
  category: "Electronics",
  minPrice: 100,
  maxPrice: 500,
  rating: 4,
  search: "phone",
  sortBy: "price",
  sortOrder: "ASC",
});

// Get single product
getProductById(1);

// Create product
createProduct({
  title: "...",
  description: "...",
  price: 99.99,
  category: "...",
  brand: "...",
  rating: 4.5,
  stock: 100,
});

// Update product
updateProduct(1, { price: 199.99 });

// Delete product
deleteProduct(1);

// Get categories
getCategories();

// Get category products
getProductsByCategory("Electronics", page, limit);

// Get stats
getStatistics();
```

---

## Common Tasks

### Reset Database

```bash
rm ecommerce.db
npm run seed
```

### Run in Production

```bash
npm start
```

### View Live Logs

The server logs all operations to console.

### Test Specific Endpoint

Use curl or Postman with the base URL: `http://localhost:3001`

---

## Troubleshooting

| Issue                       | Solution                                                  |
| --------------------------- | --------------------------------------------------------- |
| "better-sqlite3 not found"  | Run `npm install`                                         |
| "Port 3001 in use"          | Change port in server.js or kill process: `lsof -i :3001` |
| "Database locked"           | Close other connections and restart server                |
| "No products after seeding" | Check `products.json` exists and run `npm run seed`       |
| "Swagger docs not loading"  | Restart server, clear browser cache                       |

---

## Response Format

All APIs return:

**Success (2xx)**:

```json
{
  "total": 100,
  "page": 1,
  "limit": 10,
  "data": [...],
  "category": "Electronics"
}
```

**Error (4xx/5xx)**:

```json
{
  "message": "Product not found"
}
```

---

## Performance Notes

- All queries use indexed fields for speed
- Pagination prevents loading entire dataset
- Database transactions ensure data consistency
- SQLite suitable for up to 1M products
- For larger datasets, consider PostgreSQL

---

## Next Steps

1. ✅ Install & seed database
2. ✅ Test endpoints with curl
3. ✅ Explore Swagger UI at /docs
4. ✅ Implement in your frontend
5. 🔜 Add authentication
6. 🔜 Add caching layer
7. 🔜 Add monitoring/logging

---

## File Reference

```
Backend-Ecomm/
├── server.js          ← Main API (all routes)
├── db.js              ← Database operations
├── seed.js            ← Data loading script
├── products.json      ← Source data (~220 products)
├── ecommerce.db       ← SQLite database (auto-created)
├── package.json       ← Dependencies
├── SETUP_GUIDE.md     ← This file
└── README.md          ← Full documentation
```

---

## Support

For detailed API documentation, visit: **http://localhost:3001/docs**
