import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Copy,
  Check,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// --- Utils ---
const generateId = () => Math.random().toString(36).substring(2, 9)

// Enhanced markdown parser for Claude-style formatting
const formatMessageContent = (content: string) => {
  const sections: JSX.Element[] = []
  let currentIndex = 0

  // Split by major sections (paragraphs, tables, code blocks)
  const lines = content.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Check for tables (simple detection: lines with | characters)
    if (line.includes('|') && lines[i + 1]?.includes('|')) {
      const tableLines: string[] = []
      while (i < lines.length && (lines[i].includes('|') || lines[i].trim() === '')) {
        if (lines[i].includes('|')) {
          tableLines.push(lines[i])
        }
        i++
      }
      if (tableLines.length > 0) {
        const tableElement = renderTable(tableLines, currentIndex++)
        if (tableElement) {
          sections.push(tableElement)
        }
      }
      continue
    }

    // Check for code blocks
    if (line.trim().startsWith('```')) {
      const codeLines: string[] = []
      i++ // Skip opening ```
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // Skip closing ```
      sections.push(renderCodeBlock(codeLines.join('\n'), currentIndex++))
      continue
    }

    // Check for headings (## or bold text at start of line)
    if (line.trim().startsWith('#') || (line.trim().startsWith('**') && line.includes('**'))) {
      sections.push(renderHeading(line, currentIndex++))
      i++
      continue
    }

    // Check for emoji headers (like "👋 Hey Chirudeep!")
    if (/^[👋🚀📊💡✨🎯📘✅]/.test(line.trim())) {
      sections.push(renderHeading(line, currentIndex++))
      i++
      continue
    }

    // Check for bullet points or numbered lists
    if (line.trim().match(/^[-•*]\s/) || line.trim().match(/^\d+\.\s/)) {
      const listLines: string[] = []
      while (i < lines.length && (lines[i].trim().match(/^[-•*]\s/) || lines[i].trim().match(/^\d+\.\s/) || lines[i].trim() === '')) {
        if (lines[i].trim() !== '') {
          listLines.push(lines[i])
        }
        i++
      }
      sections.push(renderList(listLines, currentIndex++))
      continue
    }

    // Regular paragraph
    if (line.trim() !== '') {
      const paragraphLines: string[] = [line]
      i++
      while (i < lines.length && lines[i].trim() !== '' && !lines[i].includes('|') && !lines[i].trim().startsWith('#') && !lines[i].trim().match(/^[-•*]\s/) && !lines[i].trim().match(/^\d+\.\s/)) {
        paragraphLines.push(lines[i])
        i++
      }
      sections.push(renderParagraph(paragraphLines.join(' '), currentIndex++))
      continue
    }

    i++
  }

  return <div className="space-y-4">{sections}</div>
}

const renderHeading = (text: string, key: number) => {
  // Remove # symbols
  const cleanText = text.replace(/^#+\s*/, '').replace(/^\*\*(.*?)\*\*/, '$1')
  return (
    <h2 key={key} className="text-xl font-bold text-gray-900 mt-6 mb-3 first:mt-0">
      {cleanText}
    </h2>
  )
}

const renderParagraph = (text: string, key: number) => {
  // Process inline formatting
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 text-sm font-mono">$1</code>')
  
  return (
    <p 
      key={key} 
      className="text-gray-700 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: formatted }}
    />
  )
}

const renderList = (items: string[], key: number) => {
  const isNumbered = items[0]?.trim().match(/^\d+\./)
  
  return (
    <div key={key} className="space-y-2 my-3">
      {items.map((item, idx) => {
        const cleanItem = item.trim().replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '')
        const formatted = cleanItem
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
          .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 text-sm font-mono">$1</code>')
        
        return (
          <div key={idx} className="flex items-start gap-3">
            <span className="text-gray-400 font-medium mt-0.5 flex-shrink-0">
              {isNumbered ? `${idx + 1}.` : '•'}
            </span>
            <span 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatted }}
            />
          </div>
        )
      })}
    </div>
  )
}

const renderTable = (lines: string[], key: number) => {
  const rows = lines.map(line => 
    line.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
  )
  
  if (rows.length === 0) return null
  
  const headers = rows[0]
  const dataRows = rows.slice(1).filter(row => !row.every(cell => cell.match(/^[-:]+$/)))
  
  return (
    <div key={key} className="my-6 overflow-hidden rounded-xl bg-[#faf7f2] border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-300">
              {headers.map((header, idx) => (
                <th 
                  key={idx} 
                  className="px-4 py-3 text-left text-sm font-bold text-gray-900 bg-[#f5f2ed]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-gray-200 last:border-0">
                {row.map((cell, cellIdx) => (
                  <td 
                    key={cellIdx} 
                    className="px-4 py-3 text-sm text-gray-700"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const renderCodeBlock = (code: string, key: number) => {
  return (
    <div key={key} className="my-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between bg-gray-100 px-3 py-2 text-xs text-gray-600 border-b border-gray-200">
        <span>Code</span>
      </div>
      <div className="overflow-x-auto p-4">
        <pre className="text-sm font-mono text-gray-800 whitespace-pre">
          {code}
        </pre>
      </div>
    </div>
  )
}

// --- Typing Indicator Component ---
const TypingIndicator = () => (
  <div className="flex items-center gap-2 p-2 text-sm text-gray-500">
    <span className="font-medium">Thinking...</span>
    <div className="flex gap-1">
      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
    </div>
  </div>
)

// --- Empty State Component ---
const EmptyState = ({ userName, onSuggestionClick }: { userName: string, onSuggestionClick: (text: string) => void }) => (
  <div className="flex h-full flex-col items-center justify-center p-8 text-center">
    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50 border border-gray-200">
      <Sparkles className="text-gray-400" size={36} />
    </div>
    <h2 className="mb-3 text-2xl font-bold text-gray-900">Hi {userName}! 👋</h2>
    <p className="mb-10 max-w-lg text-gray-600 leading-relaxed">
      I'm your AI Career Companion. I can help you with career planning, skill development, 
      interview prep, resume reviews, and strategic guidance tailored to your goals.
    </p>
    
    <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
      {[
        "Show me my career snapshot",
        "What should I learn next?",
        "Help me prepare for interviews",
        "Review my current progress"
      ].map((suggestion, i) => (
        <button 
          key={i}
          onClick={() => onSuggestionClick(suggestion)}
          className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-left text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm transition-all"
        >
          {suggestion}
        </button>
      ))}
    </div>
  </div>
)

// --- Message Bubble Component ---
const MessageBubble = ({ message, onCopy, copied }: { message: Message, onCopy: () => void, copied: boolean }) => {
  const isUser = message.role === 'user'

  return (
    <div className={`group flex w-full gap-4 py-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-xl ${
        isUser 
          ? 'bg-gray-100 border border-gray-200 text-gray-600' 
          : 'bg-gray-900 text-white'
      }`}>
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      {/* Content */}
      <div className={`flex max-w-[80%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>        
        <div className={`relative w-full rounded-2xl px-6 py-5 text-[15px] leading-relaxed shadow-sm transition-all
          ${isUser 
            ? 'bg-gray-100 text-gray-900 rounded-tr-sm' 
            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
          }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            formatMessageContent(message.content)
          )}
          
          {/* Action Buttons (Assistant Only) */}
          {!isUser && (
            <div className="absolute -bottom-9 left-0 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button 
                onClick={onCopy}
                className="flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 shadow-sm transition-all"
              >
                {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Main Chat Component ---
export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatHistory = async () => {
    try {
      const response = await api.get('/agent/chat/history')
      console.log('Chat history response:', response.data)
      
      // Handle nested response structure
      const responseData = response.data?.data || response.data
      if (responseData?.history) {
        const history = responseData.history.map((msg: { role: 'user' | 'assistant', content: string }) => ({
          ...msg,
          id: generateId(),
          timestamp: new Date()
        }))
        setMessages(history)
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    try {
      const response = await api.post('/agent/chat', {
        message: userMessage.content
      })

      console.log('Chat response:', response.data)
      
      // Handle nested response structure from PHP backend
      const responseData = response.data?.data || response.data
      const assistantContent = responseData?.response || responseData?.message || 'I received your message but couldn\'t generate a proper response.'
      
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error: unknown) {
      console.error('Failed to send message:', error)
      let errorContent = 'Sorry, I encountered an error. Please try again.'
      
      // Try to get more specific error info
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        if (axiosError.response?.data?.message) {
          errorContent = `Error: ${axiosError.response.data.message}`
        }
      }
      
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      textareaRef.current?.focus()
    }
  }

  const clearChat = async () => {
    try {
      await api.post('/agent/chat/clear')
      setMessages([])
    } catch (error) {
      console.error('Failed to clear chat:', error)
    }
  }

  const copyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedIndex(id)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleSuggestionClick = (text: string) => {
    setInput(text)
    textareaRef.current?.focus()
  }

  return (
    <div className="h-full w-full bg-[#f5f3ef]">
      {/* Full page container with cream background */}
      <div className="flex h-full w-full flex-col">
        
        {/* Header */}
        <header className="flex items-center justify-between bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
              <Bot size={20} />
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900">Career AI Companion</h1>
              <p className="text-xs text-gray-500">Your personal career guidance agent</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={clearChat}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </header>

        {/* Main Content Area with padding */}
        <div className="flex-1 overflow-hidden px-6 py-6">
          {/* White chat container with shadow and rounded corners */}
          <div className="h-full mx-auto max-w-5xl bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col overflow-hidden">
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {messages.length === 0 ? (
                <EmptyState 
                  userName={user?.name?.split(' ')[0] || 'there'} 
                  onSuggestionClick={handleSuggestionClick}
                />
              ) : (
                <div className="space-y-1">
                  {messages.map((msg) => (
                    <MessageBubble 
                      key={msg.id} 
                      message={msg} 
                      onCopy={() => copyMessage(msg.content, msg.id)}
                      copied={copiedIndex === msg.id}
                    />
                  ))}
                  
                  {isLoading && (
                    <div className="flex w-full gap-4 py-6 flex-row">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white">
                        <Bot size={18} />
                      </div>
                      <div className="flex flex-col items-start pt-1">
                        <TypingIndicator />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} className="h-4" />
                </div>
              )}
            </div>

            {/* Input Area - inside the white container */}
            <div className="border-t border-gray-200 bg-[#fafafa] px-8 py-6">
              <div className="relative flex w-full flex-col rounded-xl border border-gray-300 bg-white shadow-sm focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-gray-900 transition-all">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your career assistant…"
                  rows={1}
                  className="max-h-[160px] min-h-[52px] w-full resize-none rounded-xl bg-transparent px-4 py-3.5 pr-14 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
                />
                
                <div className="absolute bottom-2.5 right-2.5">
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white transition-all hover:bg-gray-800 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
                  >
                    <Send size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
              
              <div className="mt-2.5 text-center text-xs text-gray-500">
                Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-gray-700 font-mono text-[11px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-gray-700 font-mono text-[11px]">Shift + Enter</kbd> for new line
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}
