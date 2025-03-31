// server.ts
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MongoClient, ServerApiVersion } from "mongodb";


// MongoClient Config
// connection url
const uri = "PRIVATE KEY"

// defining client parameters
// @ts-ignore
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
})

// attempt connection
try {
    console.log("Attempting to connect to MongoDB...");

    // connect
    client.connect();

    console.log("Connected");

// catch error
} catch (error) {
    console.error("Failed:\n" + error);
}


// Define a request handler
const handler = async (request: Request): Promise<Response> => {
    try {
        const db = client.db("sensor_management");
        const sensorsCollection = db.collection("sensors");
        // Query the collection for all documents.
        const sensors = await sensorsCollection.find().toArray();

        // Return the data as JSON.
        return new Response(JSON.stringify(sensors), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error querying the DB:", error);
        return new Response("Error querying the DB", { status: 500 });
    }
};


// Start the server locally (this is useful for testing before deploying)
console.log("Server running on http://localhost:8000");
serve(handler, { port: 8000 });
