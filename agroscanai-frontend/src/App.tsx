
import bgImage from "../src/assets/image.png";

import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";

// Define custom Tailwind colors for consistency, assuming these are set in tailwind.config.js
// If you don't have these in your tailwind.config.js, please add them:
/*
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        darkPurple: '#1a1421', // Example dark purple
        lightPurple: '#a084dc', // Example light purple
        // Add other custom colors if needed
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Assuming Inter font
      }
    },
  },
  plugins: [],
}
*/

// --- Component: LandingPage ---
const LandingPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24">
        <motion.h2
          className="text-4xl md:text-6xl font-bold mb-6 text-black"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Diagnose Plant Diseases Instantly
        </motion.h2>
        <motion.p
          className="text-lg text-gray-900 max-w-2xl mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
        >
          Upload a photo of your tea plant, and AgroScan AI will tell you what's
          wrong — instantly and accurately.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="flex space-x-4"
        >
          <button
            onClick={() => onNavigate("auth")}
            className="bg-emerald-700 text-darkPurple font-bold py-3 px-8 rounded-full text-lg hover:bg-opacity-80 transition-all duration-300 shadow-lg"
          >
            Get Started
          </button>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section
  className="px-6 py-16 rounded-2xl my-12 bg-cover bg-center bg-no-repeat"
  style={{
            backgroundImage: `url(${bgImage})`, 

}}
>
  <h3 className="text-3xl font-bold text-center mb-17 text-black">
    How It Works
  </h3>
  <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto text-center">
    {[
      {
        title: "1. Upload",
        desc: "Take a clear photo of your plant leaf and upload it.",
      },
      {
        title: "2. Analyze",
        desc: "Our AI model scans the image and detects diseases instantly.",
      },
      {
        title: "3. Get Help",
        desc: "Receive diagnosis, treatment suggestions, and care tips.",
      },
    ].map(({ title, desc }, idx) => (
      <motion.div
        key={idx}
        className="bg-[#33360b] rounded-2xl p-6 shadow-lg border border-lightPurple/20"
        whileHover={{ scale: 1.05 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.2, duration: 0.8 }}
      >
        <h4 className="text-xl font-bold mb-2 text-lightPurple">{title}</h4>
        <p className="text-sm text-gray-300">{desc}</p>
      </motion.div>
    ))}
  </div>
</section>
    </>
  );
};

// --- Component: AuthPage ---
const AuthPage: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false); // State to toggle between login/signup

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (isSigningUp) {
      // Conceptual signup logic for demo
      // In a real app, this would involve a fetch POST to a /signup endpoint
      if (username && password) {
        // Simulate successful signup
        alert("Sign up successful! Please log in.");
        setIsSigningUp(false); // Switch back to login after conceptual signup
        setUsername("");
        setPassword("");
      } else {
        setAuthError("Please provide a username and password for signup.");
      }
    } else {
      // Conceptual login logic for demo
      // In a real app, this would involve a fetch POST to a /login endpoint
      if (username === "farmer" && password === "password") {
        onLoginSuccess();
      } else {
        setAuthError("Invalid username or password.");
      }
    }
  };

  return (
    <section className="px-6 py-16 bg-[#2c2442] rounded-2xl max-w-md mx-auto my-12 shadow-xl">
      <h3 className="text-3xl font-semibold text-center mb-8 text-lightPurple">
        {isSigningUp ? "Sign Up for AgroScan AI" : "Login to AgroScan AI"}
      </h3>
      <form onSubmit={handleAuth} className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-3 rounded-lg bg-[#33360b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lightPurple"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 rounded-lg bg-[#33360b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lightPurple"
          required
        />
        {authError && (
          <p className="text-red-400 text-sm text-center">{authError}</p>
        )}
        <motion.button
          type="submit"
          className="bg-lightPurple text-darkPurple font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-all duration-300 shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isSigningUp ? "Sign Up" : "Login"}
        </motion.button>
      </form>
      <p className="text-center text-gray-400 mt-4">
        {isSigningUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <span
          className="text-lightPurple cursor-pointer hover:underline"
          onClick={() => setIsSigningUp(!isSigningUp)}
        >
          {isSigningUp ? "Login here" : "Sign Up here"}
        </span>
      </p>
    </section>
  );
};

// --- Component: DiseaseDetector ---
const DiseaseDetector: React.FC<{
  onLogout: () => void;
}> = ({ onLogout }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{
    disease: string;
    confidence: number;
    suggestions: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [predictionError, setPredictionError] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setPrediction(null);
      setPredictionError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setPredictionError("Please select an image first.");
      return;
    }

    setLoading(true);
    setPredictionError("");
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Prediction failed.");
      }

      const data = await response.json();
      console.log("Backend Prediction Response:", data); // <-- ADDED THIS LINE FOR DEBUGGING
      setPrediction({
        disease: data.disease || "N/A", // <-- ADDED FALLBACK FOR DISEASE NAME
        confidence: parseFloat(data.confidence.toFixed(2)),
        suggestions: data.suggestions,
      });
    } catch (error: unknown) {
      console.error("Error during prediction:", error);
      if (error instanceof Error) {
        setPredictionError(error.message || "An unexpected error occurred.");
      } else {
        setPredictionError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-6 py-16 bg-[#2c2442] rounded-2xl max-w-3xl mx-auto my-12 shadow-xl relative"> {/* Added relative for positioning logout button */}
      <h3 className="text-3xl font-semibold text-center mb-8 text-lightPurple">
        Tea Leaf Disease Detector
      </h3>
      {/* Logout button within DiseaseDetector */}
      <motion.button
        onClick={onLogout}
        className="absolute top-4 right-4 bg-lightPurple text-darkPurple font-bold py-2 px-4 rounded-lg text-sm hover:bg-opacity-80 transition-all duration-300 shadow-md"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Logout
      </motion.button>

      <div className="flex flex-col items-center space-y-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-300
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-lightPurple file:text-darkPurple
                     hover:file:bg-opacity-80 transition-all duration-300 cursor-pointer"
        />

        {imagePreview && (
          <motion.div
            className="w-full max-w-sm rounded-lg overflow-hidden border-2 border-lightPurple shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={imagePreview}
              alt="Selected Leaf Preview"
              className="w-full h-auto object-cover"
            />
          </motion.div>
        )}

        <motion.button
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          className={`py-3 px-8 rounded-full font-bold text-lg transition-all duration-300 shadow-lg
                      ${
                        !selectedFile || loading
                          ? "bg-gray-500 cursor-not-allowed"
                          : "bg-lightPurple text-darkPurple hover:bg-opacity-80"
                      }`}
          whileHover={{ scale: !selectedFile || loading ? 1 : 1.05 }}
          whileTap={{ scale: !selectedFile || loading ? 1 : 0.95 }}
        >
          {loading ? "Analyzing..." : "Diagnose Leaf"}
        </motion.button>

        {predictionError && (
          <p className="text-red-400 text-center text-md">
            Error: {predictionError}
          </p>
        )}

        {prediction && (
          <motion.div
            className="bg-[#33360b] rounded-2xl p-6 shadow-xl w-full max-w-lg text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h4 className="text-2xl font-bold mb-3 text-lightPurple">
              Diagnosis Result:
            </h4>
            <p className="text-lg mb-2">
              <span className="font-semibold">Disease:</span>{" "}
              {prediction.disease}
            </p>
            <p className="text-lg mb-4">
              <span className="font-semibold">Confidence:</span>{" "}
              {(prediction.confidence * 100).toFixed(2)}%
            </p>
            <h5 className="text-xl font-bold mb-2 text-lightPurple">
              Recommendations:
            </h5>
            <p className="text-gray-300 whitespace-pre-line">
              {prediction.suggestions}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

// --- Main App Component ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("landing"); // 'landing', 'auth', 'detector'

  // Effect to navigate to detector if already logged in (e.g., after a refresh if using real auth)
  useEffect(() => {
    if (isLoggedIn && currentPage === "auth") {
      setCurrentPage("detector");
    }
  }, [isLoggedIn, currentPage]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentPage("detector");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage("landing"); // Go back to landing page on logout
  };

  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return <LandingPage onNavigate={setCurrentPage} />;
      case "auth":
        return <AuthPage onLoginSuccess={handleLoginSuccess} />;
      case "detector":
        return <DiseaseDetector onLogout={handleLogout} />;
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen font-sans bg-fuchsia-700 text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 bg-opacity-30 backdrop-blur-md sticky top-0 z-10 rounded-b-xl shadow-lg">
        <h1
          className="text-2xl font-bold text-lightPurple cursor-pointer"
          onClick={() => setCurrentPage("landing")}
        >
          AgroScan AI
        </h1>
        <ul className="flex space-x-6">
          <li
            className="hover:text-lightPurple cursor-pointer transition-colors duration-300"
            onClick={() => setCurrentPage("landing")}
          >
            Home
          </li>
          <li
            className="hover:text-lightPurple cursor-pointer transition-colors duration-300"
            onClick={() => setCurrentPage("landing")} // How it works is on landing
          >
            How it works
          </li>
          <li className="hover:text-lightPurple cursor-pointer transition-colors duration-300">
            Contact
          </li>
          {!isLoggedIn && (
            <li
              className="hover:text-lightPurple cursor-pointer transition-colors duration-300"
              onClick={() => setCurrentPage("auth")}
            >
              Login/Signup
            </li>
          )}
          {isLoggedIn && (
            <li
              className="hover:text-lightPurple cursor-pointer transition-colors duration-300"
              onClick={() => setCurrentPage("detector")}
            >
              Detector
            </li>
          )}
          {isLoggedIn && (
            <li
              className="hover:text-lightPurple cursor-pointer transition-colors duration-300"
              onClick={handleLogout}
            >
              Logout
            </li>
          )}
        </ul>
      </nav>

      {/* Render the current page component */}
      {renderPage()}

      {/* Footer */}
      <footer className="px-6 py-8 bg-opacity-30 backdrop-blur-md text-center text-gray-400 rounded-t-xl shadow-lg mt-auto">
        <p>&copy; {new Date().getFullYear()} AgroScan AI. All rights reserved.</p>
        <p className="text-sm mt-2">
          Developed for smallholder farmers in Kiambu County.
        </p>
      </footer>
    </div>
  );
}
