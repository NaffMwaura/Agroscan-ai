import React, { useState } from 'react';
import {  X,  Phone, Bot } from 'lucide-react'; 
import { Link } from 'react-router-dom';
import ChatbotComponent from './ChatbotComponent';

interface ChatWidgetProps {
    userToken: string | null;
    userId: string | null;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ userToken, userId }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const isAuthenticated = !!userToken && !!userId;
    const LOGIN_URL = "/login"; 

    const renderChatContent = () => {
        if (!isAuthenticated) {
            return (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center min-h-[350px]">
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
        return <ChatbotComponent />;
    };

    return (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
            {/* Chat Modal Window - MOBILE RESPONSIVE UPDATES */}
            {isOpen && (
                <div 
                    className="absolute bottom-20 right-0 w-[calc(100vw-2rem)] sm:w-96 h-[70vh] max-h-[600px] min-h-[400px] 
                               bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col
                               animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                    <div className="flex items-center justify-between p-4 bg-green-700 text-white rounded-t-2xl shrink-0">
                        <div className="flex items-center space-x-2">
                            <Bot className="h-6 w-6" />
                            <h3 className="text-lg font-semibold">AgroBot Assistant</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10 p-1 rounded-lg transition-colors" aria-label="Close chat">
                           <X className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="flex-grow overflow-hidden flex flex-col">
                        {renderChatContent()}
                    </div>
                </div>
            )}

            {/* Floating Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center text-white font-bold 
                            p-4 md:p-5 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.3)] 
                            transition-all duration-300 transform hover:scale-110 active:scale-95 z-50
                            ${isOpen ? 'bg-red-500' : 'bg-green-500 hover:bg-green-600'}`}
                aria-label="Toggle chat widget"
            >
                {isOpen ? (
                    <X className="h-7 w-7 md:h-8 md:w-8" />
                ) : (
                    <div className="flex items-center space-x-3 px-1">
                        <Phone className="h-6 w-6 md:h-7 md:w-7 fill-current" />
                        <span className="text-lg hidden md:block">Chat with us</span>
                    </div>
                )}
                
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20 -z-10"></span>
                )}
            </button>
        </div>
    );
};

export default ChatWidget;