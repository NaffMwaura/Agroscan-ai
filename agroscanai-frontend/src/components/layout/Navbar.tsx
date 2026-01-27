import React, { useCallback, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Grid, Leaf, ChevronRight } from 'lucide-react';
import type { NavbarProps } from '../../types'; 

/**
 * AGROSCAN AI - LANDING NAVBAR
 * * Feature: Mobile responsive menu with overlay.
 * * Navigation: Includes smooth scrolling for anchor links.
 * * Visibility: Automatically hides when on the /dashboard route.
 */

const Navbar: React.FC<NavbarProps> = ({ userToken, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation(); // Hook to track current path
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleDelayedNavigation = useCallback((e: React.MouseEvent, path: string) => {
        e.preventDefault(); 
        setIsMenuOpen(false); // Close menu on navigation
        
        const target = e.currentTarget as HTMLElement;
        target.classList.add('bg-green-700', 'cursor-wait');

        setTimeout(() => {
            target.classList.remove('bg-green-700', 'cursor-wait'); 
            navigate(path);
        }, 500); 
    }, [navigate]);
    
    const scrollToSection = useCallback((e: React.MouseEvent, id: string) => {
        e.preventDefault();
        setIsMenuOpen(false); // Close menu on scroll
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    // Hooks must be called before this conditional return
    // If the user is on the dashboard, we hide this navbar as the 
    // DashboardPage has its own internal navigation.
    if (location.pathname === '/dashboard') {
        return null;
    }

    const navLinks = [
        { name: 'How It Works', id: 'how-it-works' },
        { name: 'Features', id: 'features' },
        { name: 'Why Choose Us', id: 'why-us' },
        { name: 'Contact', id: 'contact' },
    ];

    return (
        <nav className="bg-green-800 py-4 px-5 shadow-lg fixed top-0 left-0 right-0 z-[100]">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                
                {/* 1. Logo and App Name */}
                <Link to="/" className="text-white text-2xl md:text-3xl font-extrabold flex items-center space-x-3 md:space-x-4 cursor-pointer z-50">
                    <Leaf className="text-amber-500 h-6 w-8 md:h-7 md:w-9" />
                    <span className="tracking-tight">AgroScan <span className="text-amber-400">AI</span></span>
                </Link>

                {/* 2. Desktop Navigation Links (Centered) */}
                <div className="hidden md:flex items-center space-x-8 lg:space-x-12 absolute left-1/2 transform -translate-x-1/2">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.id}
                            to={`/#${link.id}`} 
                            onClick={(e) => scrollToSection(e, link.id)} 
                            className="text-white/90 text-sm font-semibold hover:text-amber-300 transition-colors uppercase tracking-wider"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* 3. Auth Buttons & Mobile Toggle */}
                <div className="flex items-center space-x-3 md:space-x-4 z-50">
                    {userToken ? (
                        <div className="flex items-center space-x-2">
                            <Link to="/dashboard" className="hidden sm:flex items-center space-x-2 px-4 py-2 text-white hover:bg-green-700 font-bold rounded-lg transition-all">
                                <Grid className="h-5 w-5" />
                                <span>Dashboard</span>
                            </Link>
                            <button onClick={onLogout} className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white hover:bg-red-600 font-bold rounded-lg shadow-md transition-all">
                                <LogOut className="h-4 w-4 md:h-5 md:w-5" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="hidden sm:flex items-center space-x-2">
                            <Link 
                                to="/login" 
                                onClick={(e) => handleDelayedNavigation(e, '/login')}
                                className="px-4 py-2 text-white font-bold rounded-lg hover:bg-green-700 transition-all"
                            >
                                Login
                            </Link>
                            <Link 
                                to="/register" 
                                onClick={(e) => handleDelayedNavigation(e, '/register')}
                                className="px-4 py-2 bg-amber-500 text-green-900 hover:bg-amber-400 font-bold rounded-lg shadow-md transition-all text-sm"
                            >
                                Register
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle Button */}
                    <button 
                        onClick={toggleMenu}
                        className="md:hidden p-2 text-white hover:bg-green-700 rounded-lg transition-colors border border-white/20"
                        aria-label="Toggle Menu"
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay / Sidebar */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 top-16 bg-green-900 z-40 animate-in fade-in slide-in-from-top-5 duration-300">
                    <div className="flex flex-col p-6 space-y-4">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.id}
                                to={`/#${link.id}`} 
                                onClick={(e) => scrollToSection(e, link.id)} 
                                className="text-white text-xl font-bold flex justify-between items-center p-4 hover:bg-green-800 rounded-xl transition-colors border-b border-green-700/50"
                            >
                                <span>{link.name}</span>
                                <ChevronRight className="h-5 w-5 text-amber-500" />
                            </Link>
                        ))}
                        
                        <div className="pt-6 mt-4 flex flex-col space-y-3">
                            {!userToken ? (
                                <>
                                    <Link 
                                        to="/login" 
                                        onClick={(e) => handleDelayedNavigation(e, '/login')}
                                        className="w-full py-4 text-center text-white font-bold rounded-xl border border-white/20 hover:bg-green-800"
                                    >
                                        Login
                                    </Link>
                                    <Link 
                                        to="/register" 
                                        onClick={(e) => handleDelayedNavigation(e, '/register')}
                                        className="w-full py-4 text-center bg-amber-500 text-green-900 font-bold rounded-xl shadow-lg"
                                    >
                                        Create Account
                                    </Link>
                                </>
                            ) : (
                                <Link 
                                    to="/dashboard" 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full py-4 text-center bg-green-700 text-white font-bold rounded-xl flex items-center justify-center space-x-2"
                                >
                                    <Grid className="h-5 w-5" />
                                    <span>Go to Dashboard</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;