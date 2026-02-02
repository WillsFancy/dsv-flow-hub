import { useMemo } from 'react';
import { Order } from '@/types';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Clock,
  CheckCircle,
  Truck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStatsProps {
  orders: Order[];
}

export function DashboardStats({ orders }: DashboardStatsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyOrders = orders.filter(
      (o) => new Date(o.createdAt) >= startOfMonth
    );

    const totalSales = orders
      .filter((o) => o.status === 'Completed' || o.status === 'Delivered')
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
    const inProduction = orders.filter((o) => o.status === 'Production').length;
    const completed = orders.filter(
      (o) => o.status === 'Completed' || o.status === 'Delivered'
    ).length;

    const avgOrderValue = orders.length > 0 ? totalSales / completed || 0 : 0;

    return {
      totalSales,
      totalOrders: orders.length,
      monthlyOrders: monthlyOrders.length,
      pendingOrders,
      inProduction,
      completed,
      avgOrderValue,
    };
  }, [orders]);

  const statCards = [
    {
      label: 'Total Sales',
      value: `GH₵ ${stats.totalSales.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      label: 'This Month',
      value: stats.monthlyOrders.toString(),
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Pending',
      value: stats.pendingOrders.toString(),
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'In Production',
      value: stats.inProduction.toString(),
      icon: Truck,
      color: 'text-status-production',
      bgColor: 'bg-status-production/10',
    },
    {
      label: 'Completed',
      value: stats.completed.toString(),
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={cn(
              'rounded-xl bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md',
              'animate-fade-in border border-border'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className={cn('rounded-lg p-2', stat.bgColor)}>
                <Icon className={cn('h-4 w-4', stat.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-muted-foreground">
                  {stat.label}
                </p>
                <p className="truncate font-display text-lg font-semibold">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
