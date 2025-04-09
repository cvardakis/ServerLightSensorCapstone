// App.jsx
import React from 'react';
import Header from './Header';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
// import AboutPage from './AboutPage';
import DataPage from './DataPage';

function App() {
    return (
        <Router>
            <div>
                <Header />

                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        {/*<Route path="/about" element={<AboutPage />} />*/}
                        <Route path="/data" element={<DataPage />} />
                    </Routes>
                </main>

            </div>
        </Router>
    );
}

export default App;
