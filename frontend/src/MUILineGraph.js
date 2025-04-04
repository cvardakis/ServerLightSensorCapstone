// SensorLineChart.jsx

// import React, { useEffect, useState } from "react";
// import { Box, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts"


const MUILineGraph = () => {
    const [data, setData] = useState([]);

    // Fetch sensor data from the server
    const fetchSensorData = async () => {
        try {
            const response = await fetch("http://localhost:8000/sensorData/last12hours");
            const result = await response.json();

            // Sort data chronologically (oldest to newest)
            const sortedData = result.sort(
                (a, b) => new Date(a.utc) - new Date(b.utc)
            );

            // Map data into a format suitable for our chart.
            // Here, we assume each object has a "utc" (timestamp) and "reading" (string) property.
            const chartData = sortedData.map((point) => ({
                utc: point.utc,
                reading: parseFloat(point.reading),
            }));

            setData(chartData);
        } catch (error) {
            console.error("Error fetching sensor data:", error);
        }
    };

    useEffect(() => {
        fetchSensorData();
    }, []);

    return (
        <LineChart
            xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
            series={[
                {
                    data: [2, 5.5, 2, 8.5, 1.5, 5],
                },
            ]}
            width={500}
            height={300}
        />
    );
};

export default MUILineGraph;
