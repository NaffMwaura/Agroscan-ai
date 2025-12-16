import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { LandingPageProps } from '../../types';
import AlertMessage from '../../components/ui/Alertmessage';
import aiAnalysisImage from '../../assets/ai.jpg';
import { IconUploadInternal, IconMicroscope, IconCheckCircleInternal, Grid } from '../../components/ui/Icons';
import DelayedLink from '../../components/ui/DelayedLink';
import teaFarmBg1 from '../../assets/bg-1.jfif';
import teaFarmBg2 from '../../assets/bg-2.jpg';
import teaFarmBg3 from '../../assets/bg-3.jpeg';
import teaFarmBg4 from '../../assets/bg-4.jpg';

/**
 * Custom hook to handle the deleting and retyping effect
 */
const useTypewriter = (text: string, speed = 100, delay = 3000) => {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleType = () => {
      if (!isDeleting) {
        setDisplayText(text.substring(0, displayText.length + 1));
        if (displayText === text) {
          setTimeout(() => setIsDeleting(true), delay);
        }
      } else {
        setDisplayText(text.substring(0, displayText.length - 1));
        if (displayText === '') {
          setIsDeleting(false);
        }
      }
    };

    const timer = setTimeout(handleType, isDeleting ? speed / 2 : speed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, text, speed, delay]);

  return displayText;
};

const LandingPage: React.FC<LandingPageProps> = ({ message, setMessage }) => {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const CYCLE_INTERVAL = 4000;
  const FADE_DURATION = 800;

  const typedSolution = useTypewriter("We'll find the solution", 100, 3000);

  const backgroundImages = useMemo(() => [
    teaFarmBg1,
    teaFarmBg2,
    teaFarmBg3,
    teaFarmBg4,
  ], []);

  useEffect(() => {
    if (message.message) {
      const timer = setTimeout(() => setMessage({ message: null, type: null }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message, setMessage]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
        setIsFading(false);
      }, FADE_DURATION);
    }, CYCLE_INTERVAL);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <div className="min-h-full">
      {message.message && (
        <div className="fixed top-20 right-4 z-50">
          <AlertMessage message={message.message} type={message.type} />
        </div>
      )}

{/* Hero Section: Perfectly Centered & Scale-Adjusted */}
<header className="relative w-full h-screen text-white overflow-hidden bg-gray-900 flex items-center justify-center">
  {/* Background Image Container */}
  <div
    className={`absolute inset-0 transition-opacity duration-[800ms] ease-in-out ${
      isFading ? 'opacity-0' : 'opacity-100'
    }`}
    style={{
      backgroundImage: `url(${backgroundImages[currentBgIndex]})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  ></div>

  {/* Unified Dark Overlay - Increased opacity slightly to help centered text pop */}
  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>

  {/* Content Container: Centered Column Layout */}
  <div className="max-w-5xl mx-auto w-full px-6 relative z-10 text-center">
    
    {/* Headline: Using a more flexible width to prevent vertical 'cutting' */}
    <div className="flex flex-col space-y-4 md:space-y-6">
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15]">
        Do you need prediction <br /> 
        <span className="text-white/90">for your crop?</span> <br /> 
        <span className="text-cyan-400 inline-block min-h-[1.2em]">
          {typedSolution}
          <span className="animate-pulse border-r-4 border-cyan-400 ml-1">&nbsp;</span>
        </span>
      </h1>
      
      {/* Description: Centered with mx-auto */}
      <p className="text-base md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed font-medium">
        Your personal agronomist at your fingertips. We don't just identify issues; 
        we provide actionable solutions through AI-driven insights.
      </p>

      {/* Action Buttons: Centered Row */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <DelayedLink
          to="/login"
          className="w-full sm:w-auto bg-cyan-500 text-gray-900 font-bold py-4 px-10 rounded-xl text-lg shadow-2xl transition-all hover:bg-cyan-400 active:scale-95 flex items-center justify-center"
          delayMs={500}
        >
          Start Diagnosis Today
        </DelayedLink>
        
        <Link
          to="/#"
          className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white font-bold py-4 px-10 rounded-xl text-lg shadow-xl border border-white/30 hover:bg-white/20 transition flex items-center justify-center"
        >
          Explore How It Works →
        </Link>
      </div>

      {/* Trust Badges: Distributed evenly across the bottom of the content area */}
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 pt-10 mt-8 border-t border-white/10">
        {[
          { label: "Works Offline", icon: <IconCheckCircleInternal className="h-4 w-4" /> },
          { label: "Speaks Swahili", icon: <IconCheckCircleInternal className="h-4 w-4" /> },
          { label: "M-Pesa Ready", icon: <IconCheckCircleInternal className="h-4 w-4" /> },
          { label: "92% Accuracy", icon: <IconCheckCircleInternal className="h-4 w-4" /> }
        ].map((item, i) => (
          <div key={i} className="flex items-center space-x-2">
            <span className="text-green-400">{item.icon}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-300">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
</header>

      {/* 3 Steps Section */}
      <section id="how-it-works" className="py-32 bg-green-900 border-b border-green-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center text-white mb-16">Diagnose in Three Simple Steps</h2>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 p-8 rounded-xl bg-green-800/80 shadow-2xl border-l-8 border-amber-500">
            <div className="lg:w-1/2 p-6 bg-green-900 rounded-lg border-b-8 border-amber-500 shadow-xl">
              <img src={aiAnalysisImage} alt="AI Analysis Visual" className="w-full h-auto rounded-md shadow-lg" />
            </div>
            <div className="lg:w-1/2 space-y-8 text-left text-green-100">
              <div className="flex items-start space-x-4">
                <span className="text-4xl font-black text-amber-500">1.</span>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1 flex items-center space-x-2"><IconUploadInternal className="h-6 w-6 text-cyan-400" /> <span>Upload & Scan</span></h3>
                  <p className="text-green-200">Securely upload a clear photo of the tea leaf. Our system automatically pre-processes the image for optimal analysis.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <span className="text-4xl font-black text-amber-500">2.</span>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1 flex items-center space-x-2"><IconMicroscope className="h-6 w-6 text-cyan-400" /> <span>Instant Diagnosis</span></h3>
                  <p className="text-green-200">Our deep learning model identifies the exact disease and provides a risk confidence score within seconds.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <span className="text-4xl font-black text-amber-500">3.</span>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1 flex items-center space-x-2"><IconCheckCircleInternal className="h-6 w-6 text-cyan-400" /> <span>Action Plan</span></h3>
                  <p className="text-green-200">Receive specific, tailored advice on treatment, nutrient balance, and prevention measures.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-32 bg-green-950 border-b border-green-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">Core Features Driving Better Yields</h2>
          <p className="text-xl text-green-200 mb-16 max-w-3xl mx-auto">Leverage AI for smarter, data-driven decisions on your farm.</p>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-6 bg-green-800 rounded-xl shadow-xl border-t-4 border-green-400 hover:shadow-2xl transition text-white">
              <Grid className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="text-xl font-bold mb-2">Real-time Disease Tracking</h3>
              <p className="text-green-200">Identify illnesses like Red Leaf Spot or Anthracnose within seconds of uploading the leaf image.</p>
            </div>
            <div className="p-6 bg-green-800 rounded-xl shadow-xl border-t-4 border-amber-500 hover:shadow-2xl transition text-white">
              <IconMicroscope className="w-8 h-8 text-amber-500 mb-3" />
              <h3 className="text-xl font-bold mb-2">Confidence Scoring</h3>
              <p className="text-green-200">Get a clear percentage confidence score to assess risk before applying expensive treatments.</p>
            </div>
            <div className="p-6 bg-green-800 rounded-xl shadow-xl border-t-4 border-cyan-500 hover:shadow-2xl transition text-white">
              <IconCheckCircleInternal className="w-8 h-8 text-cyan-500 mb-3" />
              <h3 className="text-xl font-bold mb-2">Actionable Recommendations</h3>
              <p className="text-green-200">Receive specific, tailored advice on pruning, soil balance, and fungicide application based on the diagnosis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us & Contact */}
      <section id="why-us" className="py-32 bg-green-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">Why Choose AgroScan AI?</h2>
          <p className="text-xl text-green-200 mb-12 max-w-3xl mx-auto">We combine deep learning stability with ease of use for the local farmer.</p>
          <div className="p-10 bg-green-700 rounded-xl shadow-2xl border-b-2 border-amber-500" id="contact">
            <h3 className="text-3xl font-bold text-amber-500 mb-4">Ready to Transform Your Farm?</h3>
            <p className="text-lg text-green-200 mb-6">Contact our support team for specialized regional advice or personalized integration.</p>
            <Link to="/register" className="inline-block py-3 px-8 bg-amber-500 text-green-900 font-semibold rounded-lg hover:bg-amber-200 transition">
              Join Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;