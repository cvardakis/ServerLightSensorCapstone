import React from 'react';
import "./Background.css"

function Background() {
    return (
        <div className={"background-container"}>
            <h2>Background</h2>
            <p>This project builds upon foundational research conducted in previous years that focused on measuring
                artificial light at night (ALAN) using Sky Quality Meters (SQMs). In particular, the prior research
                conducted by Janet Wong and team involved installing SQMs at two distinct locations in Utah: the urban
                University of Utah campus and the rural Dead Horse Point State Park. These SQMs continuously collected
                data every five minutes on sky brightness, specifically measuring magnitude per square arcsecond (mag/arcsec²),
                temperature, and frequency of readings. The collected data was contributed to the Globe at
                Night Monitoring Network (GaN-NM), managed by the National Optical Astronomy Observatory.
                This work emphasized public outreach and education, employing web applications and curriculum
                development to connect students and the general public with tangible sky quality data.
            </p>
        </div>
    )
}

export default Background