import { useState, useEffect, useMemo } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { useClients } from '@/hooks/useClients';
import { Client, PRODUCT_TYPES, DISCOUNT_TIERS, VAT_RATE } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  Plus, 
  Percent, 
  Receipt, 
  TrendingUp,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderFormProps {
  onOrderCreated?: () => void;
}

export function OrderForm({ onOrderCreated }: OrderFormProps) {
  const { createOrder, calculatePricing } = useOrders();
  const { clients, createClient } = useClients();

  const [selectedClientId, setSelectedClientId] = useState('');
  const [productType, setProductType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [notes, setNotes] = useState('');
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);

  // New client form
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
  });

  const pricing = useMemo(() => {
    return calculatePricing(quantity, unitPrice);
  }, [quantity, unitPrice, calculatePricing]);

  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId);
  }, [clients, selectedClientId]);

  const currentDiscountTier = useMemo(() => {
    return DISCOUNT_TIERS.find((tier) => quantity >= tier.minQuantity);
  }, [quantity]);

  const handleCreateClient = () => {
    if (!newClient.name.trim()) return;
    const client = createClient(newClient);
    setSelectedClientId(client.id);
    setShowNewClientDialog(false);
    setNewClient({ name: '', phone: '', email: '', company: '' });
  };

  const handleSubmit = (e: React.FormEvent, status: 'Draft' | 'Pending') => {
    e.preventDefault();
    if (!selectedClientId || !productType || quantity < 1 || unitPrice <= 0) {
      return;
    }

    createOrder({
      clientId: selectedClientId,
      clientName: selectedClient?.name || '',
      productType,
      quantity,
      unitPrice,
      status,
      notes,
    });

    // Reset form
    setSelectedClientId('');
    setProductType('');
    setQuantity(1);
    setUnitPrice(0);
    setNotes('');
    onOrderCreated?.();
  };

  const isValid = selectedClientId && productType && quantity >= 1 && unitPrice > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Order Form */}
      <Card className="lg:col-span-3 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-accent" />
            Create New Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label>Client *</Label>
              <div className="flex gap-2">
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} {client.company && `(${client.company})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="icon">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Client</DialogTitle>
                      <DialogDescription>
                        Add a new client to your database.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input
                          value={newClient.name}
                          onChange={(e) =>
                            setNewClient({ ...newClient, name: e.target.value })
                          }
                          placeholder="Client name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                          value={newClient.company}
                          onChange={(e) =>
                            setNewClient({ ...newClient, company: e.target.value })
                          }
                          placeholder="Company name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input
                            value={newClient.phone}
                            onChange={(e) =>
                              setNewClient({ ...newClient, phone: e.target.value })
                            }
                            placeholder="+233..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={newClient.email}
                            onChange={(e) =>
                              setNewClient({ ...newClient, email: e.target.value })
                            }
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={handleCreateClient}
                        className="w-full bg-gradient-gold text-accent-foreground hover:opacity-90"
                        disabled={!newClient.name.trim()}
                      >
                        Add Client
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Product Type */}
            <div className="space-y-2">
              <Label>Product Type *</Label>
              <Select value={productType} onValueChange={setProductType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product type" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity and Unit Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label>Unit Price (GH₵) *</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Discount Tier Indicator */}
            {currentDiscountTier && currentDiscountTier.percentage > 0 && (
              <div className="rounded-lg bg-success/10 p-3 text-sm">
                <div className="flex items-center gap-2 font-medium text-success">
                  <Percent className="h-4 w-4" />
                  {currentDiscountTier.label}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {currentDiscountTier.percentage}% discount applied automatically
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions, design notes, etc."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={(e) => handleSubmit(e, 'Draft')}
                disabled={!isValid}
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                className="flex-1 bg-gradient-gold text-accent-foreground shadow-gold hover:opacity-90"
                onClick={(e) => handleSubmit(e, 'Pending')}
                disabled={!isValid}
              >
                Submit Order
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Quote Preview */}
      <Card className="lg:col-span-2 animate-slide-up h-fit sticky top-4">
        <CardHeader className="bg-gradient-navy text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="h-5 w-5" />
            Quote Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Client Info */}
            {selectedClient && (
              <div className="rounded-lg bg-secondary p-3">
                <p className="font-medium">{selectedClient.name}</p>
                {selectedClient.company && (
                  <p className="text-sm text-muted-foreground">
                    {selectedClient.company}
                  </p>
                )}
              </div>
            )}

            {/* Product Info */}
            {productType && (
              <div>
                <p className="text-sm text-muted-foreground">Product</p>
                <p className="font-medium">{productType}</p>
              </div>
            )}

            <Separator />

            {/* Pricing Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {quantity} × GH₵ {unitPrice.toFixed(2)}
                </span>
                <span>GH₵ {pricing.subtotal.toFixed(2)}</span>
              </div>

              {pricing.discountPercentage > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span>Discount ({pricing.discountPercentage}%)</span>
                  <span>- GH₵ {pricing.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  VAT ({VAT_RATE * 100}%)
                </span>
                <span>GH₵ {pricing.vatAmount.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-gradient-gold">
                  GH₵ {pricing.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Profit Margin Indicator */}
            <div className="rounded-lg bg-accent/10 p-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  Estimated Margin
                </span>
                <span className="font-bold text-accent">
                  {pricing.profitMargin}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
