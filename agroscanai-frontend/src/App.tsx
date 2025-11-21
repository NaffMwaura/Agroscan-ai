import React, { useState, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom'; // Added Navigate and useLocation

// Import Types and Constants
import type { Page, AlertMessageProps } from './types'; 
// Import Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
// Import Pages
import LandingPage from './components/pages/LandingPage';
import AuthPage from './components/pages/AuthPage';
import DashboardPage from './components/pages/DashboardPage';

// --- MAIN ROUTER LOGIC ---
const MainAppLogic: React.FC = () => {
    const navigate = useNavigate(); 
    const location = useLocation(); // To get current path for footer

    // --- State Initialization ---
    const initialToken = localStorage.getItem('userToken');
    const initialId = localStorage.getItem('userId');
    const initialEmail = localStorage.getItem('userEmail');

    const [userToken, setUserToken] = useState<string | null>(initialToken);
    const [userId, setUserId] = useState<string | null>(initialId);
    const [userEmail, setUserEmail] = useState<string | null>(initialEmail);
    const [globalMessage, setGlobalMessage] = useState<AlertMessageProps>({ message: null, type: null });

    const diseaseCategories = [
        "Algal Leaf", "Anthracnose", "Bird Eye Spot",
        "Brown Blight", "Gray Light", "Red Leaf Spot",
        "White Spot", "Healthy", "Other Non-Tea Leaf"
    ];

    // --- Handlers ---
    const handleLoginSuccess = useCallback((userIdArg: string, emailArg: string, tokenArg?: string) => {
        if (tokenArg) {
            localStorage.setItem('userToken', tokenArg);
            setUserToken(tokenArg);
        }
        localStorage.setItem('userId', userIdArg);
        localStorage.setItem('userEmail', emailArg);
        setUserId(userIdArg);
        setUserEmail(emailArg);
        navigate('/dashboard'); 
        setGlobalMessage({ message: `Login successful. Welcome back, user ${userIdArg}!`, type: 'success' });
    }, [navigate]);

    const handleLogout = useCallback(() => {
        // NOTE: Add call to backend /logout endpoint if required
        
        localStorage.removeItem('userToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        setUserToken(null);
        setUserId(null);
        setUserEmail(null);
        navigate('/login'); // Redirect to login page on logout
        setGlobalMessage({ message: "You have been successfully logged out.", type: 'success' });
    }, [navigate]);

    /**
     * Helper to change page via Navbar/Footer links.
     * This function is now mostly redundant but kept for legacy component compatibility.
     * In the Navbar, Link components should use 'to="/path"' directly.
     */
    const handlePageChange = useCallback((page: Page) => {
        if (page === 'landing') navigate('/');
        else if (page === 'auth') navigate('/login');
        else if (page === 'dashboard' && userId) navigate('/dashboard');
        else navigate('/login');
    }, [navigate, userId]);
    
    // Determine if the current user is logged in
    const isAuthenticated = useMemo(() => !!userToken && !!userId, [userToken, userId]);


    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            {/* The Navbar will now contain <Link> components pointing to the correct paths */}
            <Navbar setCurrentPage={handlePageChange} userToken={userToken} onLogout={handleLogout} />
            <main className="flex-grow"> 
                
                <Routes>
                    {/* 1. Landing Page (Default Route) */}
                    <Route path="/" element={<LandingPage setCurrentPage={handlePageChange} diseaseCategories={diseaseCategories} message={globalMessage} setMessage={setGlobalMessage} />} />
                    
                    {/* 2. Authentication Pages (Login/Register) */}
                    {/* If authenticated, redirect them away from the auth pages */}
                    <Route path="/login" element={isAuthenticated ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <AuthPage onLoginSuccess={handleLoginSuccess} />
                    )} />
                    <Route path="/register" element={isAuthenticated ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <AuthPage onLoginSuccess={handleLoginSuccess} />
                    )} />

                    {/* 3. Protected Dashboard Route */}
                    <Route 
                        path="/dashboard" 
                        element={isAuthenticated ? (
                            <DashboardPage userToken={userToken} userId={userId} userEmail={userEmail || ''} onLogout={handleLogout} />
                        ) : (
                            <Navigate to="/login" replace /> // Redirect unauthenticated users to /login
                        )}
                    />

                    {/* 4. Fallback for 404 (Redirect to landing) */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            {/* Display Footer only on the Landing Page */}
            {location.pathname === '/' && <Footer setCurrentPage={handlePageChange} />}
        </div>
    );
};

// --- WRAPPER COMPONENT ---
// This wrapper is essential to use the routing hooks like useNavigate and Routes
const App: React.FC = () => (
    <BrowserRouter>
        <MainAppLogic />
    </BrowserRouter>
);

export default App;