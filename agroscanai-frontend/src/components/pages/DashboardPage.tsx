import React, { useState, useCallback, useEffect } from 'react';
import { 
    Upload, Loader2, User, LogOut, 
    ChevronDown, MessageSquare, Star, ShieldCheck, 
    Zap, Microscope, History, LayoutDashboard,
    Leaf, CheckCircle, AlertCircle
} from 'lucide-react';

/**
 * AGROSCAN AI - DASHBOARD
 * * Implementation of the three-page navigation structure:
 * 1. Overview: Hero section and testimonials.
 * 2. AI Analysis: Upload and diagnosis interface.
 * 3. History: Chronological log of previous scans.
 * * Update: Persistent image preview after scan completion.
 */

// --- Configuration & Types ---

const API_BASE_URL = 'https://agroscan-ai-qmrt.onrender.com'; // Replace with actual API URL

interface AnalysisResult {
    filename: string;
    prediction: string;
    confidence: number;
    timestamp: string;
    recommendation?: string;
    scan_id: number | string;
}

interface DashboardPageProps {
    userToken: string | null;
    userId: string | null;
    userEmail: string;
    onLogout: () => void;
}

interface ProfileDropdownProps {
    userEmail: string;
    onLogout: () => void;
    userId: string | null;
}

interface ServerScanResponse {
    scan_id: number | string;
    prediction?: string;
    confidence?: number;
    date?: string;
    treatment_recommendation?: string;
}

// --- Inline UI Components ---

const IconLeaf = ({ className }: { className?: string }) => (
    <Leaf className={className} />
);

const IconMicroscope = ({ className }: { className?: string }) => (
    <Microscope className={className} />
);

const AlertMessage: React.FC<{ message: string | null; type: 'success' | 'error' | null }> = ({ message, type }) => {
    if (!message) return null;
    const isError = type === 'error';
    return (
        <div className={`flex items-center p-4 mb-6 rounded-2xl border ${
            isError ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'
        }`}>
            {isError ? <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
};

const ReviewCard: React.FC<{ name: string; role: string; text: string; rating: number }> = ({ name, role, text, rating }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-3 hover:shadow-md transition-shadow">
        <div className="flex text-amber-400">
            {[...Array(rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
        </div>
        <p className="text-gray-600 italic text-sm">"{text}"</p>
        <div>
            <h4 className="font-bold text-gray-800 text-sm">{name}</h4>
            <p className="text-green-600 text-xs">{role}</p>
        </div>
    </div>
);

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ userEmail, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative z-50">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white p-1.5 pr-3 rounded-full transition-colors shadow-md"
            >
                <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-green-900 font-bold text-sm">
                    {userEmail?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline font-semibold text-sm">{userEmail?.split('@')[0]}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 overflow-hidden z-50">
                        <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">Account Settings</div>
                        <button className="flex items-center space-x-3 w-full px-4 py-2.5 text-gray-700 hover:bg-green-50 transition-colors text-sm">
                            <User className="h-4 w-4 text-green-600" /> <span>My Profile</span>
                        </button>
                        <button onClick={onLogout} className="flex items-center space-x-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-sm border-t border-gray-50">
                            <LogOut className="h-4 w-4" /> <span>Logout</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

// --- Main Dashboard Component ---

const App: React.FC<DashboardPageProps> = ({ userToken, userId, userEmail, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'scan' | 'history'>('overview');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [results, setResults] = useState<AnalysisResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fetchSavedScans = useCallback(async () => {
        if (!userEmail) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/get_scans/${encodeURIComponent(userEmail)}`, {
                headers: { 'Content-Type': 'application/json', ...(userToken ? { Authorization: `Bearer ${userToken}` } : {}) }
            });
            const json = await res.json();
            if (res.ok && Array.isArray(json.scans)) {
                const mapped = json.scans.map((s: ServerScanResponse) => ({
                    filename: `Scan #${s.scan_id}`,
                    prediction: s.prediction || 'Unknown',
                    confidence: s.confidence || 0,
                    timestamp: s.date ? new Date(s.date).toLocaleString() : 'N/A',
                    recommendation: s.treatment_recommendation,
                    scan_id: s.scan_id
                }));
                setResults(mapped);
            }
        } catch (err) { 
            console.error("Fetch history failed:", err); 
        }
        finally { setIsLoading(false); }
    }, [userEmail, userToken]);

    useEffect(() => { if (userEmail) fetchSavedScans(); }, [userEmail, fetchSavedScans]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;
        setIsLoading(true);
        setUploadMessage(null);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("user_email", userEmail);
            
            const res = await fetch(`${API_BASE_URL}/predict`, {
                method: 'POST',
                headers: { ...(userToken ? { Authorization: `Bearer ${userToken}` } : {}) },
                body: formData
            });

            const data = await res.json(); 

            if (res.ok) {
                setUploadMessage({ text: "Scan successful!", type: 'success' });
                
                const newScan: AnalysisResult = {
                    filename: `Scan #${data.scan_id || 'New'}`,
                    prediction: data.prediction,
                    confidence: data.confidence,
                    timestamp: new Date().toLocaleString(),
                    recommendation: data.recommendation, 
                    scan_id: data.scan_id
                };

                setResults(prev => [newScan, ...prev]); 
                
                // EDITED: Removed resets for selectedFile and previewUrl 
                // to keep the image visible after scanning.
                
                // Redirect to history after short delay
                setTimeout(() => setActiveTab('history'), 2000);
            } else {
                setUploadMessage({ text: data.message || "Scan failed", type: 'error' });
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) { 
            setUploadMessage({ text: "Error connecting to server", type: 'error' }); 
        } finally { 
            setIsLoading(false); 
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans">
            {/* Navigation Header */}
            <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="bg-green-600 p-2 rounded-xl">
                            <IconLeaf className="text-white h-5 w-5" />
                        </div>
                        <span className="text-xl font-black text-gray-900 tracking-tight">AgroScan<span className="text-green-600">AI</span></span>
                    </div>
                    
                    {/* Page Navigation Tabs */}
                    <div className="hidden md:flex items-center bg-gray-100 p-1 rounded-xl">
                        <button 
                            onClick={() => setActiveTab('overview')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Overview</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('scan')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'scan' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Microscope className="w-4 h-4" />
                            <span>AI Analysis</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('history')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <History className="w-4 h-4" />
                            <span>History</span>
                        </button>
                    </div>

                    <ProfileDropdown userEmail={userEmail} onLogout={onLogout} userId={userId} />
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                {activeTab === 'overview' && (
                    /* PAGE 1: OVERVIEW */
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-5xl font-black text-gray-900 leading-tight">
                                    Precision Farming <br/>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-amber-500">Driven by AI.</span>
                                </h2>
                                <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                                    AgroScan AI uses advanced neural networks to detect tea leaf diseases with 98.2% accuracy. Protect your yield and optimize treatment with instant digital diagnosis.
                                </p>
                                <div className="mt-10 flex space-x-4">
                                    <button onClick={() => setActiveTab('scan')} className="px-8 py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-200">
                                        Start Scanning
                                    </button>
                                    <button className="px-8 py-4 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center space-x-2">
                                        <MessageSquare className="w-5 h-5 text-green-600" />
                                        <span>Talk to AgroBot</span>
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                                    <ShieldCheck className="w-10 h-10 text-green-600 mb-4" />
                                    <span className="text-3xl font-black text-gray-900">98%</span>
                                    <span className="text-sm text-green-700 font-medium">Accuracy</span>
                                </div>
                                <div className="bg-amber-50 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                                    <Zap className="w-10 h-10 text-amber-500 mb-4" />
                                    <span className="text-3xl font-black text-gray-900">&lt;2s</span>
                                    <span className="text-sm text-amber-700 font-medium">Analysis Time</span>
                                </div>
                            </div>
                        </div>

                        <section>
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Farmer Testimonials</h3>
                                    <p className="text-gray-500">Trusted by 500+ tea estates across the region.</p>
                                </div>
                                <div className="flex -space-x-2">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" />
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-green-600 flex items-center justify-center text-[10px] text-white font-bold">+2k</div>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                <ReviewCard name="Samuel K." role="Estate Manager" text="The accuracy in spotting Blight before it spreads has saved us thousands this season." rating={5} />
                                <ReviewCard name="Elena R." role="Small-scale Farmer" text="AgroBot helped me identify exactly which organic fertilizer to use for my red rust issue." rating={5} />
                                <ReviewCard name="David M." role="Agricultural Consultant" text="A game changer for the tea industry. The history tracking is invaluable for long-term health logs." rating={4} />
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'scan' && (
                    /* PAGE 2: SCAN */
                    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                            <h2 className="text-2xl font-bold mb-2 flex items-center space-x-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Microscope className="w-6 h-6 text-green-600" />
                                </div>
                                <span>Instant Diagnosis</span>
                            </h2>
                            <p className="text-gray-500 mb-8 ml-12">Upload a clear photo of the affected tea leaf for analysis.</p>
                            
                            <AlertMessage message={uploadMessage?.text || null} type={uploadMessage?.type || null} />
                            
                            <form onSubmit={handleUpload} className="space-y-6">
                                <label className="relative flex flex-col items-center justify-center w-full h-96 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer bg-gray-50 hover:bg-green-50/50 hover:border-green-300 transition-all overflow-hidden group">
                                    {previewUrl ? (
                                        <div className="relative h-full w-full">
                                            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <p className="text-white font-bold">Change Image</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center p-10">
                                            <div className="bg-white p-6 rounded-2xl shadow-sm mb-4 inline-block group-hover:scale-110 transition-transform">
                                                <Upload className="w-10 h-10 text-green-600" />
                                            </div>
                                            <p className="text-lg font-bold text-gray-700">Drop your image here</p>
                                            <p className="text-sm text-gray-400 mt-2">High resolution PNG or JPG up to 10MB recommended</p>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setSelectedFile(e.target.files[0]);
                                            setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                                        }
                                    }} />
                                </label>
                                <button 
                                    disabled={isLoading || !selectedFile}
                                    className="w-full py-5 bg-green-600 text-white text-lg font-bold rounded-2xl shadow-lg shadow-green-100 disabled:opacity-50 hover:bg-green-700 transition-all flex items-center justify-center space-x-3"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : (
                                        <>
                                            <Zap className="w-5 h-5" />
                                            <span>Run AI Analysis</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    /* PAGE 3: HISTORY */
                    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-amber-100 rounded-lg">
                                        <History className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">Diagnostic History</h2>
                                        <p className="text-sm text-gray-500">View and track all your previous scans</p>
                                    </div>
                                </div>
                                <span className="px-4 py-2 bg-green-100 text-green-700 text-sm font-bold rounded-full">{results.length} Records</span>
                            </div>
                            <div className="p-8">
                                {results.length === 0 && !isLoading ? (
                                    <div className="text-center py-32">
                                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <IconMicroscope className="w-10 h-10 text-gray-300" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-700 mb-2">No History Yet</h3>
                                        <p className="text-gray-400 max-w-xs mx-auto">Start your first AI scan to see your diagnostic logs here.</p>
                                        <button onClick={() => setActiveTab('scan')} className="mt-8 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all">
                                            Scan Now
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {results.map((res, i) => (
                                            <div key={i} className={`flex items-start space-x-6 p-6 rounded-3xl border transition-all ${res.confidence < 0.7 ? 'border-amber-200 bg-amber-50/20' : 'border-gray-100 hover:border-green-200 hover:bg-gray-50/50'}`}>
                                                <div className={`p-4 rounded-2xl shadow-sm ${res.prediction === 'Healthy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                    <IconLeaf className="w-8 h-8" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="text-xl font-bold text-gray-900">{res.prediction}</h4>
                                                            <p className="text-xs font-bold text-gray-400 flex items-center mt-1">
                                                                <Zap className="w-3 h-3 mr-1" />
                                                                Confidence: {(res.confidence * 100).toFixed(1)}%
                                                            </p>
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-400 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">{res.timestamp}</span>
                                                    </div>
                                                    
                                                    {res.recommendation && (
                                                        <div className="mt-4 text-sm bg-white p-4 rounded-2xl border border-gray-100 text-gray-700 leading-relaxed shadow-sm">
                                                            <div className="text-[10px] uppercase tracking-widest font-black text-green-600 mb-1">Treatment Recommendation</div>
                                                            {res.recommendation}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;