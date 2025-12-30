import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ComponentType<{ className?: string }>
  error?: string
  glow?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  icon: Icon,
  error,
  glow = false,
  ...props
}, ref) => {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-claude-text-muted" />
      )}
      <input
        ref={ref}
        className={cn(
          'w-full py-3 rounded-xl',
          'bg-claude-surface border text-white placeholder-claude-text-muted',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50',
          'transition-all duration-200',
          Icon ? 'pl-12 pr-4' : 'px-4',
          error 
            ? 'border-red-500' 
            : 'border-white/10 hover:border-white/20',
          glow && 'focus:shadow-glow',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export { Input }
