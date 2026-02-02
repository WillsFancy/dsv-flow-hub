import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Order, OrderStatus, DISCOUNT_TIERS, VAT_RATE } from '@/types';
import { toast } from 'sonner';

const STORAGE_KEY = 'dsv_orders';

export function useOrders() {
  const [orders, setOrders] = useLocalStorage<Order[]>(STORAGE_KEY, []);

  const generateOrderNumber = useCallback(() => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const todayOrders = orders.filter((o) =>
      o.orderNumber.includes(dateStr)
    ).length;
    const sequence = String(todayOrders + 1).padStart(3, '0');
    return `DSV-${dateStr}-${sequence}`;
  }, [orders]);

  const calculateDiscount = useCallback((quantity: number) => {
    const tier = DISCOUNT_TIERS.find((t) => quantity >= t.minQuantity);
    return tier ? tier.percentage : 0;
  }, []);

  const calculatePricing = useCallback(
    (quantity: number, unitPrice: number) => {
      const discountPercentage = calculateDiscount(quantity);
      const subtotal = quantity * unitPrice;
      const discount = subtotal * (discountPercentage / 100);
      const afterDiscount = subtotal - discount;
      const vatAmount = afterDiscount * VAT_RATE;
      const total = afterDiscount + vatAmount;
      // Assume 30% base profit margin, adjusted by discount
      const profitMargin = Math.max(30 - discountPercentage, 10);

      return {
        subtotal,
        discount,
        discountPercentage,
        vatAmount,
        vat: VAT_RATE * 100,
        total,
        profitMargin,
      };
    },
    [calculateDiscount]
  );

  const createOrder = useCallback(
    (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'subtotal' | 'discount' | 'discountPercentage' | 'vatAmount' | 'vat' | 'total' | 'profitMargin'>) => {
      const pricing = calculatePricing(orderData.quantity, orderData.unitPrice);
      const newOrder: Order = {
        ...orderData,
        id: crypto.randomUUID(),
        orderNumber: generateOrderNumber(),
        ...pricing,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setOrders((prev) => [newOrder, ...prev]);
      toast.success('Order created successfully', {
        description: `Order ${newOrder.orderNumber} has been created.`,
      });
      return newOrder;
    },
    [calculatePricing, generateOrderNumber, setOrders]
  );

  const updateOrder = useCallback(
    (id: string, updates: Partial<Order>) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== id) return order;

          const quantity = updates.quantity ?? order.quantity;
          const unitPrice = updates.unitPrice ?? order.unitPrice;
          const pricing = calculatePricing(quantity, unitPrice);

          return {
            ...order,
            ...updates,
            ...pricing,
            updatedAt: new Date().toISOString(),
          };
        })
      );
      toast.success('Order updated successfully');
    },
    [calculatePricing, setOrders]
  );

  const updateOrderStatus = useCallback(
    (id: string, status: OrderStatus) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id
            ? { ...order, status, updatedAt: new Date().toISOString() }
            : order
        )
      );
      toast.success(`Order status updated to ${status}`);
    },
    [setOrders]
  );

  const deleteOrder = useCallback(
    (id: string) => {
      setOrders((prev) => prev.filter((order) => order.id !== id));
      toast.success('Order deleted successfully');
    },
    [setOrders]
  );

  const getOrdersByClient = useCallback(
    (clientId: string) => {
      return orders.filter((order) => order.clientId === clientId);
    },
    [orders]
  );

  const getOrdersByStatus = useCallback(
    (status: OrderStatus) => {
      return orders.filter((order) => order.status === status);
    },
    [orders]
  );

  const getOrdersByDateRange = useCallback(
    (startDate: Date, endDate: Date) => {
      return orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    },
    [orders]
  );

  return {
    orders,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    getOrdersByClient,
    getOrdersByStatus,
    getOrdersByDateRange,
    calculatePricing,
    calculateDiscount,
  };
}
