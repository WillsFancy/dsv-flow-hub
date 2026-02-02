import { useState, useMemo } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { InventoryItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Package,
  PlusCircle,
  MinusCircle,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function InventoryList() {
  const { inventory, addItem, updateItem, deleteItem, addStock, reduceStock, getLowStockItems } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState({ itemId: '', amount: 0, type: 'add' as 'add' | 'reduce' });
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    minStock: 10,
    unitCost: 0,
    category: '',
  });

  const lowStockItems = getLowStockItems();

  const filteredInventory = useMemo(() => {
    if (!searchQuery) return inventory;
    const query = searchQuery.toLowerCase();
    return inventory.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }, [inventory, searchQuery]);

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (editingItem) {
      updateItem(editingItem.id, formData);
    } else {
      addItem(formData);
    }

    setFormData({ name: '', quantity: 0, minStock: 10, unitCost: 0, category: '' });
    setShowAddDialog(false);
    setEditingItem(null);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      minStock: item.minStock,
      unitCost: item.unitCost,
      category: item.category,
    });
    setShowAddDialog(true);
  };

  const handleStockAdjust = (item: InventoryItem, type: 'add' | 'reduce') => {
    setStockAdjustment({ itemId: item.id, amount: 0, type });
    setShowStockDialog(true);
  };

  const confirmStockAdjustment = () => {
    if (stockAdjustment.amount > 0) {
      if (stockAdjustment.type === 'add') {
        addStock(stockAdjustment.itemId, stockAdjustment.amount);
      } else {
        reduceStock(stockAdjustment.itemId, stockAdjustment.amount);
      }
    }
    setShowStockDialog(false);
    setStockAdjustment({ itemId: '', amount: 0, type: 'add' });
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingItem(null);
    setFormData({ name: '', quantity: 0, minStock: 10, unitCost: 0, category: '' });
  };

  const getStockLevel = (item: InventoryItem) => {
    const percentage = (item.quantity / (item.minStock * 3)) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  const getStockColor = (item: InventoryItem) => {
    if (item.quantity <= item.minStock) return 'bg-destructive';
    if (item.quantity <= item.minStock * 1.5) return 'bg-warning';
    return 'bg-success';
  };

  const formatCurrency = (amount: number) => {
    return `GH₵ ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
  };

  return (
    <>
      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="mb-6 border-destructive/50 bg-destructive/5 animate-fade-in">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Low Stock Alert</p>
                <p className="text-sm text-muted-foreground">
                  {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} running low:{' '}
                  {lowStockItems.map((item) => item.name).join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="animate-fade-in">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-accent" />
              Inventory ({filteredInventory.length})
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-gold text-accent-foreground hover:opacity-90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? 'Edit Item' : 'Add New Item'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingItem
                        ? 'Update inventory item details.'
                        : 'Add a new item to your inventory.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Item Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Item name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        placeholder="e.g., Apparel, Printing, Accessories"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min={0}
                          value={formData.quantity}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              quantity: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Min Stock</Label>
                        <Input
                          type="number"
                          min={0}
                          value={formData.minStock}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              minStock: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit Cost</Label>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={formData.unitCost}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              unitCost: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={handleCloseDialog}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        className="flex-1 bg-gradient-gold text-accent-foreground hover:opacity-90"
                        disabled={!formData.name.trim()}
                      >
                        {editingItem ? 'Update' : 'Add'} Item
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-medium">No items found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Add your first inventory item'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Stock Level</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Unit Cost</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item, index) => {
                    const isLowStock = item.quantity <= item.minStock;
                    return (
                      <TableRow
                        key={item.id}
                        className={cn(
                          'animate-fade-in',
                          isLowStock && 'bg-destructive/5'
                        )}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isLowStock && (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            )}
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                            {item.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="mx-auto w-24">
                            <Progress
                              value={getStockLevel(item)}
                              className={cn('h-2', getStockColor(item))}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={cn(
                              'font-medium',
                              isLowStock && 'text-destructive'
                            )}
                          >
                            {item.quantity.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">
                            {' '}
                            / {item.minStock} min
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitCost)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleStockAdjust(item, 'add')}
                              >
                                <PlusCircle className="mr-2 h-4 w-4 text-success" />
                                Add Stock
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStockAdjust(item, 'reduce')}
                              >
                                <MinusCircle className="mr-2 h-4 w-4 text-warning" />
                                Reduce Stock
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEdit(item)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteItem(item.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Adjustment Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {stockAdjustment.type === 'add' ? 'Add Stock' : 'Reduce Stock'}
            </DialogTitle>
            <DialogDescription>
              Enter the quantity to {stockAdjustment.type}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min={1}
                value={stockAdjustment.amount}
                onChange={(e) =>
                  setStockAdjustment({
                    ...stockAdjustment,
                    amount: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Enter quantity"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowStockDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmStockAdjustment}
                className={cn(
                  'flex-1',
                  stockAdjustment.type === 'add'
                    ? 'bg-success text-success-foreground hover:bg-success/90'
                    : 'bg-warning text-warning-foreground hover:bg-warning/90'
                )}
                disabled={stockAdjustment.amount <= 0}
              >
                {stockAdjustment.type === 'add' ? 'Add' : 'Reduce'} Stock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
