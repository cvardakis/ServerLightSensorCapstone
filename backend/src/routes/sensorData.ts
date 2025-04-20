/**
 * File: backend/src/routes/sensorData.ts
 * Author:
 * Date: 2/12/25
 * Updated: 2/17/25
 * Description: Handles posting of incoming data to the database if the sensor is authenticated,
 *              and provides endpoints to retrieve sensor data.
 */

import { Router } from "https://deno.land/x/oak@v12.5.0/mod.ts";
import { sensorCollection, sensorDataCollection } from "../db/mongoClient.ts";

const sensorDataRouter = new Router();

// Revised POST handler that works directly with the context.
sensorDataRouter.post("/sensor-data", async (ctx) => {
    try {
        // Parse JSON payload using Oak's body parser.
        const body = await ctx.request.body({ type: "json" }).value;

        /**
         * Expected Information:
         * sensor id, utc, local, temp, counts, frequency, reading
         */
        if (
            !body.id ||
            !body.utc ||
            !body.local ||
            !body.temp ||
            !body.counts ||
            !body.frequency ||
            !body.reading
        ) {
            console.log("[INFO] Sensor sent incomplete data: ", body);
            ctx.response.status = 400;
            ctx.response.body = { error: "Missing required fields" };
            return;
        }

        // Ensure the sensor ID exists in the database.
        const sensorExists = await sensorCollection.findOne({ sensor_id: body.id });
        if (!sensorExists) {
            console.log("[INFO] Sensor attempted to send data without authenticating");
            ctx.response.status = 404;
            ctx.response.body = { error: "Sensor ID not recognized" };
            return;
        }

        // Store sensor measurement data.
        const result = await sensorDataCollection.insertOne({
            sensor_id: body.id,
            utc: body.utc,
            local: body.local,
            temp: body.temp,
            counts: body.counts,
            frequency: body.frequency,
            reading: body.reading,
        });

        console.log(`[INFO] Sensor, ${body.id}, saved data`);
        ctx.response.status = 201;
        ctx.response.body = { success: true, insertedId: result.insertedId };
    } catch (error) {
        console.error("[ERROR] Error handling sensor data submission:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Server error" };
    }
});

// GET endpoint to retrieve the latest sensor data.
// GET endpoint to retrieve the latest sensor data.
sensorDataRouter.get("/sensorData/latest", async (ctx) => {
    try {
        console.log("[INFO] Route hit: /sensorData/latest");

        // grab sensorId if provided
        const sensorId = ctx.request.url.searchParams.get("sensorId");
        const filter: Record<string, unknown> = {};
        if (sensorId) {
            filter.sensor_id = sensorId;
        }

        // sort most‐recent first, limit to one
        const sort = { "local": -1 };
        const latestCursor = sensorDataCollection.find(filter, { sort, limit: 1 });
        const result = await latestCursor.toArray();
        console.log("[INFO] Query result: ", result);

        if (!result || result.length === 0) {
            ctx.response.status = 404;
            ctx.response.body = { error: "No sensor data found" };
            return;
        }

        const latestData = result[0];
        ctx.response.status = 200;
        ctx.response.body = {
            value: latestData.reading,
            timestamp: latestData.local,
        };
    } catch (error) {
        console.error("Error retrieving latest sensor data:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal server error", details: error.message };
    }
});

// GET endpoint for the last 12 hours.
sensorDataRouter.get("/sensorData/last12hours", async (ctx) => {
    try {
        console.log("[INFO] Route hit: /sensorData/last12hours");

        const now = new Date();
        console.log("[TROUBLESHOOT] Current Date ", now.toISOString());
        const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
        // Convert to an ISO string without milliseconds if needed.
        const twelveHoursAgoString = twelveHoursAgo.toISOString().split('.')[0];
        console.log("[TROUBLESHOOT] 12 hours ago: ", twelveHoursAgoString);

        // Filter: documents whose utc is greater than or equal to twelveHoursAgoString.
        const filter = { utc: { $gte: twelveHoursAgoString } };
        const project = { utc: 1, local: 1, temp: 1, reading: 1, _id: 0 };
        const sort = { local: 1 };

        // Retrieve the documents as an array.
        const latestCursor = sensorDataCollection.find(filter, { projection: project, sort });
        const result = await latestCursor.toArray();

        if (!result || result.length === 0) {
            ctx.response.status = 404;
            ctx.response.type = "application/json";
            ctx.response.body = { error: "No sensor data found" };
            return;
        }

        // Return the data points.
        ctx.response.status = 200;
        ctx.response.type = "application/json";
        ctx.response.body = result;
    } catch (error) {
        console.error("Error retrieving sensor data:", error);
        ctx.response.status = 500;
        ctx.response.type = "application/json";
        ctx.response.body = { error: "Internal server error", details: error.message };
    }
});

// GET endpoint to retrieve the list of sensors.
sensorDataRouter.get("/sensors", async (ctx) => {
    try {
        console.log("[INFO] Route hit: /sensors");

        // Define the projection object.
        const projection = { name: 1, sensor_id: 1, _id: 0 };

        // Use an empty filter {} to retrieve all documents, and pass the projection as the second argument.
        const cursor = sensorCollection.find({}, { projection });
        const result = await cursor.toArray();

        if (!result || result.length === 0) {
            ctx.response.status = 404;
            ctx.response.type = "application/json";
            ctx.response.body = { error: "No sensor data found" };
            return;
        }

        ctx.response.status = 200;
        ctx.response.body = result;
    } catch (error) {
        console.error("Error retrieving sensor data:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal server error", details: error.message };
    }
});

// GET endpoint for filtered sensor data.
sensorDataRouter.get("/sensorData/filter", async (ctx) => {
    try {
        // Extract query params
        const { searchParams } = ctx.request.url;
        const sensorParam = searchParams.get("sensor");
        const startDate   = searchParams.get("startDate");
        const startTime   = searchParams.get("startTime");
        const endDate     = searchParams.get("endDate");
        const endTime     = searchParams.get("endTime");

        console.log("[TROUBLESHOT] Filters:", sensorParam, startDate, startTime, endDate, endTime);

        const filter: Record<string, unknown> = {};

        // Sensor filter
        if (sensorParam) {
            const sensorArray = sensorParam.split(",").map(s => s.trim());
            filter.sensor_id = { $in: sensorArray };
        }

        // Build raw local-time strings (no UTC conversion)
        const buildLocalString = (
            dateStr: string | null,
            timeStr: string | null,
            defaultTime: string
        ): string | null => {
            if (!dateStr) return null;
            const time = timeStr ? timeStr : defaultTime;
            // Ensure HH:mm:ss format
            const normalized = time.length <= 5 ? `${time}:00` : time;
            return `${dateStr}T${normalized}`;
        };

        const startLocal = buildLocalString(startDate, startTime, "00:00:00");
        const endLocal   = buildLocalString(endDate,   endTime,   "23:59:59");

        // Apply range filter on local (strings)
        if (startLocal && endLocal) {
            // Optional check: ensure start <= end
            if (new Date(startLocal) > new Date(endLocal)) {
                ctx.response.status = 400;
                ctx.response.body = { error: "Start date/time is after end date/time." };
                return;
            }
            filter.local = { $gte: startLocal, $lte: endLocal };
        } else if (startLocal) {
            filter.local = { $gte: startLocal };
        } else if (endLocal) {
            filter.local = { $lte: endLocal };
        }

        // Projection & sorting
        const projection = { utc: 1, local: 1, temp: 1, reading: 1, sensor_id: 1, _id: 0 };
        const sort = { local: 1 };

        console.log("[TROUBLESHOT] Query:", filter);
        const cursor = sensorDataCollection.find(filter, { projection, sort });
        const result = await cursor.toArray();

        if (!result.length) {
            ctx.response.status = 404;
            ctx.response.body = { error: "No sensor data found" };
            return;
        }

        ctx.response.status = 200;
        ctx.response.body = result;

    } catch (err) {
        console.error("Error retrieving filtered sensor data:", err);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal server error", details: err.message };
    }
});

export default sensorDataRouter;
