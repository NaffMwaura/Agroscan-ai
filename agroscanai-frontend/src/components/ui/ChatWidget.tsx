import React, { useState } from 'react';
import { Bot, LogOut } from 'lucide-react';
import ChatbotComponent from './ChatbotComponent';
import { Link } from 'react-router-dom';
//import type  { Page } from '../../types';

interface ChatWidgetProps {
    userToken: string | null;
    userId: string | null;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ userToken, userId }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Check if the user is authenticated
    const isAuthenticated = !!userToken && !!userId;

    // Fixed path for login redirection (Using Netlify URL as requested)
    const LOGIN_URL = "/login"; // Use internal route for React Router

    // --- Content Renderers ---
    const renderChatContent = () => {
        if (!isAuthenticated) {
            // Display login prompt if not authenticated
            return (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center" style={{ minHeight: '350px' }}>
                    <Bot className="w-12 h-12 text-green-600 mb-4" />
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
        // NOTE: ChatbotComponent must be designed to fill height (h-full)
        return <ChatbotComponent />;
    };

    return (
        // FIX: High z-index (z-50) and fixed positioning ensures visibility
        <div className="fixed bottom-4 right-4 z-50">
            {/* Chat Modal (Second Image Style) */}
            {isOpen && (
                <div 
                    className="absolute bottom-20 right-0 w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden 
                               border border-gray-200 flex flex-col"
                    style={{ height: '500px', width: '350px' }} // Fixed dimensions for the chat window
                >
                    {renderChatContent()}
                </div>
            )}

            {/* Floating Button (First Image Style) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-full shadow-xl transition-transform duration-300 transform hover:scale-110 
                            flex items-center justify-center text-white 
                            ${isOpen ? 'bg-red-500' : 'bg-green-600 hover:bg-green-700 floating-icon'} z-50`}
            >
                {isOpen ? (
                    <LogOut className="w-7 h-7" />
                ) : (
                    <Bot className="w-7 h-7" />
                )}
            </button>
        </div>
    );
};

export default ChatWidget;