/**
 * File: frontend/src/App.jsx
 * Author: Connor Vardakis
 * Date: 3/10/25
 * Updated: 4/20/25
 * Description: App.jsx returns the html and handles routes for the entire
 *              react application
 **/

import React from 'react';
import Header from './Components/Header';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import AboutPage from './Pages/AboutPage';
import DataPage from './Pages/DataPage';

function App() {
    return (
        <Router>
            <div>
                <Header />

                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/data" element={<DataPage />} />
                    </Routes>
                </main>

            </div>
        </Router>
    );
}

export default App;
