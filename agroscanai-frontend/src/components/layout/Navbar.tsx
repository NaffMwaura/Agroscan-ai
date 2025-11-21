import React from 'react';
import { Link } from 'react-router-dom';
import type { NavbarProps } from '../../types';
import { IconLeaf, LogOut, Grid } from '../ui/Icons'; 

const Navbar: React.FC<NavbarProps> = ({ userToken, onLogout }) => {
    return (
        <nav className="bg-green-800 p-4 shadow-lg fixed top-0 left-0 right-0 z-20">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                
                {/* Link to Homepage (Route: /) */}
                <Link to="/" className="text-white text-2xl font-extrabold flex items-center space-x-2 cursor-pointer">
                    <IconLeaf className="text-amber-500 h-6 w-6" />
                    <span>AgroScan AI</span>
                </Link>

                <div className="flex items-center space-x-4">
                    {userToken ? (
                        // Display Dashboard and Logout buttons if authenticated
                        <>
                            {/* Link to Dashboard */}
                            <Link to="/dashboard" className="hidden sm:flex items-center space-x-2 px-4 py-2 text-white hover:bg-green-700 font-bold rounded-lg transition-colors duration-200">
                                <Grid className="h-5 w-5" />
                                <span>Dashboard</span>
                            </Link>
                            {/* Logout remains a button triggering function */}
                            <button onClick={onLogout} className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white hover:bg-red-600 font-bold rounded-lg shadow-md transition-colors duration-200">
                                <LogOut className="h-5 w-5" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </>
                    ) : (
                        // Display Login and Register links
                        <>
                            {/* FIX: Link to /login path */}
                            <Link to="/login" className="px-4 py-2 text-white font-bold rounded-lg transition-colors duration-200 hover:bg-green-700">
                                Login
                            </Link>
                            {/* FIX: Link to /register path */}
                            <Link to="/register" className="px-4 py-2 bg-amber-500 text-green-900 hover:bg-amber-400 font-bold rounded-lg shadow-md transition-colors duration-200">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};


export default Navbar;