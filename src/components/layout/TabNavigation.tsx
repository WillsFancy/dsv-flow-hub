import { cn } from '@/lib/utils';
import { 
  PlusCircle, 
  ClipboardList, 
  Package, 
  Users, 
  BarChart3 
} from 'lucide-react';

export type TabId = 'new-order' | 'orders' | 'inventory' | 'clients' | 'reports';

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  lowStockCount?: number;
}

const tabs = [
  { id: 'new-order' as TabId, label: 'New Order', icon: PlusCircle },
  { id: 'orders' as TabId, label: 'Orders', icon: ClipboardList },
  { id: 'inventory' as TabId, label: 'Inventory', icon: Package },
  { id: 'clients' as TabId, label: 'Clients', icon: Users },
  { id: 'reports' as TabId, label: 'Reports', icon: BarChart3 },
];

export function TabNavigation({ activeTab, onTabChange, lowStockCount = 0 }: TabNavigationProps) {
  return (
    <nav className="border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const showBadge = tab.id === 'inventory' && lowStockCount > 0;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                  'hover:bg-secondary',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="whitespace-nowrap">{tab.label}</span>
                {showBadge && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {lowStockCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
