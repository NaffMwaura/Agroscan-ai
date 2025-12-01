import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import type { NavbarProps } from '../../types'; 
import { IconLeaf, LogOut, Grid } from '../ui/Icons';

const Navbar: React.FC<NavbarProps> = ({ userToken, onLogout }) => {
    const navigate = useNavigate();

    const handleDelayedNavigation = useCallback((e: React.MouseEvent, path: string) => {
        e.preventDefault(); 
        
        const target = e.currentTarget;
        
        target.classList.add('bg-green-700', 'cursor-wait');

        setTimeout(() => {
            target.classList.remove('bg-green-700', 'cursor-wait'); 
            
            // Navigate after delay
            navigate(path);
        }, 500); // 500ms delay

    }, [navigate]);
    
    // Helper function to handle internal anchor links
    const scrollToSection = useCallback((e: React.MouseEvent, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    
    return (
        <nav className="bg-green-800 py-5 px-5 shadow-lg fixed top-0 left-0 right-0 z-20">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                
                {/* 1. Logo and App Name (Left) */}
                <Link to="/" className="text-white text-4xl font-extrabold flex items-center space-x-5 cursor-pointer">
                    <IconLeaf className="text-amber-500 h-8 w-10" />
                    <span>AgroScan AI</span>
                </Link>

                {/* 2. Central Navigation Links (Anchor Links) */}
                <div className="hidden md:flex items-center space-x-16 mx-auto absolute left-1/2 transform -translate-x-1/2">
                    
                    <Link 
                        to="/#how-it-works" 
                        onClick={(e) => scrollToSection(e, 'how-it-works')} 
                        className="text-white text-base py-2 hover:text-amber-300 transition-colors"
                    >
                        How It Works
                    </Link>
                    
                    <Link 
                        to="/#features" 
                        onClick={(e) => scrollToSection(e, 'features')}
                        className="text-white text-base py-2 hover:text-amber-300 transition-colors"
                    >
                        Features
                    </Link>
                    
                    <Link 
                        to="/#why-us" 
                        onClick={(e) => scrollToSection(e, 'why-us')}
                        className="text-white text-base py-2 hover:text-amber-300 transition-colors"
                    >
                        Why Choose Us
                    </Link>
                    
                    <Link 
                        to="/#contact" 
                        onClick={(e) => scrollToSection(e, 'contact')}
                        className="text-white text-base py-2 hover:text-amber-300 transition-colors"
                    >
                        Contact
                    </Link>
                </div>

                {/* 3. Auth Buttons (Right) */}
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
                        // Display Login and Register links (using manual delay logic)
                        <>
                            {/* Login Button with delay */}
                            <Link 
                                to="/login" 
                                onClick={(e) => handleDelayedNavigation(e, '/login')}
                                className="px-4 py-2 text-white font-bold rounded-lg transition-colors duration-200 hover:bg-green-700"
                            >
                                Login
                            </Link>
                            {/* Register Button with delay */}
                            <Link 
                                to="/register" 
                                onClick={(e) => handleDelayedNavigation(e, '/register')}
                                className="px-4 py-2 bg-amber-500 text-green-900 hover:bg-amber-400 font-bold rounded-lg shadow-md transition-colors duration-200"
                            >
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