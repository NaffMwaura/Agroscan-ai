import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Loader2, Search } from 'lucide-react';
import { GEMINI_API_URL, GEMINI_API_KEY } from '../../types';

interface Source { uri: string; title: string; }
interface GroundingAttribution { web?: Source; }
interface GroundingMetadata { groundingAttributions?: GroundingAttribution[]; }
interface CandidatePart { text: string; }
interface CandidateContent { parts?: CandidatePart[]; }
interface Candidate { content?: CandidateContent; groundingMetadata?: GroundingMetadata; }
interface GeminiResponse { candidates?: Candidate[]; }
interface Message { id: number; text: string; sender: 'user' | 'ai' | 'system'; sources?: Array<Source>; isTyping?: boolean; }

const systemPrompt = `
  You are AgroBot, a highly specialized AI assistant for tea farming in Kenya.
  
  CORE RULE: You only provide information about tea (Camellia sinensis).
  
  DOMAIN CONSTRAINTS:
  1. If asked about tea diseases, pests, soil, or harvest: Provide expert advice.
  2. If asked about animals: Politely decline.
  3. If asked about other crops: Briefly mention you focus on tea.
  4. If asked about general topics: Politely decline.

  Keep all responses professional, practical, and localized for Kenyan smallholder tea farmers.
`;

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

  const startTypingSimulation = useCallback((fullText: string, sources: Source[]) => {
    let currentText = '';
    let charIndex = 0;
    
    setMessages(prev => [...prev, { 
        id: STREAMING_ID, 
        text: '', 
        sender: 'ai', 
        sources: sources,
        isTyping: true,
    }]);

    const typingInterval = setInterval(() => {
      if (charIndex < fullText.length) {
        currentText += fullText[charIndex];
        charIndex++;
        setMessages(prev => 
            prev.map(msg => 
                msg.id === STREAMING_ID ? { ...msg, text: currentText } : msg
            )
        );
      } else {
        clearInterval(typingInterval);
        setMessages(prev => 
            prev.map(msg => 
                msg.id === STREAMING_ID ? { ...msg, id: Date.now() + 1, isTyping: false } : msg
            )
        );
        setIsSending(false);
      }
    }, 25);
    
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
      if (!result) { throw new Error("Empty response received from AI service."); }
      
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
      startTypingSimulation(fullAiResponseText, sources);

    } catch (error) {
      console.error("Gemini API Error:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "I am currently unable to connect to the AI model. Please try again later.",
        sender: 'system',
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsSending(false);
    } 
  }, [isSending, startTypingSimulation]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage(input);
    }
  };

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.sender === 'user';
    const isSystem = message.sender === 'system';
    
    const bubbleClass = isUser 
      ? "bg-green-600 text-white self-end rounded-br-none" 
      : isSystem 
        ? "bg-yellow-50 text-yellow-800 text-center mx-auto border border-yellow-200 text-sm" 
        : "bg-gray-100 text-gray-800 self-start rounded-tl-none";

    return (
      <div className={`flex flex-col max-w-[85%] md:max-w-[80%] p-3 my-1 rounded-2xl shadow-sm ${bubbleClass} transition-all duration-200`}>
        <p className="text-sm md:text-base leading-relaxed">{message.text}</p>
        
        {message.isTyping && <Loader2 className="animate-spin h-3 w-3 mt-2 text-green-500" />}

        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-opacity-20 border-current text-[10px] md:text-xs">
            <h4 className="font-semibold mb-1 flex items-center">
                <Search className="h-3 w-3 mr-1" /> Sources:
            </h4>
            <ul className="space-y-1">
              {message.sources.slice(0, 3).map((source, index) => (
                <li key={index} className="truncate">
                  <a href={source.uri} target="_blank" rel="noopener noreferrer" className="hover:underline opacity-80">
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
    <div className="flex flex-col h-full bg-white overflow-hidden">
        {/* Message Area - MOBILE RESPONSIVE HEIGHT */}
        <div className="flex-grow p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col">
                    <MessageBubble message={msg} />
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isSending ? "AgroBot is thinking..." : "Ask about tea crops..."}
                    className="flex-grow p-3 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all duration-200 text-sm md:text-base shadow-sm disabled:bg-gray-100"
                    disabled={isSending}
                />
                <button
                    onClick={() => handleSendMessage(input)}
                    disabled={!input.trim() || isSending}
                    className={`p-3 rounded-2xl text-white transition-all duration-300 shadow-md flex-shrink-0 ${
                        !input.trim() || isSending ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-90 shadow-green-200'
                    }`}
                >
                    {isSending ? <Loader2 className="animate-spin h-5 w-5 md:h-6 md:w-6" /> : <Send className="h-5 w-5 md:h-6 md:w-6" />}
                </button>
            </div>
        </div>
    </div>
  );
};

export default ChatbotComponent;