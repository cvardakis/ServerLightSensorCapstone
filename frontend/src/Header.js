import React, { useState } from 'react';
import logo from './Assets/Utah_SkyScope_Logo_No_Background.png'
import './Header.css';

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(prev => !prev);
    };

    return (
        <header className="header">
            <img src={logo} className="logo-image" alt="logo" />
            {/*<div className="logo">Night Sky Sensor</div>*/}
            <div className="menu-icon" onClick={toggleMenu}>
                &#9776;
            </div>
            <nav className={`nav ${menuOpen ? 'open' : ''} routes`}>
                <ul className="routes">
                    <li><a href="/">Home</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/data">Data</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
