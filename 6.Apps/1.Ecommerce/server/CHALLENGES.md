# Server Development Challenges & Solutions

## Challenge: EADDRINUSE Port 3001 Conflict (RESOLVED ✓)

### Problem

When nodemon attempted to restart the server after file changes, it would fail with:

```
EADDRINUSE: address already in use 0.0.0.0:3001
```

**Root Cause:** The previous server process wasn't gracefully closing when nodemon sent the restart signal. The port wasn't being released in time for the new process to bind to it.

### Solution Implemented

Added graceful shutdown handlers to `server.js` that properly close the Fastify instance when receiving termination signals:

```javascript
// Graceful shutdown handlers
const signals = ["SIGTERM", "SIGINT"];
signals.forEach((signal) => {
  process.on(signal, async () => {
    fastify.log.info(`Received ${signal}, closing server gracefully...`);
    await fastify.close();
    process.exit(0);
  });
});
```

### How It Works

1. When nodemon detects file changes, it sends SIGTERM/SIGINT to the server process
2. The signal handlers catch these signals and call `fastify.close()`
3. This properly closes all connections and releases the port
4. The process exits with code 0
5. Nodemon then starts a fresh process that can successfully bind to port 3001

### Result

✓ Server now restarts cleanly without port conflicts
✓ Multiple file changes trigger restarts correctly
✓ No orphaned processes or hanging ports
✓ Development workflow is smooth and uninterrupted

---

## Other Nodemon Configuration Improvements

### nodemon.json

Created configuration to watch only relevant code files:

```json
{
  "watch": ["server.js", "db.js"],
  "delay": 1000,
  "ext": "js,mjs,cjs,json"
}
```

**Why:** Prevents unnecessary restarts when data files (products.json, ecommerce.db) change, which can cause cascading restart loops.

### .nodemonignore

Excludes files that shouldn't trigger restarts:

- node_modules/
- ecommerce.db\* (database files)
- logs/
- .git/
- package.json (already excluded by default)

---

## Testing

Server restart was tested by:

1. Starting server with `npm run dev`
2. Making a code change to `server.js`
3. Verifying nodemon detected change and restarted
4. Confirming no EADDRINUSE error and successful binding to port 3001
5. New process (PID 27180) started successfully after graceful shutdown of old process (PID 11600)

---

## Date Resolved

Fixed on session date - Major stability improvement for development workflow.
