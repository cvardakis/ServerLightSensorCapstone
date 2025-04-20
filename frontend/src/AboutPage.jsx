import React from "react";
import Background from "./Background";
import AboutData from "./AboutData";
import importance from "./Importance";
import Importance from "./Importance";

function AboutPage() {
    return (
        <div className="aboutPage">
            <Background />
            <AboutData />
            <Importance />
        </div>
    )
}

export default AboutPage;