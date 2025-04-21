/**
 * File: frontend/src/Pages/Home.jsx
 * Author: Connor Vardakis
 * Date: 4/8/25
 * Updated: 4/20/25
 * Description: Home.jsx returns the home page html for the landing page
 **/

import React from 'react';
import SensorStatus from '../Components/SensorStatus';
import Intro from '../Components/Intro';
import AboutData from '../Components/AboutData';
import '../Components/css/App.css';


function Home() {
    return (
        <div className="App">
            <Intro/>
            <h2>Sensor Dashboard</h2>
            <SensorStatus/>
            <AboutData/>
        </div>
    )
        ;
}

export default Home;
