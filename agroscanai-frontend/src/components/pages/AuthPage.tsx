import React, { useState, useEffect } from 'react'; 
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowLeft, Leaf, CheckCircle, AlertCircle } from 'lucide-react'; 

/**
 * AGROSCAN AI - AUTHENTICATION PAGE
 * Refined with Dashboard-consistent light theme color shades.
 * Features: Self-contained logic, unified green/amber palette, and responsive design.
 */

// --- Types ---

interface AuthPageProps {
    onLoginSuccess: (userId: string, email: string, token: string) => void;
}

type FastAPIValidationError = {
    loc?: (string | number)[]; 
    msg: string;              
    type: string;             
};

// --- Configuration ---

const API_BASE_URL = 'https://agroscan-ai-qmrt.onrender.com'; // Replace with actual API URL

// --- Sub-Components (Self-Contained) ---

const IconLeaf = ({ className }: { className?: string }) => (
    <Leaf className={className} />
);

const AlertMessage: React.FC<{ message: string | null; type: 'success' | 'error' | null }> = ({ message, type }) => {
    if (!message) return null;
    const isError = type === 'error';
    return (
        <div className={`flex items-center p-4 mb-6 rounded-2xl border animate-in fade-in slide-in-from-top-2 ${
            isError ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'
        }`}>
            {isError ? <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
            <p className="text-sm font-semibold">{message}</p>
        </div>
    );
};

const InputField: React.FC<{
    icon: React.ElementType;
    placeholder: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}> = ({ icon: Icon, placeholder, type, value, onChange, className }) => (
    <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors">
            <Icon size={18} />
        </div>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-green-600/50 focus:bg-white outline-none transition-all rounded-2xl ${className}`}
        />
    </div>
);

// --- Error Formatting Logic ---

const formatError = (data: unknown, defaultMessage: string): string => {
    if (!data) return defaultMessage;
    if (typeof data === 'object' && data !== null) {
        const d = data as { detail?: unknown; error?: string; message?: string };
        if (Array.isArray(d.detail)) {
            const details = d.detail as FastAPIValidationError[]; 
            return details.map((item: FastAPIValidationError) => {
                const fieldName = item.loc?.slice(-1).join('') || 'field';
                return `${fieldName}: ${item.msg}`;
            }).join('; ');
        }
        if (typeof d.detail === 'string') return d.detail;
        if (d.error) return d.error;
        if (d.message) return d.message;
    }
    return defaultMessage;
};

// --- Main AuthPage Component ---

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
    const location = useLocation(); 
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [view, setView] = useState<'register' | 'login'>(location.pathname === '/register' ? 'register' : 'login');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        setView(location.pathname === '/register' ? 'register' : 'login');
        setMessage(null); 
    }, [location.pathname]); 

    const handleAction = async () => {
        setMessage(null);
        if (view === 'register' && password !== confirmPassword) {
            setMessage({ text: "Passwords do not match.", type: 'error' });
            return;
        }
        setIsLoading(true);
        try {
            const endpoint = view === 'register' ? '/register' : '/login';
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json().catch(() => null);
            if (response.ok && data) {
                if (view === 'login') {
                    onLoginSuccess(data.user_id?.toString() || '0', data.email || email, data.token);
                } else {
                    setMessage({ text: "Registration successful! Please sign in.", type: 'success' });
                    navigate('/login');
                }
            } else {
                setMessage({ text: formatError(data, `${view} failed.`), type: 'error' });
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setMessage({ text: "Connection error. Is the server running?", type: 'error' });
        } finally { setIsLoading(false); }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-[#f8fafc] overflow-hidden font-sans">
            {/* Ambient Background Accents (Dashboard style) */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-green-200/20 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-200/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Auth Card: Matching Dashboard Elevation and Radii */}
                <div className="relative bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-green-900/5 border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                    
                    {/* Subtle Top Accent */}
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-green-600 to-amber-500 pointer-events-none"></div>

                    <div className="relative z-20">
                        <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-gray-400 hover:text-green-600 transition-colors mb-10 group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-widest">Return Home</span>
                        </button>

                        <header className="text-center mb-8">
                            <div className="inline-flex p-4 bg-green-100 rounded-[1.5rem] mb-4 border border-green-200 shadow-sm">
                                <IconLeaf className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                {view === 'register' ? 'Join Agroscan AI' : 'Welcome Back'}
                            </h1>
                            <p className="text-gray-500 text-sm mt-2 font-medium">Precision agricultural analysis</p>
                        </header>

                        <AlertMessage message={message ? message.text : null} type={message ? message.type : null} />

                        <form onSubmit={(e) => { e.preventDefault(); handleAction(); }} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <InputField 
                                    icon={Mail} 
                                    placeholder="farmer@agroscan.ai" 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                                <InputField 
                                    icon={Lock} 
                                    placeholder="••••••••" 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            
                            {view === 'register' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Identity</label>
                                    <InputField 
                                        icon={Lock} 
                                        placeholder="••••••••" 
                                        type="password" 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            )}
                            
                            <button 
                                type="submit" 
                                disabled={isLoading} 
                                className="w-full py-4 mt-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-100 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin h-5 w-5 text-white" />
                                ) : (
                                    <span>{view === 'register' ? 'Register Account' : 'Sign In'}</span>
                                )}
                            </button>
                        </form>

                        <footer className="mt-8 text-center border-t border-gray-50 pt-8">
                            <Link 
                                to={view === 'register' ? "/login" : "/register"} 
                                className="text-gray-500 text-sm font-medium hover:text-green-600 transition-colors"
                            >
                                {view === 'register' ? 'Already have an account? ' : "New to Agroscan? "}
                                <span className="text-green-600 font-bold hover:underline underline-offset-4 decoration-green-600/20">
                                    {view === 'register' ? 'Sign In' : 'Join Now'}
                                </span>
                            </Link>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;