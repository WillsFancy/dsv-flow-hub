import { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';
import { 
  FileEdit, 
  Clock, 
  CheckCircle, 
  Cog, 
  PackageCheck, 
  Truck 
} from 'lucide-react';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const statusConfig: Record<OrderStatus, { 
  bg: string; 
  text: string; 
  icon: React.ComponentType<{ className?: string }> 
}> = {
  Draft: { bg: 'bg-muted', text: 'text-muted-foreground', icon: FileEdit },
  Pending: { bg: 'bg-status-pending/20', text: 'text-status-pending', icon: Clock },
  Approved: { bg: 'bg-status-approved/20', text: 'text-status-approved', icon: CheckCircle },
  Production: { bg: 'bg-status-production/20', text: 'text-status-production', icon: Cog },
  Completed: { bg: 'bg-status-completed/20', text: 'text-status-completed', icon: PackageCheck },
  Delivered: { bg: 'bg-status-delivered/20', text: 'text-status-delivered', icon: Truck },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

export function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        config.bg,
        config.text,
        sizeClasses[size]
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {status}
    </span>
  );
}
