import React from "react";
import './Intro.css';

function Intro() {
    return (
        <section className="intro-container">
            <h1>About This Project</h1>
            <p>
                This project aims to measure and analyze night sky brightness using sensor data.
                By monitoring how much light <br/> pollution is present in various locations, we can
                gain insights into environmental impacts, energy usage, and more.
            </p>
        </section>
    );
}

export default Intro;