// src/App.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'; // <-- NEW IMPORTS

// Import Types and Constants
import type { Page, AlertMessageProps } from './types'; 
// Import Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
// Import Pages
import LandingPage from './components/pages/LandingPage';
import AuthPage from './components/pages/AuthPage';
import DashboardPage from './components/pages/DashboardPage';

// --- MAIN ROUTER LOGIC (New component to handle routing) ---
const MainAppLogic: React.FC = () => {
    // useNavigate hook replaces setCurrentPage for navigation
    const navigate = useNavigate(); 
    
    // --- State Initialization (same as before) ---
    const initialToken = localStorage.getItem('userToken');
    const initialId = localStorage.getItem('userId');
    const initialEmail = localStorage.getItem('userEmail');

    // Use useMemo to determine the starting state/page based on the current URL
    const [userToken, setUserToken] = useState<string | null>(initialToken);
    const [userId, setUserId] = useState<string | null>(initialId);
    const [userEmail, setUserEmail] = useState<string | null>(initialEmail);
    const [globalMessage, setGlobalMessage] = useState<AlertMessageProps>({ message: null, type: null });

    const diseaseCategories = [
        "Algal Leaf", "Anthracnose", "Bird Eye Spot",
        "Brown Blight", "Gray Light", "Red Leaf Spot",
        "White Spot", "Healthy", "Other Non-Tea Leaf"
    ];

    // --- Handlers now use useNavigate ---
    const handleLoginSuccess = useCallback((userIdArg: string, emailArg: string, tokenArg?: string) => {
        if (tokenArg) {
            localStorage.setItem('userToken', tokenArg);
            setUserToken(tokenArg);
        }
        localStorage.setItem('userId', userIdArg);
        localStorage.setItem('userEmail', emailArg);
        setUserId(userIdArg);
        setUserEmail(emailArg);
        navigate('/dashboard'); // <-- Navigate to the URL
        setGlobalMessage({ message: `Login successful. Welcome back, user ${userIdArg}!`, type: 'success' });
    }, [navigate]);

    const handleLogout = useCallback(() => {
        // ... (API call if needed)
        
        localStorage.removeItem('userToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        setUserToken(null);
        setUserId(null);
        setUserEmail(null);
        navigate('/'); // <-- Navigate back to the homepage
        setGlobalMessage({ message: "You have been successfully logged out.", type: 'success' });
    }, [navigate]);

    // Helper to change page via Navbar/Footer links
    const handlePageChange = useCallback((page: Page) => {
        if (page === 'landing') navigate('/');
        else if (page === 'auth') navigate('/login');
        else if (page === 'dashboard' && userId) navigate('/dashboard');
        else navigate('/');
    }, [navigate, userId]);
    
    // Determine if the current user is logged in
    const isAuthenticated = useMemo(() => !!userToken && !!userId, [userToken, userId]);


    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <Navbar setCurrentPage={handlePageChange} userToken={userToken} onLogout={handleLogout} />
            <main className="flex-grow">
                {/* 3. Define the routes */}
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage setCurrentPage={handlePageChange} diseaseCategories={diseaseCategories} message={globalMessage} setMessage={setGlobalMessage} />} />
                    
                    {/* Auth Routes */}
                    <Route path="/login" element={<AuthPage onLoginSuccess={handleLoginSuccess} />} />
                    <Route path="/register" element={<AuthPage onLoginSuccess={handleLoginSuccess} />} />

                    {/* Protected Dashboard Route */}
                    <Route 
                        path="/dashboard" 
                        element={isAuthenticated && userId ? (
                            <DashboardPage userToken={userToken} userId={userId} userEmail={userEmail || ''} onLogout={handleLogout} />
                        ) : (
                            <AuthPage onLoginSuccess={handleLoginSuccess} /> // Redirect to login if not authenticated
                        )}
                    />

                    {/* Fallback for 404 - redirects to landing */}
                    <Route path="*" element={<LandingPage setCurrentPage={handlePageChange} diseaseCategories={diseaseCategories} message={globalMessage} setMessage={setGlobalMessage} />} />
                </Routes>
            </main>
            {/* Display Footer only on landing page or define conditional logic based on path */}
            {window.location.pathname === '/' && <Footer setCurrentPage={handlePageChange} />}
        </div>
    );
};

// --- WRAPPER COMPONENT ---
const App: React.FC = () => (
    <BrowserRouter>
        <MainAppLogic />
    </BrowserRouter>
);

export default App;