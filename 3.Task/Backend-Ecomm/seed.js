const fs = require("fs");
const path = require("path");
const {
  initializeDatabase,
  clearProducts,
  bulkInsertProducts,
} = require("./db");

const PRODUCTS_FILE = path.join(__dirname, "products.json");

/**
 * Seed database from products.json
 */
async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Initialize database schema
    initializeDatabase();
    console.log("✓ Database initialized");

    // Check if products.json exists
    if (!fs.existsSync(PRODUCTS_FILE)) {
      console.error("✗ products.json not found!");
      process.exit(1);
    }

    // Read products.json
    const data = fs.readFileSync(PRODUCTS_FILE, "utf8");
    const products = JSON.parse(data);

    console.log(`✓ Loaded ${products.length} products from products.json`);

    // Clear existing products
    clearProducts();
    console.log("✓ Cleared existing products");

    // Insert products into database
    const formattedProducts = products.map((p) => ({
      title: p.title,
      description: p.description,
      price: p.price,
      category: p.category,
      rating: p.rating || 0,
      stock: p.stock || 0,
      brand: p.brand,
      createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
    }));

    bulkInsertProducts(formattedProducts);
    console.log(`✓ Inserted ${products.length} products into database`);

    console.log("\n✨ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("✗ Seeding failed:", error.message);
    process.exit(1);
  }
}

// Run seeding if executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
