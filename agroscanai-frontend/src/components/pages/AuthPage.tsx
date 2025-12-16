import React, { useState,  useEffect } from 'react'; 
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react'; 
import type { AuthPageProps } from '../../types';
import { API_BASE_URL } from '../../types';
import AlertMessage from '../ui/Alertmessage';
import InputField from '../ui/InputField';
import { IconLeaf } from '../ui/Icons'; 

type FastAPIValidationError = {
    loc?: (string | number)[]; 
    msg: string;              
    type: string;             
};

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
        <div className="relative min-h-screen w-full flex items-center justify-center bg-[#05080d] overflow-hidden font-inter">
            {/* Soft Ambient Background Orbs */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-green-500/10 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Reference Image Style: Glass card with Golden Halo */}
                <div className="relative bg-[#0a0f1a]/80 backdrop-blur-2xl rounded-[2rem] p-8 shadow-[0_0_80px_-20px_rgba(251,191,36,0.2)] border border-white/10 overflow-hidden">
                    
                    {/* The Golden Border Light (Pseudo-Reflector) */}
                    <div className="absolute inset-0 border border-amber-400/20 rounded-[2rem] pointer-events-none"></div>
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-400/5 blur-3xl rounded-full"></div>

                    <div className="relative z-20">
                        <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-gray-500 hover:text-amber-400 transition-colors mb-10 group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-widest">Return</span>
                        </button>

                        <header className="text-center mb-8">
                            <div className="inline-flex p-4 bg-amber-400/10 rounded-2xl mb-4 border border-amber-400/20 shadow-inner">
                                <IconLeaf className="w-8 h-8 text-amber-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                {view === 'register' ? 'Create Account' : 'Welcome Back'}
                            </h1>
                            <p className="text-gray-400 text-sm mt-2">Precision analysis at your fingertips</p>
                        </header>

                        <AlertMessage message={message ? message.text : null} type={message ? message.type : null} />

                        <form onSubmit={(e) => { e.preventDefault(); handleAction(); }} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-amber-400/60 uppercase tracking-widest ml-1">Email</label>
                                <InputField 
                                    icon={Mail} 
                                    placeholder="farmer@agroscan.ai" 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-700 focus:border-amber-500/50"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-amber-400/60 uppercase tracking-widest ml-1">Password</label>
                                <InputField 
                                    icon={Lock} 
                                    placeholder="••••••••" 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-700 focus:border-amber-500/50"
                                />
                            </div>
                            
                            {view === 'register' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-amber-400/60 uppercase tracking-widest ml-1">Confirm</label>
                                    <InputField 
                                        icon={Lock} 
                                        placeholder="••••••••" 
                                        type="password" 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-700 focus:border-amber-500/50"
                                    />
                                </div>
                            )}
                            
                            <button 
                                type="submit" 
                                disabled={isLoading} 
                                className="w-full py-4 mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-2xl transition-all shadow-[0_20px_40px_-15px_rgba(251,191,36,0.3)] active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="animate-spin mx-auto h-5 w-5" /> : (view === 'register' ? 'Register' : 'Sign In')}
                            </button>
                        </form>

                        <footer className="mt-8 text-center">
                            <Link to={view === 'register' ? "/login" : "/register"} className="text-gray-500 text-sm hover:text-white transition-colors">
                                {view === 'register' ? 'Already have an account? ' : "Don't have an account? "}
                                <span className="text-amber-400 font-bold underline underline-offset-4 decoration-amber-400/20">
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