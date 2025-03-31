/**
 * File: backend/src/server.ts
 * Author:
 * Date: 2/12/25
 * Updated: 2/17/25
 * Description: Controls all DB connections and routes requests using Oak.
 */

import { Application, Router, send } from "https://deno.land/x/oak@v12.5.0/mod.ts";
import { connectDB } from "./db/mongoClient.ts";
import sensorDataRouter from "./routes/sensorData.ts";
import sensorAuthRouter from "./routes/sensorAuth.ts";  // Make sure sensorAuthRouter is exported from sensorAuth.ts
// If you still need the postSensorDataHandler separately, ensure it's imported appropriately.
// import { postSensorDataHandler } from "./routes/sensorData.ts";

import "https://deno.land/std@0.221.0/dotenv/load.ts";

// 1. Connect to MongoDB before starting the server.
await connectDB();

// 2. Create an Oak application.
const app = new Application();

// 3. Optional: Logging middleware for debugging.
app.use(async (ctx, next) => {
    await next();
    console.log(`${ctx.request.method} ${ctx.request.url}`);
});

// 4. Register sensor authentication routes.
// These routes should use Oak's Request, which provides the body() method.
app.use(sensorAuthRouter.routes());
app.use(sensorAuthRouter.allowedMethods());

// 5. Register sensor data routes (e.g., GET endpoints like /sensorData/latest).
app.use(sensorDataRouter.routes());
app.use(sensorDataRouter.allowedMethods());

// 6. Serve static files from your React build.
// This middleware comes after API routes so that unmatched routes fall back to React's index.html.
app.use(async (ctx, next) => {
    const path = ctx.request.url.pathname;
    try {
        await send(ctx, path, {
            root: `${Deno.cwd()}/frontend/build`,
            index: "index.html", // Fallback to index.html for client-side routing.
        });
    } catch (error) {
        console.error("Static file error:", error);
        await next();
    }
});

// 7. Start listening on port 8000.
const PORT = 8000;
console.log(`[INFO] Server running on http://localhost:${PORT}`);
await app.listen({ port: PORT });

// 8. Handle SIGINT for graceful shutdown.
Deno.addSignalListener("SIGINT", () => {
    console.log("[INFO] Closing MongoDB connection...");
    // Perform any additional cleanup tasks here if needed.
    Deno.exit();
});
