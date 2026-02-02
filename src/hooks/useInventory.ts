import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { InventoryItem } from '@/types';
import { toast } from 'sonner';

const STORAGE_KEY = 'dsv_inventory';

// Default inventory items for DSV Enterprise
const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Plain White T-Shirts', quantity: 500, minStock: 100, unitCost: 15, category: 'Apparel', lastUpdated: new Date().toISOString() },
  { id: '2', name: 'Plain Black T-Shirts', quantity: 450, minStock: 100, unitCost: 15, category: 'Apparel', lastUpdated: new Date().toISOString() },
  { id: '3', name: 'Polo Shirts (Assorted)', quantity: 300, minStock: 75, unitCost: 25, category: 'Apparel', lastUpdated: new Date().toISOString() },
  { id: '4', name: 'Baseball Caps', quantity: 200, minStock: 50, unitCost: 8, category: 'Accessories', lastUpdated: new Date().toISOString() },
  { id: '5', name: 'Ceramic Mugs', quantity: 350, minStock: 80, unitCost: 5, category: 'Drinkware', lastUpdated: new Date().toISOString() },
  { id: '6', name: 'Vinyl Banner Material (sqm)', quantity: 100, minStock: 25, unitCost: 12, category: 'Printing', lastUpdated: new Date().toISOString() },
  { id: '7', name: 'Business Card Paper (packs)', quantity: 150, minStock: 30, unitCost: 20, category: 'Printing', lastUpdated: new Date().toISOString() },
  { id: '8', name: 'Sticker Vinyl Rolls', quantity: 45, minStock: 15, unitCost: 35, category: 'Printing', lastUpdated: new Date().toISOString() },
  { id: '9', name: 'Tote Bags', quantity: 180, minStock: 50, unitCost: 10, category: 'Bags', lastUpdated: new Date().toISOString() },
  { id: '10', name: 'Branded Pens', quantity: 1000, minStock: 200, unitCost: 1.5, category: 'Stationery', lastUpdated: new Date().toISOString() },
];

export function useInventory() {
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>(
    STORAGE_KEY,
    DEFAULT_INVENTORY
  );

  const addItem = useCallback(
    (itemData: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
      const newItem: InventoryItem = {
        ...itemData,
        id: crypto.randomUUID(),
        lastUpdated: new Date().toISOString(),
      };

      setInventory((prev) => [newItem, ...prev]);
      toast.success('Item added to inventory', {
        description: `${newItem.name} has been added.`,
      });
      return newItem;
    },
    [setInventory]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<InventoryItem>) => {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, ...updates, lastUpdated: new Date().toISOString() }
            : item
        )
      );
      toast.success('Inventory updated');
    },
    [setInventory]
  );

  const deleteItem = useCallback(
    (id: string) => {
      setInventory((prev) => prev.filter((item) => item.id !== id));
      toast.success('Item removed from inventory');
    },
    [setInventory]
  );

  const reduceStock = useCallback(
    (id: string, quantity: number) => {
      setInventory((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const newQuantity = Math.max(0, item.quantity - quantity);
          if (newQuantity <= item.minStock) {
            toast.warning(`Low stock alert: ${item.name}`, {
              description: `Only ${newQuantity} units remaining.`,
            });
          }
          return {
            ...item,
            quantity: newQuantity,
            lastUpdated: new Date().toISOString(),
          };
        })
      );
    },
    [setInventory]
  );

  const addStock = useCallback(
    (id: string, quantity: number) => {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                lastUpdated: new Date().toISOString(),
              }
            : item
        )
      );
      toast.success('Stock added successfully');
    },
    [setInventory]
  );

  const getLowStockItems = useCallback(() => {
    return inventory.filter((item) => item.quantity <= item.minStock);
  }, [inventory]);

  const getItemById = useCallback(
    (id: string) => {
      return inventory.find((item) => item.id === id);
    },
    [inventory]
  );

  const searchInventory = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return inventory.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerQuery) ||
          item.category.toLowerCase().includes(lowerQuery)
      );
    },
    [inventory]
  );

  return {
    inventory,
    addItem,
    updateItem,
    deleteItem,
    reduceStock,
    addStock,
    getLowStockItems,
    getItemById,
    searchInventory,
  };
}
