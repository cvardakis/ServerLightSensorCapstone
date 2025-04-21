/**
 * File: frontend/src/Components/SensorStatus.jsx
 * Author: Connor Vardakis
 * Date: 3/25/25
 * Updated: 4/20/25
 * Description: SensorStatus.jsx does get requests from backend to get chart and sensor data
 *              Also constructs all html for the data charts and js to make charts functional
 **/
import React, { useState, useEffect } from 'react';
import './css/SensorStatus.css';

function SensorStatusList() {
    // Establishing constants with setter functions with useState()
    const [sensorMeasurements, setSensorMeasurements] = useState([]);
    const [loading, setLoading] = useState(true);

    // Function that calls on the backend api
    useEffect(() => {
        const apiBase = process.env.NODE_ENV === 'development'
            ? 'http://localhost:8000'
            : 'https://utah-skyscope.deno.dev';

        // Call API for all available sensors
        fetch(`${apiBase}/sensors`)
            // Parse json
            .then(res => res.json())
            .then(sensors =>
                Promise.all(
                    // Store sensorid and Sensor Names into map
                    sensors.map(({ name, sensor_id }) =>
                        // After storing data request latest measurement from database
                        fetch(`${apiBase}/sensorData/latest?sensorId=${sensor_id}`)
                            .then(r => r.json())
                            .then(data => ({ name, id: sensor_id, data }))
                            .catch(() => ({ name, id: sensor_id, error: true }))
                    )
                )
            )
            // Store latest measurment
            .then(results => {
                setSensorMeasurements(results);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching sensors or data:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading sensors…</p>;

    return (
        <div className="sensor-status-container">
            {sensorMeasurements.map(({ name, id, data, error }) => {
                if (error || !data || data.error) {
                    return (
                        <div key={id} className="sensor-card">
                            <h2>{name}</h2>
                            <p>Error loading data.</p>
                        </div>
                    );
                }

                const reported = new Date(data.timestamp);
                const minutesAgo = (Date.now() - reported.getTime()) / 1000 / 60;
                const status = minutesAgo <= 10 ? 'online' : 'offline';

                return (
                    <div key={id} className="sensor-card">
                        <h2>{name}</h2>
                        <button
                            style={{
                                background: status === 'online' ? 'green' : 'red',
                                color: 'white',
                                padding: '10px'
                            }}
                        >
                            {status === 'online' ? 'Online' : 'Offline'}
                        </button>

                        <div>
                            <p>
                                <strong>Latest Measurement</strong><br/>
                                {data.value} mag/arcsec<sup>2</sup>
                            </p>
                            <p>
                                <strong>Local Timestamp</strong><br/>
                                {new Date(data.timestamp).toLocaleString('en-US', {
                                    month:    '2-digit',
                                    day:      '2-digit',
                                    year:     'numeric',
                                    hour:     '2-digit',
                                    minute:   '2-digit',
                                    hour12:   false
                                })}


                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default SensorStatusList;
