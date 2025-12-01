import React, { useState, useCallback, useEffect } from 'react'; 
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2} from 'lucide-react'; // Ensure Bot is imported if needed for mobile
import type { AuthPageProps } from '../../types';
import {API_BASE_URL} from '../../types';
import AlertMessage from '../ui/Alertmessage';
import InputField from '../ui/InputField';
import { IconLeaf } from '../ui/Icons'; 

// Define a type for the structured FastAPI validation error item (for cleaner TS)
type FastAPIValidationError = {
    loc?: (string | number)[]; 
    msg: string;              
    type: string;             
};

// --- Helper Function: Format API Errors (omitted for brevity) ---
const formatError = (data: unknown, defaultMessage: string): string => {
    if (!data) return defaultMessage;
    
    if (typeof data === 'object' && data !== null) {
        const d = data as { detail?: unknown; error?: string; message?: string };
        
        if (Array.isArray(d.detail)) {
            const details = d.detail as FastAPIValidationError[]; 
            
            return details
                .map((item: FastAPIValidationError) => {
                    const fieldName = item.loc?.slice(-1).join('') || 'field';
                    return `${fieldName}: ${item.msg}`;
                })
                .join('; ');
        }
        
        if (typeof d.detail === 'string') return d.detail;
        if (d.error) return d.error;
        if (d.message) return d.message;
    }
    
    return defaultMessage;
};
// ---------------------------------------------------------------------

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
    const location = useLocation(); 
    const navigate = useNavigate();

    // --- State ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [view, setView] = useState<'register' | 'login'>(location.pathname === '/register' ? 'register' : 'login');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // --- EFFECT: Update view state when URL path changes ---
    useEffect(() => {
        if (location.pathname === '/register') {
            setView('register');
        } else {
            setView('login');
        }
        setMessage(null); 
    }, [location.pathname]); 

    // --- Handlers (omitted for brevity) ---
    const handleLogin = useCallback(async () => {
        setMessage(null); setIsLoading(true); 
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json().catch(() => null);
            if (response.ok && data) {
                onLoginSuccess(data.user_id?.toString() || '0', data.email || email, data.token);
            } else {
                setMessage({ text: formatError(data, "Login failed. Check your credentials."), type: 'error' });
            }
        } catch (err) {
            console.error("API Connection Error:", err);
            setMessage({ text: "Could not connect to the backend API. Ensure the server is running.", type: 'error' });
        } finally { setIsLoading(false); }
    }, [email, password, onLoginSuccess]); 

    const handleRegister = useCallback(async () => {
        setMessage(null);
        if (password !== confirmPassword) { setMessage({ text: "Passwords do not match.", type: 'error' }); return; }
        if (password.length < 6) { setMessage({ text: "Password must be at least 6 characters long.", type: 'error' }); return; }
        setIsLoading(true); 
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }), 
            });
            const data = await response.json().catch(() => null);
            if (response.ok && data) {
                setMessage({ text: `Registration successful. Please sign in.`, type: 'success' });
                setEmail(''); setPassword(''); setConfirmPassword(''); navigate('/login'); 
            } else {
                setMessage({ text: formatError(data, "Registration failed. Please try again."), type: 'error' }); 
            }
        } catch (err) {
            console.error("API Connection Error:", err);
            setMessage({ text: "Could not connect to the backend API. Ensure the server is running.", type: 'error' });
        } finally { setIsLoading(false); }
    }, [email, password, confirmPassword, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (view === 'register') handleRegister(); else handleLogin();
    };

    const FormContent = (
        <>
            <header className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    {view === 'register' ? 'Create AgroScan AI Account' : 'Welcome Back'}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    {view === 'register' ? 'Start analyzing your crop health.' : 'Sign in to your account.'}
                </p>
            </header>

            <AlertMessage message={message ? message.text : null} type={message ? message.type : null} />

            <form onSubmit={handleSubmit}>
                <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">Email</label>
                <InputField icon={Mail} placeholder="Enter your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                
                <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">Password</label>
                <InputField icon={Lock} placeholder="Enter your password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                
                {view === 'register' && (
                    <>
                        <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">Confirm Password</label>
                        <InputField icon={Lock} placeholder="Confirm your password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </>
                )}
                
                <button type="submit" disabled={isLoading} className={`w-full py-3 mt-8 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg ${isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800 active:bg-green-900'}`}>
                    {isLoading ? (<div className="flex items-center justify-center"><Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />Processing...</div>) : (view === 'register' ? 'Register Account' : 'Sign In')}
                </button>
            </form>

            <footer className="mt-6 text-center text-sm">
                {view === 'register' ? (
                    <p className="text-gray-600">Already have an account? <Link to="/login" className="text-green-700 font-medium hover:text-green-800 transition">Sign In</Link></p>
                ) : (
                    <p className="text-gray-600">Don't have an account? <Link to="/register" className="text-green-700 font-medium hover:text-green-800 transition">Create Account</Link></p>
                )}
            </footer>
        </>
    );

    return (
        // Outermost container - ensures vertical centering for mobile/tablet screens
        <div className="min-h-screen bg-gray-50 flex items-center justify-center font-inter">
            
            {/* 1. DESKTOP/LARGE SCREEN SPLIT VIEW (lg:flex) */}
            <div className="hidden lg:flex w-screen h-screen overflow-hidden">
                
                {/* Left Panel (Branding) - Full Height */}
                <div className="w-1/2 h-full p-12 flex flex-col items-center justify-center text-white bg-gradient-to-br from-green-800 to-green-950">
                    
                    <div className="max-w-md mx-auto text-center">
                        <IconLeaf className="w-16 h-16 mx-auto mb-6 text-amber-400 floating-icon" /> 
                        
                        <h1 className="text-4xl font-extrabold mb-4 leading-tight">
                            {view === 'register' ? 'Join AgroScan AI' : 'Welcome to AgroScan AI'}
                        </h1>
                        <p className="text-lg text-green-200 mb-8">
                            Precision diagnosis for tea crops. Get instant health analysis and treatment recommendations from our deep learning models.
                        </p>
                        
                        <pre className="mt-8 p-4 bg-green-700/50 text-xs rounded-lg font-mono border border-green-600 shadow-md">
                            <span className="text-amber-300">const</span>{' '}
                            <span className="text-red-300">innovation</span> = <span className="text-yellow-300">'limitless'</span>;
                            <br />
                            <span className="text-red-300">if</span> (crop.<span className="text-cyan-300">disease</span>) {'{'}
                            <br />
                            {'  '}
                            <span className="text-yellow-300">analyze</span>();
                            <br />
                            {'  '}
                            <span className="text-yellow-300">recommendTreatment</span>();
                            <br />
                            {'}'}
                        </pre>
                    </div>
                </div>

                {/* Right Panel (Form) - Full Height, Vertically Centered */}
                <div className="w-1/2 h-full bg-white p-12 flex items-center justify-center">
                    
                    <div className="w-full max-w-sm">
                        {FormContent}
                    </div>
                </div>
            </div> 
            
            {/* 2. MOBILE/TABLET FALLBACK (lg:hidden) */}
            {/* FIX: Ensure mobile form is centered and has good vertical spacing */}
            <div className="lg:hidden bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-4 border-green-600 mx-auto my-12">
                {/* Use 'my-12' (margin-y) instead of hardcoded mt-24 mb-8 to ensure vertical padding 
                    and better responsiveness if the screen height is short. */}
                {FormContent}
            </div>
        </div>
    );
};

export default AuthPage;