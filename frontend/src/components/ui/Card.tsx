import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div className={cn(
      'glass-card',
      hover && 'card-hover',
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
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        {children}
      </h2>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      )}
    </div>
  )
}

interface CardIconProps {
  icon: React.ComponentType<{ className?: string }>
  color?: 'primary' | 'accent' | 'green' | 'orange' | 'red' | 'pink'
  className?: string
}

export function CardIcon({ icon: Icon, color = 'primary', className }: CardIconProps) {
  const colorClasses = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    accent: 'bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
  }

  return (
    <div className={cn(
      'w-12 h-12 rounded-xl flex items-center justify-center',
      colorClasses[color],
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
