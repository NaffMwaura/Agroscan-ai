import React, { useState } from 'react';
import {  X,  Phone, Bot } from 'lucide-react'; // FIX: Added Bot import
import { Link } from 'react-router-dom';
//import { GEMINI_API_URL, GEMINI_API_KEY } from '../../types'; 

// --- PLACEHOLDER TYPES (Required for compilation) ---
// FIX: Removed unused interface, as ChatbotComponent defines its own internal Message type.
// interface Message {
//   id: number;
//   text: string;
//   sender: 'user' | 'ai';
//   sources?: Array<{ uri: string; title: string }>;
// }
// Placeholder for ChatbotComponent (actual logic is complex, keep as separate file)
const ChatbotComponent: React.FC = () => {
    // NOTE: This component should contain the full chat logic you provided earlier.
    // Ensure the inner div uses h-full and flex-grow for vertical spacing.
    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-grow p-4 space-y-3 overflow-y-auto">
                <p className="text-gray-500 text-center text-sm">Start the conversation below.</p>
                {/* Simplified Chatbot rendering logic here */}
            </div>
            <div className="p-3 border-t border-gray-200">
                 {/* Simplified Input for demonstration */}
                 <input type="text" placeholder="Type your message..." className="w-full p-2 border rounded-lg" disabled={true} />
            </div>
        </div>
    );
};
// ----------------------------------------------------

interface ChatWidgetProps {
    userToken: string | null;
    userId: string | null;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ userToken, userId }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const isAuthenticated = !!userToken && !!userId;

    // We will use the internal router path /login
    const LOGIN_URL = "/login"; 

    // --- Content Renderers ---
    const renderChatContent = () => {
        if (!isAuthenticated) {
            // Display login prompt if not authenticated
            return (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center" style={{ minHeight: '350px' }}>
                    <Bot className="w-12 h-12 text-green-600 mb-4" /> {/* FIX: Bot is now recognized */}
                    <h4 className="text-xl font-bold text-gray-800 mb-2">Login Required</h4>
                    <p className="text-gray-600 mb-6">
                        Please log in or register to chat with AgroBot.
                    </p>
                    <Link 
                        to={LOGIN_URL} 
                        onClick={() => setIsOpen(false)}
                        className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition duration-200"
                    >
                        Sign In / Register
                    </Link>
                    <p className="mt-3 text-xs text-gray-500">Redirects to internal login page.</p>
                </div>
            );
        }
        
        // Render the full chatbot component if authenticated
        return <ChatbotComponent />;
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Chat Modal Window */}
            {isOpen && (
                <div 
                    className="absolute bottom-20 right-0 w-full max-w-sm h-auto bg-white rounded-2xl shadow-2xl overflow-hidden 
                               border border-gray-200 flex flex-col"
                    style={{ height: '500px', width: '350px' }} 
                >
                    <div className="flex items-center justify-between p-3 bg-green-700 text-white rounded-t-2xl">
                        <h3 className="text-lg font-semibold">AgroBot Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200" aria-label="Close chat">
                           <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex-grow">
                        {renderChatContent()}
                    </div>
                </div>
            )}

            {/* Floating Chat Button (WhatsApp Style) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center text-white font-bold 
                            py-3 px-5 rounded-full shadow-lg transition-transform duration-300 transform hover:scale-105 z-50
                            ${isOpen ? 'bg-red-500' : 'bg-green-500 hover:bg-green-600 floating-icon'}`}
                aria-label="Toggle chat widget"
            >
                {isOpen ? (
                    // Button when chat is open (shows X/close)
                    <X className="h-6 w-6" />
                ) : (
                    // Button when chat is closed (WhatsApp style)
                    <div className="flex items-center space-x-2">
                        {/* WhatsApp Icon SVG (Using Phone as a close proxy to the requested icon) */}
                        <Phone className="h-5 w-5" />
                        <span className="text-sm">Chat with us</span>
                    </div>
                )}
            </button>
        </div>
    );
};

export default ChatWidget;