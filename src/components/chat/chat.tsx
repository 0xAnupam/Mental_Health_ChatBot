'use client'
import { useEffect, useRef, useState } from 'react'
import { Send, Loader2, MenuIcon, X, Sun, Moon, MessageSquare, Settings, LogIn, LogOut, Bot } from 'lucide-react'

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

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(prefersDark)

    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const startNewChat = () => {
    setMessages([])
    setShowWelcome(true)
    setSidebarOpen(false)
  }

  const toggleTheme = () => {
    setDarkMode(!darkMode)
    setSidebarOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (showWelcome) setShowWelcome(false)

    setIsLoading(true)
    const userInput = input
    setMessages(prev => [...prev, { text: userInput, isUser: true, timestamp: new Date() }])
    setInput('')
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

  return (
    <div className={`h-screen flex flex-col md:flex-row ${themeColors.background} transition-colors duration-300`}>
      
      {/* Sidebar */}
      <div className={`w-64 hidden md:flex flex-col p-4 border-r ${themeColors.sidebar} ${themeColors.border}`}>
        <div className="flex items-center mb-6">
          <Bot size={24} className="text-purple-600" />
          <h1 className={`ml-2 font-bold ${themeColors.text}`}>CheerChat</h1>
        </div>
        
        <button onClick={startNewChat} className={`flex items-center p-2 mb-4 rounded ${themeColors.primary} text-white hover:opacity-90 transition`}>
          <MessageSquare size={20} className="mr-2" />
          New Chat
        </button>

        <button onClick={toggleTheme} className="flex items-center p-2 mb-4 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          {darkMode ? <Sun size={20} className="mr-2" /> : <Moon size={20} className="mr-2" />}
          Toggle Theme
        </button>

        <button className="flex items-center p-2 mt-auto rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          <LogIn size={20} className="mr-2" />
          LogIn
        </button>
      </div>

      {/* Mobile Header */}
      <div className={`md:hidden flex items-center justify-between p-4 border-b ${themeColors.sidebar} ${themeColors.border}`}>
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          <MenuIcon size={24} className={themeColors.text} />
        </button>
        <div className="flex items-center">
          <Bot size={24} className="text-purple-600" />
          <h1 className={`ml-2 font-bold ${themeColors.text}`}>CheerChat</h1>
        </div>
        <button onClick={toggleTheme} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          {darkMode ? <Sun size={24} className={themeColors.text} /> : <Moon size={24} className={themeColors.text} />}
        </button>
      </div>

      {/* Sidebar Overlay Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
          <div className={`w-64 h-full p-4 flex flex-col ${themeColors.sidebar} ${themeColors.border}`}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <Bot size={24} className="text-purple-600" />
                <h1 className={`ml-2 font-bold ${themeColors.text}`}>CheerChat</h1>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                <X size={20} className={themeColors.text} />
              </button>
            </div>

            <button onClick={startNewChat} className={`flex items-center p-2 mb-4 rounded ${themeColors.primary} text-white hover:opacity-90 transition`}>
              <MessageSquare size={20} className="mr-2" />
              New Chat
            </button>

            <button onClick={toggleTheme} className="flex items-center p-2 mb-4 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              {darkMode ? <Sun size={20} className="mr-2" /> : <Moon size={20} className="mr-2" />}
              Toggle Theme
            </button>

            <button className="flex items-center p-2 mt-auto rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              <LogOut size={20} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {showWelcome && (
            <div className="text-center text-xl font-semibold text-purple-500 mt-10">
              Welcome to CheerChat!
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs p-3 rounded-lg ${msg.isUser ? themeColors.messageUser : themeColors.messageBot}`}>
                <p className={`${msg.isUser ? 'text-white' : themeColors.messageBotText}`}>{msg.text}</p>
                <p className="text-xs mt-1 text-right text-gray-400">{formatTime(msg.timestamp)}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className={`max-w-xs p-3 rounded-lg ${themeColors.messageBot}`}>
                <p className={`${themeColors.messageBotText}`}>Typing...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className={`p-4 border-t ${themeColors.border} flex items-center ${themeColors.sidebar}`}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 p-2 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button 
            type="submit"
            disabled={isLoading}
            className={`ml-2 p-2 rounded-full ${themeColors.primary} text-white hover:opacity-90 transition`}
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </form>
      </div>

    </div>
  )
}
