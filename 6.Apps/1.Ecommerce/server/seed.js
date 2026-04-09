const fs = require("fs");
const path = require("path");
const {
  initializeDatabase,
  clearProducts,
  bulkInsertProducts,
} = require("./db");

const PRODUCTS_FILE = path.join(__dirname, "products.json");

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    await initializeDatabase();
    console.log("✓ Database initialized");

    if (!fs.existsSync(PRODUCTS_FILE)) {
      console.error("✗ products.json not found!");
      process.exit(1);
    }

    const data = fs.readFileSync(PRODUCTS_FILE, "utf8");
    const products = JSON.parse(data);

    console.log(`✓ Loaded ${products.length} products`);

    await clearProducts();
    console.log("✓ Cleared existing products");

    const formattedProducts = products.map((p) => ({
      title: p.title,
      description: p.description,
      price: p.price,
      category: p.category,
      rating: p.rating || 0,
      stock: p.stock || 0,
      brand: p.brand,
      createdAt: p.createdAt
        ? new Date(p.createdAt).toISOString()
        : new Date().toISOString(),
    }));

    await bulkInsertProducts(formattedProducts);

    console.log(`✓ Inserted ${products.length} products`);
    console.log("✨ Database seeding completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error("✗ Seeding failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
