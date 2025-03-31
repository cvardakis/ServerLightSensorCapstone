// src/SensorGraph.js
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function SensorGraph() {
    const [graphData, setGraphData] = useState(null);

    useEffect(() => {
        // Replace with your actual Deno server endpoint for the last 12 hours of sensor data
        fetch('http://your-deno-server/sensorData/last12hours')
            .then((res) => res.json())
            .then((data) => {
                // Assuming data is an array of objects with `timestamp` and `value` properties.
                // Create labels from timestamps and data points from sensor values.
                const labels = data.map((item) =>
                    new Date(item.timestamp).toLocaleTimeString()
                );
                const values = data.map((item) => item.value);
                setGraphData({
                    labels,
                    datasets: [
                        {
                            label: 'Mag/arcsec²',
                            data: values,
                            fill: false,
                            borderColor: 'blue',
                            tension: 0.1, // smoothness of the line
                        },
                    ],
                });
            })
            .catch((err) => console.error('Error fetching sensor data:', err));
    }, []);

    return (
        <div>
            <h2>Sensor Data Over Last 12 Hours</h2>
            {graphData ? (
                <Line data={graphData} />
            ) : (
                <p>Loading graph data...</p>
            )}
        </div>
    );
}

export default SensorGraph;
