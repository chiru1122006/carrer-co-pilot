import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
  size?: 'sm' | 'md'
  glow?: boolean
  className?: string
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'sm',
  glow = false,
  className 
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-white/10 text-claude-text-secondary border-white/10',
    primary: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
    success: 'bg-green-500/20 text-green-300 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-300 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    outline: 'bg-transparent text-claude-text-secondary border-white/20'
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  }

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium border',
      'transition-all duration-200',
      variantClasses[variant],
      sizeClasses[size],
      glow && 'shadow-glow',
      className
    )}>
      {children}
    </span>
  )
}
