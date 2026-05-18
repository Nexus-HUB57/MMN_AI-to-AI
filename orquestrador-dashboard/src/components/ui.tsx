import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn(
      "rounded-lg border border-gray-200 bg-white shadow-sm",
      className
    )}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)}>
      {children}
    </h3>
  )
}

interface CardDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn("text-sm text-gray-500", className)}>
      {children}
    </p>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn("p-6 pt-0", className)}>
      {children}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: { value: number; positive: boolean }
  className?: string
}

export function StatCard({ title, value, description, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-2">
          <span className="text-sm font-medium text-gray-500">{title}</span>
          <span className="text-3xl font-bold">{value}</span>
          {description && (
            <span className="text-xs text-gray-400">{description}</span>
          )}
          {trend && (
            <span className={cn(
              "text-xs font-medium",
              trend.positive ? "text-green-600" : "text-red-600"
            )}>
              {trend.positive ? "+" : "-"}{Math.abs(trend.value)}%
            </span>
          )}
        </div>
        <div className="rounded-full bg-blue-100 p-3">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </Card>
  )
}

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    outline: "border border-gray-300 text-gray-700"
  }

  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
}

export function ProgressBar({ value, max = 100, className }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-2", className)}>
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

interface AvatarProps {
  src?: string
  alt?: string
  fallback: string
  className?: string
}

export function Avatar({ src, alt, fallback, className }: AvatarProps) {
  return (
    <div className={cn(
      "flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold",
      className
    )}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full rounded-full object-cover" />
      ) : (
        fallback
      )}
    </div>
  )
}

interface TableProps {
  children: React.ReactNode
  className?: string
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full caption-bottom text-sm">
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="border-b bg-gray-50">{children}</thead>
}

export function TableRow({ children }: { children: React.ReactNode }) {
  return <tr className="border-b transition-colors hover:bg-gray-50">{children}</tr>
}

export function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("h-12 px-4 text-left align-middle font-medium text-gray-500", className)}>
      {children}
    </th>
  )
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>
}

export function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn("p-4 align-middle", className)}>
      {children}
    </td>
  )
}