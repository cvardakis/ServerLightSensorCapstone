/**
 * File: backend/src/server.ts
 * Author:
 * Date: 2/12/25
 * Updated: 4/20/25
 */

import { Application, send } from "https://deno.land/x/oak@v12.5.0/mod.ts";
import { connectDB } from "./db/mongoClient.ts";
import sensorDataRouter from "./routes/sensorData.ts";
import sensorAuthRouter from "./routes/sensorAuth.ts";
import "https://deno.land/std@0.221.0/dotenv/load.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { dirname, fromFileUrl, join } from "https://deno.land/std@0.221.0/path/mod.ts";

// ————————————————————————————
// 1) Build folder resolution
// server.ts is in backend/src, so go up two levels to reach project-root/frontend/build
const __dirname  = dirname(fromFileUrl(import.meta.url));
const buildRoot  = join(__dirname, "../../frontend/build");
console.log("[INFO] Serving React build from:", buildRoot);

// ————————————————————————————
// 2) Connect to MongoDB
await connectDB();

// ————————————————————————————
// 3) Create Oak app
const app = new Application();

// CORS (allow your client on port 3000 or change to 8000 if you host both on same origin)
app.use(oakCors({ origin: "http://localhost:3000" }));

// Simple request logging
app.use(async (ctx, next) => {
    await next();
    console.log(`${ctx.request.method} ${ctx.request.url.pathname}`);
});

// ————————————————————————————
// 4) API routes
app.use(sensorAuthRouter.routes());
app.use(sensorAuthRouter.allowedMethods());
app.use(sensorDataRouter.routes());
app.use(sensorDataRouter.allowedMethods());

// ————————————————————————————
// 5) Static + SPA fallback
const clientRoutes = new Set([ "/", "/home", "/data", "/about" ]);

app.use(async (ctx, next) => {
    const url = ctx.request.url.pathname;

    // 5a) If it's one of your known client routes, always serve index.html
    if (clientRoutes.has(url)) {
        await send(ctx, "index.html", { root: buildRoot });
        return;
    }

    // 5b) Otherwise try to serve a real file (JS/CSS/assets).
    //     If url maps to a directory (like "/"), index:"index.html" will serve index.html.
    try {
        await send(ctx, url, {
            root: buildRoot,
            index: "index.html",
        });
        return;
    } catch {
        // not a file → fall through
    }

    // 5c) Not an SPA route or a static asset → 404 or next middleware
    await next();
});

// ————————————————————————————
// 6) Launch
const PORT = 8000;
console.log(`[INFO] Server running on http://localhost:${PORT}`);
await app.listen({ port: PORT });

// Graceful shutdown
Deno.addSignalListener("SIGINT", () => {
    console.log("[INFO] Closing MongoDB connection...");
    Deno.exit();
});
