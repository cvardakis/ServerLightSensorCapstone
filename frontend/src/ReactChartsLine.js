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

// Custom tooltip with a finite‐check on the timestamp
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    // parse label as a Date
    const date = new Date(label);
    if (isNaN(date.getTime())) return null;  // bail if invalid

    // format however you like
    const timeLabel = date.toLocaleString('en-US', {
        hour12: false,
        month:  '2-digit',
        day:    '2-digit',
        hour:   '2-digit',
        minute: '2-digit',
    });

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


export default function LineGraph() {
    // Raw & pivoted data
    const [rawData, setRawData]       = useState([]);
    const [chartData, setChartData]   = useState([]);

    // Sensor list & selection
    const [sensors, setSensors]             = useState([]);
    const [selectedSensors, setSelectedSensors] = useState([]);

    // Init flag (wait until sensors are loaded)
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

    const apiUrl = process.env.REACT_APP_API_URL || 'https://utah-skyscope.deno.dev';

    // Helper to enforce at least one sensor checked
    const toggleSensor = id => {
        setSelectedSensors(prev => {
            if (prev.includes(id)) {
                return prev.length === 1 ? prev : prev.filter(x => x !== id);
            }
            return [...prev, id];
        });
    };

    // On mount: round to 5 min, set filters, fetch sensor list
    useEffect(() => {
        const pad = n => String(n).padStart(2, '0');
        const round5 = d => {
            const ms = d.getTime(), step = 5 * 60 * 1000;
            return new Date(Math.floor(ms/step)*step);
        };
        const now = round5(new Date());
        const ago12 = new Date(now.getTime() - 12 * 3600 * 1000);

        setStartDate(`${ago12.getFullYear()}-${pad(ago12.getMonth()+1)}-${pad(ago12.getDate())}`);
        setStartTime(`${pad(ago12.getHours())}:${pad(ago12.getMinutes())}`);
        setEndDate(`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`);
        setEndTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);

        fetch(`${apiUrl}/sensors`)
            .then(r => r.json())
            .then(list => {
                setSensors(list);
                setSelectedSensors(list.map(s => s.sensor_id));
                setInitialized(true);
            })
            .catch(console.error);
    }, [apiUrl]);

    // Fetch rawData any time filters or selection change
    useEffect(() => {
        if (!initialized) return;

        const buildUrl = () => {
            const p = new URLSearchParams();
            if (selectedSensors.length) p.set('sensor', selectedSensors.join(','));
            if (startDate) p.set('startDate', startDate);
            if (startTime) p.set('startTime', startTime);
            if (endDate)   p.set('endDate', endDate);
            if (endTime)   p.set('endTime', endTime);
            return `${apiUrl}/sensorData/filter?${p.toString()}`;
        };

        const fetchData = () => {
            fetch(buildUrl())
                .then(r => r.json())
                .then(rows => {
                    setRawData(rows);
                    // Pivot & normalize:
                    const bucket = {};
                    rows.forEach(({ sensor_id, local, reading }) => {
                        const ts = new Date(local).getTime();
                        if (!bucket[ts]) bucket[ts] = { timestamp: ts };
                        bucket[ts][sensor_id] = parseFloat(reading);
                    });
                    let arr = Object.values(bucket).sort((a,b) => a.timestamp - b.timestamp);
                    // ensure each timestamp has a key for every selected sensor
                    arr = arr.map(pt => {
                        selectedSensors.forEach(id => {
                            if (!(id in pt)) pt[id] = null;
                        });
                        return pt;
                    });
                    setChartData(arr);

                    // Recompute Y domain
                    const all = rows.map(r => parseFloat(r.reading));
                    const maxR = all.length ? Math.max(...all) : 0;
                    const ceilMax = Math.ceil(maxR / yStep) * yStep;
                    setYMin(0);
                    setYMax(ceilMax);
                })
                .catch(console.error);
        };

        fetchData();
        // const iv = setInterval(fetchData, 60_000);
        // return () => clearInterval(iv);
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
    const xTicks = [];
    let firstHour = new Date(startTs);
    firstHour.setMinutes(0,0,0);
    if (firstHour.getTime() < startTs) firstHour = new Date(firstHour.getTime() + 3600_000);
    for (let t = firstHour.getTime(); t <= endTs; t += 3600_000) {
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
            {/* ─── Menus ────────────────────────────────────────────────────────── */}
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

            {/* ─── Chart ────────────────────────────────────────────────────────── */}
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
