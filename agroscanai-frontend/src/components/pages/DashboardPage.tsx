import React, { useState, useCallback, useEffect } from 'react';
import { 
    Upload, Loader2, User, LogOut, 
    ChevronDown, MessageSquare, Star, ShieldCheck, 
    Zap, Microscope 
} from 'lucide-react';
import type { DashboardPageProps, AnalysisResult } from '../../types';
import { API_BASE_URL } from '../../types';
import AlertMessage from '../ui/Alertmessage';
import { IconMicroscope, IconLeaf } from '../ui/Icons';

// --- Interfaces ---

// FIX 1: Defined the missing ProfileDropdownProps
interface ProfileDropdownProps {
    userEmail: string;
    onLogout: () => void;
    userId: string | null;
}

// FIX 2: Defined a specific type for the API response objects to avoid 'any'
interface ServerScanResponse {
    scan_id: number | string;
    prediction?: string;
    confidence?: number;
    date?: string;
    treatment_recommendation?: string;
}

// --- Sub-Components ---

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
                    {userEmail[0]?.toUpperCase()}
                </div>
                <span className="hidden sm:inline font-semibold text-sm">{userEmail.split('@')[0]}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 overflow-hidden" onMouseLeave={() => setIsOpen(false)}>
                    <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">Account Settings</div>
                    <button className="flex items-center space-x-3 w-full px-4 py-2.5 text-gray-700 hover:bg-green-50 transition-colors text-sm">
                        <User className="h-4 w-4 text-green-600" /> <span>My Profile</span>
                    </button>
                    <button onClick={onLogout} className="flex items-center space-x-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-sm border-t border-gray-50">
                        <LogOut className="h-4 w-4" /> <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Main Dashboard ---

const DashboardPage: React.FC<DashboardPageProps> = ({ userToken, userId, userEmail, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'scan'>('overview');
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
                // FIX 2: Used ServerScanResponse instead of 'any'
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
            // FIX 3: Log error or prefix with _ to satisfy ESLint if you aren't using the object
            console.error("Fetch history failed:", err); 
        }
        finally { setIsLoading(false); }
    }, [userEmail, userToken]);

    useEffect(() => { if (userEmail) fetchSavedScans(); }, [userEmail, fetchSavedScans]);

const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setIsLoading(true);
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
            
            // Map the response directly from the PredictionAndSaveResponse model
            const newScan: AnalysisResult = {
                filename: `Scan #${data.scan_id || 'New'}`,
                prediction: data.prediction,
                confidence: data.confidence,
                timestamp: new Date().toLocaleString(),
                // Ensure this matches the key 'recommendation' in your backend Pydantic model
                recommendation: data.recommendation, 
                scan_id: data.scan_id
            };

            // Update state immediately so the user sees the result without a reload
            setResults(prev => [newScan, ...prev]); 
            
            setSelectedFile(null);
            setPreviewUrl(null);
        } else {
            setUploadMessage({ text: data.message || "Scan failed", type: 'error' });
        }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) { 
        setUploadMessage({ text: "Error connecting to server", type: 'error' }); 
    } finally { 
        setIsLoading(false); 
    }
};
    return (
        <div className="min-h-screen bg-[#f8fafc] font-inter">
            {/* Navigation Header */}
            <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="bg-green-600 p-2 rounded-xl">
                            <IconLeaf className="text-white h-5 w-5" />
                        </div>
                        <span className="text-xl font-black text-gray-900 tracking-tight">AgroScan<span className="text-green-600">AI</span></span>
                    </div>
                    
                    <div className="hidden md:flex items-center bg-gray-100 p-1 rounded-xl">
                        <button 
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Overview
                        </button>
                        <button 
                            onClick={() => setActiveTab('scan')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'scan' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            AI Analysis
                        </button>
                    </div>

                    <ProfileDropdown userEmail={userEmail} onLogout={onLogout} userId={userId} />
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                {activeTab === 'overview' ? (
                    /* PAGE 1: OVERVIEW & REVIEWS */
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

                        {/* Reviews Section */}
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
                                <ReviewCard 
                                    name="Samuel K." role="Estate Manager" 
                                    text="The accuracy in spotting Blight before it spreads has saved us thousands this season." 
                                    rating={5} 
                                />
                                <ReviewCard 
                                    name="Elena R." role="Small-scale Farmer" 
                                    text="AgroBot helped me identify exactly which organic fertilizer to use for my red rust issue." 
                                    rating={5} 
                                />
                                <ReviewCard 
                                    name="David M." role="Agricultural Consultant" 
                                    text="A game changer for the tea industry. The history tracking is invaluable for long-term health logs." 
                                    rating={4} 
                                />
                            </div>
                        </section>
                    </div>
                ) : (
                    /* PAGE 2: SCAN & HISTORY */
                    <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
                                <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                                    <Microscope className="w-5 h-5 text-green-600" />
                                    <span>Instant Diagnosis</span>
                                </h2>
                                <AlertMessage message={uploadMessage?.text || null} type={uploadMessage?.type || null} />
                                <form onSubmit={handleUpload} className="space-y-4">
                                    <label className="relative flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer bg-gray-50 hover:bg-green-50/50 hover:border-green-300 transition-all overflow-hidden group">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="text-center">
                                                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 inline-block group-hover:scale-110 transition-transform">
                                                    <Upload className="w-8 h-8 text-green-600" />
                                                </div>
                                                <p className="text-sm font-bold text-gray-700">Drop your image here</p>
                                                <p className="text-xs text-gray-400 mt-1">PNG or JPG up to 10MB</p>
                                            </div>
                                        )}
                                        <input type="file" className="hidden" onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                setSelectedFile(e.target.files[0]);
                                                setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                                            }
                                        }} />
                                    </label>
                                    <button 
                                        disabled={isLoading || !selectedFile}
                                        className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-100 disabled:opacity-50 hover:bg-green-700 transition-all flex items-center justify-center space-x-2"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : <span>Analyze Sample</span>}
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                    <h2 className="text-xl font-bold text-gray-800">Recent Scans</h2>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">{results.length} Records</span>
                                </div>
                                <div className="p-6">
                                    {results.length === 0 ? (
                                        <div className="text-center py-20">
                                            <IconMicroscope className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                            <p className="text-gray-400 font-medium">No history found. Start your first scan.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {results.map((res, i) => (
                                                <div key={i} className="flex items-start space-x-4 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <div className={`p-3 rounded-xl ${res.prediction === 'Healthy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                        <IconLeaf className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between">
                                                            <h4 className="font-bold text-gray-900">{res.prediction}</h4>
                                                            <span className="text-xs font-bold text-gray-400">{res.timestamp}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">Confidence: {(res.confidence * 100).toFixed(1)}%</p>
                                                        {res.recommendation && (
                                                            <div className="mt-3 text-xs bg-white p-3 rounded-lg border border-gray-100 text-gray-600 italic">
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
                    </div>
                )}
            </main>
        </div>
    );
};

export default DashboardPage;