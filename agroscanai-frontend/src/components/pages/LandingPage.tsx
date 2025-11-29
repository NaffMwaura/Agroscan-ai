import React, { useEffect, useState } from 'react'; // Added useState
import { Link } from 'react-router-dom'; 
import type { LandingPageProps } from '../../types';
import AlertMessage from '../ui/Alertmessage';
import aiAnalysisImage from '../../assets/ai.jpg'; 
import {  IconUploadInternal, IconMicroscope, IconCheckCircleInternal, Grid } from '../ui/Icons';
import DelayedLink from '../ui/DelayedLink'; 
// NEW: Import your local tea farm background images
import teaFarmBg1 from '../../assets/bg-1.jfif'; 
import teaFarmBg2 from '../../assets/bg-2.jpg'; 
import teaFarmBg3 from '../../assets/bg-3.jpeg'; 
import teaFarmBg4 from '../../assets/bg-4.jpg';


const LandingPage: React.FC<LandingPageProps> = ({ message, setMessage }) => { 
  const [currentBgIndex, setCurrentBgIndex] = useState(0); // State for current background image
  // Array of your background images
  const backgroundImages = [
    teaFarmBg1,
    teaFarmBg2,
    teaFarmBg3,
    teaFarmBg4,
    // Add more image imports here if you have them!
  ];

  useEffect(() => {
    if (message.message) {
      const timer = setTimeout(() => setMessage({ message: null, type: null }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message, setMessage]);

  // Effect for background image cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000); // Change image every 5 seconds (5000ms)

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [backgroundImages.length]); // Re-run if image array length changes

  return (
    <div className="min-h-full">
      {message.message && (
        <div className="fixed top-20 right-4 z-50"><AlertMessage message={message.message} type={message.type} /></div>
      )}

      {/* Hero Section: Dynamic Background Slideshow with Dark Overlay */}
      <header 
        className="pt-32 pb-20 text-white shadow-2xl relative overflow-hidden" 
        style={{ 
            minHeight: '600px'
        }}
      > 
        {/* Background Image Container with Transitions */}
        <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out transform" // Added transition and transform
            style={{ 
                backgroundImage: `url(${backgroundImages[currentBgIndex]})`, 
                // This 'translate-x-0' will be dynamically adjusted by the animation if needed, for 'left' transition
                // For a simple fade, `opacity` transition is sufficient.
                // For slide, we might need more complex keyframe animations or direct style manipulation.
                // Let's stick to a fade for now, as direct `translateX` via `backgroundImage` is not straightforward.
                // If you want a literal slide effect, we would need multiple <img> tags or a single image with CSS keyframes.
                // For a "transitioning to the left side" illusion, we'll use `background-position` and `scale`.
                backgroundPosition: `center ${-currentBgIndex * 10}%`, // Slight shift for illusion
                backgroundSize: '110%', // Start slightly zoomed for movement effect
            }}
        ></div>

        {/* Dark Overlay for Text Contrast */}
        <div className="absolute inset-0 bg-green-950 opacity-90"></div>

        <div className="max-w-6xl mx-auto text-left px-8 relative z-10">
          
          {/* Enhanced Typography & Hierarchy */}
          <p className="text-sm uppercase tracking-widest text-green-300 mb-2">TRANSFORMING CROP MANAGEMENT</p>
          <h1 className="text-7xl font-extrabold mb-4 tracking-tight leading-tight max-w-4xl">
             Your Crop is Sick? <br /> We'll Find the <span className="text-cyan-400">Medicine</span>
          </h1>
          <p className="text-xl text-green-200 mb-10 max-w-2xl">
            Your autonomous agronomist-in-your-pocket. We don't just diagnose, we deliver the cure.
          </p>
          
          {/* Action Row */}
          <div className="flex space-x-4 mb-10">
                <DelayedLink 
                  to="/login" 
                  className="bg-cyan-500 text-gray-900 font-bold py-3 px-8 rounded-lg text-lg shadow-xl transform transition duration-300 hover:bg-cyan-400 flex items-center justify-center space-x-2"
                  delayMs={500}
                >
                  Start Free Diagnosis
                </DelayedLink>
                <Link
                   to="/#how-it-works"
                   className="bg-white text-gray-900 font-bold py-3 px-8 rounded-lg text-lg shadow-xl border border-gray-300 hover:bg-gray-100 transition flex items-center justify-center"
                >
                  See How It Works →
                </Link>
          </div>
          
          {/* Feature Badges Below CTA */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-12">
            <span className="text-sm font-semibold text-white flex items-center">
                <IconCheckCircleInternal className="h-4 w-4 text-green-400 mr-1" /> Works Offline
            </span>
            <span className="text-sm font-semibold text-white flex items-center">
                <IconCheckCircleInternal className="h-4 w-4 text-green-400 mr-1" /> Speaks Swahili
            </span>
            <span className="text-sm font-semibold text-white flex items-center">
                <IconCheckCircleInternal className="h-4 w-4 text-green-400 mr-1" /> M-Pesa Ready
            </span>
            <span className="text-sm font-semibold text-white flex items-center">
                <IconCheckCircleInternal className="h-4 w-4 text-green-400 mr-1" /> 92% Accuracy
            </span>
          </div>

        </div>
      </header>

      {/* 3 Steps Section (How It Works Anchor) */}
      <section id="how-it-works" className="py-24 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-12">Diagnose in Three Simple Steps</h2>
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 p-8 rounded-xl bg-white shadow-2xl border-l-8 border-green-600">
            
            {/* Diagram/Visual Area */}
            <div className="lg:w-1/2 p-6 bg-white rounded-lg border-b-8 border-amber-500 shadow-xl">
              <img 
                  src={aiAnalysisImage} 
                  alt="AI Analysis Visual" 
                  className="w-full h-auto rounded-md shadow-lg" 
              />
            </div>
            
            {/* Steps Content Area */}
            <div className="lg:w-1/2 space-y-8 text-left">
              <div className="flex items-start space-x-4">
                <span className="text-4xl font-black text-green-600">1.</span>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1 flex items-center space-x-2"><IconUploadInternal className="h-6 w-6 text-green-600" /> <span>Upload & Scan</span></h3>
                  <p className="text-gray-600">Securely upload a clear photo of the tea leaf. Our system automatically pre-processes the image for optimal analysis.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <span className="text-4xl font-black text-green-600">2.</span>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1 flex items-center space-x-2"><IconMicroscope className="h-6 w-6 text-green-600" /> <span>Instant Diagnosis</span></h3>
                  <p className="text-gray-600">Our deep learning model identifies the exact disease and provides a risk confidence score within seconds.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <span className="text-4xl font-black text-green-600">3.</span>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1 flex items-center space-x-2"><IconCheckCircleInternal className="h-6 w-6 text-green-600" /> <span>Action Plan</span></h3>
                  <p className="text-gray-600">Receive specific, tailored advice on treatment, nutrient balance, and prevention measures.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Section: Core Features (Features Anchor) */}
      <section id="features" className="py-24 bg-green-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Core Features Driving Better Yields</h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">Leverage AI for smarter, data-driven decisions on your farm.</p>
            
            {/* Feature Grid */}
            <div className="grid md:grid-cols-3 gap-8 text-left">
                <div id="feature-1" className="p-6 bg-white rounded-xl shadow-xl border-t-4 border-green-600 hover:shadow-2xl transition">
                    <Grid className="w-8 h-8 text-green-600 mb-3" />
                    <h3 className="text-xl font-bold mb-2">Real-time Disease Tracking</h3>
                    <p className="text-gray-600">Identify illnesses like Red Leaf Spot or Anthracnose within seconds of uploading the leaf image.</p>
                </div>
                <div id="feature-2" className="p-6 bg-white rounded-xl shadow-xl border-t-4 border-amber-500 hover:shadow-2xl transition">
                    <IconMicroscope className="w-8 h-8 text-amber-500 mb-3" />
                    <h3 className="text-xl font-bold mb-2">Confidence Scoring</h3>
                    <p className="text-gray-600">Get a clear percentage confidence score to assess risk before applying expensive treatments.</p>
                </div>
                <div id="feature-3" className="p-6 bg-white rounded-xl shadow-xl border-t-4 border-cyan-500 hover:shadow-2xl transition">
                    <IconCheckCircleInternal className="w-8 h-8 text-cyan-500 mb-3" />
                    <h3 className="text-xl font-bold mb-2">Actionable Recommendations</h3>
                    <p className ="text-gray-600">Receive specific, tailored advice on pruning, soil balance, and fungicide application based on the diagnosis.</p>
                </div>
            </div>
        </div>
      </section>

      {/* New Section: Why Us & Contact Anchor */}
      <section id="why-us" className="py-24 bg-green-900 border-b border-green-700">
        <div className="max-w-7xl mx-auto px-4 text-center">
             <h2 className="text-4xl font-extrabold text-white mb-4">Why Choose AgroScan AI?</h2>
             <p className="text-xl text-green-200 mb-12 max-w-3xl mx-auto">We combine deep learning stability with ease of use for the local farmer.</p>
             
             {/* Contact/Call to Action Block */}
             <div className="p-10 bg-green-700 rounded-xl shadow-2xl border-b-2 border-amber-500" id="contact">
                 <h3 className="text-3xl font-bold text-amber-500 mb-4">Ready to Transform Your Farm?</h3>
                 <p className="text-lg text-green-200 mb-6">Contact our support team for specialized regional advice or personalized integration.</p>
                 <Link to="/register" className="inline-block py-3 px-8 bg-cyan-500 text-green-900 font-semibold rounded-lg hover:bg-cyan-400 transition">
                     Join Now
                 </Link>
             </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;