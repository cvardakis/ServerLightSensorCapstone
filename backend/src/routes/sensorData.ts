/**
 * File: backend/src/routes/sensorData.ts
 * Author:
 * Date: 2/12/25
 * Updated: 2/17/25
 * Description: Handles posting of incoming data to the database if the sensor is authenticated,
 *              and provides endpoints to retrieve sensor data.
 */

// In backend/src/routes/sensorData.ts

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

// GET endpoints (unchanged for now)
sensorDataRouter.get("/sensorData/latest", async (ctx) => {
    try {
        console.log("[INFO] Route hit: /sensorData/latest");
        const filter = {};
        const sort = { utc: -1 };
        const limit = 1;

        // Query and convert to array.
        const latestCursor = sensorDataCollection.find(filter, { sort, limit });
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
            timestamp: latestData.utc,
        };
    } catch (error) {
        console.error("Error retrieving latest sensor data:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal server error", details: error.message };
    }
});

// GET endpoint for last 12 hours.
sensorDataRouter.get("/sensorData/last12hours", async (ctx) => {
    try {
        const now = new Date();
        const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
        const twelveHoursAgoString = twelveHoursAgo.toISOString().slice(0, 19);

        const results = await sensorDataCollection.find(
            { utc: { $gte: twelveHoursAgoString } },
            { sort: { utc: 1 } },
        ).toArray();

        ctx.response.status = 200;
        ctx.response.body = results.map((doc) => ({
            value: doc.reading,
            timestamp: doc.utc,
        }));
    } catch (error) {
        console.error("Error retrieving last 12 hours of sensor data:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal server error", details: error.message };
    }
});

export default sensorDataRouter;
