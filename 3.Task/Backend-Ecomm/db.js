const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "ecommerce.db");

// Initialize database connection
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma("foreign_keys = ON");

/**
 * Initialize database schema and tables
 */
function initializeDatabase() {
  const schema = `
    -- Products table
    CREATE TABLE IF NOT EXISTS products (
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

    -- Categories table
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create index on category for faster queries
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
    CREATE INDEX IF NOT EXISTS idx_products_title ON products(title);
  `;

  const statements = schema.split(";").filter((s) => s.trim());

  for (const statement of statements) {
    if (statement.trim()) {
      db.exec(statement);
    }
  }
}

/**
 * Get all products with filtering, sorting, and pagination
 */
function getProducts(opts = {}) {
  const {
    page = 1,
    limit = 10,
    category = null,
    minPrice = null,
    maxPrice = null,
    rating = null,
    search = null,
    sortBy = "createdAt",
    sortOrder = "DESC",
  } = opts;

  let query = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }

  if (minPrice !== null) {
    query += " AND price >= ?";
    params.push(minPrice);
  }

  if (maxPrice !== null) {
    query += " AND price <= ?";
    params.push(maxPrice);
  }

  if (rating !== null) {
    query += " AND rating >= ?";
    params.push(rating);
  }

  if (search) {
    query += " AND (title LIKE ? OR description LIKE ?)";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  // Get total count
  const countQuery = `SELECT COUNT(*) as count FROM products WHERE 1=1${params.length ? ` AND ${query.split("WHERE 1=1")[1]}` : ""}`;
  const countStmt = db.prepare(countQuery);
  const { count: total } = countStmt.get(...params);

  // Add sorting
  const validSortFields = [
    "id",
    "title",
    "price",
    "rating",
    "stock",
    "createdAt",
  ];
  const field = validSortFields.includes(sortBy) ? sortBy : "createdAt";
  const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";
  query += ` ORDER BY ${field} ${order}`;

  // Add pagination
  const offset = (page - 1) * limit;
  query += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const stmt = db.prepare(query);
  const data = stmt.all(...params);

  return {
    total,
    page,
    limit,
    data,
  };
}

/**
 * Get product by ID
 */
function getProductById(id) {
  const stmt = db.prepare("SELECT * FROM products WHERE id = ?");
  return stmt.get(id);
}

/**
 * Create new product
 */
function createProduct(productData) {
  const { title, description, price, category, rating, stock, brand } =
    productData;

  const stmt = db.prepare(`
    INSERT INTO products (title, description, price, category, rating, stock, brand, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);

  const result = stmt.run(
    title,
    description,
    price,
    category,
    rating || 0,
    stock || 0,
    brand,
  );

  return {
    id: result.lastInsertRowid,
    ...productData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Update product
 */
function updateProduct(id, productData) {
  const existingProduct = getProductById(id);
  if (!existingProduct) return null;

  const updatedData = {
    ...existingProduct,
    ...productData,
    updatedAt: new Date(),
  };

  const { title, description, price, category, rating, stock, brand } =
    updatedData;

  const stmt = db.prepare(`
    UPDATE products 
    SET title = ?, description = ?, price = ?, category = ?, rating = ?, stock = ?, brand = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(title, description, price, category, rating, stock, brand, id);

  return updatedData;
}

/**
 * Delete product
 */
function deleteProduct(id) {
  const product = getProductById(id);
  if (!product) return null;

  const stmt = db.prepare("DELETE FROM products WHERE id = ?");
  stmt.run(id);

  return product;
}

/**
 * Get all categories
 */
function getCategories() {
  const stmt = db.prepare(
    "SELECT DISTINCT category FROM products ORDER BY category",
  );
  return stmt.all().map((row) => row.category);
}

/**
 * Get products by category with pagination
 */
function getProductsByCategory(category, page = 1, limit = 10) {
  const opts = {
    category,
    page,
    limit,
  };
  return getProducts(opts);
}

/**
 * Get product statistics
 */
function getStatistics() {
  const stats = db
    .prepare(
      `
    SELECT
      COUNT(*) as totalProducts,
      COUNT(DISTINCT category) as totalCategories,
      COUNT(DISTINCT brand) as totalBrands,
      AVG(price) as avgPrice,
      MIN(price) as minPrice,
      MAX(price) as maxPrice,
      AVG(rating) as avgRating,
      SUM(stock) as totalStock
    FROM products
  `,
    )
    .get();

  return stats;
}

/**
 * Clear all products (useful for re-seeding)
 */
function clearProducts() {
  const stmt = db.prepare("DELETE FROM products");
  stmt.run();
}

/**
 * Bulk insert products
 */
function bulkInsertProducts(products) {
  const insertStmt = db.prepare(`
    INSERT INTO products (title, description, price, category, rating, stock, brand, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((products) => {
    for (const product of products) {
      insertStmt.run(
        product.title,
        product.description,
        product.price,
        product.category,
        product.rating,
        product.stock,
        product.brand,
        product.createdAt,
        new Date(),
      );
    }
  });

  transaction(products);
}

module.exports = {
  db,
  initializeDatabase,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getProductsByCategory,
  getStatistics,
  clearProducts,
  bulkInsertProducts,
};
