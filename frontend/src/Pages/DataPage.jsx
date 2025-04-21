/**
 * File: frontend/src/Components/DataPage.jsx
 * Author: Connor Vardakis
 * Date: 4/2/25
 * Updated: 4/20/25
 * Description: DataPage.jsx returns the html for the DataPage
 **/

import React from 'react';
import ReactChartsLine from "../Components/ReactChartsLine";
import AboutData from "../Components/AboutData";
import "../Components/css/DataPage.css"

function DataPage() {
    return (
        <div>
            <div>
                <ReactChartsLine />
            </div>
            <div className="about">
                <AboutData />
            </div>
        </div>
    )
}

export default DataPage