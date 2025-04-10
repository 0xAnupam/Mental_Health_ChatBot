'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, MenuIcon, X, Sun, Moon, MessageSquare, Settings, LogOut, User as UserIcon, Bot, Sparkles, Heart, ThumbsUp, Gift, Smile, Coffee, Zap } from 'lucide-react'

export function ChatInterface() {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean; timestamp: Date }[]>([])
  const [input, setInput] = useState('')
  const [userId, setUserId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  const themeColors = {
    primary: darkMode ? 'bg-purple-600' : 'bg-gradient-to-r from-pink-500 to-purple-600',
    secondary: darkMode ? 'bg-purple-900' : 'bg-purple-100',
    text: darkMode ? 'text-white' : 'text-gray-800',
    textSecondary: darkMode ? 'text-gray-300' : 'text-gray-600',
    background: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    messageUser: darkMode ? 'bg-purple-700' : 'bg-gradient-to-r from-pink-500 to-purple-600',
    messageBot: darkMode ? 'bg-gray-800' : 'bg-white',
    messageBotText: darkMode ? 'text-white' : 'text-gray-800',
    border: darkMode ? 'border-gray-700' : 'border-gray-200',
    sidebar: darkMode ? 'bg-gray-800' : 'bg-white',
  }

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId') || crypto.randomUUID()
    localStorage.setItem('userId', storedUserId)
    setUserId(storedUserId)
    
    // Check user preference for dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(prefersDark)
    
    // Focus input on load
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const startNewChat = () => {
    setMessages([])
    setShowWelcome(true)
    closeSidebar()
  }

  const toggleTheme = () => {
    setDarkMode(!darkMode)
    closeSidebar()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (showWelcome) setShowWelcome(false)

    setIsLoading(true)
    const userInput = input
    setMessages(prev => [...prev, { text: userInput, isUser: true, timestamp: new Date() }])
    setInput('')

    // Show typing indicator
    setIsTyping(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput, userId })
      })
      
      if (!response.ok) throw new Error('API request failed')
      
      const { text } = await response.json()
      setIsTyping(false)
      setMessages(prev => [...prev, { text, isUser: false, timestamp: new Date() }])
    } catch (error) {
      console.error('Error:', error)
      setIsTyping(false)
      setMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble responding. Please try again later.", 
        isUser: false,
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Feature for future messages list
  const recentChats = [
    "Ask about your day",
    "Tell me a joke",
    "Help with a project",
  ]

  const messageIcons = [Heart, ThumbsUp, Gift, Smile, Coffee, Zap]

  return (
    <div className={`h-screen flex flex-col md:flex-row ${themeColors.background} transition-colors duration-300`}>
      {/* Mobile header */}
      <div className={`md:hidden flex items-center justify-between p-4 ${themeColors.sidebar} ${themeColors.border} border-b`}>
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <MenuIcon size={24} className={themeColors.text} />
        </button>
        <div className="flex items-center">
          <Bot size={24} className="text-purple-600" />
          <h1 className={`ml-2 font-bold ${themeColors.text}`}>CheerChat</h1>
        </div>
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          {darkMode ? <Sun size={24} className={themeColors.text} /> : <Moon size={24} className={themeColors.text} />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 md:relative bg-black bg-opacity-50 md:bg-opacity-0"
          >
            <div className={`w-64 h-full ${themeColors.sidebar} p-4 flex flex-col border-r ${themeColors.border}`}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <Bot size={24} className="text-purple-600" />
                  <h1 className={`ml-2 font-bold ${themeColors.text}`}>CheerChat</h1>
                </div>
                <button onClick={closeSidebar} className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                  <X size={20} className={themeColors.text} />
                </button>
              </div>
              
              <button 
                onClick={startNewChat}
                className={`flex items-center p-3 mb-2 rounded-lg ${themeColors.primary} text-white hover:opacity-90 transition-all transform hover:scale-105`}
              >
                <Sparkles size={18} className="mr-2" />
                <span>New Chat</span>
              </button>
              
              <div className={`mt-6 mb-4 text-sm font-medium ${themeColors.textSecondary}`}>RECENT CHATS</div>
              
              {recentChats.map((chat, index) => (
                <button 
                  key={index}
                  className={`flex items-center p-3 mb-2 rounded-lg ${themeColors.text} hover:bg-gray-200 dark:hover:bg-gray-700 transition-all`}
                >
                  <MessageSquare size={16} className="mr-2 text-purple-500" />
                  <span className="truncate">{chat}</span>
                </button>
              ))}
              
              <div className="mt-auto">
                <button 
                  onClick={toggleTheme}
                  className={`flex items-center w-full p-3 mb-2 rounded-lg ${themeColors.text} hover:bg-gray-200 dark:hover:bg-gray-700 transition-all`}
                >
                  {darkMode ? <Sun size={18} className="mr-2" /> : <Moon size={18} className="mr-2" />}
                  <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                
                <button className={`flex items-center w-full p-3 mb-2 rounded-lg ${themeColors.text} hover:bg-gray-200 dark:hover:bg-gray-700 transition-all`}>
                  <Settings size={18} className="mr-2" />
                  <span>Settings</span>
                </button>
                
                <button className={`flex items-center w-full p-3 rounded-lg ${themeColors.text} hover:bg-gray-200 dark:hover:bg-gray-700 transition-all`}>
                  <LogOut size={18} className="mr-2" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Desktop header */}
        <div className={`hidden md:flex items-center justify-between p-4 ${themeColors.sidebar} ${themeColors.border} border-b`}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <MenuIcon size={24} className={themeColors.text} />
          </button>
          <div className="flex items-center">
            <Bot size={24} className="text-purple-600" />
            <h1 className={`ml-2 font-bold ${themeColors.text}`}>CheerChat</h1>
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            {darkMode ? <Sun size={24} className={themeColors.text} /> : <Moon size={24} className={themeColors.text} />}
          </button>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Welcome Hero Section */}
          <AnimatePresence>
            {showWelcome && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className={`mb-8 p-6 rounded-2xl overflow-hidden relative ${themeColors.primary} text-white`}
              >
                <div className="relative z-10">
                  <motion.div 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center mb-4"
                  >
                    <Sparkles size={28} className="mr-2" />
                    <h2 className="text-2xl font-bold">Welcome to CheerChat!</h2>
                  </motion.div>
                  
                  <p className="mb-6">Your friendly AI assistant thats here to brighten your day. How can I help you today?</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {["Tell me a joke", "How's the weather?", "Give me a fun fact", "Help me plan my day"].map((suggestion, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        onClick={() => {
                          setInput(suggestion)
                          inputRef.current?.focus()
                        }}
                        className="p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-left text-sm transition-all transform hover:scale-105"
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {/* Decorative floating bubbles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[1, 2, 3, 4, 5].map((_, i) => {
                    const Icon = messageIcons[i % messageIcons.length]
                    return (
                      <motion.div
                        key={i}
                        initial={{ 
                          x: Math.random() * 100 - 50, 
                          y: Math.random() * 100 - 50,
                          opacity: 0.7,
                          scale: Math.random() * 0.5 + 0.5
                        }}
                        animate={{ 
                          x: Math.random() * 100 - 50,
                          y: Math.random() * 100 - 50,
                          opacity: Math.random() * 0.3 + 0.4,
                          scale: Math.random() * 0.5 + 0.5
                        }}
                        transition={{ 
                          repeat: Infinity,
                          repeatType: "reverse",
                          duration: Math.random() * 10 + 10
                        }}
                        className="absolute text-white text-opacity-30"
                        style={{
                          top: `${Math.random() * 80 + 10}%`,
                          left: `${Math.random() * 80 + 10}%`,
                        }}
                      >
                        <Icon size={24 + i * 8} />
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Chat Messages */}
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div className={`flex max-w-[85%] ${msg.isUser ? 'flex-row-reverse' : ''}`}>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        msg.isUser 
                          ? 'bg-pink-500' 
                          : 'bg-purple-600'
                      } shadow-md mr-2 ${msg.isUser ? 'ml-3 mr-0' : ''}`}
                    >
                      {msg.isUser ? 
                        <UserIcon size={18} className="text-white" /> : 
                        <Bot size={18} className="text-white" />
                      }
                    </motion.div>
                    
                    <div>
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-2xl shadow-md ${
                          msg.isUser 
                            ? themeColors.messageUser + ' text-white' 
                            : themeColors.messageBot + ' ' + themeColors.messageBotText
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      </motion.div>
                      <div className={`text-xs mt-1 ${themeColors.textSecondary} ${msg.isUser ? 'text-right mr-1' : 'text-left ml-1'}`}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mb-4"
              >
                <div className="flex max-w-[85%]">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-purple-600 shadow-md mr-2`}>
                    <Bot size={18} className="text-white" />
                  </div>
                  <div className={`p-4 rounded-2xl shadow-md ${themeColors.messageBot}`}>
                    <div className="flex space-x-2">
                      <motion.span 
                        animate={{ 
                          y: [0, -8, 0] 
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 1.2,
                          delay: 0 
                        }}
                        className="h-3 w-3 bg-purple-600 rounded-full"
                      ></motion.span>
                      <motion.span 
                        animate={{ 
                          y: [0, -8, 0] 
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 1.2,
                          delay: 0.2 
                        }}
                        className="h-3 w-3 bg-pink-500 rounded-full"
                      ></motion.span>
                      <motion.span 
                        animate={{ 
                          y: [0, -8, 0] 
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 1.2,
                          delay: 0.4 
                        }}
                        className="h-3 w-3 bg-purple-400 rounded-full"
                      ></motion.span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input Area */}
        <div className={`p-4 border-t ${themeColors.border}`}>
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full p-4 pr-16 border ${themeColors.border} rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} transition-colors`}
              placeholder="Type your message..."
              disabled={isLoading}
              rows={2}
              style={{ minHeight: '64px', maxHeight: '150px' }}
            />
            
            <motion.button 
              type="submit"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading || !input.trim()}
              className={`absolute right-3 bottom-3 p-3 rounded-full ${themeColors.primary} text-white disabled:opacity-50 transition-all shadow-md`}
            >
              {isLoading ? 
                <Loader2 size={20} className="animate-spin" /> : 
                <Send size={20} />
              }
            </motion.button>
          </form>
          
          <div className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
            Press Enter to send, Shift+Enter for a new line
          </div>
        </div>
      </div>
    </div>
  )
}