// ReactChartsLine.js
import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

function LineGraph() {
    const [data, setData] = useState([]);

    useEffect(() => {
        // Use the environment variable for API URL if available,
        // otherwise default to localhost (good for development).
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const fetchUrl = `${apiUrl}/sensorData/last12hours`;

        const fetchSensorData = async () => {
            try {
                const response = await fetch(fetchUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                console.log("Fetched sensor data:", result);

                // Sort the data by the utc timestamp (oldest first)
                const sortedData = result.sort(
                    (a, b) => new Date(a.utc) - new Date(b.utc)
                );
                console.log("Sorted sensor data:", sortedData);

                // Map the data to the format needed by Recharts
                const chartData = sortedData.map((item) => ({
                    utc: item.utc,
                    reading: parseFloat(item.reading),
                }));
                console.log("Chart data:", chartData);

                setData(chartData);
            } catch (error) {
                console.error("Error fetching sensor data:", error);
            }
        };

        fetchSensorData();
    }, []);

    return (
        // Ensure that the container has an explicit height.
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    {/* Display the timestamp on the X-axis */}
                    <XAxis dataKey="utc" />
                    {/* Y-axis for the sensor reading */}
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="reading"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default LineGraph;
