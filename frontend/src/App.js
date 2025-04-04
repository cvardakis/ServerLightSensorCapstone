// src/App.js
import React from 'react';
import SensorStatus from './SensorStatus';
import Header from './Header';
import Intro from './Intro';
import AboutData from './AboutData';
import LineGraph from "./ReactChartsLine"
import './App.css';
// import MUILineGraph from "./MUILineGraph";
// import SensorGraph from './SensorGraph';

function App() {
    return (
    <div className="App" >
        <Header/>
        <Intro/>
        <h2>Sensor Dashboard</h2>
        <SensorStatus/>
        <AboutData/>
        {/*<MUILineGraph/>*/}
        <div style={{ width: '100%', height: 400 }}>
            <LineGraph/>
        </div>
        {/*<hr style={{margin: '20px 0'}}/>*/}
        {/*<SensorGraph />*/}
    </div>
)
    ;
}

export default App;
