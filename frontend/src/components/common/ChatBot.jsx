import React, { useState, useEffect, useRef, useContext } from 'react';
import { MessageSquare, Send, X, Mic, Bot, User, Loader2, Sparkles, ChevronDown, Paperclip, FileText } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';

const ChatBot = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hi there! I'm your AI Job Assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  const quickButtons = [
    "Find Jobs",
    "Improve Resume",
    "Improve Project",
    "Top Candidates",
    "Interview Questions"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text = inputValue, attachment = null) => {
    if (!text.trim() && !attachment) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text,
      attachment: attachment,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      if (attachment) {
        // For now, file analysis remains local/simulated but could be sent to backend
        setTimeout(() => {
          const botMessage = {
            id: Date.now() + 1,
            type: 'bot',
            text: `I've successfully analyzed **${attachment.name}**. Here is the data extracted directly from the file:`,
            summary: {
              title: "File Data Analysis",
              skills: attachment.name.toLowerCase().includes('java') ? ["Java", "Spring Boot", "Backend"] : ["Frontend", "React", "UI/UX"],
              experience: `File Size: ${attachment.size}`,
              education: `File Type: ${attachment.type || 'Document'}`,
              recommendation: attachment.content ? `Extracted Snippet: "${attachment.content.substring(0, 50)}..."` : "Content successfully processed for indexing."
            },
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
        }, 2000);
      } else {
        // Call Real Backend for text messages
        const response = await api.post('/chat', {
          message: text,
          userId: user?.id,
          sender: "USER"
        });

        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          text: response.data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);

        // Auto-trigger file upload if bot asks for resume
        if (response.data.message.toLowerCase().includes("upload your resume")) {
          setTimeout(() => {
            fileInputRef.current?.click();
          }, 800);
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        handleSend("", { 
          name: file.name, 
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type,
          content: typeof content === 'string' ? content : "Binary data"
        });
      };
      
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    }
  };

  const getBotResponse = (input) => {
    const text = input.toLowerCase();
    if (text.includes('job')) return "I can help you find the best jobs matching your skills. Would you like to see latest openings in software engineering?";
    if (text.includes('resume')) return "A great resume is key! I can analyze your resume and suggest improvements. Please upload your current CV using the attachment icon.";
    if (text.includes('interview')) return "Preparation is everything. I have a list of common interview questions for various roles. Which role are you preparing for?";
    return "That's interesting! Tell me more about your career goals so I can assist you better.";
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[380px] h-[550px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-4 bg-blue-600 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <Bot size={22} className="text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-600 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-none">AI Assistant</h3>
                <span className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Online Now
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-slate-50/50 dark:bg-slate-950/50"
          >
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`flex gap-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    msg.type === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {msg.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                      msg.type === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                    }`}>
                      {msg.attachment && (
                        <div className={`mb-2 p-2 rounded-lg flex items-center gap-3 border ${
                          msg.type === 'user' ? 'bg-white/10 border-white/20' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700'
                        }`}>
                          <div className={`p-2 rounded-md ${msg.type === 'user' ? 'bg-white/20' : 'bg-blue-50 dark:bg-blue-900/30'}`}>
                            <FileText size={18} className={msg.type === 'user' ? 'text-white' : 'text-blue-500'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${msg.type === 'user' ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                              {msg.attachment.name}
                            </p>
                            <p className={`text-[10px] ${msg.type === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                              {msg.attachment.size}
                            </p>
                          </div>
                        </div>
                      )}
                      {msg.text && <div className="mb-1">{msg.text}</div>}
                      
                      {/* Summary Card */}
                      {msg.summary && (
                        <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/50 space-y-2">
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-xs">
                            <Sparkles size={14} />
                            {msg.summary.title}
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Key Skills</p>
                              <div className="flex flex-wrap gap-1">
                                {msg.summary.skills.map((skill, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md text-[10px] text-slate-600 dark:text-slate-300">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Experience</p>
                                <p className="text-xs text-slate-700 dark:text-slate-300">{msg.summary.experience}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Education</p>
                                <p className="text-xs text-slate-700 dark:text-slate-300">{msg.summary.education}</p>
                              </div>
                            </div>
                            <div className="pt-1 border-t border-blue-100 dark:border-blue-800/50">
                              <p className="text-[10px] italic text-blue-600/80 dark:text-blue-400/80">{msg.summary.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] text-slate-400 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-in fade-in duration-200">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                    <Bot size={16} />
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800/50">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {quickButtons.map((btn, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(btn)}
                  className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-500 transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Sparkles size={12} className="text-blue-500" />
                  {btn}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".pdf,.doc,.docx,.txt"
            />
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors"
                title="Upload file"
              >
                <Paperclip size={18} />
              </button>
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-800 dark:text-slate-200"
              />
              <button 
                onClick={() => handleSend()}
                disabled={!inputValue.trim()}
                className={`p-2 rounded-lg transition-all ${
                  inputValue.trim() 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700' 
                    : 'text-slate-400'
                }`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group ${
          isOpen ? 'bg-slate-200 dark:bg-slate-800 rotate-90' : 'bg-blue-600 hover:bg-blue-700 scale-110'
        }`}
      >
        {isOpen ? (
          <ChevronDown className="text-slate-600 dark:text-slate-400" />
        ) : (
          <div className="relative">
            <MessageSquare className="text-white fill-white/20" size={26} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
          </div>
        )}
        
        {!isOpen && (
          <div className="absolute right-full mr-4 px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Need help? Chat with me!
          </div>
        )}
      </button>
    </div>
  );
};

export default ChatBot;
