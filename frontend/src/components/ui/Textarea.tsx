import { forwardRef, TextareaHTMLAttributes, useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  autoResize?: boolean
  maxHeight?: number
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className,
  error,
  autoResize = false,
  maxHeight = 200,
  onChange,
  ...props
}, ref) => {
  const internalRef = useRef<HTMLTextAreaElement>(null)
  const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef

  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (!textarea || !autoResize) return

    textarea.style.height = 'auto'
    const newHeight = Math.min(textarea.scrollHeight, maxHeight)
    textarea.style.height = `${newHeight}px`
  }

  useEffect(() => {
    adjustHeight()
  }, [props.value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      adjustHeight()
    }
    onChange?.(e)
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        className={cn(
          'w-full px-4 py-3 rounded-xl resize-none',
          'bg-claude-surface border text-white placeholder-claude-text-muted',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50',
          'transition-all duration-200',
          error
            ? 'border-red-500'
            : 'border-white/10 hover:border-white/20',
          className
        )}
        onChange={handleChange}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export { Textarea }
