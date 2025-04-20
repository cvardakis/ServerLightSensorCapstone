import React from 'react';
import ReactChartsLine from "./ReactChartsLine";
import AboutData from "./AboutData";
import "./DataPage.css"

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