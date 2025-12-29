import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
  glow?: boolean
}

export function Card({ children, className, hover = false, gradient = false, glow = false }: CardProps) {
  return (
    <div className={cn(
      'glass-card',
      hover && 'glass-card-hover',
      gradient && 'gradient-border',
      glow && 'animate-glow-pulse',
      className
    )}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center gap-3 mb-6', className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
  subtitle?: string
}

export function CardTitle({ children, className, subtitle }: CardTitleProps) {
  return (
    <div className={className}>
      <h2 className="text-xl font-semibold text-white">
        {children}
      </h2>
      {subtitle && (
        <p className="text-sm text-claude-text-secondary mt-0.5">{subtitle}</p>
      )}
    </div>
  )
}

interface CardIconProps {
  icon: React.ComponentType<{ className?: string }>
  color?: 'primary' | 'accent' | 'green' | 'orange' | 'red' | 'pink' | 'blue' | 'yellow'
  className?: string
  glow?: boolean
}

export function CardIcon({ icon: Icon, color = 'primary', className, glow = false }: CardIconProps) {
  const colorClasses = {
    primary: 'bg-primary-500/20 text-primary-400',
    accent: 'bg-accent-500/20 text-accent-400',
    green: 'bg-green-500/20 text-green-400',
    orange: 'bg-orange-500/20 text-orange-400',
    red: 'bg-red-500/20 text-red-400',
    pink: 'bg-pink-500/20 text-pink-400',
    blue: 'bg-blue-500/20 text-blue-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
  }

  return (
    <div className={cn(
      'w-12 h-12 rounded-xl flex items-center justify-center',
      colorClasses[color],
      glow && 'shadow-glow',
      className
    )}>
      <Icon className="w-6 h-6" />
    </div>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('mt-6 pt-6 border-t border-white/5', className)}>
      {children}
    </div>
  )
}
