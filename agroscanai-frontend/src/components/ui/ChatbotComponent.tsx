import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Loader2, Search,} from 'lucide-react';
import { GEMINI_API_URL, GEMINI_API_KEY } from '../../types';

// --- TYPE DEFINITIONS (omitted for brevity) ---
interface Source { uri: string; title: string; }
interface GroundingAttribution { web?: Source; }
interface GroundingMetadata { groundingAttributions?: GroundingAttribution[]; }
interface CandidatePart { text: string; }
interface CandidateContent { parts?: CandidatePart[]; }
interface Candidate { content?: CandidateContent; groundingMetadata?: GroundingMetadata; }
interface GeminiResponse { candidates?: Candidate[]; }
interface Message { id: number; text: string; sender: 'user' | 'ai' | 'system'; sources?: Array<Source>; isTyping?: boolean; } // ADDED isTyping
// --- END TYPE DEFINITIONS ---


const systemPrompt = `
  You are AgroBot, a highly specialized AI assistant for tea farming in Kenya.
  
  CORE RULE: You only provide information about tea (Camellia sinensis).
  
  DOMAIN CONSTRAINTS:
  1. If asked about tea diseases, pests, soil, or harvest: Provide expert advice.
  2. If asked about animals (cows, poultry, goats, etc.): Politely decline. 
     Example: "I am specialized only in tea farming. I cannot provide information regarding animal husbandry."
  3. If asked about other crops (maize, coffee): Briefly mention you focus on tea, then stop.
  4. If asked about general topics (politics, sports, etc.): Politely decline.

  Keep all responses professional, practical, and localized for Kenyan smallholder tea farmers.
`;
// Utility function for exponential backoff during API calls (omitted for brevity)
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
        return await response.json() as GeminiResponse;
      } else if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; 
        continue;
      } else {
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
  // Use a negative ID for the AI's response that is currently being streamed
  const STREAMING_ID = -99; 
  
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

  // We use a helper function to simulate the typing effect
  const startTypingSimulation = useCallback((fullText: string, sources: Source[]) => {
    let currentText = '';
    let charIndex = 0;
    
    // Initialize a temporary message for streaming
    setMessages(prev => [...prev, { 
        id: STREAMING_ID, 
        text: '', 
        sender: 'ai', 
        sources: sources,
        isTyping: true, // Marker for styling
    }]);

    const typingInterval = setInterval(() => {
      if (charIndex < fullText.length) {
        currentText += fullText[charIndex];
        charIndex++;
        
        // Update the message being streamed
        setMessages(prev => 
            prev.map(msg => 
                msg.id === STREAMING_ID ? { ...msg, text: currentText } : msg
            )
        );
      } else {
        clearInterval(typingInterval);
        
        // Final update: Remove typing marker and set final text
        setMessages(prev => 
            prev.map(msg => 
                msg.id === STREAMING_ID ? { ...msg, id: Date.now() + 1, isTyping: false } : msg
            )
        );
        setIsSending(false); // Enable input again
      }
    }, 25); // Speed of typing (25ms per character)
    
  }, [STREAMING_ID]);


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
        tools: [{ "google_search": {} }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
      };
      
      const keyQuery = GEMINI_API_KEY ? `?key=${GEMINI_API_KEY}` : '';
      const apiUrl = `${GEMINI_API_URL}${keyQuery}`;
      
      const result = await fetchWithBackoff(apiUrl, payload);

      if (!result) { throw new Error("Empty response received from AI service after retries."); }
      
      const candidate = result.candidates?.[0];
      const fullAiResponseText = candidate?.content?.parts?.[0]?.text || "Sorry, I encountered an issue generating a response.";
      
      let sources: Source[] = [];
      const groundingMetadata = candidate?.groundingMetadata;
      if (groundingMetadata && groundingMetadata.groundingAttributions) {
          sources = groundingMetadata.groundingAttributions
              .map((attr: GroundingAttribution) => ({ 
                  uri: attr.web?.uri || '',
                  title: attr.web?.title || '',
              }))
              .filter(source => source.uri && source.title);
      }

      // 🎯 FIX: Start the typing simulation here instead of adding the final message block
      startTypingSimulation(fullAiResponseText, sources);

    } catch (error) {
      console.error("Gemini API Error:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "I am currently unable to connect to the AI model. Please try again later.",
        sender: 'system',
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsSending(false); // Re-enable input if API call failed
    } 
    // We DON'T set setIsSending(false) here, it's done inside startTypingSimulation
  }, [isSending, startTypingSimulation]);

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
      
    // System messages are a neutral style
    const isSystem = message.sender === 'system';
    const systemClass = isSystem ? "bg-yellow-100 text-yellow-800 text-center mx-auto" : "";

    return (
      <div className={`flex flex-col max-w-xs sm:max-w-md p-3 my-2 rounded-xl shadow-md ${isSystem ? systemClass : bubbleClass}`}>
        <p>{message.text}</p>
        
        {/* Visual cue for typing */}
        {message.isTyping && <Loader2 className="animate-spin h-4 w-4 mt-2 text-green-500" />}

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
        {/* Message Area */}
        <div className="flex-grow p-4 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 350px)' }}>
            {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area (Functional, enabled when not sending) */}
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