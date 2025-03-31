import React, { useState, useEffect } from 'react';
import './SensorStatus.css'

function SensorStatus() {
    const [status, setStatus] = useState(null);
    const [latestMeasurement, setLatestMeasurement] = useState(null);

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            // Use fake data in development for easier testing
            const fakeData = {
                value: 21.5,
                timestamp: new Date().toISOString()
            };

            const simulateFetch = () =>
                new Promise((resolve) => setTimeout(() => resolve(fakeData), 500));

            simulateFetch().then(handleData).catch(console.error);
        } else {
            // Use the real API call in production
            fetch('https://utah-skyscope.deno.dev/sensorData/latest')
                .then((res) => res.json())
                .then(handleData)
                .catch((err) => console.error('Error fetching sensor status:', err));
        }
    }, []);

    function handleData(data) {
        setLatestMeasurement(data);
        if (data && data.timestamp) {
            const reportedTime = new Date(data.timestamp);
            const now = new Date();
            const diffMinutes = (now - reportedTime) / 1000 / 60;
            setStatus(diffMinutes <= 10 ? 'online' : 'offline');
        }
    }

    return (
        <div className="sensor-container">
            <h2>Sensor Name</h2>
            <button
                style={{
                    background: status === 'online' ? 'green' : 'red',
                    color: 'white',
                    padding: '10px'
                }}
            >
                {status ? (status === 'online' ? 'Online' : 'Offline') : 'Loading...'}
            </button>
            {latestMeasurement && (
                <div>
                    <p>
                        <strong>Latest Measurement</strong><br />
                        {latestMeasurement.value} mag/arcsec<sup>2</sup>
                    </p>
                    <p>
                        <strong>Timestamp</strong><br />
                        {new Date(latestMeasurement.timestamp).toLocaleString()}
                    </p>
                </div>
            )}
        </div>
    );
}

export default SensorStatus;
