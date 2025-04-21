/**
 * File: frontend/src/Components/test.jsx
 * Author: Connor Vardakis
 * Date: 4/2/25
 * Updated: 4/20/25
 * Description: Test.jsx made to test the fetching process
 **/

import { fileURLToPath } from 'url';

export async function fetchAndProcessSensorData(apiUrl) {
    const fetchUrl = `${apiUrl}/sensorData/last12hours`;
    try {
        const response = await fetch(fetchUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log("Fetched sensor data:", result);

        const sortedData = result.sort(
            (a, b) => new Date(a.utc) - new Date(b.utc)
        );
        console.log("Sorted sensor data:", sortedData);

        // Map to the desired format: time (x-axis) and reading (y-axis)
        const chartData = sortedData.map((item) => ({
            time: new Date(item.utc).toLocaleTimeString(),
            reading: parseFloat(item.reading)
        }));
        console.log("Chart data:", chartData);

        return chartData;
    } catch (error) {
        console.error("Error fetching sensor data:", error);
        throw error;
    }
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

    fetchAndProcessSensorData(apiUrl)
        .then((data) => {
            console.log("Processed sensor data:", data);
        })
        .catch((error) => {
            console.error("Failed fetching sensor data:", error);
        });
}
