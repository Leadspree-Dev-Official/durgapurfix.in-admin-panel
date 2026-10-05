import React from 'react';
import { 
  LayoutDashboard, ShoppingBag, Briefcase, Users, Menu, 
  ShieldCheck, Wallet, FileText 
} from 'lucide-react';
import { UserRole } from '../types';

interface MobileBottomNavProps {
  currentRole: UserRole;
  activeView: string;
  onSelectView: (view: string) => void;
  onToggleSidebar: () => void;
  pendingOrdersCount?: number;
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  isActive: boolean;
  badge?: number;
  onClick: () => void;
}

export default function MobileBottomNav({
  currentRole,
  activeView,
  onSelectView,
  onToggleSidebar,
  pendingOrdersCount = 0
}: MobileBottomNavProps) {
  
  // Tab definition for Admin / Staff
  const adminTabs: TabItem[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: LayoutDashboard,
      isActive: activeView === 'dashboard',
      onClick: () => onSelectView('dashboard')
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      isActive: activeView.startsWith('orders-'),
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      onClick: () => onSelectView('orders-all')
    },
    {
      id: 'services',
      label: 'Services',
      icon: Briefcase,
      isActive: activeView.startsWith('services-'),
      onClick: () => onSelectView('services-all')
    },
    {
      id: 'providers',
      label: 'Partners',
      icon: Users,
      isActive: activeView.startsWith('providers-'),
      onClick: () => onSelectView('providers-all')
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: Menu,
      isActive: false,
      onClick: onToggleSidebar
    }
  ];

  // Tab definition for Service Provider
  const providerTabs: TabItem[] = [
    {
      id: 'provider-portal',
      label: 'Jobs Feed',
      icon: Briefcase,
      isActive: activeView === 'provider-portal' || activeView === 'partner-jobs',
      onClick: () => onSelectView('provider-portal')
    },
    {
      id: 'partner-kyc',
      label: 'Audit & KYC',
      icon: ShieldCheck,
      isActive: activeView === 'partner-kyc',
      onClick: () => onSelectView('partner-kyc')
    },
    {
      id: 'orders',
      label: 'Job History',
      icon: ShoppingBag,
      isActive: activeView.startsWith('orders-'),
      onClick: () => onSelectView('orders-all')
    },
    {
      id: 'menu',
      label: 'More',
      icon: Menu,
      isActive: false,
      onClick: onToggleSidebar
    }
  ];

  const tabs = currentRole === 'provider' ? providerTabs : adminTabs;

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none safe-bottom transition-all"
      id="mobile-bottom-nav-bar"
    >
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.isActive;

          return (
            <button
              key={tab.id}
              onClick={tab.onClick}
              type="button"
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 h-full rounded-xl transition-all duration-200 cursor-pointer active:scale-90 relative ${
                active 
                  ? 'text-[#106ad2]' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <div className={`p-1 rounded-xl transition-colors ${
                  active ? 'bg-blue-50 text-[#106ad2]' : 'text-slate-600'
                }`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 font-bold truncate max-w-[64px] ${
                active ? 'text-[#106ad2] font-extrabold' : 'text-slate-500'
              }`}>
                {tab.label}
              </span>
              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#106ad2]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
