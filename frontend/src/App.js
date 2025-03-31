// src/App.js
import React from 'react';
import SensorStatus from './SensorStatus';
import Header from './Header';
import Intro from './Intro';
import AboutData from './AboutData';
import './App.css';
// import SensorGraph from './SensorGraph';

function App() {
    return (
    <div className="App" >
        <Header/>
        <Intro/>
        <h1>Sensor Dashboard</h1>
        <SensorStatus/>
        <AboutData/>
        <hr style={{margin: '20px 0'}}/>
        {/*<SensorGraph />*/}
    </div>
)
    ;
}

export default App;
