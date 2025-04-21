import React from 'react'
import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.svg'
import '../styles/Header.css'

const Header: React.FC = () => {
    return (
        <header className="main-header">
            <div className="logo-container">
                <img src={logo} alt="BIST Trading Bot" className="logo" />
                <h1 className="site-title">BIST Trading Bot</h1>
            </div>

            <nav className="main-nav">
                <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
                    Dashboard
                </NavLink>
                <NavLink to="/trading" className={({ isActive }) => isActive ? 'active' : ''}>
                    Trading
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
                    Settings
                </NavLink>
            </nav>
        </header>
    )
}

export default Header 