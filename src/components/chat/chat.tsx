'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, User, Bot } from 'lucide-react'

export function ChatInterface() {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean; timestamp: Date }[]>([])
  const [input, setInput] = useState('')
  const [userId, setUserId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId') || crypto.randomUUID()
    localStorage.setItem('userId', storedUserId)
    setUserId(storedUserId)
    
    // Add welcome message
    setMessages([{
      text: "Hello! How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }])
    
    // Focus input on load
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

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

  return (
    <div className="max-w-3xl mx-auto p-4 h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="py-4 border-b border-gray-200 dark:border-gray-700 mb-4">
        <h1 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-100">AI Assistant</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div className={`flex max-w-[80%] ${msg.isUser ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                  msg.isUser ? 'bg-blue-600 ml-2' : 'bg-gray-300 dark:bg-gray-700 mr-2'
                }`}>
                  {msg.isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-gray-700 dark:text-gray-300" />}
                </div>
                <div>
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    msg.isUser 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                  <div className={`text-xs mt-1 text-gray-500 ${msg.isUser ? 'text-right' : 'text-left'}`}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start mb-4"
          >
            <div className="flex">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center mr-2">
                <Bot size={16} className="text-gray-700 dark:text-gray-300" />
              </div>
              <div className="p-4 rounded-2xl shadow-sm bg-white dark:bg-gray-800">
                <div className="flex space-x-2">
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-4 pr-16 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          placeholder="Type your message..."
          disabled={isLoading}
          rows={2}
          style={{ minHeight: '64px' }}
        />
        <button 
          type="submit"
          className="absolute right-3 bottom-3 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? 
            <Loader2 size={20} className="animate-spin" /> : 
            <Send size={20} />
          }
        </button>
      </form>
      
      <div className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
        Press Enter to send, Shift+Enter for a new line
      </div>
    </div>
  )
}