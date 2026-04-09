const fastify = require("fastify")({ logger: true });

const swagger = require("@fastify/swagger");
const swaggerUI = require("@fastify/swagger-ui");

const {
  initializeDatabase,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getProductsByCategory,
  getStatistics,
} = require("./db");

/* ---------------------------------
   PRODUCT SCHEMA FOR SWAGGER
----------------------------------*/

const productSchema = {
  type: "object",
  properties: {
    id: { type: "number", description: "Product ID" },
    title: { type: "string", description: "Product name/title" },
    description: { type: "string", description: "Product description" },
    price: { type: "number", description: "Product price" },
    category: { type: "string", description: "Product category" },
    rating: { type: "number", description: "Product rating (1-5)" },
    stock: { type: "number", description: "Available stock" },
    brand: { type: "string", description: "Brand name" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  required: ["title", "description", "price", "category", "brand"],
};

const productRequestSchema = {
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
  required: ["title", "description", "price", "category", "brand"],
};

/* ---------------------------------
   REGISTER SWAGGER PLUGINS
----------------------------------*/

async function registerPlugins() {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "Ecommerce Product API",
        description:
          "Amazon-like CRUD API with SQLite database, search, filters, and category-wise organization",
        version: "1.0.0",
        contact: {
          name: "API Support",
        },
      },
      tags: [
        {
          name: "Products",
          description: "General product operations",
        },
        {
          name: "Products - Electronics",
          description: "Electronics category products",
        },
        {
          name: "Products - Clothing",
          description: "Clothing category products",
        },
        {
          name: "Products - Books",
          description: "Books category products",
        },
        {
          name: "Products - Sports",
          description: "Sports category products",
        },
        {
          name: "Products - Home",
          description: "Home & Kitchen category products",
        },
        {
          name: "Products - Beauty",
          description: "Beauty & Personal Care category products",
        },
        {
          name: "Products - Toys",
          description: "Toys & Games category products",
        },
        {
          name: "Statistics",
          description: "API statistics and analytics",
        },
      ],
      servers: [
        {
          url: "http://localhost:3001",
          description: "Development server",
        },
      ],
    },
  });

  await fastify.register(swaggerUI, {
    routePrefix: "/docs",
  });
}

/* ---------------------------------
   ROUTE HANDLERS
----------------------------------*/

function registerRoutes() {
  /**
   * GET /products - Get all products with filters, search, and pagination
   */
  fastify.get(
    "/products",
    {
      schema: {
        tags: ["Products"],
        summary: "Get all products with filters",
        description:
          "Retrieve products with pagination, filtering by category/price/rating, and search functionality",
        querystring: {
          type: "object",
          properties: {
            page: { type: "number", default: 1, description: "Page number" },
            limit: {
              type: "number",
              default: 10,
              description: "Items per page",
            },
            category: { type: "string", description: "Filter by category" },
            minPrice: { type: "number", description: "Minimum price filter" },
            maxPrice: { type: "number", description: "Maximum price filter" },
            rating: {
              type: "number",
              description: "Minimum rating filter (1-5)",
            },
            search: {
              type: "string",
              description: "Search in title and description",
            },
            sortBy: {
              type: "string",
              description:
                "Sort field (id, title, price, rating, stock, createdAt)",
              default: "createdAt",
            },
            sortOrder: {
              type: "string",
              description: "Sort order (ASC or DESC)",
              default: "DESC",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              total: { type: "number" },
              page: { type: "number" },
              limit: { type: "number" },
              data: {
                type: "array",
                items: productSchema,
              },
            },
          },
        },
      },
    },
    async (req) => {
      const result = getProducts({
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        category: req.query.category,
        minPrice:
          req.query.minPrice !== undefined ? Number(req.query.minPrice) : null,
        maxPrice:
          req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : null,
        rating:
          req.query.rating !== undefined ? Number(req.query.rating) : null,
        search: req.query.search,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "DESC",
      });
      return result;
    },
  );

  /**
   * GET /products/:id - Get single product by ID
   */
  fastify.get(
    "/products/:id",
    {
      schema: {
        tags: ["Products"],
        summary: "Get product by ID",
        description: "Retrieve a specific product by its ID",
        params: {
          type: "object",
          properties: {
            id: { type: "number", description: "Product ID" },
          },
          required: ["id"],
        },
        response: {
          200: productSchema,
          404: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const product = getProductById(Number(req.params.id));

      if (!product) {
        return reply.code(404).send({ message: "Product not found" });
      }

      return product;
    },
  );

  /**
   * POST /products - Create new product
   */
  fastify.post(
    "/products",
    {
      schema: {
        tags: ["Products"],
        summary: "Create new product",
        description: "Add a new product to the catalog",
        body: productRequestSchema,
        response: {
          201: {
            type: "object",
            properties: {
              message: { type: "string" },
              data: productSchema,
            },
          },
        },
      },
    },
    async (req, reply) => {
      const newProduct = await createProduct(req.body);
      reply.code(201);
      return {
        message: "Product created successfully",
        data: newProduct,
      };
    },
  );

  /**
   * PUT /products/:id - Update product
   */
  fastify.put(
    "/products/:id",
    {
      schema: {
        tags: ["Products"],
        summary: "Update product",
        description: "Update an existing product by ID",
        params: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
          required: ["id"],
        },
        body: productRequestSchema,
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              data: productSchema,
            },
          },
          404: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const updated = updateProduct(Number(req.params.id), req.body);

      if (!updated) {
        return reply.code(404).send({ message: "Product not found" });
      }

      return {
        message: "Product updated successfully",
        data: updated,
      };
    },
  );

  /**
   * DELETE /products/:id - Delete product
   */
  fastify.delete(
    "/products/:id",
    {
      schema: {
        tags: ["Products"],
        summary: "Delete product",
        description: "Remove a product from the catalog",
        params: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              data: productSchema,
            },
          },
          404: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const deleted = deleteProduct(Number(req.params.id));

      if (!deleted) {
        return reply.code(404).send({ message: "Product not found" });
      }

      return {
        message: "Product deleted successfully",
        data: deleted,
      };
    },
  );

  /**
   * GET /categories - Get all available categories
   */
  fastify.get(
    "/categories",
    {
      schema: {
        tags: ["Products"],
        summary: "Get all categories",
        description: "Retrieve list of all available product categories",
        response: {
          200: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    },
    async () => {
      return getCategories();
    },
  );

  // ==========================================
  //   CATEGORY-SPECIFIC ENDPOINTS
  // ==========================================

  /**
   * GET /categories/{category}/products - Get products by category
   */
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
    const tagName = `Products - ${category}`;

    fastify.get(
      `/categories/${category.toLowerCase()}/products`,
      {
        schema: {
          tags: [tagName],
          summary: `Get ${category} products`,
          description: `Retrieve all products in the ${category} category with pagination`,
          querystring: {
            type: "object",
            properties: {
              page: { type: "number", default: 1 },
              limit: { type: "number", default: 10 },
            },
          },
          response: {
            200: {
              type: "object",
              properties: {
                total: { type: "number" },
                page: { type: "number" },
                limit: { type: "number" },
                category: { type: "string" },
                data: {
                  type: "array",
                  items: productSchema,
                },
              },
            },
          },
        },
      },
      async (req) => {
        const result = getProductsByCategory(
          category,
          Number(req.query.page) || 1,
          Number(req.query.limit) || 10,
        );
        return {
          ...result,
          category,
        };
      },
    );

    /**
     * GET /categories/{category}/stats - Get category statistics
     */
    fastify.get(
      `/categories/${category.toLowerCase()}/stats`,
      {
        schema: {
          tags: [tagName],
          summary: `Get ${category} statistics`,
          description: `Retrieve statistics for ${category} products`,
          response: {
            200: {
              type: "object",
              properties: {
                category: { type: "string" },
                totalProducts: { type: "number" },
                avgPrice: { type: "number" },
                minPrice: { type: "number" },
                maxPrice: { type: "number" },
                avgRating: { type: "number" },
                totalStock: { type: "number" },
              },
            },
          },
        },
      },
      async () => {
        const result = getProducts({ category, limit: 10000 });
        if (result.data.length === 0) {
          return {
            category,
            totalProducts: 0,
            avgPrice: 0,
            minPrice: 0,
            maxPrice: 0,
            avgRating: 0,
            totalStock: 0,
          };
        }

        const stats = result.data.reduce(
          (acc, product) => {
            acc.avgPrice += product.price;
            acc.minPrice = Math.min(acc.minPrice, product.price);
            acc.maxPrice = Math.max(acc.maxPrice, product.price);
            acc.avgRating += product.rating;
            acc.totalStock += product.stock;
            return acc;
          },
          {
            avgPrice: 0,
            minPrice: Infinity,
            maxPrice: 0,
            avgRating: 0,
            totalStock: 0,
          },
        );

        return {
          category,
          totalProducts: result.data.length,
          avgPrice:
            Math.round((stats.avgPrice / result.data.length) * 100) / 100,
          minPrice: stats.minPrice,
          maxPrice: stats.maxPrice,
          avgRating:
            Math.round((stats.avgRating / result.data.length) * 100) / 100,
          totalStock: stats.totalStock,
        };
      },
    );

    /**
     * POST /categories/{category}/products - Create product in category
     */
    fastify.post(
      `/categories/${category.toLowerCase()}/products`,
      {
        schema: {
          tags: [tagName],
          summary: `Create ${category} product`,
          description: `Add a new product to the ${category} category`,
          body: productRequestSchema,
          response: {
            201: {
              type: "object",
              properties: {
                message: { type: "string" },
                data: productSchema,
              },
            },
          },
        },
      },
      async (req, reply) => {
        const newProduct = createProduct({
          ...req.body,
          category,
        });
        reply.code(201);
        return {
          message: `${category} product created successfully`,
          data: newProduct,
        };
      },
    );
  }

  /**
   * GET /statistics - Get overall API statistics
   */
  fastify.get(
    "/statistics",
    {
      schema: {
        tags: ["Statistics"],
        summary: "Get API statistics",
        description:
          "Retrieve overall statistics about all products in the database",
        response: {
          200: {
            type: "object",
            properties: {
              totalProducts: { type: "number" },
              totalCategories: { type: "number" },
              totalBrands: { type: "number" },
              avgPrice: { type: "number" },
              minPrice: { type: "number" },
              maxPrice: { type: "number" },
              avgRating: { type: "number" },
              totalStock: { type: "number" },
            },
          },
        },
      },
    },
    async () => {
      return getStatistics();
    },
  );

  /**
   * GET /health - Health check endpoint
   */
  fastify.get(
    "/health",
    {
      schema: {
        tags: ["Statistics"],
        summary: "Health check",
        description: "Check if the API is running",
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              timestamp: { type: "string" },
            },
          },
        },
      },
    },
    async () => {
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
      };
    },
  );
}

/* ---------------------------------
   SERVER INITIALIZATION
----------------------------------*/

const start = async () => {
  try {
    // Initialize database and create tables
    initializeDatabase();
    fastify.log.info("✓ Database initialized");

    // Register plugins
    await registerPlugins();
    fastify.log.info("✓ Swagger documentation registered");

    // Register routes
    registerRoutes();
    fastify.log.info("✓ Routes registered");

    // Start server
    await fastify.listen({ port: 3001, host: "0.0.0.0" });

    console.log("\n========================================");
    console.log("✨ Server running successfully!");
    console.log("========================================");
    console.log("API:      http://localhost:3001");
    console.log("Docs:     http://localhost:3001/docs");
    console.log("Health:   http://localhost:3001/health");
    console.log("Stats:    http://localhost:3001/statistics");
    console.log("========================================\n");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
