import React from "react";
import "./AboutData.css"

function AboutData() {
    return (
        <div className="about-data">
            <h2>About This Data</h2>
            <p>
                The Night Sky Sensor continuously measures ambient light levels to gauge
                light pollution. The collected data helps identify trends, track changes
                over time, and inform strategies for preserving dark skies.
            </p>
        </div>
    );
}

export default AboutData;
