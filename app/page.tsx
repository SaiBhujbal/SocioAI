'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send, Bot, Sparkles } from 'lucide-react'
import ChatMessage from '@/components/ChatMessage'
import { motion } from 'framer-motion'

export default function Chat() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string; data?: any }>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    setError('')
    setMessages(prev => [...prev, { role: 'user', content: input }])
    setInput('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data || !data.message) {
        throw new Error('Invalid response format')
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.message, data: data.data }])
      
      // Scroll to bottom
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setError('');
    setIsLoading(false);
  };

  return (
    <div className="h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-purple-900 to-black text-white overflow-hidden">
      <div className="flex-none p-4">
        <Card className="bg-gray-800/30 border-gray-700 backdrop-blur-sm rounded-2xl">
          <CardHeader className="py-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  SocioAI
                </CardTitle>
                <CardDescription className="text-gray-400 text-sm">
                  Get detailed insights and visualizations about your social media performance
                </CardDescription>
              </div>
              <Button
                onClick={handleNewChat}
                size="sm"
                className="bg-red-600 hover:bg-red-700 transition-colors rounded-full px-4 h-8 text-sm"
              >
                New Chat
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="flex-1 p-4 overflow-hidden">
        <Card className="bg-gray-800/30 border-gray-700 backdrop-blur-sm rounded-2xl h-full flex flex-col">
          <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
            <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
              {messages.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-400 py-8"
                >
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Welcome to Analytics Insights AI!</p>
                  <p className="text-sm text-gray-500">
                    Ask questions about your social media analytics to get detailed insights and visualizations.
                  </p>
                </motion.div>
              )}
              {messages.map((m, index) => (
                <ChatMessage key={index} message={m} />
              ))}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2 text-blue-400 py-4"
                >
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [1, 0.5, 1],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                        className="w-2 h-2 bg-current rounded-full"
                      />
                    ))}
                  </div>
                  <span className="text-sm">Analyzing data</span>
                </motion.div>
              )}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 mt-2 p-4 rounded-lg bg-red-900/20 border border-red-800"
                >
                  {error}
                </motion.div>
              )}
            </ScrollArea>

            <div className="flex-none pt-4">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <div className="flex-1 max-w-[calc(100%-3rem)]">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your analytics..."
                    className="bg-gray-700/50 border-gray-600 focus:border-blue-500 pl-4 h-10 rounded-full"
                  />
                </div>
                <Button 
                  type="submit" 
                  size="icon"
                  className="bg-blue-600 hover:bg-blue-700 transition-colors rounded-full w-10 h-10 flex-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-2 ml-4">
                Press Enter to send, Shift + Enter for new line
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

