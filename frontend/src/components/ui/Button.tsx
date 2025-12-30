import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glow'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
  glow?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  glow = false,
  disabled,
  children,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-claude-bg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-glow focus:ring-primary-500 hover:from-primary-400 hover:to-primary-500',
    secondary: 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 focus:ring-white/20',
    outline: 'border border-white/10 text-claude-text-secondary hover:text-white hover:border-primary-500/50 hover:bg-primary-500/10 focus:ring-primary-500',
    ghost: 'text-claude-text-secondary hover:text-white hover:bg-white/5 focus:ring-white/20',
    danger: 'bg-red-500/90 text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/25 focus:ring-red-500',
    glow: 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-glow hover:shadow-glow-lg focus:ring-primary-500 animate-glow-pulse'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
    icon: 'p-2.5'
  }

  return (
    <button
      ref={ref}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        glow && 'shadow-glow hover:shadow-glow-lg',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export { Button }
