const { createClient } = require("@libsql/client");
const path = require("path");

const db = createClient({
  url: "file:" + path.join(__dirname, "ecommerce.db"),
});

/**
 * Initialize database
 */
async function initializeDatabase() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      rating REAL DEFAULT 0,
      stock INTEGER DEFAULT 0,
      brand TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

/**
 * Get products with filters
 */
async function getProducts(opts = {}) {
  const {
    page = 1,
    limit = 10,
    category,
    minPrice,
    maxPrice,
    rating,
    search,
    sortBy = "createdAt",
    sortOrder = "DESC",
  } = opts;

  let query = "SELECT * FROM products WHERE 1=1";
  let params = [];

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }

  if (minPrice != null) {
    query += " AND price >= ?";
    params.push(minPrice);
  }

  if (maxPrice != null) {
    query += " AND price <= ?";
    params.push(maxPrice);
  }

  if (rating != null) {
    query += " AND rating >= ?";
    params.push(rating);
  }

  if (search) {
    query += " AND (title LIKE ? OR description LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s);
  }

  // Count
  const countRes = await db.execute({
    sql: query.replace("SELECT *", "SELECT COUNT(*) as total"),
    args: params,
  });

  const total = countRes.rows[0].total;

  // Sorting
  const validSort = ["id", "title", "price", "rating", "stock", "createdAt"];
  const field = validSort.includes(sortBy) ? sortBy : "createdAt";
  const order = sortOrder === "ASC" ? "ASC" : "DESC";

  query += ` ORDER BY ${field} ${order} LIMIT ? OFFSET ?`;
  params.push(limit, (page - 1) * limit);

  const res = await db.execute({ sql: query, args: params });

  return {
    total,
    page,
    limit,
    data: res.rows,
  };
}

/**
 * Get product by ID
 */
async function getProductById(id) {
  const res = await db.execute({
    sql: "SELECT * FROM products WHERE id = ?",
    args: [id],
  });

  return res.rows[0] || null;
}

/**
 * Create product
 */
async function createProduct(data) {
  const {
    title,
    description,
    price,
    category,
    rating = 0,
    stock = 0,
    brand,
  } = data;

  const res = await db.execute({
    sql: `
      INSERT INTO products 
      (title, description, price, category, rating, stock, brand, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    args: [title, description, price, category, rating, stock, brand],
  });

  return { id: res.lastInsertRowid, ...data };
}

/**
 * Update product
 */
async function updateProduct(id, data) {
  const existing = await getProductById(id);
  if (!existing) return null;

  const fields = [];
  const values = [];

  // Build dynamic query
  for (const key in data) {
    fields.push(`${key} = ?`);
    values.push(data[key]);
  }

  // If no fields provided
  if (fields.length === 0) {
    return existing;
  }

  // Add updatedAt
  fields.push("updatedAt = CURRENT_TIMESTAMP");

  const sql = `
    UPDATE products 
    SET ${fields.join(", ")} 
    WHERE id = ?
  `;

  values.push(id);

  await db.execute({
    sql,
    args: values,
  });

  // Return updated record
  return await getProductById(id);
}

/**
 * Delete product
 */
async function deleteProduct(id) {
  const product = await getProductById(id);
  if (!product) return null;

  await db.execute({
    sql: "DELETE FROM products WHERE id=?",
    args: [id],
  });

  return product;
}

/**
 * Get categories
 */
async function getCategories() {
  const res = await db.execute(
    "SELECT DISTINCT category FROM products ORDER BY category",
  );
  return res.rows.map((r) => r.category);
}
/**
 *
 * @param {*} Get product by category
 * @param {*} page
 * @param {*} limit
 * @returns
 */
async function getProductsByCategory(category, page = 1, limit = 10) {
  return getProducts({
    category,
    page,
    limit,
  });
}

/**
 * Statistics
 */
async function getStatistics() {
  const res = await db.execute(`
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
  `);

  return res.rows[0];
}

/**
 * Clear products
 */
async function clearProducts() {
  await db.execute("DELETE FROM products");
}

/**
 * Bulk insert (transaction)
 */
async function bulkInsertProducts(products) {
  const tx = await db.transaction();

  try {
    for (const p of products) {
      await tx.execute({
        sql: `
          INSERT INTO products
          (title, description, price, category, rating, stock, brand, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          p.title,
          p.description,
          p.price,
          p.category,
          p.rating,
          p.stock,
          p.brand,
          p.createdAt,
          new Date().toISOString(),
        ],
      });
    }

    await tx.commit();
  } catch (err) {
    await tx.rollback();
    throw err;
  }
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
