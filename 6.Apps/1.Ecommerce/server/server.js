const fastify = require("fastify")({
  logger: true,
  ajv: {
    customOptions: {
      coerceTypes: "array", // coerce query string numbers automatically
      removeAdditional: "all", // strip unknown fields from body silently
      useDefaults: true, // apply schema defaults automatically
      allErrors: true, // report all validation errors, not just first
    },
  },
});

const cors = require("@fastify/cors");
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
  getStatistics,
} = require("./db");

/* ---------------------------------
   SCHEMAS
----------------------------------*/

const productSchema = {
  type: "object",
  properties: {
    id: { type: "number" },
    title: { type: "string" },
    description: { type: "string" },
    price: { type: "number" },
    category: { type: "string" },
    rating: { type: "number" },
    stock: { type: "number" },
    brand: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

// POST body — all core fields required, AJV handles rejection automatically
const productCreateSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "description", "price", "category", "brand"],
  properties: {
    title: { type: "string", minLength: 1, maxLength: 255 },
    description: { type: "string", minLength: 1 },
    price: { type: "number", minimum: 0 },
    category: { type: "string", minLength: 1 },
    rating: { type: "number", minimum: 1, maximum: 5 },
    stock: { type: "number", minimum: 0 },
    brand: { type: "string", minLength: 1, maxLength: 255 },
  },
};

// PATCH body — all fields optional, but at least one must be present (enforced via minProperties)
const productUpdateSchema = {
  type: "object",
  additionalProperties: false,
  minProperties: 1,
  properties: {
    title: { type: "string", minLength: 1, maxLength: 255 },
    description: { type: "string", minLength: 1 },
    price: { type: "number", minimum: 0 },
    category: { type: "string", minLength: 1 },
    rating: { type: "number", minimum: 1, maximum: 5 },
    stock: { type: "number", minimum: 0 },
    brand: { type: "string", minLength: 1, maxLength: 255 },
  },
};

const paginationQuerySchema = {
  type: "object",
  properties: {
    page: { type: "number", default: 1, minimum: 1 },
    limit: { type: "number", default: 10, minimum: 1, maximum: 100 },
  },
};

const productsQuerySchema = {
  type: "object",
  properties: {
    page: { type: "number", default: 1, minimum: 1 },
    limit: { type: "number", default: 10, minimum: 1, maximum: 100 },
    category: { type: "string" },
    minPrice: { type: "number", minimum: 0 },
    maxPrice: { type: "number", minimum: 0 },
    rating: { type: "number", minimum: 1, maximum: 5 },
    search: { type: "string", maxLength: 200 },
    sortBy: {
      type: "string",
      enum: ["id", "title", "price", "rating", "stock", "createdAt"],
      default: "createdAt",
    },
    sortOrder: {
      type: "string",
      enum: ["ASC", "DESC"],
      default: "DESC",
    },
  },
};

/* ---------------------------------
   STANDARD RESPONSE SHAPES (reused across routes)
----------------------------------*/

const errorResponse = (code) => ({
  [code]: {
    type: "object",
    properties: {
      statusCode: { type: "number" },
      error: { type: "string" },
      message: { type: "string" },
      missingFields: { type: "array", items: { type: "string" } },
      details: {
        type: "array",
        items: {
          type: "object",
          properties: {
            field: { type: "string" },
            issue: { type: "string" },
          },
        },
      },
    },
  },
});

/* ---------------------------------
   GLOBAL ERROR HANDLER
----------------------------------*/

function registerErrorHandlers() {
  // Catches: AJV validation errors, thrown errors, anything unhandled
  fastify.setErrorHandler((error, req, reply) => {
    const statusCode = error.statusCode || 500;

    // AJV validation errors come with statusCode 400 and error.validation array
    if (error.validation) {
      const missingFields = error.validation
        .filter((v) => v.keyword === "required")
        .map((v) => v.params.missingProperty);

      const otherErrors = error.validation
        .filter((v) => v.keyword !== "required")
        .map((v) => ({
          field: v.instancePath.replace(/^\//, "") || "unknown",
          issue: v.message,
        }));

      const formatFieldList = (fields) => {
        if (fields.length === 0) return "";
        if (fields.length === 1) return fields[0];
        const last = fields[fields.length - 1];
        const rest = fields.slice(0, -1);
        return `${rest.join(", ")} & ${last}`;
      };

      const message =
        missingFields.length > 0
          ? `Please provide ${formatFieldList(missingFields)} field${missingFields.length > 1 ? "s" : ""}.`
          : `Invalid value${otherErrors.length > 1 ? "s" : ""} for: ${formatFieldList(otherErrors.map((e) => e.field))}.`;

      return reply.status(400).send({
        statusCode: 400,
        error: "Validation Error",
        message,
        ...(missingFields.length > 0 && { missingFields }),
        ...(otherErrors.length > 0 && { details: otherErrors }),
      });
    }

    fastify.log.error(error);

    reply.status(statusCode).send({
      statusCode,
      error:
        statusCode === 500 ? "Internal Server Error" : error.name || "Error",
      message:
        statusCode === 500
          ? "An unexpected error occurred. Please try again later."
          : error.message,
    });
  });

  fastify.setNotFoundHandler((req, reply) => {
    reply.status(404).send({
      statusCode: 404,
      error: "Not Found",
      message: `Route ${req.method} ${req.url} not found`,
    });
  });
}

/* ---------------------------------
   REGISTER PLUGINS
----------------------------------*/

async function registerPlugins() {
  await fastify.register(cors, { origin: "*" });

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "Ecommerce Product API",
        description:
          "Amazon-like CRUD API with SQLite, search, filters, and category-wise organization",
        version: "1.0.0",
      },
      tags: [{ name: "Products" }, { name: "Statistics" }],
      servers: [{ url: "http://localhost:3001" }],
    },
  });

  await fastify.register(swaggerUI, { routePrefix: "/docs" });
}

/* ---------------------------------
   ROUTES
----------------------------------*/

function registerRoutes() {
  /* GET /products */
  fastify.get(
    "/products",
    {
      schema: {
        tags: ["Products"],
        summary: "Get all products with filters",
        querystring: productsQuerySchema,
        response: {
          200: {
            type: "object",
            properties: {
              total: { type: "number" },
              page: { type: "number" },
              limit: { type: "number" },
              data: { type: "array", items: productSchema },
            },
          },
          ...errorResponse(400),
        },
      },
    },
    async (req) => getProducts(req.query),
  );

  /* GET /products/:id */
  fastify.get(
    "/products/:id",
    {
      schema: {
        tags: ["Products"],
        summary: "Get product by ID",
        description: "Retrieve a specific product by its ID",
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "number" } },
        },
        response: {
          200: productSchema,
          ...errorResponse(404),
        },
      },
    },
    async (req, reply) => {
      const product = await getProductById(req.params.id);
      if (!product)
        return reply.code(404).send({ message: "Product not found" });
      return product;
    },
  );

  /* POST /products */
  fastify.post(
    "/products",
    {
      schema: {
        tags: ["Products"],
        summary: "Create a new product",
        description: "Add a new product to the catalog",
        body: productCreateSchema,
        response: {
          201: {
            type: "object",
            properties: {
              message: { type: "string" },
              data: productSchema,
            },
          },
          ...errorResponse(400),
        },
      },
    },
    async (req, reply) => {
      const newProduct = await createProduct(req.body);
      return reply
        .code(201)
        .send({ message: "Product created successfully", data: newProduct });
    },
  );

  /* PATCH /products/:id */
  fastify.patch(
    "/products/:id",
    {
      schema: {
        tags: ["Products"],
        summary: "Partially update a product",
        description: "Update an existing product by ID",
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "number" } },
        },
        body: productUpdateSchema,
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              data: productSchema,
            },
          },
          ...errorResponse(400),
          ...errorResponse(404),
        },
      },
    },
    async (req, reply) => {
      const updated = await updateProduct(req.params.id, req.body);
      if (!updated)
        return reply.code(404).send({ message: "Product not found" });
      return reply
        .code(200)
        .send({ message: "Product updated successfully", data: updated });
    },
  );

  /* DELETE /products/:id */
  fastify.delete(
    "/products/:id",
    {
      schema: {
        tags: ["Products"],
        summary: "Delete a product",
        description: "Remove a product from the catalog",
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "number" } },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              data: productSchema,
            },
          },
          ...errorResponse(404),
        },
      },
    },
    async (req, reply) => {
      const deleted = await deleteProduct(req.params.id);
      if (!deleted)
        return reply.code(404).send({ message: "Product not found" });
      return reply
        .code(200)
        .send({ message: "Product deleted successfully", data: deleted });
    },
  );

  /* GET /categories */
  fastify.get(
    "/categories",
    {
      schema: {
        tags: ["Categories"],
        summary: "Get all categories",
        description: "Retrieve list of all available product categories",
        response: { 200: { type: "array", items: { type: "string" } } },
      },
    },
    async () => getCategories(),
  );

  /* GET /statistics */
  fastify.get(
    "/statistics",
    {
      schema: {
        tags: ["Statistics"],
        summary: "Get overall API statistics",
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
    async () => getStatistics(),
  );

  /* GET /health */
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
    async () => ({ status: "ok", timestamp: new Date().toISOString() }),
  );
}

void (async () => {
  try {
    initializeDatabase();
    fastify.log.info("✓ Database initialized");

    registerErrorHandlers();
    fastify.log.info("✓ Error handlers registered");

    await registerPlugins();
    fastify.log.info("✓ Plugins registered");

    registerRoutes();
    fastify.log.info("✓ Routes registered");

    await fastify.listen({ port: 3001, host: "0.0.0.0" });

    console.log("\n========================================");
    console.log("✨ Server running!");
    console.log("========================================");
    console.log("API:    http://localhost:3001");
    console.log("Docs:   http://localhost:3001/docs");
    console.log("Health: http://localhost:3001/health");
    console.log("Stats:  http://localhost:3001/statistics");
    console.log("========================================\n");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
