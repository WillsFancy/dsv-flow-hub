import { Order, ORDER_STATUS_FLOW, VAT_RATE } from '@/types';
import { useOrders } from '@/hooks/useOrders';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Printer, 
  ArrowRight, 
  Package,
  Calendar,
  User,
  FileText
} from 'lucide-react';

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  const { updateOrderStatus } = useOrders();

  if (!order) return null;

  const getNextStatus = () => {
    const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status);
    if (currentIndex < ORDER_STATUS_FLOW.length - 1) {
      return ORDER_STATUS_FLOW[currentIndex + 1];
    }
    return null;
  };

  const nextStatus = getNextStatus();

  const handlePrint = () => {
    window.print();
  };

  const handleAdvanceStatus = () => {
    if (nextStatus) {
      updateOrderStatus(order.id, nextStatus);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `GH₵ ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="no-print">
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-accent" />
            Order Details
          </DialogTitle>
        </DialogHeader>

        {/* Printable Invoice */}
        <div className="space-y-6 print:p-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-primary">
                DSV Enterprise
              </h2>
              <p className="text-sm text-muted-foreground">
                Custom Branding Solutions
              </p>
              <p className="text-sm text-muted-foreground">Accra, Ghana</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-lg font-bold">{order.orderNumber}</p>
              <StatusBadge status={order.status} size="lg" />
            </div>
          </div>

          <Separator />

          {/* Client & Order Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <User className="h-4 w-4" />
                Client
              </div>
              <p className="mt-1 font-medium">{order.clientName}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Date
              </div>
              <p className="mt-1">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          <Separator />

          {/* Order Details */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-medium">
              <FileText className="h-4 w-4" />
              Order Items
            </h3>
            <div className="rounded-lg border">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium">
                      Product
                    </th>
                    <th className="px-4 py-2 text-center text-sm font-medium">
                      Qty
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium">
                      Unit Price
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-3">{order.productType}</td>
                    <td className="px-4 py-3 text-center">
                      {order.quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(order.unitPrice)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(order.subtotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="rounded-lg bg-muted/30 p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span>Discount ({order.discountPercentage}%)</span>
                  <span>- {formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>VAT ({VAT_RATE * 100}%)</span>
                <span>{formatCurrency(order.vatAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="rounded-lg bg-muted/30 p-4">
              <p className="text-sm font-medium text-muted-foreground">Notes</p>
              <p className="mt-1">{order.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 no-print">
            <Button variant="outline" onClick={handlePrint} className="flex-1">
              <Printer className="mr-2 h-4 w-4" />
              Print Invoice
            </Button>
            {nextStatus && (
              <Button
                onClick={handleAdvanceStatus}
                className="flex-1 bg-gradient-gold text-accent-foreground hover:opacity-90"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Move to {nextStatus}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
