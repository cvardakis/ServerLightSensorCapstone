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
import './ReactChartsLine.css';

function LineGraph() {
    // Data and sensor selection state
    const [data, setData] = useState([]);
    const [selectedSensors, setSelectedSensors] = useState([]);

    // State for the date range selection
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');

    // Toggle function for sensor checkboxes (allows multiple selections)
    const toggleSensor = (sensor) => {
        setSelectedSensors((prevSelected) =>
            prevSelected.includes(sensor)
                ? prevSelected.filter((s) => s !== sensor)
                : [...prevSelected, sensor]
        );
    };

    // Placeholder function for CSV download
    const downloadCSV = () => {
        console.log("CSV download initiated (placeholder)");
    };

    // Fetch sensor data from the API on component mount
    useEffect(() => {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const fetchUrl = `${apiUrl}/sensorData/last12hours`;

        const fetchSensorData = async () => {
            try {
                console.log("Fetching from:", fetchUrl);
                const response = await fetch(fetchUrl, {
                    headers: { 'Accept': 'application/json' }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                console.log("Fetched sensor data:", result);

                // Sort data by utc timestamp (oldest first)
                const sortedData = result.sort(
                    (a, b) => new Date(a.utc) - new Date(b.utc)
                );
                console.log("Sorted sensor data:", sortedData);

                // Map API data to chart format using keys 'time' and 'reading'
                const chartData = sortedData.map((item) => ({
                    time: new Date(item.utc).toLocaleTimeString(),
                    reading: parseFloat(item.reading)
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
        <div style={{ width: '100%', height: 400 }}>
            <div className="menuContainer">
                {/* Section 1: Sensor Selection */}
                <section className="section1">
                    <h5>Sensor Selection</h5>
                    <div className="sensor-options">
                        <label>
                            <input
                                type="checkbox"
                                value="sensor1"
                                checked={selectedSensors.includes("sensor1")}
                                onChange={() => toggleSensor("sensor1")}
                            />
                            Sensor 1
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                value="sensor2"
                                checked={selectedSensors.includes("sensor2")}
                                onChange={() => toggleSensor("sensor2")}
                            />
                            Sensor 2
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                value="sensor3"
                                checked={selectedSensors.includes("sensor3")}
                                onChange={() => toggleSensor("sensor3")}
                            />
                            Sensor 3
                        </label>
                    </div>
                </section>

                {/* Section 2: Date and Range */}
                <section className="section2">
                    <h5>Date and Range</h5>
                    <div className="range-selector">
                        <div className="range-group">
                            <label>
                                Start Date:
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </label>
                            <label>
                                Start Time:
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </label>
                        </div>
                        <div className="range-group">
                            <label>
                                End Date:
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </label>
                            <label>
                                End Time:
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </label>
                        </div>
                    </div>
                </section>

                {/* Section 3: Data Options */}
                <section className="section3">
                    <h5>Data Options</h5>
                    <button onClick={downloadCSV}>Download as CSV</button>
                </section>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="reading" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default LineGraph;
