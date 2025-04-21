/**
 * File: frontend/src/Components/Importance.jsx
 * Author: Connor Vardakis
 * Date: 4/19/25
 * Updated: 4/20/25
 * Description: Importance.jsx passes all html for Importance section on about page
 **/

import React from 'react';
import "./css/Importance.css"

function Importance() {
    return(
        <div className="importance-container">
            <h2>Importance & Active Research</h2>
            <p>
                Collecting data on artificial light at night is critical for several reasons. Artificial light pollution
                significantly affects human health, wildlife ecosystems, and energy consumption. Excessive nighttime
                lighting disrupts circadian rhythms, impacting sleep patterns and overall health. Wildlife, particularly
                nocturnal species, experience disturbances in navigation, predation, and reproduction due to altered
                natural lighting conditions.<br/>
                <br/>
                Current research focuses on expanding monitoring sites across urban and rural regions to better
                understand the extent and impact of artificial lighting. By establishing baselines through ongoing data
                collection, researchers can track changes related to urban growth, conservation efforts, and
                public policy initiatives aimed at reducing unnecessary artificial lighting. The data also supports
                educational and public outreach efforts, fostering greater community engagement and awareness around
                the issue of light pollution.<br/>
                <br/>
                Future research initiatives aim to refine data collection methods, expand educational programs,
                and enhance public accessibility of data through interactive web-based tools. Through these efforts,
                our project seeks to significantly contribute to regional and global efforts to mitigate artificial
                light pollution and preserve the integrity of the natural night sky.
            </p>
        </div>
    )
}

export default Importance;