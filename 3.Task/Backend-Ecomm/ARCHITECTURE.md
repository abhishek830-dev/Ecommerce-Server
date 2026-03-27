# Architecture & Code Structure Guide

## Project Overview

```
Backend-Ecomm (SQLite-powered REST API)
    ├── Express Layer (server.js)
    ├── Database Layer (db.js)
    └── Data Layer (products.json)
```

## Core Files Explained

### 1. **server.js** - API Server

**Responsibility**: Handle HTTP requests and route them

**Key Sections**:

```
├── Imports & Setup
│   ├── Fastify initialization
│   └── Database module import
│
├── Schema Definition
│   ├── productSchema (response format)
│   └── productRequestSchema (request format)
│
├── Plugin Registration
│   ├── Swagger documentation
│   └── Swagger UI
│
├── Route Handlers
│   ├── General Products Routes
│   │   ├── GET /products (with filters)
│   │   ├── GET /products/:id
│   │   ├── POST /products
│   │   ├── PUT /products/:id
│   │   └── DELETE /products/:id
│   │
│   ├── Categories Routes
│   │   ├── GET /categories
│   │   └── Category-Specific Loop (7 categories)
│   │       ├── GET /categories/{cat}/products
│   │       ├── GET /categories/{cat}/stats
│   │       └── POST /categories/{cat}/products
│   │
│   └── Statistics Routes
│       ├── GET /statistics
│       └── GET /health
│
└── Server Lifecycle
    └── start() - Initialize and listen
```

**Pattern**: Each endpoint logs properly, validates input, calls db, returns response

### 2. **db.js** - Database Operations

**Responsibility**: All database interactions

**Architecture**:

```
┌─ Database Connection ─┐
│  const db = new       │
│    Database(...)      │
└───────────────────────┘
           ↓
┌─ Schema Initialization ─┐
│  initializeDatabase()   │
│  └─ Creates tables      │
│  └─ Creates indexes     │
└─────────────────────────┘
           ↓
┌─ Query Functions ─┐
│ Read Operations   │
├─ getProducts()   │ (with filter logic)
├─ getProductById()│
├─ getCategories() │
└─ getStatistics() │
           ↑
│ Write Operations  │
├─ createProduct() │
├─ updateProduct() │
├─ deleteProduct() │
└─ bulkInsert...() │
           ↑
│ Helper Functions  │
├─ clearProducts() │
└─ (transactions)  │
```

**Key Functions**:

1. **getProducts(opts)** - Most complex

   ```
   Input: page, limit, category, minPrice, maxPrice, rating, search, sortBy, sortOrder
   Process:
   ├─ Build SQL query dynamically
   ├─ Add WHERE clauses based on options
   ├─ Add ORDER BY clause
   ├─ Add LIMIT/OFFSET for pagination
   └─ Return: {total, page, limit, data}
   ```

2. **createProduct(data)** - Insert operation

   ```
   Input: {title, description, price, category, rating, stock, brand}
   Process:
   ├─ Validate required fields
   ├─ Insert into products table
   ├─ Get auto-generated ID
   └─ Return: {id, ...data, createdAt, updatedAt}
   ```

3. **updateProduct(id, data)** - Patch operation

   ```
   Input: id, partial data
   Process:
   ├─ Get existing product
   ├─ Merge with new data
   ├─ Update in database
   └─ Return: updated product
   ```

4. **bulkInsertProducts(products)** - Seeding
   ```
   Input: Array of products
   Process:
   ├─ Create transaction
   ├─ Insert all products
   ├─ Rollback on error
   └─ Commit on success
   ```

### 3. **seed.js** - Data Seeding

**Responsibility**: Populate database from JSON

**Flow**:

```
Start seedDatabase()
    ↓
Initialize Database
    ↓
Read products.json
    ↓
Clear Existing Data
    ↓
Format Products
    ↓
Bulk Insert
    ↓
Display Success Message
    ↓
Exit
```

**Error Handling**:

- Missing products.json → Exit with error
- Database errors → Log and exit
- Success → Exit with success code

### 4. **products.json** - Data Source

**Format**: Array of product objects

```json
[
  {
    "id": 1,
    "title": "...",
    "description": "...",
    "price": 100,
    "category": "Electronics",
    "rating": 4.5,
    "stock": 100,
    "brand": "...",
    "createdAt": "2025-06-09T21:59:09.743Z"
  }
]
```

---

## Data Flow Diagrams

### Creating a Product

```
POST /products
    ↓
server.js (POST handler)
    ├─ Validate request body
    └─ Call createProduct()
        ↓
    db.js (createProduct)
        ├─ Prepare INSERT statement
        ├─ Execute with parameters
        ├─ Get inserted ID
        └─ Return new product
    ↓
Server
    └─ Return 201 Created
```

### Fetching Products with Filters

```
GET /products?category=Electronics&minPrice=100
    ↓
server.js
    ├─ Parse query parameters
    └─ Call getProducts()
        ↓
    db.js (getProducts)
        ├─ Build base query
        ├─ Add WHERE category = ?
        ├─ Add WHERE price >= ?
        ├─ Add ORDER BY
        ├─ Add LIMIT/OFFSET
        ├─ Prepare statements
        ├─ Execute count query
        ├─ Execute data query
        └─ Return {total, page, limit, data}
    ↓
Server
    └─ Return 200 OK with data
```

### Updating a Product

```
PUT /products/1
    ↓
server.js
    ├─ Parse ID and body
    └─ Call updateProduct()
        ↓
    db.js (updateProduct)
        ├─ SELECT existing product
        ├─ Merge data
        ├─ UPDATE product
        └─ Return updated product
    ↓
Server
    └─ Return 200 OK with updated data
```

---

## Database Query Examples

### Simple Filtering

```javascript
// User calls:
GET /products?category=Electronics

// db.js does:
SELECT * FROM products
WHERE category = ?
LIMIT 10 OFFSET 0

// Parameters: ["Electronics"]
```

### Complex Filtering

```javascript
// User calls:
GET /products?category=Electronics&minPrice=200&maxPrice=500&rating=4

// db.js does:
SELECT * FROM products
WHERE category = ?
  AND price >= ?
  AND price <= ?
  AND rating >= ?
LIMIT 10 OFFSET 0

// Parameters: ["Electronics", 200, 500, 4]
```

### Search with Pagination

```javascript
// User calls:
GET /products?search=laptop&page=2&limit=20

// db.js does:
SELECT * FROM products
WHERE title LIKE ?
  OR description LIKE ?
ORDER BY createdAt DESC
LIMIT 20 OFFSET 20

// Parameters: ["%laptop%", "%laptop%"]
```

---

## Category Loop in Server.js

The server dynamically creates 21 category endpoints:

```javascript
const categoryRoutes = [
  "Electronics",
  "Clothing",
  "Books",
  "Sports",
  "Home",
  "Beauty",
  "Toys",
];

for (const category of categoryRoutes) {
  // For each category, create 3 endpoints:

  // 1. GET /categories/{category}/products
  fastify.get(`/categories/${category.toLowerCase()}/products`, ...);

  // 2. GET /categories/{category}/stats
  fastify.get(`/categories/${category.toLowerCase()}/stats`, ...);

  // 3. POST /categories/{category}/products
  fastify.post(`/categories/${category.toLowerCase()}/products`, ...);
}

// Result: 7 categories × 3 endpoints = 21 endpoints
```

---

## Error Handling Pattern

```javascript
// In all endpoints:

try {
  const result = dbFunction();

  if (!result) {
    return reply.code(404).send({ message: "Not found" });
  }

  reply.code(200); // or 201 for POST
  return result;
} catch (error) {
  fastify.log.error(error);
  return reply.code(500).send({ message: "Internal error" });
}
```

---

## Swagger Organization

```yaml
tags:
  - name: Products
    description: General product operations

  - name: Products - Electronics
    description: Electronics category products

  - name: Products - Clothing
    description: Clothing category products

  # ... 5 more categories

  - name: Statistics
    description: API statistics and analytics
```

Each endpoint is tagged with:

- Category + operation (e.g., "Products - Electronics")
- Comprehensive description
- Schema definitions

---

## Dependencies & Versions

```json
{
  "fastify": "^5.8.2", // Web framework
  "better-sqlite3": "^9.2.2", // SQLite driver
  "@fastify/swagger": "^9.7.0", // Swagger generator
  "@fastify/swagger-ui": "^5.2.5", // Swagger UI
  "nodemon": "^3.1.14" // Dev auto-reload
}
```

---

## Port & Configuration

```javascript
// server.js - Line with listen call
await fastify.listen({ port: 3001, host: "0.0.0.0" });

// To change:
// - Edit port: 3001 → desired port
// - host "0.0.0.0" allows all interfaces
// - Change to "localhost" for local-only
```

---

## Database File Location

```
Database file: {project_root}/ecommerce.db
If moved or deleted:
  └─ Will be recreated on next seed or server start
```

---

## Testing Each Layer

### Test Database Layer

```bash
node -e "const db = require('./db'); console.log(db.getProducts())"
```

### Test Seeding

```bash
npm run seed
```

### Test Server

```bash
npm run dev
# Then: curl http://localhost:3001/products
```

### Test Swagger

```
Open: http://localhost:3001/docs
```

---

## Performance Considerations

1. **Indexes**: Used on frequently queried columns
   - `category` → for category filtering
   - `price` → for price range queries
   - `title` → for search/LIKE queries

2. **Pagination**: Always use limit to prevent loading all products

3. **Prepared Statements**: Prevent SQL injection

4. **Transactions**: Used in bulk operations for consistency

---

## Common Modifications

### Change Port

Edit server.js:

```javascript
await fastify.listen({ port: 3002, host: "0.0.0.0" });
```

### Add New Category

Edit server.js:

```javascript
const categoryRoutes = [
  // existing...
  "Electronics",
  "Clothing",
  // add new:
  "Furniture", // ← New category
];
```

### Add New Field to Products

1. Edit schema in db.js
2. Update productSchema in server.js
3. Update seed.js if including in imports

### Change Pagination Default

Edit db.js getProducts():

```javascript
const { page = 1, limit = 50, ... } = opts;  // Changed default
```

---

## File Size & Complexity

| File          | Size       | Complexity | Purpose                   |
| ------------- | ---------- | ---------- | ------------------------- |
| server.js     | ~400 lines | High       | All routing & integration |
| db.js         | ~300 lines | High       | All DB operations         |
| seed.js       | ~50 lines  | Low        | Data import               |
| products.json | Variable   | None       | Data source               |

Total: ~750 lines of production code

---

## Summary

- **Single responsibility**: Each file has clear purpose
- **Modular design**: Easy to extend/modify
- **Error handling**: Comprehensive across all layers
- **Performance**: Indexed queries for scalability
- **Documentation**: Inline comments + external guides
- **Production ready**: Proper HTTP status codes, validation, logging
