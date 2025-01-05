import { Card } from "@/components/ui/card"
import AnalyticsChart from './AnalyticsChart'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion } from 'framer-motion'
import { Bot, User } from 'lucide-react'

interface ChatMessageProps {
  message: {
    role: string
    content: string
    data?: any
  }
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  // Remove "Data Summary" section if present
  const content = message.content.includes('Data Summary') 
    ? 'We analyzed ' + message.content.split('We analyzed')[1]
    : message.content

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex gap-3 max-w-[95%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-none w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600' : 'bg-emerald-600'
        }`}>
          {isUser ? <User size={14} /> : <Bot size={14} />}
        </div>
        <Card className={`
          p-4 backdrop-blur-sm rounded-2xl flex-1 overflow-hidden
          ${isUser ? 'bg-blue-600/20 border-blue-500/30' : 'bg-emerald-600/20 border-emerald-500/30'}
        `}>
          <div className="prose prose-invert max-w-none overflow-x-auto">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full border-collapse">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="px-3 py-2 bg-gray-700/50 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-600">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-2 text-sm text-gray-300 border-b border-gray-700/50">
                    {children}
                  </td>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
          {message.data && message.data.table && (
            <div className="mt-4 w-full">
              <AnalyticsChart data={message.data.table} />
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  )
}

