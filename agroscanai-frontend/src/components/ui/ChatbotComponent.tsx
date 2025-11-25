import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, Search } from 'lucide-react';
import { GEMINI_API_URL, GEMINI_API_KEY } from '../../types';

// --- NEW TYPE DEFINITIONS FOR API RESPONSE ---
interface Source {
    uri: string;
    title: string;
}

interface GroundingAttribution {
    web?: Source;
}

interface GroundingMetadata {
    groundingAttributions?: GroundingAttribution[];
}

interface CandidatePart {
    text: string;
}

interface CandidateContent {
    parts?: CandidatePart[];
}

interface Candidate {
    content?: CandidateContent;
    groundingMetadata?: GroundingMetadata;
}

interface GeminiResponse {
    candidates?: Candidate[];
}
// --- END NEW TYPE DEFINITIONS ---

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  sources?: Array<Source>;
}

const systemPrompt = "You are AgroBot, an expert agricultural advisor specializing in tea crop health, farming techniques, and general agronomy. Provide clear, concise, and helpful answers. Always use Google Search for current information when discussing best practices, market trends, or recent events. Keep responses professional and practical for farmers.";

// Utility function for exponential backoff during API calls
// Payload is still 'any' because the type is complex and defined locally before sending
const fetchWithBackoff = async (url: string, payload: unknown, maxRetries = 5) => {
  let delay = 1000;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Return type is now GeminiResponse
        return await response.json() as GeminiResponse;
      } else if (response.status === 429) {
        // Rate limit error, retry after delay
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      } else {
        // Other non-retriable error
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API failed with status ${response.status}: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};

const ChatbotComponent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([{
    id: 1,
    text: "Hello! I am AgroBot. I can help you with your tea crop questions, pest control, and farming techniques. How can I assist you today?",
    sender: 'ai'
  }]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = useCallback(async (userQuery: string) => {
    if (!userQuery.trim() || isSending) return;

    const newMessage: Message = { id: Date.now(), text: userQuery, sender: 'user' };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsSending(true);

    try {
      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        // Enable Google Search grounding for accurate, real-time farming info
        tools: [{ "google_search": {} }],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
      };
      
      const apiUrl = `${GEMINI_API_URL}${GEMINI_API_KEY ? `?key=${GEMINI_API_KEY}` : ''}`;
      
      // Result is now type-checked as GeminiResponse
      const result = await fetchWithBackoff(apiUrl, payload) as GeminiResponse;

      const candidate = result.candidates?.[0];
      const aiResponseText = candidate?.content?.parts?.[0]?.text || "Sorry, I encountered an issue generating a response.";
      
      // Extract grounding sources
      let sources: Source[] = [];
      const groundingMetadata = candidate?.groundingMetadata;
      
      if (groundingMetadata && groundingMetadata.groundingAttributions) {
          sources = groundingMetadata.groundingAttributions
              // FIX: Attr is now explicitly GroundingAttribution type
              .map((attr: GroundingAttribution) => ({ 
                  uri: attr.web?.uri || '',
                  title: attr.web?.title || '',
              }))
              .filter(source => source.uri && source.title); // FIX: source is now type Source
      }

      const aiMessage: Message = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'ai',
        sources: sources,
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("Gemini API Error:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "I am currently unable to connect to the AI model. Please try again later.",
        sender: 'ai',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  }, [isSending]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage(input);
    }
  };

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.sender === 'user';
    const bubbleClass = isUser 
      ? "bg-green-600 text-white self-end rounded-br-none" 
      : "bg-gray-100 text-gray-800 self-start rounded-tl-none";

    return (
      <div className={`flex flex-col max-w-xs sm:max-w-md p-3 my-2 rounded-xl shadow-md ${bubbleClass}`}>
        <p>{message.text}</p>
        
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-opacity-20 border-current text-xs text-opacity-80">
            <h4 className="font-semibold mb-1 flex items-center">
                <Search className="h-3 w-3 mr-1" /> Sources:
            </h4>
            <ul className="space-y-1">
              {message.sources.slice(0, 3).map((source, index) => (
                <li key={index} className="truncate">
                  <a href={source.uri} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl">
        {/* Chat Header */}
        <div className="p-4 bg-green-700 text-white rounded-t-2xl flex items-center space-x-3">
            <Bot className="w-6 h-6 text-amber-300" />
            <h3 className="text-xl font-bold">AgroBot AI Assistant</h3>
        </div>

        {/* Message Area */}
        <div className="flex-grow p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 350px)' }}>
            {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isSending ? "Waiting for response..." : "Ask a question about your crops..."}
                    className="flex-grow p-3 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-inner"
                    disabled={isSending}
                />
                <button
                    onClick={() => handleSendMessage(input)}
                    disabled={!input.trim() || isSending}
                    className={`p-3 rounded-xl text-white font-semibold transition-all duration-300 shadow-md ${
                        !input.trim() || isSending ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                    {isSending ? <Loader2 className="animate-spin h-6 w-6" /> : <Send className="h-6 w-6" />}
                </button>
            </div>
        </div>
    </div>
  );
};

export default ChatbotComponent;