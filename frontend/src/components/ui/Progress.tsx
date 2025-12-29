import { cn } from '../../lib/utils'

interface ProgressRingProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  className?: string
  showValue?: boolean
  label?: string
  glow?: boolean
}

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
  showValue = true,
  label,
  glow = false
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percentage = Math.min(Math.max(value, 0), max) / max
  const offset = circumference - percentage * circumference

  return (
    <div className={cn(
      'relative inline-flex items-center justify-center',
      glow && 'drop-shadow-[0_0_15px_rgba(124,124,255,0.3)]',
      className
    )}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/10"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progress-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c7cff" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">
            {Math.round(percentage * 100)}%
          </span>
          {label && (
            <span className="text-xs text-claude-text-secondary mt-1">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  glow?: boolean
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
  size = 'md',
  animated = true,
  glow = false,
  color = 'primary'
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(value, 0), max) / max * 100

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  const colorClasses = {
    primary: 'from-primary-500 to-accent-500',
    success: 'from-green-500 to-emerald-400',
    warning: 'from-yellow-500 to-orange-400',
    danger: 'from-red-500 to-rose-400'
  }

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-claude-text-secondary">Progress</span>
          <span className="font-medium text-white">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn(
        'w-full bg-white/10 rounded-full overflow-hidden',
        sizeClasses[size],
        glow && 'shadow-glow'
      )}>
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r',
            colorClasses[color],
            animated && 'transition-all duration-700 ease-out'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
