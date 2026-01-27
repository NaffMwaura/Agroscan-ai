import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { LandingPageProps } from '../../types';
import AlertMessage from '../../components/ui/Alertmessage';
import aiAnalysisImage from '../../assets/ai.jpg';
import { IconUploadInternal, IconMicroscope, IconCheckCircleInternal, Grid } from '../../components/ui/Icons';
import DelayedLink from '../../components/ui/DelayedLink';
import teaFarmBg1 from '../../assets/bg-1.jpg';
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

  const CYCLE_INTERVAL = 5000; // Increased slightly for better viewing

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
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, CYCLE_INTERVAL);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <div className="min-h-full font-sans">
      {message.message && (
        <div className="fixed top-20 right-4 z-50">
          <AlertMessage message={message.message} type={message.type} />
        </div>
      )}

      {/* Hero Section: Enhanced for Image Clarity & Smooth Transitions */}
      <header className="relative w-full h-screen text-white overflow-hidden bg-black flex items-center justify-center">
        
        {/* Background Image Layers for True Crossfade */}
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out transform ${
              index === currentBgIndex ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
            }`}
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transitionProperty: 'opacity, transform',
              // Ken Burns Effect: Very slow zoom when active
              transitionDuration: index === currentBgIndex ? '10000ms' : '1000ms',
            }}
          ></div>
        ))}

        {/* Enhanced Dynamic Overlay: Clearer center with vignetted edges for focus */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70"></div>
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Content Container: Centered Column Layout */}
        <div className="max-w-5xl mx-auto w-full px-6 relative z-10 text-center">
          
          {/* Headline */}
          <div className="flex flex-col space-y-4 md:space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] drop-shadow-2xl">
              Do you need prediction <br /> 
              <span className="text-white/95">for your crop?</span> <br /> 
              <span className="text-cyan-400 inline-block min-h-[1.2em]">
                {typedSolution}
                <span className="animate-pulse border-r-4 border-cyan-400 ml-1">&nbsp;</span>
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-base md:text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed font-semibold drop-shadow-md">
              Your personal agronomist at your fingertips. We don't just identify issues; 
              we provide actionable solutions through AI-driven insights.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <DelayedLink
                to="/login"
                className="w-full sm:w-auto bg-cyan-500 text-gray-900 font-black py-4 px-10 rounded-2xl text-lg shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] transition-all hover:bg-cyan-400 hover:scale-105 active:scale-95 flex items-center justify-center"
                delayMs={500}
              >
                Start Diagnosis Today
              </DelayedLink>
              
              <Link
                to="/#how-it-works"
                className="w-full sm:w-auto bg-white/10 backdrop-blur-xl text-white font-bold py-4 px-10 rounded-2xl text-lg shadow-xl border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center"
              >
                Explore How It Works →
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 pt-10 mt-10 border-t border-white/20">
              {[
                { label: "Works Offline", icon: <IconCheckCircleInternal className="h-4 w-4" /> },
                { label: "Speaks Swahili", icon: <IconCheckCircleInternal className="h-4 w-4" /> },
                { label: "M-Pesa Ready", icon: <IconCheckCircleInternal className="h-4 w-4" /> },
                { label: "92% Accuracy", icon: <IconCheckCircleInternal className="h-4 w-4" /> }
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <span className="text-green-400">{item.icon}</span>
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
           <div className="w-1 h-12 bg-gradient-to-b from-cyan-500 to-transparent rounded-full"></div>
        </div>
      </header>

      {/* 3 Steps Section */}
      <section id="how-it-works" className="py-32 bg-green-900 border-b border-green-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center text-white mb-16">Diagnose in Three Simple Steps</h2>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 p-8 rounded-3xl bg-green-800/80 shadow-2xl border-l-8 border-amber-500">
            <div className="lg:w-1/2 p-6 bg-green-900 rounded-2xl border-b-8 border-amber-500 shadow-xl overflow-hidden">
              <img src={aiAnalysisImage} alt="AI Analysis Visual" className="w-full h-auto rounded-xl shadow-lg hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="lg:w-1/2 space-y-8 text-left text-green-100">
              <div className="flex items-start space-x-6 group">
                <span className="text-5xl font-black text-amber-500 transition-transform group-hover:scale-110">1.</span>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1 flex items-center space-x-2"><IconUploadInternal className="h-6 w-6 text-cyan-400" /> <span>Upload & Scan</span></h3>
                  <p className="text-green-200 leading-relaxed">Securely upload a clear photo of the tea leaf. Our system automatically pre-processes the image for optimal analysis.</p>
                </div>
              </div>
              <div className="flex items-start space-x-6 group">
                <span className="text-5xl font-black text-amber-500 transition-transform group-hover:scale-110">2.</span>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1 flex items-center space-x-2"><IconMicroscope className="h-6 w-6 text-cyan-400" /> <span>Instant Diagnosis</span></h3>
                  <p className="text-green-200 leading-relaxed">Our deep learning model identifies the exact disease and provides a risk confidence score within seconds.</p>
                </div>
              </div>
              <div className="flex items-start space-x-6 group">
                <span className="text-5xl font-black text-amber-500 transition-transform group-hover:scale-110">3.</span>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1 flex items-center space-x-2"><IconCheckCircleInternal className="h-6 w-6 text-cyan-400" /> <span>Action Plan</span></h3>
                  <p className="text-green-200 leading-relaxed">Receive specific, tailored advice on treatment, nutrient balance, and prevention measures.</p>
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
            <div className="p-8 bg-green-800 rounded-2xl shadow-xl border-t-4 border-green-400 hover:shadow-2xl hover:-translate-y-2 transition-all text-white">
              <Grid className="w-10 h-10 text-green-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Real-time Disease Tracking</h3>
              <p className="text-green-200 leading-relaxed text-sm">Identify illnesses like Red Leaf Spot or Anthracnose within seconds of uploading the leaf image.</p>
            </div>
            <div className="p-8 bg-green-800 rounded-2xl shadow-xl border-t-4 border-amber-500 hover:shadow-2xl hover:-translate-y-2 transition-all text-white">
              <IconMicroscope className="w-10 h-10 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold mb-3">Confidence Scoring</h3>
              <p className="text-green-200 leading-relaxed text-sm">Get a clear percentage confidence score to assess risk before applying expensive treatments.</p>
            </div>
            <div className="p-8 bg-green-800 rounded-2xl shadow-xl border-t-4 border-cyan-500 hover:shadow-2xl hover:-translate-y-2 transition-all text-white">
              <IconCheckCircleInternal className="w-10 h-10 text-cyan-500 mb-4" />
              <h3 className="text-xl font-bold mb-3">Actionable Recommendations</h3>
              <p className="text-green-200 leading-relaxed text-sm">Receive specific, tailored advice on pruning, soil balance, and fungicide application based on the diagnosis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us & Contact */}
      <section id="why-us" className="py-32 bg-green-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">Why Choose AgroScan AI?</h2>
          <p className="text-xl text-green-200 mb-12 max-w-3xl mx-auto">We combine deep learning stability with ease of use for the local farmer.</p>
          <div className="p-12 bg-green-700 rounded-[3rem] shadow-2xl border-b-4 border-amber-500 relative overflow-hidden" id="contact">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full"></div>
            <h3 className="text-4xl font-black text-white mb-4">Ready to Transform Your Farm?</h3>
            <p className="text-lg text-green-100 mb-8 max-w-xl mx-auto font-medium">Contact our support team for specialized regional advice or personalized integration.</p>
            <Link to="/register" className="inline-block py-4 px-12 bg-amber-500 text-green-900 font-black rounded-2xl hover:bg-amber-400 hover:scale-105 transition-all shadow-xl">
              Join Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;