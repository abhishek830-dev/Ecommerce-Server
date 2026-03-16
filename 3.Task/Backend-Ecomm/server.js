const fastify = require("fastify")({ logger: true });

const swagger = require("@fastify/swagger");
const swaggerUI = require("@fastify/swagger-ui");
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "products.json");

/* -----------------------------
   IN-MEMORY DATABASE
------------------------------*/

let products = [];

const categories = [
  "Electronics",
  "Clothing",
  "Books",
  "Sports",
  "Home",
  "Beauty",
  "Toys",
];

// Seeded PRNG for deterministic product generation
function mulberry32(a) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateProducts(count = 220, seed = 12345) {
  const rnd = mulberry32(seed);

  const catalog = {
    Electronics: [
      {
        title: "Smartphone",
        models: ["Galaxy S21", "iPhone 12", "Pixel 5", "OnePlus 9"],
        brands: ["Samsung", "Apple", "Google", "OnePlus"],
        priceRange: [199, 1199],
      },
      {
        title: "Laptop",
        models: ["XPS 13", "MacBook Air", "ThinkPad X1", "ZenBook 14"],
        brands: ["Dell", "Apple", "Lenovo", "Asus"],
        priceRange: [499, 2499],
      },
      {
        title: "Wireless Headphones",
        models: ["WH-1000XM4", "AirPods Pro", "QC35 II", "Buds Pro"],
        brands: ["Sony", "Apple", "Bose", "Samsung"],
        priceRange: [49, 399],
      },
      {
        title: "Smartwatch",
        models: ["Galaxy Watch 4", "Watch Series 6", "Pixel Watch"],
        brands: ["Samsung", "Apple", "Google"],
        priceRange: [99, 799],
      },
      {
        title: "4K TV",
        models: ["Bravia X90J", "QLED Q80T", "OLED CX"],
        brands: ["Sony", "Samsung", "LG"],
        priceRange: [299, 3999],
      },
    ],
    Clothing: [
      {
        title: "T-Shirt",
        models: ["Classic Tee", "V-Neck Tee", "Polo"],
        brands: ["Levi's", "H&M", "Uniqlo", "Nike"],
        priceRange: [5, 79],
      },
      {
        title: "Jeans",
        models: ["Slim Fit", "Straight Leg", "Bootcut"],
        brands: ["Levi's", "Wrangler", "Lee"],
        priceRange: [19, 199],
      },
      {
        title: "Sneakers",
        models: ["Air Max", "Ultraboost", "Chuck Taylor"],
        brands: ["Nike", "Adidas", "Converse"],
        priceRange: [29, 299],
      },
    ],
    Books: [
      {
        title: "Fiction Book",
        models: ["The Last Kingdom", "Midnight Library", "The Silent Patient"],
        brands: ["Penguin", "HarperCollins", "Random House"],
        priceRange: [4, 35],
      },
      {
        title: "Non-Fiction",
        models: ["Sapiens", "Atomic Habits", "Educated"],
        brands: ["Penguin", "HarperCollins", "W.W. Norton"],
        priceRange: [6, 45],
      },
    ],
    Sports: [
      {
        title: "Running Shoes",
        models: ["ZoomX", "Gel-Nimbus", "Fresh Foam"],
        brands: ["Nike", "ASICS", "New Balance"],
        priceRange: [29, 249],
      },
      {
        title: "Yoga Mat",
        models: ["ProGrip", "EcoMat"],
        brands: ["Lululemon", "Manduka", "Decathlon"],
        priceRange: [9, 129],
      },
    ],
    Home: [
      {
        title: "Blender",
        models: ["ProBlend", "SmoothieX"],
        brands: ["Philips", "KitchenAid", "Ninja"],
        priceRange: [19, 399],
      },
      {
        title: "Vacuum Cleaner",
        models: ["Cyclone 3000", "PowerSweep"],
        brands: ["Dyson", "Hoover", "Shark"],
        priceRange: [49, 599],
      },
    ],
    Beauty: [
      {
        title: "Moisturizer",
        models: ["HydraBoost", "Daily Cream"],
        brands: ["Neutrogena", "Olay", "Cetaphil"],
        priceRange: [4, 79],
      },
      {
        title: "Lipstick",
        models: ["Matte", "Satin"],
        brands: ["Maybelline", "MAC", "L'Oreal"],
        priceRange: [3, 45],
      },
    ],
    Toys: [
      {
        title: "Building Blocks",
        models: ["Classic Bricks", "Mega Blocks"],
        brands: ["LEGO", "Mega Bloks", "Hasbro"],
        priceRange: [9, 199],
      },
      {
        title: "Action Figure",
        models: ["Hero Series", "Galaxy Fighter"],
        brands: ["Hasbro", "Mattel"],
        priceRange: [5, 79],
      },
    ],
  };

  let id = 1;

  const categoryKeys = Object.keys(catalog);

  for (let i = 0; i < count; i++) {
    const cat = categoryKeys[Math.floor(rnd() * categoryKeys.length)];
    const items = catalog[cat];
    const chosen = items[Math.floor(rnd() * items.length)];

    const brand = chosen.brands[Math.floor(rnd() * chosen.brands.length)];
    const model = chosen.models[Math.floor(rnd() * chosen.models.length)];

    const title = `${brand} ${model} ${chosen.title}`;

    const priceMin = chosen.priceRange[0];
    const priceMax = chosen.priceRange[1];
    const price = Number((priceMin + rnd() * (priceMax - priceMin)).toFixed(2));

    const rating = Number(Math.max(1, rnd() * 4 + 1).toFixed(1));
    const stock = Math.floor(rnd() * 500);

    const description = `Buy the ${title} from ${brand}. ${chosen.title} engineered for quality and value. Ideal for ${cat.toLowerCase()} needs.`;

    products.push({
      id: id,
      title,
      description,
      price,
      category: cat,
      rating,
      stock,
      brand,
      createdAt: new Date(
        Date.now() - Math.floor(rnd() * 1000 * 60 * 60 * 24 * 365),
      ),
    });

    id += 1;
  }
}

async function saveProductsToFile() {
  try {
    await fs.promises.writeFile(
      DATA_FILE,
      JSON.stringify(products, null, 2),
      "utf8",
    );
  } catch (err) {
    fastify.log.error("Failed to save products to file:", err);
  }
}

async function loadProductsFromFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = await fs.promises.readFile(DATA_FILE, "utf8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        products = parsed.map((p) => ({
          ...p,
          createdAt: new Date(p.createdAt),
        }));
        return true;
      }
    }
  } catch (err) {
    fastify.log.error("Failed to load products from file:", err);
  }
  return false;
}

/* -----------------------------
   PRODUCT SCHEMA
------------------------------*/

const productSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    price: { type: "number" },
    category: { type: "string" },
    rating: { type: "number" },
    stock: { type: "number" },
    brand: { type: "string" },
  },
};

/* -----------------------------
   REGISTER SWAGGER
------------------------------*/

async function registerPlugins() {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "Ecommerce Product API",
        description: "Amazon-like CRUD API with search & filters",
        version: "1.0.0",
      },
    },
  });

  await fastify.register(swaggerUI, {
    routePrefix: "/docs",
  });
}

/* -----------------------------
   ROUTES
------------------------------*/

function registerRoutes() {
  fastify.get(
    "/products",
    {
      schema: {
        tags: ["Products"],
        summary: "Get all products",
        querystring: {
          type: "object",
          properties: {
            page: { type: "number" },
            limit: { type: "number" },
            category: { type: "string" },
            minPrice: { type: "number" },
            maxPrice: { type: "number" },
            rating: { type: "number" },
            search: { type: "string" },
          },
        },
      },
    },
    async (req) => {
      let {
        page = 1,
        limit = 10,
        category,
        minPrice,
        maxPrice,
        rating,
        search,
      } = req.query;

      page = Number(page);
      limit = Number(limit);

      let result = [...products];

      if (search) {
        const keyword = search.toLowerCase();
        result = result.filter(
          (p) =>
            p.title.toLowerCase().includes(keyword) ||
            p.description.toLowerCase().includes(keyword),
        );
      }

      if (category) result = result.filter((p) => p.category === category);
      if (minPrice) result = result.filter((p) => p.price >= minPrice);
      if (maxPrice) result = result.filter((p) => p.price <= maxPrice);
      if (rating) result = result.filter((p) => p.rating >= rating);

      const total = result.length;

      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        total,
        page,
        limit,
        data: result.slice(start, end),
      };
    },
  );

  fastify.get(
    "/products/:id",
    {
      schema: {
        tags: ["Products"],
        summary: "Get product by ID",
      },
    },
    async (req, reply) => {
      const product = products.find((p) => p.id === Number(req.params.id));

      if (!product) {
        return reply.code(404).send({ message: "Product not found" });
      }

      return product;
    },
  );

  fastify.post(
    "/products",
    {
      schema: {
        tags: ["Products"],
        summary: "Create product",
        body: productSchema,
      },
    },
    async (req, reply) => {
      const newProduct = {
        id: products.length + 1,
        ...req.body,
        createdAt: new Date(),
      };

      products.push(newProduct);

      await saveProductsToFile();

      reply.code(201);

      return {
        message: "Product created",
        data: newProduct,
      };
    },
  );

  fastify.put(
    "/products/:id",
    {
      schema: {
        tags: ["Products"],
        summary: "Update product",
        body: productSchema,
      },
    },
    async (req, reply) => {
      const id = Number(req.params.id);

      const index = products.findIndex((p) => p.id === id);

      if (index === -1) {
        return reply.code(404).send({ message: "Product not found" });
      }

      products[index] = {
        ...products[index],
        ...req.body,
      };

      await saveProductsToFile();

      return {
        message: "Product updated",
        data: products[index],
      };
    },
  );

  fastify.delete(
    "/products/:id",
    {
      schema: {
        tags: ["Products"],
        summary: "Delete product",
      },
    },
    async (req, reply) => {
      const id = Number(req.params.id);

      const index = products.findIndex((p) => p.id === id);

      if (index === -1) {
        return reply.code(404).send({ message: "Product not found" });
      }

      const deleted = products.splice(index, 1);

      await saveProductsToFile();

      return {
        message: "Product deleted",
        data: deleted[0],
      };
    },
  );

  fastify.get(
    "/categories",
    {
      schema: {
        tags: ["Products"],
        summary: "Get all categories",
      },
    },
    async () => {
      return [...new Set(products.map((p) => p.category))];
    },
  );

  // Regenerate products (admin/debug). Body: { count?: number, seed?: number, persist?: boolean }
  fastify.post(
    "/reload-products",
    {
      schema: {
        tags: ["Products"],
        summary: "Regenerate products with optional seed and count",
        body: {
          type: "object",
          properties: {
            count: { type: "number" },
            seed: { type: "number" },
            persist: { type: "boolean" },
          },
        },
      },
    },
    async (req, reply) => {
      const { count = 220, seed = 12345, persist = true } = req.body || {};

      products = [];
      generateProducts(Number(count) || 220, Number(seed) || 12345);

      if (persist) await saveProductsToFile();

      return {
        message: "Products regenerated",
        total: products.length,
      };
    },
  );
}

/* -----------------------------
   START SERVER
------------------------------*/

const start = async () => {
  try {
    // Load persisted products if available, otherwise generate and persist
    const loaded = await loadProductsFromFile();
    if (!loaded) {
      generateProducts();
      await saveProductsToFile();
      fastify.log.info(
        `Generated ${products.length} products and saved to ${DATA_FILE}`,
      );
    } else {
      fastify.log.info(`Loaded ${products.length} products from ${DATA_FILE}`);
    }

    await registerPlugins();
    registerRoutes();

    await fastify.listen({ port: 3001 });

    console.log("Server running http://localhost:3001");
    console.log("Swagger docs http://localhost:3001/docs");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
