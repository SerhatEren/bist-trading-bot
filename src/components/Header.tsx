import React from 'react'
import { NavLink } from 'react-router-dom'
import '../styles/Header.css'

const Header: React.FC = () => {
    return (
        <header className="header">
            <div className="logo">
                <h1>BIST Trading Bot</h1>
            </div>
            <nav className="navigation">
                <ul>
                    <li>
                        <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
                            Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/strategies" className={({ isActive }) => isActive ? "active" : ""}>
                            Strategies
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/statistics" className={({ isActive }) => isActive ? "active" : ""}>
                            Statistics
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/settings" className={({ isActive }) => isActive ? "active" : ""}>
                            Settings
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </header>
    )
}

export default Header 