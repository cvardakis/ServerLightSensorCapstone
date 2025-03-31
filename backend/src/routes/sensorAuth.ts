// sensorAuth.ts
import { Router, Request } from "https://deno.land/x/oak@v12.5.0/mod.ts";
import "https://deno.land/std@0.221.0/dotenv/load.ts";
import { sensorCollection } from "../db/mongoClient.ts";

const REGISTRATION_KEY = Deno.env.get("REGISTRATION_KEY");

// Create a new router instance.
const router = new Router();

// Generate a unique sensor ID.
function generateUniqueSensorId(): string {
    return `sensor-${crypto.randomUUID()}`;
}

export async function sensorAuthHandler(ctx: any): Promise<void> {
    try {
        const body = await ctx.request.body({ type: "json" }).value;
        console.log(body);

        if (
            !body.registration_key ||
            !body.id ||
            !body.name ||
            !body.location ||
            !body.latitude ||
            !body.longitude ||
            !body.elevation
        ) {
            console.log("[SECURITY] Sensor attempted to authenticate with missing information", body);
            ctx.response.status = 400;
            ctx.response.body = { error: "Missing Fields" };
            return;
        }

        if (body.registration_key !== REGISTRATION_KEY) {
            console.log("[SECURITY] Sensor attempted to authenticate with invalid key");
            ctx.response.status = 403;
            ctx.response.body = { error: "Unauthorized sensor registration" };
            return;
        }

        const existingSensor = await sensorCollection.findOne({
            latitude: body.latitude,
            longitude: body.longitude,
        });

        if (existingSensor) {
            console.log(`[INFO] Sensor, ${body.name}, authenticated on server`);
            ctx.response.status = 200;
            ctx.response.body = { status: "authenticated", sensor_id: existingSensor.sensor_id };
            return;
        }

        const uniqueSensorId = generateUniqueSensorId();
        const newSensor = {
            sensor_id: uniqueSensorId,
            name: body.name,
            location: body.location,
            latitude: body.latitude,
            longitude: body.longitude,
            elevation: body.elevation,
            status: "active",
        };

        await sensorCollection.insertOne(newSensor);
        console.log("[INFO] New sensor added", body);
        ctx.response.status = 201;
        ctx.response.body = { status: "registered", sensor_id: uniqueSensorId };
    } catch (error) {
        console.error("[ERROR] Error handling sensor authentication:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Server error" };
    }
}

// Register the sensor authentication endpoint.
router.post("/sensor-auth", sensorAuthHandler);

export default router;
