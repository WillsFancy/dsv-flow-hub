import { useState, useMemo } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Printer,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Target
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';

export function ReportsView() {
  const { orders, getOrdersByDateRange } = useOrders();
  
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(
    firstDayOfMonth.toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const filteredOrders = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return getOrdersByDateRange(start, end);
  }, [startDate, endDate, getOrdersByDateRange]);

  const metrics = useMemo(() => {
    const completedOrders = filteredOrders.filter(
      (o) => o.status === 'Completed' || o.status === 'Delivered'
    );
    
    const totalSales = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / completedOrders.length || 0 : 0;
    const totalUnits = filteredOrders.reduce((sum, o) => sum + o.quantity, 0);
    
    // Group by product type
    const productBreakdown = filteredOrders.reduce((acc, order) => {
      if (!acc[order.productType]) {
        acc[order.productType] = { count: 0, revenue: 0, units: 0 };
      }
      acc[order.productType].count += 1;
      acc[order.productType].revenue += order.total;
      acc[order.productType].units += order.quantity;
      return acc;
    }, {} as Record<string, { count: number; revenue: number; units: number }>);

    // Group by status
    const statusBreakdown = filteredOrders.reduce((acc, order) => {
      if (!acc[order.status]) {
        acc[order.status] = 0;
      }
      acc[order.status] += 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSales,
      totalOrders,
      avgOrderValue,
      totalUnits,
      productBreakdown,
      statusBreakdown,
      completedCount: completedOrders.length,
    };
  }, [filteredOrders]);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return `GH₵ ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(metrics.totalSales),
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Total Orders',
      value: metrics.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      label: 'Avg Order Value',
      value: formatCurrency(metrics.avgOrderValue),
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Total Units',
      value: metrics.totalUnits.toLocaleString(),
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="space-y-6 print:p-4">
      {/* Header with Date Filter */}
      <Card className="animate-fade-in no-print">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent" />
            Sales Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Print Header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">DSV Enterprise - Sales Report</h1>
        <p className="text-muted-foreground">
          Period: {formatDate(startDate)} - {formatDate(endDate)}
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={cn('rounded-lg p-2', stat.bgColor)}>
                    <Icon className={cn('h-5 w-5', stat.color)} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="font-display text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Breakdown */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg">Revenue by Product</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(metrics.productBreakdown).length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No orders in selected period
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(metrics.productBreakdown)
                  .sort((a, b) => b[1].revenue - a[1].revenue)
                  .map(([product, data]) => {
                    const percentage = (data.revenue / metrics.totalSales) * 100 || 0;
                    return (
                      <div key={product} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{product}</span>
                          <span className="text-muted-foreground">
                            {data.count} orders • {data.units.toLocaleString()} units
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 flex-1 rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-gradient-gold"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-24 text-right text-sm font-medium">
                            {formatCurrency(data.revenue)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(metrics.statusBreakdown).length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No orders in selected period
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(metrics.statusBreakdown).map(([status, count]) => {
                  const percentage = (count / metrics.totalOrders) * 100;
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <StatusBadge status={status as any} size="md" />
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{count}</span>
                        <span className="text-sm text-muted-foreground">
                          ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Details Table */}
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle className="text-lg">Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No orders found in the selected date range
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>{order.clientName}</TableCell>
                      <TableCell>{order.productType}</TableCell>
                      <TableCell className="text-center">
                        {order.quantity.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} size="sm" />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
