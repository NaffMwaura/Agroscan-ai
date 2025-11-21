// src/components/pages/AuthPage.tsx
import React, { useState, useCallback } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react'; 
import type { AuthPageProps } from '../../types';
import AlertMessage from '../ui/Alertmessage';
import InputField from '../ui/InputField';
import { IconLeaf } from '../ui/Icons'; // Import the Leaf icon for branding
// ... (Helper functions remain the same) ...

const formatError = (data: unknown, defaultMessage: string): string => {
    // ... (formatError logic remains the same) ...
    // ... (logic omitted for brevity) ...
    return defaultMessage;
};

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
    // ... (state and handlers remain the same) ...
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [view, setView] = useState<'register' | 'login'>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleLogin = useCallback(async () => {
        // ... (login logic) ...
    }, [email, password, onLoginSuccess]);
    
    const handleRegister = useCallback(async () => {
        // ... (register logic) ...
    }, [email, password, confirmPassword]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (view === 'register') handleRegister(); else handleLogin();
    };

    return (
        // 1. OUTER WRAPPER: Full Screen, but now using flex to center the content
        <div className="min-h-screen bg-gray-50 flex items-center justify-center font-inter">
            
            {/* 2. SPLIT CONTAINER: Full Width/Height (w-screen h-screen) */}
            {/* Removed the extra inner div that was causing layout issues */}
            <div className="hidden lg:flex w-screen h-screen overflow-hidden">
                
                {/* 3. Left Panel (Branding) - Full Height/Width, uses flex to center content */}
                {/* Changed justify-center to justify-start here for clean content look */}
                <div className="w-1/2 h-full p-12 flex flex-col items-center justify-center text-white bg-gradient-to-br from-green-800 to-green-950">
                    
                    {/* Inner Content Wrapper to define center and max-width for the text */}
                    <div className="max-w-md mx-auto text-center">
                        {/* Point 4: Added floating-icon class for motion */}
                        <IconLeaf className="w-16 h-16 mx-auto mb-6 text-amber-400 floating-icon" /> 
                        
                        <h1 className="text-4xl font-extrabold mb-4 leading-tight">
                            {view === 'register' ? 'Join AgroScan AI' : 'Welcome to AgroScan AI'}
                        </h1>
                        <p className="text-lg text-green-200 mb-8">
                            Precision diagnosis for tea crops. Get instant health analysis and treatment recommendations from our deep learning models.
                        </p>
                        
                        {/* Code snippet / styling element */}
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

                {/* 4. Right Panel (Form) - Full Height/Width, uses flex to center content */}
                <div className="w-1/2 h-full bg-white p-12 flex items-center justify-center">
                    
                    {/* Inner Form Wrapper: Point 1 & 5: Reduced max-width and centered the content */}
                    <div className="w-full max-w-sm">
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
                            {/* Point 2: Added explicit labels outside the InputField */}
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
                            
                            {/* Point 5: Styled Sign In Button */}
                            <button type="submit" disabled={isLoading} className={`w-full py-3 mt-8 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg ${isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800 active:bg-green-900'}`}>
                                {isLoading ? (<div className="flex items-center justify-center"><Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />Processing...</div>) : (view === 'register' ? 'Register Account' : 'Sign In')}
                            </button>
                        </form>

                        <footer className="mt-6 text-center text-sm">
                            {view === 'register' ? (
                                <p className="text-gray-600">Already have an account? <button onClick={() => { setView('login'); setMessage(null); }} className="text-green-700 font-medium hover:text-green-800 transition">Sign In</button></p>
                            ) : (
                                <p className="text-gray-600">Don't have an account? <button onClick={() => { setView('register'); setMessage(null); }} className="text-green-700 font-medium hover:text-green-800 transition">Create Account</button></p>
                            )}
                        </footer>
                    </div> {/* End inner form wrapper */}
                </div> {/* End Right Panel */}
            </div> {/* End Split Container */}
            
            {/* Fallback for small screens (Mobile/Tablet) - Kept original styles for mobile */}
            <div className="lg:hidden bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-4 border-green-600 mx-auto mt-16 mb-8">
                {/* ... (mobile form content remains here) ... */}
            </div>
        </div>
    );
};

export default AuthPage;