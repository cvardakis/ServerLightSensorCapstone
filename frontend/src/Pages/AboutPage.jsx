/**
 * File: frontend/src/Pages/AboutPage.jsx
 * Author: Connor Vardakis
 * Date: 4/19/25
 * Updated: 4/20/25
 * Description: AboutPage.jsx returns the html for all the about
 *              data sections on the frontend
 **/

import React from "react";
import Background from "../Components/Background";
import AboutData from "../Components/AboutData";
import Importance from "../Components/Importance";

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