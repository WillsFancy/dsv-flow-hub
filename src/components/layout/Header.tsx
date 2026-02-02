import { Package } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gradient-navy border-b border-primary/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-gold shadow-gold">
              <Package className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-primary-foreground">
                DSV Flow
              </h1>
              <p className="text-xs text-primary-foreground/70">
                Order Management System
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium text-primary-foreground">
              DSV Enterprise
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
