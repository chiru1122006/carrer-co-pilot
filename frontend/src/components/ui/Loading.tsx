import { cn } from '../../lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3'
  }

  return (
    <div
      className={cn(
        sizeClasses[size],
        'border-primary-500 border-t-transparent rounded-full animate-spin',
        className
      )}
    />
  )
}

interface LoadingProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Loading({ text = 'Loading...', size = 'lg' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <Spinner size={size} />
        <div className="absolute inset-0 animate-ping opacity-20">
          <Spinner size={size} />
        </div>
      </div>
      <p className="mt-4 text-claude-text-secondary animate-pulse">{text}</p>
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-primary-500/20"></div>
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}

interface LoadingOverlayProps {
  message?: string
}

export function LoadingOverlay({ message = 'Processing...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-claude-bg/80 backdrop-blur-sm">
      <div className="glass-card p-8 flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-3 border-primary-500/20"></div>
          <div className="absolute inset-0 w-16 h-16 rounded-full border-3 border-primary-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-white font-medium">{message}</p>
      </div>
    </div>
  )
}
