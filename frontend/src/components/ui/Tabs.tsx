import { useState, createContext, useContext, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

interface TabsProps {
  defaultValue: string
  children: ReactNode
  className?: string
  onChange?: (value: string) => void
}

export function Tabs({ defaultValue, children, className, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue)

  const handleSetActiveTab = (value: string) => {
    setActiveTab(value)
    onChange?.(value)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleSetActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: ReactNode
  className?: string
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={cn(
        'flex gap-1 p-1 rounded-xl bg-white/5',
        className
      )}
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')

  const isActive = context.activeTab === value

  return (
    <button
      onClick={() => context.setActiveTab(value)}
      className={cn(
        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-white/10 text-white shadow-sm'
          : 'text-claude-text-secondary hover:text-white hover:bg-white/5',
        className
      )}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')

  if (context.activeTab !== value) return null

  return (
    <div className={cn('animate-fade-in', className)}>
      {children}
    </div>
  )
}

// Accordion Components
interface AccordionItemContextValue {
  isOpen: boolean
  toggle: () => void
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null)

interface AccordionProps {
  children: ReactNode
  className?: string
  type?: 'single' | 'multiple'
}

export function Accordion({ children, className }: AccordionProps) {
  return (
    <div className={cn('divide-y divide-white/5', className)}>
      {children}
    </div>
  )
}

interface AccordionItemProps {
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

export function AccordionItem({ children, defaultOpen = false, className }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const toggle = () => setIsOpen(!isOpen)

  return (
    <AccordionItemContext.Provider value={{ isOpen, toggle }}>
      <div className={cn('py-2', className)}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

interface AccordionTriggerProps {
  children: ReactNode
  className?: string
}

export function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  const context = useContext(AccordionItemContext)
  if (!context) throw new Error('AccordionTrigger must be used within AccordionItem')

  return (
    <button
      onClick={context.toggle}
      className={cn(
        'w-full flex items-center justify-between py-3 text-left',
        'text-white font-medium transition-colors hover:text-primary-400',
        className
      )}
    >
      {children}
      <ChevronDown
        className={cn(
          'w-5 h-5 text-claude-text-secondary transition-transform duration-200',
          context.isOpen && 'rotate-180'
        )}
      />
    </button>
  )
}

interface AccordionContentProps {
  children: ReactNode
  className?: string
}

export function AccordionContent({ children, className }: AccordionContentProps) {
  const context = useContext(AccordionItemContext)
  if (!context) throw new Error('AccordionContent must be used within AccordionItem')

  return (
    <div
      className={cn(
        'overflow-hidden transition-all duration-300',
        context.isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0',
        className
      )}
    >
      <div className="pb-4 text-claude-text-secondary">
        {children}
      </div>
    </div>
  )
}
