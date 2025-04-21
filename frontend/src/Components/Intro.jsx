/**
 * File: frontend/src/Components/Intro.jsx
 * Author: Connor Vardakis
 * Date: 3/25/25
 * Updated: 4/20/25
 * Description: Intro.jsx passes all html for the intro section
 **/

import React from "react";
import './css/Intro.css';

function Intro() {
    return (
        <section className="intro-container">
            <h1>About This Project</h1>
            <p className="intro-text">
                This project continuously monitors and analyzes night sky brightness using specialized light sensors.
                By gathering precise measurements of ambient light, we can accurately assess the levels of light
                pollution present in various environments. Understanding the extent and impact of artificial light
                pollution is crucial, as excessive artificial lighting disrupts ecosystems, affects human health,
                wastes energy, and obscures our view of the stars. This project aims to inform better environmental
                practices and promote awareness about preserving dark skies.
            </p>
        </section>
    );
}

export default Intro;