# Backend-Ecomm

**SQLite-powered ecommerce product API** with Fastify, featuring complete CRUD operations, advanced filtering, category-wise organization, and comprehensive Swagger documentation.

## Features

✨ **Database-Driven**: SQLite database with persistent storage
🏷️ **Category Organization**: Dedicated endpoints for Electronics, Clothing, Books, Sports, Home, Beauty, Toys
🔍 **Advanced Filtering**: Filter by category, price range, rating, and search
📊 **Statistics**: Get analytics for overall catalog and per-category stats
📚 **Swagger UI**: Interactive API documentation with category-wise grouping
🚀 **Seeding**: Bulk load products from `products.json`
⚡ **Fastify**: High-performance web framework
🔄 **Pagination**: Built-in pagination support

## Prerequisites

- **Node.js** (v14 or higher recommended)
- **npm** or **pnpm**
- **SQLite3** (included with better-sqlite3)

## Installation

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

This installs:

- `fastify` - Web framework
- `better-sqlite3` - SQLite database driver
- `@fastify/swagger` - Swagger documentation plugin
- `@fastify/swagger-ui` - Swagger UI interface
- `nodemon` - Development auto-reload

### 2. Seed the Database

Load products from `products.json` into SQLite:

```bash
npm run seed
```

This will:

- Create the SQLite database (`ecommerce.db`)
- Initialize all tables and indexes
- Insert ~220 products from `products.json`
- Clear any existing data and re-seed

### 3. Start the Server

**Development mode** (with auto-reload):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

Server will run on: `http://localhost:3001`

## Project Structure

```
Backend-Ecomm/
├── server.js          # Main Fastify server with all routes
├── db.js              # SQLite database module with CRUD operations
├── seed.js            # Database seeding script
├── products.json      # Product data for seeding
├── ecommerce.db       # SQLite database (created on first run)
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

## API Endpoints

### General Products

- **GET** `/products` - Get all products with filters, search, sorting, pagination
- **GET** `/products/:id` - Get single product by ID
- **POST** `/products` - Create new product
- **PUT** `/products/:id` - Update product
- **DELETE** `/products/:id` - Delete product

### Categories

- **GET** `/categories` - Get all available categories
- **GET** `/categories/{category}/products` - Get products by category
- **GET** `/categories/{category}/stats` - Get category statistics
- **POST** `/categories/{category}/products` - Create product in specific category

### Statistics & Health

- **GET** `/statistics` - Overall API statistics
- **GET** `/health` - Health check endpoint

## Query Parameters

### Filtering & Search

```bash
# Pagination
?page=1&limit=10

# Category filter
?category=Electronics

# Price range
?minPrice=100&maxPrice=500

# Rating filter
?rating=4

# Search
?search=smartphone

# Sorting
?sortBy=price&sortOrder=ASC
```

### Example Requests

**Get Electronics products with pagination**:

```bash
curl "http://localhost:3001/categories/electronics/products?page=1&limit=5"
```

**Search for products**:

```bash
curl "http://localhost:3001/products?search=laptop&limit=10"
```

**Filter by price range**:

```bash
curl "http://localhost:3001/products?minPrice=50&maxPrice=200"
```

**Get category statistics**:

```bash
curl "http://localhost:3001/categories/electronics/stats"
```

**Create a product**:

```bash
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Product",
    "description": "A great new product",
    "price": 99.99,
    "category": "Electronics",
    "brand": "BrandName",
    "rating": 4.5,
    "stock": 100
  }'
```

## Swagger UI Documentation

Open your browser and visit: **http://localhost:3001/docs**

The Swagger UI is organized by:

- **Products** - General operations
- **Products - [Category]** - Category-specific endpoints
- **Statistics** - Analytics endpoints

Each endpoint shows:

- Full description
- Query/body parameters
- Response schema
- Try-it-out functionality

## Database Schema

### Products Table

```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  category TEXT NOT NULL,
  rating REAL DEFAULT 0,
  stock INTEGER DEFAULT 0,
  brand TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:

- `idx_products_category` - For fast category filtering
- `idx_products_price` - For fast price-based queries
- `idx_products_title` - For search operations

## API Response Format

### Success Response

```json
{
  "total": 50,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "id": 1,
      "title": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "category": "Electronics",
      "rating": 4.5,
      "stock": 100,
      "brand": "BrandName",
      "createdAt": "2025-06-09T21:59:09.743Z",
      "updatedAt": "2025-06-09T21:59:09.743Z"
    }
  ]
}
```

### Error Response

```json
{
  "message": "Product not found"
}
```

## Environment & Configuration

Currently, the server is hardcoded to:

- **Port**: 3001
- **Host**: 0.0.0.0 (accessible from any interface)
- **Database**: `ecommerce.db` in project root

To customize, edit `server.js`:

```javascript
await fastify.listen({ port: 3001, host: "0.0.0.0" });
```

## Development Workflow

1. **Start dev server**:

   ```bash
   npm run dev
   ```

2. **In another terminal, test endpoints**:

   ```bash
   curl http://localhost:3001/products
   ```

3. **View Swagger docs**:
   Open http://localhost:3001/docs

4. **Reset database**:
   ```bash
   rm ecommerce.db
   npm run seed
   ```

## File Descriptions

### db.js

Core database module exposing functions:

- `initializeDatabase()` - Set up schema
- `getProducts()` - Query with filters
- `getProductById()` - Get single product
- `createProduct()` - Insert new product
- `updateProduct()` - Modify existing product
- `deleteProduct()` - Remove product
- `getCategories()` - List all categories
- `getProductsByCategory()` - Category filtering
- `getStatistics()` - API-wide statistics
- `bulkInsertProducts()` - Batch insert for seeding

### seed.js

Standalone script that:

- Reads `products.json`
- Initializes database
- Clears existing products
- Bulk inserts new data
- Provides console feedback

### server.js

Fastify server with:

- Swagger plugin registration
- All CRUD routes
- Category-specific routes
- Statistics endpoints
- Error handling
- Swagger documentation

## Troubleshooting

### "Module not found: better-sqlite3"

```bash
npm install
# If still fails, try:
npm install --save better-sqlite3
```

### "SQLITE_CANTOPEN" error

Ensure you have write permissions in the project directory.

### Port 3001 already in use

Change the port in `server.js` or kill the process:

```bash
lsof -i :3001
kill -9 <PID>
```

### Database locked error

Close all other connections to `ecommerce.dbdb` and restart the server.

## API Statistics Response

```json
{
  "totalProducts": 220,
  "totalCategories": 7,
  "totalBrands": 45,
  "avgPrice": 156.78,
  "minPrice": 3.0,
  "maxPrice": 3999.0,
  "avgRating": 3.2,
  "totalStock": 98450
}
```

## Next Steps / Future Enhancements

- Add authentication & authorization
- Implement request validation
- Add rate limiting
- Cache frequently accessed data
- Database migrations system
- User reviews & ratings system
- Wishlist functionality
- Order management

## License

ISC
-d '{"title":"New Item","description":"Desc","price":19.99,"category":"Toys","rating":4.5,"stock":120,"brand":"Acme"}'

````

- Update product:

```bash
curl -X PUT http://localhost:3001/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price":29.99}'
````

- Delete product:

```bash
curl -X DELETE http://localhost:3001/products/1
```

- Get categories:

```bash
curl http://localhost:3001/categories
```

- Regenerate products (admin/debug):
  - POST `/reload-products` body: `{ "count": 300, "seed": 999, "persist": true }`

```bash
curl -X POST http://localhost:3001/reload-products \
  -H "Content-Type: application/json" \
  -d '{"count":300,"seed":999,"persist":true}'
```

Persistence

- Generated or modified products are saved to `products.json` in the project directory so data survives restarts.
- To force regeneration without calling the endpoint, delete `products.json` and restart the server.

Notes & next steps

- `/reload-products` is not authenticated — consider adding a simple token or admin check before using in production.
- If you prefer a different default count or seed, edit `generateProducts()` call in [server.js](server.js).

Contact

- For questions about this repo, open an issue or message the maintainer.
