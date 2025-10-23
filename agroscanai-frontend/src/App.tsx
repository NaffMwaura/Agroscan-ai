// ...existing code...
import React, { useState, useCallback, useEffect } from 'react';
import { Mail, Lock, Zap, LogOut, Upload, Loader2, CheckCircle, XCircle, Grid } from 'lucide-react';

// NOTE: Match your backend base URL (remove /api/v1 unless your backend uses that prefix)
const API_BASE_URL = 'http://127.0.0.1:8000';

// --- 1. ICON SVG COMPONENTS (kept as-is) ---
const IconLeaf: React.FC<{ className?: string }> = ({ className = '' }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17 8c-2 0-2.486 3.036-3.804 5.344-1.353 2.37-3.238 4.793-5.592 5.094C5.08 18.73 3 17.5 3 17.5c1.474-3.565 4.54-6.387 7.022-8.085C12.446 8.784 15 8 17 8zM20.5 3.5c-2.348 0-4.48 1.146-6.07 2.923C13.68 6.48 13.5 6.77 13.5 7c0 .543.457 1 1 1h.5c.348 0 .685-.18.868-.492 1.258-2.16 3.25-3.008 4.598-3.008.064 0 .114.004.16.012.08-.106.14-.236.14-.408 0-.39-.18-.75-.48-.962C20.54 3.52 20.52 3.5 20.5 3.5zM22 6.5c-.82 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.68-1.5-1.5-1.5z"/></svg>);
const IconArrowRight: React.FC<{ className?: string }> = ({ className = '' }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L15.17 11H4v2h11.17l-4.58 4.59L12 20l7-7-7-7z"/></svg>);
const IconSignInAlt: React.FC<{ className?: string }> = ({ className = '' }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 7L9.6 8.4l2.6 2.6H4v2h8.2l-2.6 2.6L11 17l5-5-5-5zm9 8c0 1.66-1.34 3-3 3h-4v-2h4c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1h-4V7h4c1.66 0 3 1.34 3 3v5z"/></svg>);
const IconMicroscope: React.FC<{ className?: string }> = ({ className = '' }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.3 16 10c0-3.31-2.69-6-6-6S4 6.69 4 10s2.69 6 6 6c1.3 0 2.59-.59 3.53-1.38l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zM11 7H9v2H7v2h2v2h2v-2h2V9h-2z"/></svg>);
const IconShield: React.FC<{ className?: string }> = ({ className = '' }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.1-3.23 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>);
const IconMailInternal: React.FC<{ className?: string }> = ({ className = '' }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>);
const IconLocation: React.FC<{ className?: string }> = ({ className = '' }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>);
const IconUploadInternal: React.FC<{ className?: string }> = ({ className = '' }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>);
const IconCheckCircleInternal: React.FC<{ className?: string }> = ({ className = '' }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>);

// --- 2. TYPE DEFINITIONS & NAVIGATION ---
type Page = 'landing' | 'auth' | 'dashboard';

interface AlertMessageProps {
    message: string | null;
    type: 'success' | 'error' | null;
}

// --- 3. HELPER COMPONENTS (single definitions) ---
const AlertMessage: React.FC<AlertMessageProps> = ({ message, type }) => {
    if (!message) return null;

    const baseClasses = "p-4 rounded-xl text-sm mb-4 transition-all duration-300 shadow-md flex items-center";
    const typeClasses = type === 'success'
        ? "bg-green-100 text-green-800 border border-green-300"
        : "bg-red-100 text-red-800 border border-red-300";
    const Icon = type === 'success' ? CheckCircle : XCircle;

    return (
        <div className={`${baseClasses} ${typeClasses}`} role="alert">
            <Icon className="h-5 w-5 flex-shrink-0 mr-2" />
            <span>{message}</span>
        </div>
    );
};

const InputField: React.FC<{
    icon: React.ElementType,
    placeholder: string,
    type: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}> = ({ icon: Icon, placeholder, type, value, onChange }) => (
    <div className="relative mb-4">
        <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
            type={type} 
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm text-gray-700"
        />
    </div>
);

// --- 4. AUTHENTICATION PAGE (Login/Register Logic) ---
interface AuthPageProps {
    onLoginSuccess: (userId: string, email: string) => void; 
    // Accept React state setter for Page
    setCurrentPage: React.Dispatch<React.SetStateAction<Page>>;
}
const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, setCurrentPage }) => {
    // Call setCurrentPage after successful login
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [view, setView] = useState<'register' | 'login'>('login'); 
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const formatError = (data: { detail?: { loc: string[]; msg: string; type: string; }[] } | null, defaultMessage: string): string => {
        if (!data) return defaultMessage;
        interface ValidationError {
            loc: string[];
            msg: string;
            type: string;
        }

        if (Array.isArray(data.detail)) {
            return data.detail.map((d: ValidationError) => `${d.loc?.slice(-1).join('') || 'field'}: ${d.msg}`).join('; ');
        }
        return data.detail ? data.detail : defaultMessage;
    };

    const handleLogin = useCallback(async () => {
        setMessage(null);
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            let data;
            try { data = await response.json(); } catch { data = null; }

            if (response.ok && data) {
                onLoginSuccess(data.user_id?.toString() || '0', data.email || email);
                setCurrentPage('dashboard'); // Navigate to dashboard after login
                onLoginSuccess(data.user_id?.toString() || '0', data.email || email);
            } else {
                const detail = formatError(data, "Login failed. Check your credentials.");
                setMessage({ text: detail, type: 'error' });
            }
        } catch (error) {
            console.error("API Connection Error:", error);
            setMessage({ text: "Could not connect to the backend API. Ensure the server is running.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [email, password, onLoginSuccess, setCurrentPage]);

    const handleRegister = useCallback(async () => {
        setMessage(null);
        if (password !== confirmPassword) {
            setMessage({ text: "Passwords do not match.", type: 'error' });
            return;
        }
        if (password.length < 6) { 
            setMessage({ text: "Password must be at least 6 characters long.", type: 'error' });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            let data;
            try { data = await response.json(); } catch { data = null; }

            if (response.ok && data) {
                setMessage({ text: `Registration successful for user ID ${data.user_id || 'unknown'}. Please log in.`, type: 'success' });
                setEmail(''); setPassword(''); setConfirmPassword(''); setView('login');
            } else {
                const detail = formatError(data, "Registration failed. Please try again.");
                setMessage({ text: detail, type: 'error' });
            }
        } catch (error) {
            console.error("API Connection Error:", error);
            setMessage({ text: "Could not connect to the backend API. Ensure the server is running.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [email, password, confirmPassword]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (view === 'register') handleRegister(); else handleLogin();
    };
    
    return (
        <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center p-4 font-inter">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-4 border-green-600">
                <header className="text-center mb-6">
                    <Zap className="w-10 h-10 mx-auto text-green-600 mb-2" />
                    <h1 className="text-3xl font-bold text-gray-800">
                        {view === 'register' ? 'Create AgroScan AI Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {view === 'register' ? 'Start analyzing your crop health.' : 'Sign in to access your scans.'}
                    </p>
                </header>

                <AlertMessage message={message ? message.text : null} type={message ? message.type : null} />

                <form onSubmit={handleSubmit}>
                    <InputField icon={Mail} placeholder="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <InputField icon={Lock} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    {view === 'register' && <InputField icon={Lock} placeholder="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />}

                    <button type="submit" disabled={isLoading} className={`w-full py-3 mt-4 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg ${isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:bg-green-800'}`}>
                        {isLoading ? (<div className="flex items-center justify-center"><Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />Processing...</div>) : (view === 'register' ? 'Register Account' : 'Sign In')}
                    </button>
                </form>

                <footer className="mt-6 text-center text-sm">
                    {view === 'register' ? (
                        <p className="text-gray-600">Already have an account? <button onClick={() => { setView('login'); setMessage(null); }} className="text-green-600 font-medium hover:text-green-700 transition">Sign In</button></p>
                    ) : (
                        <p className="text-gray-600">Don't have an account? <button onClick={() => { setView('register'); setMessage(null); }} className="text-green-600 font-medium hover:text-green-700 transition">Register</button></p>
                    )}
                </footer>
            </div>
        </div>
    );
};

// --- 5. DASHBOARD, NAVBAR, FOOTER, LANDING & APP LOGIC ---
// (kept mostly unchanged; ensure you don't duplicate components elsewhere)
// For brevity I keep the rest of your original components (DashboardPage, Navbar, Footer, LandingPage) unchanged.
// ...existing code...

// --- 5. DASHBOARD COMPONENT (NEW) ---

interface AnalysisResult {
    filename: string;
    prediction: string;
    confidence: number;
    timestamp: string;
    status?: string;
    message?: string;
    recommendation?: string;
}


interface DashboardPageProps {
    userToken: string;
    userId: string;
    onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ userToken, userId, onLogout }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [results, setResults] = useState<AnalysisResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Placeholder for fetching historical results (optional, but good practice)
    useEffect(() => {
        // In a real app, you'd fetch /api/v1/history here to populate results
        setResults([
            { filename: "leaf_001.jpg", prediction: "Brown Blight", confidence: 0.92, timestamp: new Date().toLocaleString() },
            { filename: "leaf_002.png", prediction: "Healthy", confidence: 0.99, timestamp: new Date(Date.now() - 86400000).toLocaleString() },
        ]);
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setUploadMessage(null);
        }
    };

    const handleUpload = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setUploadMessage({ text: "Please select an image file to upload.", type: 'error' });
            return;
        }

        setIsLoading(true);
        setUploadMessage(null);
        
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const response = await fetch(`https://agroscan-ai-backend.onrender.com/predict`,{
                method: 'POST',
                headers: {
                    // Authorization header is critical for the protected endpoint
                    'Authorization': userToken ? `Bearer ${userToken}` : '',
                },
                // Do NOT set Content-Type for FormData, browser does it automatically (multipart/form-data)
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                // Backend returns:
                const newResult: AnalysisResult = {
                    filename: selectedFile.name,
                    prediction: data.prediction,
                    confidence: data.confidence,
                    timestamp: new Date().toLocaleString(),
                    status: data.status,
                    message: data.message,
                    recommendation: data.recommendation,
                };

                setResults(prev => [newResult, ...prev]);

                // Show friendly upload message based on status
                if (data.status && data.status !== 'HIGH_CONFIDENCE') {
                    // Low/medium confidence -> show backend message as warning/error
                    setUploadMessage({ text: data.message || 'Low confidence. Consider retaking the photo.', type: 'error' });
                } else {
                    setUploadMessage({ text: `Analysis successful: ${data.prediction} (${(data.confidence * 100).toFixed(1)}%)`, type: 'success' });
                }

                // Clear selection after handled
                setSelectedFile(null);
                setPreviewUrl(null);
            } else {
                // Show server-side message or fallback
                const detail = (data && (data.detail || data.message)) || "Upload failed. Your session may have expired.";
                setUploadMessage({ text: detail, type: 'error' });
                if (response.status === 401 || response.status === 403) {
                    onLogout(); // Force logout on unauthorized access
                }
            }
        } catch (error) {
            console.error("Upload Error:", error);
            setUploadMessage({ text: "A network error occurred. Check backend connection.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [selectedFile, userToken, onLogout]);

    return (
        <div className="min-h-screen pt-20 bg-gray-50 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 p-6 bg-white rounded-2xl shadow-xl border-l-8 border-green-600">
                    <h1 className="text-4xl font-extrabold text-gray-800 flex items-center space-x-3">
                        <Grid className="h-8 w-8 text-green-600" />
                        <span>Farmer Dashboard</span>
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Welcome, User ID: <span className="font-mono text-xs p-1 bg-gray-100 rounded">{userId}</span>. Upload a leaf image for immediate health assessment.
                    </p>
                </header>

                <div className="grid lg:grid-cols-3 gap-8">
                    
                    {/* Column 1: Upload Form */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-xl h-fit sticky top-24">
                        <h2 className="text-2xl font-bold mb-4 text-green-700 border-b pb-2">New Scan</h2>
                        
                        <AlertMessage message={uploadMessage ? uploadMessage.text : null} type={uploadMessage ? uploadMessage.type : null} />

                        <form onSubmit={handleUpload}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Tea Leaf Image (JPG/PNG)
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-green-300 border-dashed rounded-xl cursor-pointer bg-green-50 hover:bg-green-100 transition-colors">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover rounded-xl p-1" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-10 h-10 mb-3 text-green-500" />
                                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                <p className="text-xs text-gray-500">{selectedFile ? selectedFile.name : 'Max 5MB'}</p>
                                            </div>
                                        )}
                                        <input id="file-upload" type="file" className="hidden" accept="image/jpeg,image/png" onChange={handleFileChange} />
                                    </label>
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isLoading || !selectedFile}
                                className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg flex items-center justify-center space-x-2 ${
                                    isLoading || !selectedFile 
                                        ? 'bg-green-400 cursor-not-allowed' 
                                        : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin h-5 w-5" />
                                        <span>Analyzing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-5 w-5" />
                                        <span>Run AI Scan</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Column 2 & 3: Results History */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xl">
                        <h2 className="text-2xl font-bold mb-6 text-green-700 border-b pb-2">Scan History ({results.length})</h2>

                        {results.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                                <IconMicroscope className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                <p>No scan history yet. Upload your first image to begin tracking your tea crop health!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {results.map((result, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition duration-150 flex flex-col bg-green-50">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-4">
                                                <IconLeaf className={`h-8 w-8 flex-shrink-0 ${result.prediction === 'Healthy' ? 'text-green-600' : 'text-red-500'}`} />
                                                <div>
                                                    <p className="text-lg font-semibold text-gray-800">{result.prediction}</p>
                                                    <p className="text-xs text-gray-500">{result.filename} | Scanned: {result.timestamp}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-green-700">{(result.confidence * 100).toFixed(1)}<span className="text-lg font-normal">%</span></p>
                                                <p className="text-xs text-gray-500">Confidence</p>
                                            </div>
                                        </div>

                                        {/* Backend message (e.g., low confidence explanation) */}
                                        {result.message && (
                                            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                                                {result.message}
                                            </div>
                                        )}

                                        {/* Recommendation from backend */}
                                        {result.recommendation && (
                                            <div className="mt-3 p-3 bg-white border border-green-100 rounded text-sm text-gray-800">
                                                <h4 className="font-semibold text-sm mb-1">Recommendation</h4>
                                                <p>{result.recommendation}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    
);
};

// --- 6. NAVIGATION COMPONENTS ---

interface NavbarProps { 
    setCurrentPage: (page: Page) => void;
    userToken: string | null; // Pass token to determine auth state
    onLogout: () => void;
}
const Navbar: React.FC<NavbarProps> = ({ setCurrentPage, userToken, onLogout }) => {
    
    return (
        <nav className="bg-green-800 p-4 shadow-lg fixed top-0 left-0 right-0 z-20">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div 
                    className="text-white text-2xl font-extrabold flex items-center space-x-2 cursor-pointer" 
                    onClick={() => setCurrentPage('landing')}
                >
                    <IconLeaf className="text-amber-500 h-6 w-6" />
                    <span>AgroScan AI</span>
                </div>
                
                <div className="flex items-center space-x-4">
                    {userToken ? (
                        <>
                            <button
                                onClick={() => setCurrentPage('dashboard')}
                                className="hidden sm:flex items-center space-x-2 px-4 py-2 text-white hover:bg-green-700 font-bold rounded-lg transition-colors duration-200"
                            >
                                <Grid className="h-5 w-5" />
                                <span>Dashboard</span>
                            </button>
                            <button 
                                onClick={onLogout}
                                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white hover:bg-red-600 font-bold rounded-lg shadow-md transition-colors duration-200"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => setCurrentPage('auth')}
                            className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-green-900 hover:bg-amber-400 font-bold rounded-lg shadow-md transition-colors duration-200"
                        >
                            <IconSignInAlt className="h-5 w-5" />
                            <span>Get Started</span>
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

// --- 7. FOOTER COMPONENT ---
// (Footer component remains unchanged for brevity and is only shown on landing page)
const Footer: React.FC<{ setCurrentPage: (page: Page) => void }> = ({ setCurrentPage }) => {

    return (
        <footer className="bg-green-800 text-green-200 py-10 border-t border-green-700 mt-auto">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
                {/* Logo and Tagline */}
                <div className="col-span-2 md:col-span-1">
                    <div className="text-white text-xl font-extrabold flex items-center space-x-2 mb-3">
                        <IconLeaf className="text-amber-500 h-5 w-5" />
                        <span>AgroScan AI</span>
                    </div>
                    <p className="text-sm">
                        Precision diagnosis for a healthier harvest.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Navigation</h4>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <button onClick={() => setCurrentPage('landing')} className="hover:text-amber-500 transition-colors">Home</button>
                        </li>
                        <li>
                            <button onClick={() => setCurrentPage('auth')} className="hover:text-amber-500 transition-colors">Features</button>
                        </li>
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <a href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-amber-500 transition-colors">Terms of Service</a>
                        </li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
                    <div className="space-y-2 text-sm">
                        <p className="flex items-center space-x-2">
                            <IconMailInternal className="h-4 w-4 text-amber-500" />
                            <span>support@agroscan.ai</span>
                        </p>
                        <p className="flex items-start space-x-2">
                            <IconLocation className="h-4 w-4 text-amber-500 mt-1" />
                            <span>Global HQ, AgTech Hub</span>
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Copyright Bar */}
            <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-green-700 text-center text-sm text-green-400">
                &copy; {new Date().getFullYear()} AgroScan AI. All rights reserved.
            </div>
        </footer>
    );
};


// --- 8. LANDING PAGE COMPONENT (Existing) ---

interface LandingPageProps { 
    setCurrentPage: (page: Page) => void; 
    diseaseCategories: string[];
    message: AlertMessageProps;
    setMessage: (msg: AlertMessageProps) => void;
}
const LandingPage: React.FC<LandingPageProps> = ({ setCurrentPage, diseaseCategories, message, setMessage }) => {
    
    // Clear the message after rendering it once
    useEffect(() => {
        if (message.message) {
            const timer = setTimeout(() => {
                setMessage({ message: null, type: null });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message, setMessage]);

    return (
        <div className="min-h-full">
            {/* Alert container for global messages like logout */}
            {message.message && (
                <div className="fixed top-20 right-4 z-50">
                    <AlertMessage message={message.message} type={message.type} />
                </div>
            )}
            
            {/* Hero Section */}
            <header className="pt-32 pb-20 bg-green-900 text-white shadow-2xl">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h1 className="text-6xl font-black mb-4 tracking-tight leading-tight">
                        Precision Health for <span className="text-amber-500">Tea Crops</span> using AI
                    </h1>
                    <p className="text-xl text-green-200 mb-8 max-w-2xl mx-auto">
                        Instantly detect, identify, and manage common tea leaf diseases with high-accuracy computer vision.
                    </p>
                    <button 
                        onClick={() => setCurrentPage('auth')}
                        className="bg-amber-500 text-green-900 font-bold py-3 px-8 rounded-full text-lg shadow-xl transform transition duration-300 hover:bg-amber-400 hover:scale-105 flex items-center justify-center mx-auto space-x-2"
                    >
                        <span>Start Your Scan Journey</span> <IconArrowRight className="h-5 w-5" />
                    </button>
                </div>
            </header>

            {/* --- SECTION: HOW IT WORKS WITH IMAGES --- */}
            <section className="py-20 bg-green-900">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl font-extrabold text-center text-white mb-12">
                        Diagnose in Three Simple Steps
                    </h2>
                    
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 p-8 rounded-xl bg-green-800/50 border border-green-700">
                        
                        {/* LEFT SIDE: Image Example */}
                        <div className="lg:w-1/2 p-6 bg-white rounded-lg shadow-2xl border-b-8 border-amber-500">
                            <img 
                                src="uploaded:image_1b6f9f.jpg-78a65d95-9dd6-41ae-90a3-f136a246df60" 
                                alt="A seedling with a transparent holographic AI overlay showing real-time environmental data and plant health metrics." 
                                className="w-full h-auto rounded-md shadow-lg"
                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => e.currentTarget.src='https://placehold.co/800x500/166534/FFFFFF?text=A.I.+Analysis+Visual'}
                            />
                        </div>

                        {/* RIGHT SIDE: Steps Description */}
                        <div className="lg:w-1/2 space-y-8">
                            {/* Step 1 */}
                            <div className="flex items-start space-x-4">
                                <span className="text-4xl font-black text-amber-500">1.</span>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1 flex items-center space-x-2">
                                        <IconUploadInternal className="h-6 w-6 text-green-300" /> 
                                        <span>Upload & Scan</span>
                                    </h3>
                                    <p className="text-green-200">
                                        Take a photo of the affected tea leaf or upload an existing image from your device.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex items-start space-x-4">
                                <span className="text-4xl font-black text-amber-500">2.</span>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1 flex items-center space-x-2">
                                        <IconMicroscope className="h-6 w-6 text-green-300" />
                                        <span>Instant Analysis</span>
                                    </h3>
                                    <p className="text-green-200">
                                        Our computer vision model processes the image to identify the exact disease type.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex items-start space-x-4">
                                <span className="text-4xl font-black text-amber-500">3.</span>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1 flex items-center space-x-2">
                                        <IconCheckCircleInternal className="h-6 w-6 text-green-300" />
                                        <span>Get Recommended Action</span>
                                    </h3>
                                    <p className="text-green-200">
                                        Receive a confidence score and practical advice for treatment and prevention.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* --- END SECTION --- */}


            {/* AI Capabilities Section (Existing) */}
            <section className="py-20 bg-green-900"> 
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl font-extrabold text-center text-white mb-4">
                        Trained on a Diverse Tea Sickness Dataset
                    </h2>
                    <p className="text-center text-xl text-green-200 mb-12 max-w-3xl mx-auto">
                        Our model leverages a vast dataset to classify leaves into the following categories, providing the most accurate diagnoses.
                    </p>
                    
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {diseaseCategories.map((category, index) => (
                            <div key={index} className="p-4 bg-white rounded-xl shadow-xl flex items-center space-x-3 border-l-4 border-amber-500 transition hover:shadow-2xl">
                                <IconLeaf className={`h-6 w-6 ${category === 'Healthy' ? 'text-green-600' : 'text-amber-600'}`} />
                                <span className="font-medium text-gray-800">{category}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Features Section (Existing) */}
            <section className="py-20 bg-green-900 text-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl font-extrabold text-center mb-16">Other Key Features</h2>
                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            { title: "High Confidence Reports", desc: "Get a clear confidence score to know how reliable the prediction is.", icon: IconShield },
                            { title: "Actionable Recommendations", desc: "We provide specific, localized treatment and prevention advice for each condition.", icon: IconLeaf },
                            { title: "Secure Data Tracking", desc: "Keep a historical record of all your scans and field observations.", icon: IconShield },
                        ].map((item, index) => (
                            <div key={index} className="text-center p-6 rounded-xl border-t-4 border-amber-500 transition hover:bg-green-800">
                                <item.icon className="text-5xl text-amber-500 mx-auto mb-4 h-12 w-12" />
                                <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                                <p className="text-green-200">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};


// --- 9. MAIN APP COMPONENT (Core Logic and State Container) ---

const App: React.FC = () => {
    // 1. Auth State Initialization (check local storage first for persistence)
    const initialToken = localStorage.getItem('userToken');
    const initialId = localStorage.getItem('userId');
    const initialPage: Page = (initialToken && initialId) ? 'dashboard' : 'landing';

    const [currentPage, setCurrentPage] = useState<Page>(initialPage);
    const [userToken, setUserToken] = useState<string | null>(initialToken);
    const [userId, setUserId] = useState<string | null>(initialId);
    const [globalMessage, setGlobalMessage] = useState<AlertMessageProps>({ message: null, type: null });

    const diseaseCategories = [
        "Algal Leaf", "Anthracnose", "Bird Eye Spot", 
        "Brown Blight", "Gray Light", "Red Leaf Spot", 
        "White Spot", "Healthy", "Other Non-Tea Leaf"
    ];

    // Function passed to AuthPage on successful login
    const handleLoginSuccess = useCallback((token: string, id: string) => {
        localStorage.setItem('userToken', token);
        localStorage.setItem('userId', id);
        setUserToken(token);
        setUserId(id);
        setCurrentPage('dashboard');
        setGlobalMessage({ message: `Login successful. Welcome back, user ${id}!`, type: 'success' });
    }, []);

    // Function for logging out
    const handleLogout = useCallback(() => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userId');
        setUserToken(null);
        setUserId(null);
        setCurrentPage('landing');
        setGlobalMessage({ message: "You have been successfully logged out.", type: 'success' });
    }, []);


    const renderPage = () => {
        switch (currentPage) {
            case 'landing':
                return <LandingPage 
                    setCurrentPage={setCurrentPage} 
                    diseaseCategories={diseaseCategories}
                    message={globalMessage}
                    setMessage={setGlobalMessage}
                />;
            case 'auth':
                // Reset message state when navigating to auth page
                if (globalMessage.message) setGlobalMessage({ message: null, type: null });
                return <AuthPage setCurrentPage={setCurrentPage} onLoginSuccess={handleLoginSuccess} />;
            case 'dashboard':
                // Check if user is authenticated before showing dashboard
                if (userToken && userId) {
                    // Reset message state when navigating to dashboard
                    if (globalMessage.message) setGlobalMessage({ message: null, type: null });
                    return <DashboardPage userToken={userToken} userId={userId} onLogout={handleLogout} />;
                }
                // If not authenticated, redirect to login
                setCurrentPage('auth');
                return <AuthPage setCurrentPage={setCurrentPage} onLoginSuccess={handleLoginSuccess} />;
            default:
                return <LandingPage 
                    setCurrentPage={setCurrentPage} 
                    diseaseCategories={diseaseCategories}
                    message={globalMessage}
                    setMessage={setGlobalMessage}
                />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <Navbar 
                setCurrentPage={setCurrentPage} 
                userToken={userToken}
                onLogout={handleLogout}
            />
            <main className="flex-grow"> 
                {renderPage()} 
            </main>
            {/* Don't render the footer on the Auth/Dashboard page for a cleaner look */}
            {currentPage === 'landing' && <Footer setCurrentPage={setCurrentPage} />}
        </div>
    );
};
export default App;
