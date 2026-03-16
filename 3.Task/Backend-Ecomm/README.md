# Backend-Ecomm

Small in-memory ecommerce product API with deterministic product generation and persistence to `products.json`.

**Files**

- [server.js](server.js) — main Fastify server and routes

Prerequisites

- Node.js (v14+ recommended)
- npm

Quick start

```bash
# install dependencies
npm install

# start server
node server.js
```

After installation and starting the server you can immediately regenerate or change the dataset using the reload endpoint shown below.

Server will: try to load `products.json` from the project directory. If absent, it will generate 220 realistic products and save them to `products.json`.

Swagger UI

- Open http://localhost:3001/docs to view API docs and try endpoints.

API Endpoints (examples)

- Get products (pagination, filters):

```bash
curl "http://localhost:3001/products?page=1&limit=10"
```

- Get single product:

```bash
curl "http://localhost:3001/products/1"
```

- Create product:

```bash
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{"title":"New Item","description":"Desc","price":19.99,"category":"Toys","rating":4.5,"stock":120,"brand":"Acme"}'
```

- Update product:

```bash
curl -X PUT http://localhost:3001/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price":29.99}'
```

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
