import React, { useEffect } from 'react';
import type { LandingPageProps } from '../../types';
import AlertMessage from '../ui/Alertmessage';
// --- CORRECT IMPORT FOR LOCAL IMAGE ---
import aiAnalysisImage from '../../assets/ai.jpg'; 
// --------------------------------------
import { IconArrowRight, IconUploadInternal, IconMicroscope, IconCheckCircleInternal } from '../ui/Icons';


const LandingPage: React.FC<LandingPageProps> = ({ setCurrentPage, message, setMessage }) => {
  useEffect(() => {
    if (message.message) {
      const timer = setTimeout(() => setMessage({ message: null, type: null }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message, setMessage]);

  return (
    <div className="min-h-full">
      {message.message && (
        <div className="fixed top-20 right-4 z-50"><AlertMessage message={message.message} type={message.type} /></div>
      )}

      <header className="pt-32 pb-20 bg-green-900 text-white shadow-2xl">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-6xl font-black mb-4 tracking-tight leading-tight">Precision Health for <span className="text-amber-500">Tea Crops</span> using AI</h1>
          <p className="text-xl text-green-200 mb-8 max-w-2xl mx-auto">Instantly detect, identify, and manage common tea leaf diseases with high-accuracy computer vision.</p>
          <button onClick={() => setCurrentPage('auth')} className="bg-amber-500 text-green-900 font-bold py-3 px-8 rounded-full text-lg shadow-xl transform transition duration-300 hover:bg-amber-400 hover:scale-105 flex items-center justify-center mx-auto space-x-2">
            <span>Start Your Scan Journey</span> <IconArrowRight className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* FIXED: Corrected invalid py-22 class to py-20 or py-24, and included the image variable */}
      <section className="py-24 bg-green-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center text-white mb-12">Diagnose in Three Simple Steps</h2>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 p-8 rounded-xl bg-green-800/50 border border-green-700">
            <div className="lg:w-1/2 p-6 bg-white rounded-lg shadow-2xl border-b-8 border-amber-500">
              {/* --- IMAGE SOURCE REPLACED WITH IMPORTED VARIABLE --- */}
              <img 
                  src={aiAnalysisImage} 
                  alt="AI Analysis Visual" 
                  className="w-full h-auto rounded-md shadow-lg" 
              />
              {/* ---------------------------------------------------- */}
            </div>
            <div className="lg:w-1/2 space-y-8">
              <div className="flex items-start space-x-4">
                <span className="text-4xl font-black text-amber-500">1.</span>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1 flex items-center space-x-2"><IconUploadInternal className="h-6 w-6 text-green-300" /> <span>Upload & Scan</span></h3>
                  <p className="text-green-200">Take a photo of the affected tea leaf or upload an existing image from your device.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <span className="text-4xl font-black text-amber-500">2.</span>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1 flex items-center space-x-2"><IconMicroscope className="h-6 w-6 text-green-300" /> <span>Instant Analysis</span></h3>
                  <p className="text-green-200">Our computer vision model processes the image to identify the exact disease type.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <span className="text-4xl font-black text-amber-500">3.</span>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1 flex items-center space-x-2"><IconCheckCircleInternal className="h-6 w-6 text-green-300" /> <span>Get Recommended Action</span></h3>
                  <p className="text-green-200">Receive a confidence score and practical advice for treatment and prevention.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* other landing content omitted for brevity (keeps existing markup) */}
    </div>
  );
};

export default LandingPage;