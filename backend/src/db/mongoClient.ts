/**
 * File: backend/src/db/mongoClient.ts
 * Author:
 * Date: 2/12/25
 * Updated: 2/17/25
 * Description: mongoClient.ts handles connection to MonoDB for DB access
 * */
import { MongoClient, ServerApiVersion } from "mongodb";
import "https://deno.land/std@0.221.0/dotenv/load.ts";

// Get MongoDB URL from environmental variables
const uri = Deno.env.get("MONGO_URI");

if (!uri) {
    console.error("[ERROR] MongoClient URI is missing");
    Deno.exit(1);
}
// Create Client
export const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Connect to MongoDB
export async function connectDB(){
    try {
        console.log("[INFO] Attempting to connect to MongoDB...");
        await client.connect();
        console.log("[INFO] Connected");
    } catch (error) {
        console.error("[ERROR] MongoDB connection failed:", error);
        Deno.exit(1);
    }
}

// Export Database and Collection
export const db = client.db("sensor_management");
export const sensorCollection = db.collection("sensors");
export const sensorDataCollection = db.collection("sensor_data");