import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';

// Import Types and Constants
import type { Page, AlertMessageProps } from './types'; 
// Import Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
// Import Pages
import LandingPage from './components/pages/LandingPage';
import AuthPage from './components/pages/AuthPage';
import DashboardPage from './components/pages/DashboardPage';
// --- NEW WIDGET IMPORT ---
import ChatWidget from './components/ui/ChatWidget';
// -------------------------

// --- CONFIGURATION: 5 Minutes Inactivity Timeout ---
const LOGIN_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
// ----------------------------------------

// --- MAIN ROUTER LOGIC ---
const MainAppLogic: React.FC = () => {
const navigate = useNavigate(); 
const location = useLocation();

    // ... (State Initialization and Handlers remain the same) ...
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

    // Handler to perform full logout cleanup
    const performLogoutCleanup = useCallback((message?: string) => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('login_time'); // Clear the timestamp

        setUserToken(null);
        setUserId(null);
        setUserEmail(null);
        
        navigate('/login'); 
        setGlobalMessage({ message: message || "You have been successfully logged out.", type: 'success' });
    }, [navigate]);


    // --- 1. SESSION VALIDITY CHECK (Initial load) ---
    useEffect(() => {
        const lastLoginTime = localStorage.getItem('login_time');
        
        if (userToken && lastLoginTime) {
            const timeElapsed = Date.now() - parseInt(lastLoginTime, 10);

            if (timeElapsed > LOGIN_TIMEOUT_MS) {
                // Session expired!
                performLogoutCleanup("Your session has expired due to inactivity. Please log in again.");
            }
        } else if (userToken && !lastLoginTime) {
            // Case where token exists but time doesn't (corrupted data)
            performLogoutCleanup("Session data corrupted. Please log in again.");
        }
    }, [userToken, performLogoutCleanup]);

    // --- 2. INACTIVITY TIMER CHECK (Continuous monitoring) ---
    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const resetTimer = () => {
            clearTimeout(timeout);
            // Reset the timer when there is activity
            timeout = setTimeout(() => {
                if (userToken) {
                    performLogoutCleanup("You were logged out after 5 minutes of inactivity.");
                }
            }, LOGIN_TIMEOUT_MS);
        };
        
        // Initial setup and reset on user interaction
        const events = ['mousemove', 'keypress', 'touchstart', 'scroll'];
        events.forEach(event => window.addEventListener(event, resetTimer));

        // Start the timer when component mounts/userToken is set
        if (userToken) {
            resetTimer();
        }

        return () => {
            clearTimeout(timeout);
            // Cleanup: remove event listeners when component unmounts
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [userToken, performLogoutCleanup]);


    // --- Handlers ---
    const handleLoginSuccess = useCallback((userIdArg: string, emailArg: string, tokenArg?: string) => {
        const currentTime = Date.now().toString();

        if (tokenArg) {
            localStorage.setItem('userToken', tokenArg);
            setUserToken(tokenArg);
        }
        localStorage.setItem('userId', userIdArg);
        localStorage.setItem('userEmail', emailArg);
        localStorage.setItem('login_time', currentTime); // Store current login time

        setUserId(userIdArg);
        setUserEmail(emailArg);
        navigate('/dashboard'); 
        setGlobalMessage({ message: `Login successful. Welcome back, user ${userIdArg}!`, type: 'success' });
    }, [navigate]);

    const handleLogout = useCallback(() => {
        performLogoutCleanup();
    }, [performLogoutCleanup]);

    const handlePageChange = useCallback((page: Page) => {
        if (page === 'landing') navigate('/');
        else if (page === 'auth') navigate('/login');
        else if (page === 'dashboard' && userId) navigate('/dashboard');
        else navigate('/login');
    }, [navigate, userId]);
    
    // Determine if the current user is logged in
    const isAuthenticated = useMemo(() => !!userToken && !!userId, [userToken, userId]);

    // --- AUTH PAGE VISIBILITY LOGIC ---
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    const shouldShowFooter = location.pathname === '/' && !isAuthPage;

    // Apply padding only if Navbar is visible and we are on Dashboard
    const isDashboardRoute = location.pathname === '/dashboard';
    const mainClasses = `flex-grow ${isDashboardRoute && !isAuthPage ? 'pt-24' : ''}`;

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            {/* Navbar is hidden on Auth Pages */}
            {!isAuthPage && <Navbar setCurrentPage={handlePageChange} userToken={userToken} onLogout={handleLogout} />} 
            
            <main className={mainClasses}> 
                <Routes>
                    {/* 1. Landing Page (Default Route) */}
                    <Route path="/" element={<LandingPage setCurrentPage={handlePageChange} diseaseCategories={diseaseCategories} message={globalMessage} setMessage={setGlobalMessage} />} />
                    
                    {/* 2. Authentication Pages (Login/Register) */}
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

            {/* Footer is hidden on Auth Pages and Dashboard */}
            {shouldShowFooter && <Footer setCurrentPage={handlePageChange} />}

            {/* --- GLOBAL CHAT WIDGET INTEGRATION --- */}
            {!isAuthPage && <ChatWidget userToken={userToken} userId={userId} />}
            {/* -------------------------------------- */}
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