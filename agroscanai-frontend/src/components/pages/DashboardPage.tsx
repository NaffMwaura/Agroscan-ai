import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Loader2, Grid, User, Settings, LogOut, ChevronDown,  } from 'lucide-react';
import type { DashboardPageProps, AnalysisResult } from '../../types';
import { API_BASE_URL } from '../../types';
import AlertMessage from '../ui/Alertmessage';
import { IconMicroscope, IconLeaf } from '../ui/Icons';

// --- New Profile Dropdown Component ---
interface ProfileDropdownProps {
    userEmail: string;
    onLogout: () => void;
    userId: string | null;
}
const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ userEmail, onLogout, }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative z-50">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition-colors shadow-md"
            >
                <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-green-900 font-bold text-sm">
                    {userEmail[0]?.toUpperCase()}
                </div>
                <span className="hidden sm:inline font-semibold">{userEmail}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <div className="px-4 py-2 text-sm text-gray-700 font-semibold border-b border-gray-100">
                        Profile
                    </div>
                    <button className="flex items-center space-x-3 w-full px-4 py-2 text-gray-700 hover:bg-green-50 transition-colors">
                        <User className="h-4 w-4 text-green-600" />
                        <span>My Account</span>
                    </button>
                    <button className="flex items-center space-x-3 w-full px-4 py-2 text-gray-700 hover:bg-green-50 transition-colors">
                        <Settings className="h-4 w-4 text-green-600" />
                        <span>Update Settings</span>
                    </button>
                    <button 
                        onClick={onLogout}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors border-t mt-1"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Dashboard Header (Replaces Nav on Dashboard Route) ---
const DashboardHeader: React.FC<DashboardPageProps> = (props) => {
    return (
        // FIX: Fixed position, full width, high z-index to sit flush with the top
        <div className="fixed top-0 left-0 right-0 bg-green-800 py-4 px-5 shadow-xl z-30">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                 {/* Logo and App Name */}
                <div className="text-white text-xl font-extrabold flex items-center space-x-2">
                    <IconLeaf className="text-amber-500 h-6 w-6" />
                    <span>AgroScan AI | Dashboard</span>
                </div>

                {/* Profile Controls */}
                <ProfileDropdown {...props} />
            </div>
        </div>
    );
};


const DashboardPage: React.FC<DashboardPageProps> = ({ userToken, userId, userEmail, onLogout }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchSavedScans = useCallback(async () => {
    // Only attempt fetch if user email is present
    if (!userEmail) {
      setResults([]);
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/get_scans/${encodeURIComponent(userEmail)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(userToken ? { Authorization: `Bearer ${userToken}` } : {})
        }
      });

      const json = await res.json().catch(() => null);
      
      // We check for res.ok AND that 'scans' property exists and is an array
      if (!res.ok || !json || !Array.isArray(json.scans)) {
        console.warn('fetchSavedScans failed or returned bad data structure:', json);
        setResults([]); // Clear results on failure
        return;
      }

      type ServerScan = {
        scan_id?: string | number;
        image_link?: string;
        diagnosis_result?: string;
        confidence_score?: number;
        treatment_recommendation?: string;
        scan_date?: string;
      };

      const serverResults = (json.scans as ServerScan[]).map((s) => ({
        // Use scan_id as a fallback filename if no link exists
        filename: `Scan ID: ${s.scan_id || 'N/A'}`,
        prediction: s.diagnosis_result || 'Unknown',
        confidence: typeof s.confidence_score === 'number' ? s.confidence_score : 0,
        // FIX: Ensure timestamp formatting handles database UTC vs local time
        timestamp: s.scan_date ? new Date(s.scan_date).toLocaleString() : new Date().toLocaleString(),
        recommendation: s.treatment_recommendation,
        image: s.image_link,
        scan_id: s.scan_id
      }));

      setResults(serverResults);
    } catch (err) {
      console.error('Error fetching saved scans', err);
      setResults([]); // Clear results on network error
    } finally {
      setIsLoading(false);
    }
  }, [userEmail, userToken]);

useEffect(() => {
    // This correctly runs immediately after login (when userEmail becomes set) to fetch history
    if (userEmail) {
        fetchSavedScans();
    }
    // We explicitly depend on userEmail to guarantee fetch is called upon component mount/remount after login
}, [userEmail, fetchSavedScans]);

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
      formData.append("user_email", userEmail); 

      console.log('Uploading to /predict...');
      const predictRes = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          ...(userToken ? { Authorization: `Bearer ${userToken}` } : {})
        },
        body: formData,
      });

      const predictData = await predictRes.json().catch(() => null);
      if (!predictRes.ok) {
        console.error('Predict failed', predictRes.status, predictData);
        setUploadMessage({ text: predictData?.message || 'Analysis failed.', type: 'error' });
        if (predictRes.status === 401 || predictRes.status === 403) onLogout();
        return;
      }

      const newResult: AnalysisResult = {
        filename: selectedFile.name,
        prediction: predictData.prediction,
        confidence: predictData.confidence,
        timestamp: new Date().toLocaleString(),
        status: predictData.status,
        message: predictData.message,
        recommendation: predictData.recommendation,
      };

      // Since the backend /predict endpoint now includes save logic (via PredictionAndSaveResponse), 
      // we check the response for save status, eliminating the need for a separate /save_scan call.
      if (predictData.save_status === 'SAVED_SUCCESS') {
          newResult.scan_id = predictData.scan_id;
          setUploadMessage({ text: 'Scan analyzed and saved to history.', type: 'success' });
          await fetchSavedScans(); // Refresh history
      } else if (predictData.save_status && predictData.save_status.includes('FAILED')) {
          console.warn('Save scan failed on backend:', predictData.save_status);
          setUploadMessage({ text: 'Analysis ran, but saving history failed.', type: 'error' });
      }


      // Show immediate result locally
      setResults(prev => [newResult, ...prev]);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Upload Error:", error);
      setUploadMessage({ text: "A network error occurred. Check backend connection.", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, userToken, userEmail, onLogout, fetchSavedScans]);

  return (
    <>
      {/* 1. Dedicated Dashboard Header */}
      <DashboardHeader userEmail={userEmail} userId={userId} userToken={userToken} onLogout={onLogout} />

      {/* 2. Content Area (Pushed Down by the fixed header) */}
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8 pt-[80px]"> {/* Adjusted pt-[80px] to manually clear the fixed header's height */}
        <div className="max-w-7xl mx-auto">
          {/* Main Dashboard Welcome Header */}
          <header className="mb-8 p-6 bg-white rounded-2xl shadow-xl border-l-8 border-green-600">
            <h1 className="text-4xl font-extrabold text-gray-800 flex items-center space-x-3">
              <Grid className="h-8 w-8 text-green-600" />
              <span>Farmer Dashboard</span>
            </h1>
            <p className="text-gray-500 mt-2">
              Welcome, Naff: <span className="font-mono text-xs p-1 bg-gray-100 rounded">{userEmail}</span>. Upload a leaf image for immediate health assessment.
            </p>
          </header>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* New Scan Upload Card */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-xl h-fit sticky top-24">
              <h2 className="text-2xl font-bold mb-4 text-green-700 border-b pb-2">New Scan</h2>

              <AlertMessage message={uploadMessage ? uploadMessage.text : null} type={uploadMessage ? uploadMessage.type : null} />

              <form onSubmit={handleUpload}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Tea Leaf Image (JPG/PNG)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    {/* FIX: Increased image box size for better visual fit */}
                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-green-300 border-dashed rounded-xl cursor-pointer bg-green-50 hover:bg-green-100 transition-colors">
                      {previewUrl ? (
                        // If preview exists, display the image
                        <img src={previewUrl} alt="Preview" className="h-full w-full object-cover rounded-xl p-1" />
                      ) : (
                        // If no preview, display the upload placeholder
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
                  className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg flex items-center justify-center space-x-2 ${isLoading || !selectedFile ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:bg-green-800'}`}
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

            {/* Scan History Card */}
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
                            <p className="text-xs text-gray-500">Scanned: {result.timestamp}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${result.confidence >= 0.7 ? 'text-green-700' : 'text-yellow-600'}`}>
                            {(result.confidence * 100).toFixed(1)}<span className="text-lg font-normal">%</span>
                          </p>
                          <p className="text-xs text-gray-500">Confidence</p>
                        </div>
                      </div>

                      {result.message && (
                        <div className={`mt-2 p-3 rounded text-sm ${result.status === 'LOW_CONFIDENCE' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' : 'bg-gray-100 border border-gray-200 text-gray-700'}`}>
                          {result.message}
                        </div>
                      )}

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
    </>
  );
};

export default DashboardPage;