import React from "react";
import "./AboutData.css"

function AboutData() {
    return (
        <div className="about-data">
            <h2>About This Data</h2>
            <p className="about-text">
                The data collected by our sensors is reported in magnitude per square arcsecond (mag/arcsec²), a
                standard astronomical unit used to quantify sky brightness. In this scale, higher numerical values
                indicate darker skies, while lower values correspond to brighter, more light-polluted skies.
                For reference, a pristine dark sky typically has a measurement around 21.7 to 22.0 mag/arcsec²,
                whereas urban environments can drop well below 18 mag/arcsec² due to artificial lighting. Our sensors
                collect measurements at regular intervals of five minutes, ensuring comprehensive and consistent
                monitoring to track variations and trends in sky brightness over time.
            </p>
        </div>
    );
}

export default AboutData;
