import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ComponentType<{ className?: string }>
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  icon: Icon,
  error,
  ...props
}, ref) => {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      )}
      <input
        ref={ref}
        className={cn(
          'w-full py-3 rounded-xl bg-white dark:bg-gray-800 border text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
          Icon ? 'pl-12 pr-4' : 'px-4',
          error 
            ? 'border-red-500 dark:border-red-500' 
            : 'border-gray-200 dark:border-gray-700',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export { Input }
