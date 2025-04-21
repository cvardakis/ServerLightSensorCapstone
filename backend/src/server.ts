/**
 * File: backend/src/server.ts
 * Author: Connor Vardakis
 * Date: 2/12/25
 * Updated: 4/20/25
 * Description: server.ts manages all routes and serves frontend and backend routes
 */

import { Application, send } from "https://deno.land/x/oak@v12.5.0/mod.ts";
import { connectDB } from "./db/mongoClient.ts";
import sensorDataRouter from "./routes/sensorData.ts";
import sensorAuthRouter from "./routes/sensorAuth.ts";
import "https://deno.land/std@0.221.0/dotenv/load.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { dirname, fromFileUrl, join } from "https://deno.land/std@0.221.0/path/mod.ts";

// Building route for frontend static serving
const __dirname  = dirname(fromFileUrl(import.meta.url));
const buildRoot  = join(__dirname, "../../frontend/build");
console.log("[INFO] Serving React build from:", buildRoot);

// Connect to MongoDB
await connectDB();

// Create Oak App for routing requests
const app = new Application();

// Defining Connection Domain
app.use(oakCors({ origin: "http://localhost:3000" }));

// Request logging for debugging
app.use(async (ctx, next) => {
    await next();
    console.log(`${ctx.request.method} ${ctx.request.url.pathname}`);
});

// API routes for backend sensor reporting
app.use(sensorAuthRouter.routes());
app.use(sensorAuthRouter.allowedMethods());
app.use(sensorDataRouter.routes());
app.use(sensorDataRouter.allowedMethods());

// Defining of routes for frontend route serving
const clientRoutes = new Set([ "/", "/home", "/data", "/about" ]);

// Setting up requests to server frontend react project
app.use(async (ctx, next) => {
    const url = ctx.request.url.pathname;

    // Serve index.html if route is specified above
    if (clientRoutes.has(url)) {
        await send(ctx, "index.html", { root: buildRoot });
        return;
    }

    // If route is not specified will serve other files i.e. JS, CSS, Etc.
    try {
        await send(ctx, url, {
            root: buildRoot,
            index: "index.html",
        });
        return;
    } catch {
        // Fall through for no file
    }

    // 404 Error
    await next();
});

// Project startup
const PORT = 8000;
console.log(`[INFO] Server running on http://localhost:${PORT}`);
await app.listen({ port: PORT });

// Graceful shutdown with MongoDB terminations
Deno.addSignalListener("SIGINT", () => {
    console.log("[INFO] Closing MongoDB connection...");
    Deno.exit();
});
