/**
 * File: frontend/src/Components/ReactChartLine.jsx
 * Author: Connor Vardakis
 * Date: 4/2/25
 * Updated: 4/20/25
 * Description: ReactChartLine.jsx does get requests from backend to get chart and sensor data
 *              Also constructs all html for the data charts and js to make charts functional
 **/

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
import './css/ReactChartsLine.css';

// Custom tooltip with a finite‐check on the timestamp
const CustomTooltip = ({ active, payload, label }) => {
    // If tooltip is not active
    if (!active || !payload?.length) return null;

    // Generate Date label for given X value that is being hovered over
    const date = new Date(label);
    if (isNaN(date.getTime())) return null;  // bail if invalid

    // Format time label to be date and HH:MM
    const timeLabel = date.toLocaleString('en-US', {
        hour12: false,
        month:  '2-digit',
        day:    '2-digit',
        hour:   '2-digit',
        minute: '2-digit',
    });

    // HTML for ToolTip on graph
    return (
        <div style={{
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            padding: '0.5rem',
            color: '#000'
        }}>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                Time: {timeLabel}
            </div>
            {/** load all the data fed back from server **/}
            {payload.map(entry => (
                <div
                    key={entry.dataKey}
                    style={{ color: entry.color, fontWeight: 'bold' }}
                >
                    {entry.name}: {entry.value}
                </div>
            ))}
        </div>
    );
};

// Function to request and organize data to be used on graph
export default function LineGraph() {
    // Defining of multiple constants and useStates functions to set the values of these constants
    // Constants for sensorData
    const [rawData, setRawData]       = useState([]);
    const [chartData, setChartData]   = useState([]);

    // Sensor list & selection
    const [sensors, setSensors]             = useState([]);
    const [selectedSensors, setSelectedSensors] = useState([]);

    // Init flag to see if all sensors are loaded
    const [initialized, setInitialized]     = useState(false);

    // Date/time filters
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate,   setEndDate]   = useState('');
    const [endTime,   setEndTime]   = useState('');

    // Y‑axis controls
    const [yStep, setYStep] = useState(5);
    const [yMin,  setYMin]  = useState(0);
    const [yMax,  setYMax]  = useState(0);

    const apiUrl = 'https://utah-skyscope.deno.dev';

    // Helper to enforce at least one sensor checked (User must have one active sensor in the selection box)
    const toggleSensor = id => {
        setSelectedSensors(prev => {
            // Checks to see id is selected removes if not selected
            // Keeps if it is the only sensor listed
            if (prev.includes(id)) {
                return prev.length === 1 ? prev : prev.filter(x => x !== id);
            }
            // Append to array if not already listed
            return [...prev, id];
        });
    };

    // On mount: round to 5 min, set filters, fetch sensor list
    useEffect(() => {
        // Helper function to ensure time is formated properly
        const pad = n => String(n).padStart(2, '0');

        // Helper function that rounds time to the nearest 5 minute mark to
        // match DB structure
        const round5 = d => {
            const ms = d.getTime(), step = 5 * 60 * 1000;
            return new Date(Math.floor(ms/step)*step);
        };

        // Collect latest time and round it to the nearest 5 minute mark
        // Calculate 12 hours ago for default chart loading
        const now = round5(new Date());
        const ago12 = new Date(now.getTime() - 12 * 3600 * 1000);

        // Initialize all date and time values for MMDDYY and HHSSMsMs format
        // Collects 4 digit year (.getFullYear)
        // Collects month and adjust by 1 for human calendar (.getMonth starts with Jan = 0)
        // Collects the date (.getDate)
        setStartDate(`${ago12.getFullYear()}-${pad(ago12.getMonth()+1)}-${pad(ago12.getDate())}`);
        setStartTime(`${pad(ago12.getHours())}:${pad(ago12.getMinutes())}`);
        setEndDate(`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`);
        setEndTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);

        // Get request from backend
        fetch(`${apiUrl}/sensors`)
            // Parse JSON
            .then(r => r.json())
            // Store values in listed map and sets initialized value
            .then(list => {
                setSensors(list);
                setSelectedSensors(list.map(s => s.sensor_id));
                setInitialized(true);
            })
            .catch(console.error);
    }, [apiUrl]);

    // Function to fetch data
    useEffect(() => {
        // Skip nonselected sensors
        if (!initialized) return;

        // Builds customer URL to query wanted information
        const buildUrl = () => {
            const p = new URLSearchParams();
            if (selectedSensors.length) p.set('sensor', selectedSensors.join(','));
            if (startDate) p.set('startDate', startDate);
            if (startTime) p.set('startTime', startTime);
            if (endDate)   p.set('endDate', endDate);
            if (endTime)   p.set('endTime', endTime);
            return `${apiUrl}/sensorData/filter?${p.toString()}`;
        };

        // Does get request on custom URL
        const fetchData = () => {
            fetch(buildUrl())
                // JSON parsing
                .then(r => r.json())
                .then(rows => {
                    // store data in raw format
                    setRawData(rows);

                    // Create empty bucket and organize data
                    const bucket = {};
                    rows.forEach(({ sensor_id, local, reading }) => {
                        const ts = new Date(local).getTime();
                        // initialize timestamp if necessary
                        if (!bucket[ts]) bucket[ts] = { timestamp: ts };
                        // Set value for timestamp and each sensor
                        bucket[ts][sensor_id] = parseFloat(reading);
                    });
                    // Turn bucket into a sorted array
                    let arr = Object.values(bucket).sort((a,b) => a.timestamp - b.timestamp);

                    // ensure each timestamp has a key for every selected sensor
                    arr = arr.map(pt => {
                        selectedSensors.forEach(id => {
                            if (!(id in pt)) pt[id] = null;
                        });
                        return pt;
                    });
                    // send data to chart
                    setChartData(arr);

                    // Recompute Y bounds
                    // Calculates highest value
                    const all = rows.map(r => parseFloat(r.reading));
                    const maxR = all.length ? Math.max(...all) : 0;
                    // Sets Y max to nearest step
                    const ceilMax = Math.ceil(maxR / yStep) * yStep;
                    setYMin(0);
                    setYMax(ceilMax);
                })
                .catch(console.error);
        };

        fetchData();
    }, [
        apiUrl,
        initialized,
        startDate,
        startTime,
        endDate,
        endTime,
        selectedSensors,
        yStep
    ]);

    // Compute X & Y ticks
    const startTs = new Date(`${startDate}T${startTime}`).getTime();
    const endTs   = new Date(`${endDate}T${endTime}`).getTime();
    // X ticks every hour
    // Calculate the first hour mark
    const xTicks = [];
    let firstHour = new Date(startTs);
    firstHour.setMinutes(0,0,0);
    // Calculate every subsequent hour after
    if (firstHour.getTime() < startTs) firstHour = new Date(firstHour.getTime() + 3600_000);
    for (let t = firstHour.getTime(); t <= endTs; t += 3600_000) {
        // Set the tickmarks
        xTicks.push(t);
    }
    // Y ticks by yStep
    const yTicks = [];
    for (let v = yMin; v <= yMax; v += yStep) {
        yTicks.push(v);
    }

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c'];

    return (
        <div style={{ width: '100%', height: 600 }}>
            {/* Menus */}
            <div className="menuContainer">
                {/* Sensor Selection */}
                <section className="section1">
                    <h4>Sensor Selection</h4>
                    <div
                        className="sensor-options"
                        style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}
                    >
                        {sensors.map(s => (
                            <label key={s.sensor_id}>
                                <input
                                    type="checkbox"
                                    checked={selectedSensors.includes(s.sensor_id)}
                                    onChange={() => toggleSensor(s.sensor_id)}
                                />
                                {s.name}
                            </label>
                        ))}
                    </div>
                </section>


                {/* Date & Range */}
                <section className="section2">
                    <h4>Date & Range</h4>
                    <div style={{display: 'flex', gap: 24, justifyContent: 'center'}}>
                        <div>
                            <label>Start Date<br/>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}/>
                            </label><br/>
                            <label>Start Time<br/>
                                <input type="time" step="300" value={startTime}
                                       onChange={e => setStartTime(e.target.value)}/>
                            </label>
                        </div>
                        <div>
                            <label>End Date<br/>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}/>
                            </label><br/>
                            <label>End Time<br/>
                                <input type="time" step="300" value={endTime}
                                       onChange={e => setEndTime(e.target.value)}/>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Y‑Axis & CSV */}
                <section className="section3">
                    <h4>Data Options</h4>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 24,
                        marginBottom: 8,
                        justifyContent: 'center'
                    }}>
                        <div>
                            <label>Y Min<br/>
                                <input
                                    type="number"
                                    value={yMin}
                                    onChange={e => setYMin(Number(e.target.value))}
                                    style={{width: 60}}
                                />
                            </label>
                        </div>
                        <div>
                            <label>Y Max<br/>
                                <input
                                    type="number"
                                    value={yMax}
                                    onChange={e => setYMax(Number(e.target.value))}
                                    style={{width: 60}}
                                />
                            </label>
                        </div>
                        <div>
                            <label>Y Step<br/>
                                <select value={yStep} onChange={e => setYStep(Number(e.target.value))}>
                                    <option value={1}>1 unit</option>
                                    <option value={2}>2 units</option>
                                    <option value={5}>5 units</option>
                                    <option value={10}>10 units</option>
                                </select>
                            </label>
                        </div>
                    </div>
                </section>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{top: 20, right: 10, bottom: 80, left: 10}}
                >
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis
                        dataKey="timestamp"
                        type="number"
                        domain={[startTs, endTs]}
                        ticks={xTicks}
                        tickFormatter={ms => new Date(ms).toLocaleTimeString('en-GB', {
                            hour12: false, hour: '2-digit', minute: '2-digit'
                        })}
                        label={{ value: 'Local Time', position: 'bottom', offset: 20, style: { fontWeight: 'bold' } }}
                    />
                    <YAxis
                        domain={[yMin, yMax]}
                        ticks={yTicks}
                        label={{ value: 'mag/arcsec²', angle: -90, position: 'insideLeft', dy: 50, style: { fontWeight: 'bold' } }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" />

                    {selectedSensors.map((id, i) => {
                        const sensor = sensors.find(s => s.sensor_id === id);
                        return (
                            <Line
                                key={id}
                                type="monotone"
                                dataKey={id}
                                name={sensor?.name || id}
                                stroke={colors[i % colors.length]}
                                dot={false}
                                connectNulls
                            />
                        );
                    })}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
