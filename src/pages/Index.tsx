import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { TabNavigation, TabId } from '@/components/layout/TabNavigation';
import { DashboardStats } from '@/components/layout/DashboardStats';
import { OrderForm } from '@/components/orders/OrderForm';
import { OrderList } from '@/components/orders/OrderList';
import { ClientList } from '@/components/clients/ClientList';
import { InventoryList } from '@/components/inventory/InventoryList';
import { ReportsView } from '@/components/reports/ReportsView';
import { useOrders } from '@/hooks/useOrders';
import { useInventory } from '@/hooks/useInventory';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('new-order');
  const { orders } = useOrders();
  const { getLowStockItems } = useInventory();

  const lowStockCount = getLowStockItems().length;

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
  };

  const handleOrderCreated = () => {
    // Optionally switch to orders tab after creating
    // setActiveTab('orders');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'new-order':
        return <OrderForm onOrderCreated={handleOrderCreated} />;
      case 'orders':
        return <OrderList />;
      case 'inventory':
        return <InventoryList />;
      case 'clients':
        return <ClientList />;
      case 'reports':
        return <ReportsView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        lowStockCount={lowStockCount}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Dashboard Stats - Always visible */}
        <div className="mb-6">
          <DashboardStats orders={orders} />
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">{renderContent()}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground no-print">
        <p>© 2024 DSV Enterprise. All rights reserved.</p>
        <p className="mt-1 text-xs">DSV Flow - Order Management System v1.0</p>
      </footer>
    </div>
  );
};

export default Index;
