import React, { useState } from 'react';

// --- 1. ICONOS SVG INTERNOS ---
const IconLeaf: React.FC<{ className: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17 8c-2 0-2.486 3.036-3.804 5.344-1.353 2.37-3.238 4.793-5.592 5.094C5.08 18.73 3 17.5 3 17.5c1.474-3.565 4.54-6.387 7.022-8.085C12.446 8.784 15 8 17 8zM20.5 3.5c-2.348 0-4.48 1.146-6.07 2.923C13.68 6.48 13.5 6.77 13.5 7c0 .543.457 1 1 1h.5c.348 0 .685-.18.868-.492 1.258-2.16 3.25-3.008 4.598-3.008.064 0 .114.004.16.012.08-.106.14-.236.14-.408 0-.39-.18-.75-.48-.962C20.54 3.52 20.52 3.5 20.5 3.5zM22 6.5c-.82 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.68-1.5-1.5-1.5z"/></svg>);
const IconArrowRight: React.FC<{ className: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L15.17 11H4v2h11.17l-4.58 4.59L12 20l7-7-7-7z"/></svg>);
const IconSignInAlt: React.FC<{ className: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 7L9.6 8.4l2.6 2.6H4v2h8.2l-2.6 2.6L11 17l5-5-5-5zm9 8c0 1.66-1.34 3-3 3h-4v-2h4c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1h-4V7h4c1.66 0 3 1.34 3 3v5z"/></svg>);
const IconMicroscope: React.FC<{ className: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.3 16 10c0-3.31-2.69-6-6-6S4 6.69 4 10s2.69 6 6 6c1.3 0 2.59-.59 3.53-1.38l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zM11 7H9v2H7v2h2v2h2v-2h2V9h-2z"/></svg>);
const IconShield: React.FC<{ className: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.1-3.23 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>);
const IconMail: React.FC<{ className: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>);
const IconLocation: React.FC<{ className: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>);
const IconUpload: React.FC<{ className: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>);
const IconCheckCircle: React.FC<{ className: string }> = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>);


// --- 2. TYPE DEFINITIONS & NAVIGATION ---

type Page = 'landing' | 'auth_placeholder';

// --- 3. MAIN APP COMPONENT (Core Logic and State Container) ---

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('landing');
    
    const diseaseCategories = [
        "Algal Leaf", "Anthracnose", "Bird Eye Spot", 
        "Brown Blight", "Gray Light", "Red Leaf Spot", 
        "White Spot", "Healthy", "Other Non-Tea Leaf"
    ];

    const renderPage = () => {
        switch (currentPage) {
            case 'landing':
                return <LandingPage 
                            setCurrentPage={setCurrentPage} 
                            diseaseCategories={diseaseCategories}
                        />;
            case 'auth_placeholder':
                return <AuthPlaceholder />;
            default:
                return <LandingPage 
                            setCurrentPage={setCurrentPage}
                            diseaseCategories={diseaseCategories}
                        />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-green-900">
            <Navbar setCurrentPage={setCurrentPage} />
            <main className="flex-grow"> 
                {renderPage()} 
            </main>
            <Footer setCurrentPage={setCurrentPage} />
        </div>
    );
};
export default App;


// --- 4. NAVIGATION COMPONENTS ---

interface NavbarProps { 
    setCurrentPage: (page: Page) => void; 
}
const Navbar: React.FC<NavbarProps> = ({ setCurrentPage }) => {
    
    return (
        <nav className="bg-green-800 p-4 shadow-lg fixed top-0 left-0 right-0 z-10">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="text-white text-2xl font-extrabold flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentPage('landing')}>
                    <IconLeaf className="text-amber-500 h-6 w-6" />
                    <span>AgroScan AI</span>
                </div>
                <button 
                    onClick={() => setCurrentPage('auth_placeholder')}
                    className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-green-900 hover:bg-amber-400 font-bold rounded-lg shadow-md transition-colors duration-200"
                >
                    <IconSignInAlt className="h-5 w-5" />
                    <span>Get Started</span>
                </button>
            </div>
        </nav>
    );
};

// --- 5. FOOTER COMPONENT ---

const Footer: React.FC<NavbarProps> = ({ setCurrentPage }) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-green-800 text-green-200 py-10 border-t border-green-700">
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
                            {/* In a real app, these would be <a href="#"> or Router Links */}
                            <button onClick={() => setCurrentPage('landing')} className="hover:text-amber-500 transition-colors">Home</button>
                        </li>
                        <li>
                            <button onClick={() => setCurrentPage('auth_placeholder')} className="hover:text-amber-500 transition-colors">Features</button>
                        </li>
                        <li>
                            <button onClick={() => setCurrentPage('auth_placeholder')} className="hover:text-amber-500 transition-colors">Pricing</button>
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
                            <IconMail className="h-4 w-4 text-amber-500" />
                            <span>support@agroscan.ai</span>
                        </p>
                        <p className="flex items-start space-x-2">
                            <IconLocation className="h-4 w-4 text-amber-500 mt-1" />
                            <span>Global Headquarters, AgTech Innovation Hub</span>
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Copyright Bar */}
            <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-green-700 text-center text-sm text-green-400">
                &copy; {currentYear} AgroScan AI. All rights reserved.
            </div>
        </footer>
    );
};


// --- 6. PAGE COMPONENTS ---

interface LandingPageProps { 
    setCurrentPage: (page: Page) => void; 
    diseaseCategories: string[];
}
// Simulates src/pages/LandingPage.jsx
const LandingPage: React.FC<LandingPageProps> = ({ setCurrentPage, diseaseCategories }) => (
    <div className="min-h-full">
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
                    onClick={() => setCurrentPage('auth_placeholder')}
                    className="bg-amber-500 text-green-900 font-bold py-3 px-8 rounded-full text-lg shadow-xl transform transition duration-300 hover:bg-amber-400 hover:scale-105 flex items-center justify-center mx-auto space-x-2"
                >
                    <span>Start Your Scan Journey</span> <IconArrowRight className="h-5 w-5" />
                </button>
            </div>
        </header>

        {/* --- SECTION: HOW IT WORKS WITH IMAGES (Corrected) --- */}
        <section className="py-20 bg-green-900">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-4xl font-extrabold text-center text-white mb-12">
                    Diagnose in Three Simple Steps
                </h2>
                
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 p-8 rounded-xl bg-green-800/50 border border-green-700">
                    
                    {/* LEFT SIDE: Image Example */}
                    <div className="lg:w-1/2 p-6 bg-white rounded-lg shadow-2xl border-b-8 border-amber-500">
                        
                        {/* IMPORTANT: Using the direct reference to the uploaded image.
                            The unique ID is 'uploaded:image_1b6f9f.jpg-78a65d95-9dd6-41ae-90a3-f136a246df60'
                        */}
                        <img 
                            src="uploaded:image_1b6f9f.jpg-78a65d95-9dd6-41ae-90a3-f136a246df60" 
                            alt="A seedling with a transparent holographic AI overlay showing real-time environmental data and plant health metrics." 
                            className="w-full h-auto rounded-md shadow-lg"
                            // Fallback in case image fails to load
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
                                    <IconUpload className="h-6 w-6 text-green-300" /> 
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
                                    <IconCheckCircle className="h-6 w-6 text-green-300" />
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
                        <div key={index} className="p-4 bg-white rounded-lg shadow-xl flex items-center space-x-3 border-l-4 border-amber-500 transition hover:shadow-2xl">
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


// Simulates the page we will build next
const AuthPlaceholder: React.FC = () => (
    <div className="min-h-screen pt-20 bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl border-t-8 border-green-600 text-center">
            <IconSignInAlt className="h-12 w-12 text-green-700 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-green-800 mb-4">Secure Access Required</h2>
            <p className="text-gray-600 mb-6">
                This is where the **Login** and **Registration** forms will be implemented to secure the dashboard.
            </p>
            <p className="text-sm text-gray-500 italic">
                We will integrate the authentication logic connecting to your PostgreSQL backend here in the next step!
            </p>
        </div>
    </div>
);
