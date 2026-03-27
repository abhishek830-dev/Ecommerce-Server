# Testing & Debugging Guide

## Quick Test Script

Run these commands in order to verify everything is working:

```bash
# 1. Install dependencies
npm install
echo "✓ Dependencies installed"

# 2. Seed database
npm run seed
echo "✓ Database seeded"

# 3. Start server
npm run dev &
SERVER_PID=$!
sleep 3
echo "✓ Server started (PID: $SERVER_PID)"

# 4. Test endpoints
echo ""
echo "=== Testing Endpoints ==="

echo "🔍 Health Check..."
curl -s http://localhost:3001/health | jq .

echo "🔍 Statistics..."
curl -s http://localhost:3001/statistics | jq .

echo "🔍 Categories..."
curl -s http://localhost:3001/categories | jq .

echo "🔍 Products (First 2)..."
curl -s "http://localhost:3001/products?limit=2" | jq .

echo "🔍 Electronics (First 3)..."
curl -s "http://localhost:3001/categories/electronics/products?limit=3" | jq .

echo "🔍 Electronics Stats..."
curl -s http://localhost:3001/categories/electronics/stats | jq .

# 5. Cleanup
kill $SERVER_PID
echo "✓ All tests passed!"
```

---

## Manual Testing with curl

### 1. Health & Status

**Health Check**:

```bash
curl http://localhost:3001/health
```

Expected: `{"status":"ok","timestamp":"2025-03-27T..."}`

**Statistics**:

```bash
curl http://localhost:3001/statistics
```

Expected: Complete catalog statistics

### 2. Read Operations

**Get All Products**:

```bash
curl "http://localhost:3001/products"
```

**Get With Pagination**:

```bash
curl "http://localhost:3001/products?page=1&limit=5"
```

**Get Product by ID**:

```bash
curl http://localhost:3001/products/1
```

**Search**:

```bash
curl "http://localhost:3001/products?search=laptop"
```

**Filter by Category**:

```bash
curl "http://localhost:3001/products?category=Electronics"
```

**Price Range**:

```bash
curl "http://localhost:3001/products?minPrice=100&maxPrice=500"
```

**Rating Filter**:

```bash
curl "http://localhost:3001/products?rating=4"
```

**Sorting**:

```bash
# By price ascending
curl "http://localhost:3001/products?sortBy=price&sortOrder=ASC"

# By rating descending
curl "http://localhost:3001/products?sortBy=rating&sortOrder=DESC"
```

**Combined Filters**:

```bash
curl "http://localhost:3001/products?category=Electronics&minPrice=200&maxPrice=1000&rating=4&limit=10&page=1"
```

### 3. Write Operations

**Create Product**:

```bash
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Product",
    "description": "This is a test product",
    "price": 99.99,
    "category": "Electronics",
    "brand": "TestBrand",
    "rating": 4.5,
    "stock": 50
  }'
```

**Update Product**:

```bash
curl -X PUT http://localhost:3001/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 149.99,
    "stock": 75
  }'
```

**Delete Product**:

```bash
curl -X DELETE http://localhost:3001/products/1
```

### 4. Category Operations

**Get Category Products**:

```bash
curl "http://localhost:3001/categories/electronics/products"
```

**Get Category Stats**:

```bash
curl http://localhost:3001/categories/electronics/stats
```

**Create in Category**:

```bash
curl -X POST http://localhost:3001/categories/electronics/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "iPhone 15",
    "description": "Latest Apple iPhone",
    "price": 999,
    "brand": "Apple",
    "rating": 5,
    "stock": 100
  }'
```

---

## Using Postman

### Setup Collection

1. Create New Collection: "Backend-Ecomm"

2. Create Requests:

**Environment Variable** (optional):

```
base_url = http://localhost:3001
```

**Request Examples**:

| Method | Endpoint                                     | Notes                 |
| ------ | -------------------------------------------- | --------------------- |
| GET    | {{base_url}}/products                        | Test pagination query |
| GET    | {{base_url}}/products/1                      | Test single product   |
| POST   | {{base_url}}/products                        | Body: JSON product    |
| PUT    | {{base_url}}/products/1                      | Body: Partial JSON    |
| DELETE | {{base_url}}/products/1                      | No body needed        |
| GET    | {{base_url}}/categories                      | No params             |
| GET    | {{base_url}}/categories/electronics/products | Test category         |

---

## Node REPL Testing

Test database directly:

```javascript
const {
  initializeDatabase,
  getProducts,
  createProduct,
  getCategories,
} = require("./db.js");

// Initialize DB
initializeDatabase();

// Get all products
const allProducts = getProducts({ limit: 5 });
console.log(allProducts);

// Get Electronics
const electronics = getProducts({ category: "Electronics", limit: 3 });
console.log(electronics);

// Create product
const newProduct = createProduct({
  title: "Test",
  description: "Test product",
  price: 99.99,
  category: "Electronics",
  brand: "TestBrand",
});
console.log(newProduct);

// Get categories
const categories = getCategories();
console.log(categories);
```

---

## Common Issues & Fixes

### "Module not found: better-sqlite3"

```bash
# Solution 1: Install from scratch
rm -rf node_modules
npm install

# Solution 2: Rebuild native module
npm rebuild better-sqlite3
```

### "SQLITE_CANTOPEN" Error

```bash
# Issue: No write permission
# Solution: Check project directory permissions or move to writable location

chmod 755 /path/to/Backend-Ecomm
```

### Port 3001 Already in Use

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in server.js
```

### Database Locked

```bash
# Issue: Multiple processes accessing DB
# Solution 1: Close all Node processes
pkill node

# Solution 2: Delete and reseed
rm ecommerce.db
npm run seed
```

### No Products After Seeding

```bash
# Verify products.json exists
ls -la products.json

# Check file is valid JSON
jq . products.json

# Clear and reseed
rm ecommerce.db
npm run seed
```

### Swagger Docs Not Loading

```bash
# Clear browser cache
# Restart server
npm run dev

# Verify Swagger routes
curl http://localhost:3001/docs
```

### Query Returns Empty Results

```bash
# Verify data exists
curl http://localhost:3001/products?limit=1

# Check category name (case-sensitive!)
curl http://localhost:3001/products?category=Electronics

# Try without filters
curl http://localhost:3001/products?limit=10
```

---

## Testing Different Scenarios

### Scenario 1: Create, Read, Update, Delete

```bash
# 1. Create
PRODUCT=$(curl -s -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test","price":99,"category":"Electronics","brand":"TestCo"}' \
  | jq '.data.id')

echo "Created product ID: $PRODUCT"

# 2. Read
curl -s http://localhost:3001/products/$PRODUCT | jq .

# 3. Update
curl -s -X PUT http://localhost:3001/products/$PRODUCT \
  -H "Content-Type: application/json" \
  -d '{"price":149}' | jq .

# 4. Delete
curl -s -X DELETE http://localhost:3001/products/$PRODUCT | jq .

# 5. Verify deletion
curl -s http://localhost:3001/products/$PRODUCT
```

### Scenario 2: Filter & Search

```bash
# Search for all laptops
curl -s "http://localhost:3001/products?search=laptop&limit=10" | jq '.data | length'

# Get Electronics with price between 100-500
curl -s "http://localhost:3001/products?category=Electronics&minPrice=100&maxPrice=500&limit=10" | jq '.total'

# Get highly rated items
curl -s "http://localhost:3001/products?rating=4.5&limit=10" | jq '.data | length'
```

### Scenario 3: Category Operations

```bash
# Get all clothing products
curl -s http://localhost:3001/categories/clothing/products?limit=5 | jq '.total'

# Get beauty stats
curl -s http://localhost:3001/categories/beauty/stats | jq .

# Create sports product
curl -s -X POST http://localhost:3001/categories/sports/products \
  -H "Content-Type: application/json" \
  -d '{"title":"Football","description":"Soccer ball","price":29.99,"brand":"Nike","stock":100}' | jq '.data.id'
```

### Scenario 4: Pagination

```bash
# Get page 1
curl -s "http://localhost:3001/products?page=1&limit=5" | jq '.data | length'

# Get page 2
curl -s "http://localhost:3001/products?page=2&limit=5" | jq '.data | length'

# Get page 5
curl -s "http://localhost:3001/products?page=5&limit=10" | jq '.data | length'
```

---

## Monitoring & Logs

### Console Logs

Server prints:

- Initialization status
- Route registration
- Database operations
- Error messages

### Database Inspection

Direct SQLite inspection:

```bash
# Install SQLite CLI if needed
brew install sqlite

# Open database
sqlite3 ecommerce.db

# View all products
sqlite> SELECT COUNT(*) FROM products;
sqlite> SELECT * FROM products LIMIT 5;
sqlite> SELECT DISTINCT category FROM products;
sqlite> SELECT * FROM products WHERE category='Electronics' LIMIT 3;
sqlite> .quit
```

### Performance Monitoring

Check response times:

```bash
# With curl
time curl http://localhost:3001/products?limit=1000

# Watch for slow queries
sqlite3 ecommerce.db "EXPLAIN QUERY PLAN SELECT * FROM products WHERE category='Electronics'"
```

---

## Automated Testing Script

Save as `test.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3001"
PASS=0
FAIL=0

test_endpoint() {
  local name=$1
  local url=$2
  local expected=$3

  echo -n "Testing $name... "

  response=$(curl -s "$url")

  if echo "$response" | grep -q "$expected"; then
    echo "✓ PASS"
    ((PASS++))
  else
    echo "✗ FAIL"
    echo "  Response: $response"
    ((FAIL++))
  fi
}

# Run tests
test_endpoint "Health" "$BASE_URL/health" '"status":"ok"'
test_endpoint "Statistics" "$BASE_URL/statistics" '"totalProducts"'
test_endpoint "Categories" "$BASE_URL/categories" '"Electronics"'
test_endpoint "Products" "$BASE_URL/products?limit=1" '"data"'
test_endpoint "Product by ID" "$BASE_URL/products/1" '"title"'
test_endpoint "Electronics" "$BASE_URL/categories/electronics/products" '"category":"Electronics"'

echo ""
echo "Results: $PASS passed, $FAIL failed"
```

Run with:

```bash
chmod +x test.sh
./test.sh
```

---

## Debugging Tips

### Enable Verbose Logging

Modify `server.js`:

```javascript
const fastify = require("fastify")({
  logger: {
    level: "debug", // Add this
  },
});
```

### Debug Database Queries

Modify `db.js`:

```javascript
try {
  console.log("Executing query:", query);
  const result = stmt.all(...params);
  console.log("Query result:", result);
  return result;
} catch (err) {
  console.error("Query failed:", err, "Query:", query, "Params:", params);
  throw err;
}
```

### Check Swagger Schema

Visit: `http://localhost:3001/swagger.json`

This shows complete OpenAPI schema.

---

## Performance Baseline

Expected response times:

| Operation          | Time    | Notes                  |
| ------------------ | ------- | ---------------------- |
| Get products       | <10ms   | With pagination        |
| Search             | 15-50ms | Depends on search term |
| Filter by category | <10ms   | Indexed column         |
| Create product     | 5-10ms  | Insert operation       |
| Update product     | 5-10ms  | Update operation       |
| Get statistics     | 20-30ms | Aggregation query      |

---

## Load Testing (Optional)

Using Apache Bench:

```bash
# 1000 requests, 100 concurrent
ab -n 1000 -c 100 http://localhost:3001/products

# Results will show:
# - Requests per second
# - Min/Max/Avg response time
# - Failed requests
```

Using wrk:

```bash
# 4 threads, 100 connections, 2 minute test
wrk -t4 -c100 -d2m http://localhost:3001/products
```
