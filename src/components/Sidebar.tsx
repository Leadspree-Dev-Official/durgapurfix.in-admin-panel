import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FolderTree, Tags, MapPin, Ticket, Layers, Star, 
  Settings, Users, ShieldAlert, CreditCard, Landmark, FileBarChart2, 
  ChevronDown, ChevronRight, LogOut, Menu, X, UserCheck, Briefcase, 
  Grid, Bell, ShieldCheck, Camera, Globe, ArrowUpRight, Database, Calendar, Headphones
} from 'lucide-react';
import { UserRole } from '../types';
import { getDefaultAvatar } from '../data/avengers';
import Logo from './Logo';

interface SidebarProps {
  currentRole: UserRole;
  userName: string;
  userAvatar?: string;
  userGender?: 'male' | 'female';
  onChangePhoto?: () => void;
  activeView: string;
  onSelectView: (view: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface SidebarMenu {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  view?: string;
  subMenus?: { label: string; view: string }[];
  allowedRoles: UserRole[];
  badge?: string;
}

export default function Sidebar({ 
  currentRole, userName, userAvatar, userGender, onChangePhoto, activeView, onSelectView, onLogout, isOpen, setIsOpen 
}: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const displayAvatar = userAvatar || getDefaultAvatar(userGender, userName);

  const toggleSubMenu = (menuId: string) => {
    setExpandedMenus(prev => {
      const isCurrentlyOpen = !!prev[menuId];
      if (isCurrentlyOpen) {
        return {};
      }
      return { [menuId]: true };
    });
  };

  const handleSelectView = (view: string) => {
    onSelectView(view);
    const parentMenu = menuItems.find(item => item.subMenus?.some(sub => sub.view === view));
    if (parentMenu) {
      setExpandedMenus({ [parentMenu.id]: true });
    } else {
      setExpandedMenus({});
    }
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const menuItems: SidebarMenu[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      view: 'dashboard',
      allowedRoles: ['admin', 'executive', 'provider']
    },
    {
      id: 'category',
      label: 'Category',
      icon: FolderTree,
      subMenus: [
        { label: 'Manage Category', view: 'category' }
      ],
      allowedRoles: ['admin', 'executive']
    },
    {
      id: 'subcategory',
      label: 'Sub Category',
      icon: Tags,
      subMenus: [
        { label: 'Manage Sub Category', view: 'subcategory' }
      ],
      allowedRoles: ['admin', 'executive']
    },
    {
      id: 'coupons',
      label: 'Coupons',
      icon: Ticket,
      view: 'coupons',
      allowedRoles: ['admin']
    },
    {
      id: 'sliders',
      label: 'Sliders / Promo Banners',
      icon: Layers,
      view: 'sliders',
      allowedRoles: ['admin']
    },
    {
      id: 'review',
      label: 'Manage Review',
      icon: Star,
      view: 'reviews',
      allowedRoles: ['admin', 'executive']
    },
    {
      id: 'services',
      label: 'Manage Services',
      icon: Grid,
      subMenus: [
        { label: 'All Services', view: 'services-all' },
        { label: 'Pending Services', view: 'services-pending' },
        { label: 'Approved Services', view: 'services-approved' },
        { label: 'Rejected Services', view: 'services-rejected' }
      ],
      allowedRoles: ['admin', 'executive']
    },
    {
      id: 'orders',
      label: 'Manage Orders',
      icon: Briefcase,
      subMenus: [
        { label: 'All Orders', view: 'orders-all' },
        { label: 'Pending Orders', view: 'orders-pending' },
        { label: 'Confirmed Orders', view: 'orders-confirmed' },
        { label: 'Initiated Orders', view: 'orders-initiated' },
        { label: 'Canceled Orders', view: 'orders-canceled' }
      ],
      allowedRoles: ['admin', 'executive']
    },
    {
      id: 'users',
      label: 'Manage User',
      icon: Users,
      subMenus: [
        { label: 'Active User', view: 'users-active' },
        { label: 'Banned User', view: 'users-banned' },
        { label: 'All User', view: 'users-all' },
        { label: 'Send Notification', view: 'users-notify' }
      ],
      allowedRoles: ['admin', 'executive']
    },
    {
      id: 'providers',
      label: 'Manage Provider',
      icon: UserCheck,
      subMenus: [
        { label: 'KYC Verification', view: 'providers-kyc-verification' },
        { label: 'Active Provider', view: 'providers-active' },
        { label: 'Banned Provider', view: 'providers-banned' },
        { label: 'Email Unverified', view: 'providers-email-unverified' },
        { label: 'Mobile Unverified', view: 'providers-mobile-unverified' },
        { label: 'KYC Unverified', view: 'providers-kyc-unverified' },
        { label: 'KYC Pending', view: 'providers-kyc-pending' },
        { label: 'With Balance', view: 'providers-with-balance' },
        { label: 'All Provider', view: 'providers-all' },
        { label: 'Notification to All', view: 'providers-notify' }
      ],
      allowedRoles: ['admin', 'executive']
    },
    {
      id: 'partner-kyc',
      label: 'KYC Verification',
      icon: ShieldCheck,
      view: 'partner-kyc',
      allowedRoles: ['provider']
    },
    {
      id: 'partner-jobs',
      label: 'My Allocations',
      icon: Briefcase,
      view: 'partner-jobs',
      allowedRoles: ['provider']
    },
    {
      id: 'payments',
      label: 'Payment',
      icon: CreditCard,
      subMenus: [
        { label: 'Pending Payment', view: 'payments-pending' },
        { label: 'Approved Payment', view: 'payments-approved' },
        { label: 'Successful Payment', view: 'payments-successful' },
        { label: 'Rejected Payment', view: 'payments-rejected' },
        { label: 'Initiated Payment', view: 'payments-initiated' },
        { label: 'All Payment', view: 'payments-all' }
      ],
      allowedRoles: ['admin']
    },
    {
      id: 'withdrawals',
      label: 'Withdrawals',
      icon: Landmark,
      view: 'withdrawals',
      allowedRoles: ['admin']
    },
    {
      id: 'reports',
      label: 'Report',
      icon: FileBarChart2,
      subMenus: [
        { label: 'User Transaction', view: 'reports-user-trans' },
        { label: 'Provider Transaction', view: 'reports-prov-trans' },
        { label: 'User Login', view: 'reports-user-login' },
        { label: 'Provider Login', view: 'reports-prov-login' },
        { label: 'User Notification', view: 'reports-user-notif' }
      ],
      allowedRoles: ['admin']
    },
    {
      id: 'notifications-center',
      label: 'Push Notifications',
      icon: Bell,
      view: 'notifications-center',
      allowedRoles: ['admin', 'executive'],
      badge: 'Live'
    },
    {
      id: 'appointment-settings',
      label: 'Appointment & Slots',
      icon: Calendar,
      view: 'appointment-settings',
      allowedRoles: ['admin', 'executive']
    },
    {
      id: 'help-policy-center',
      label: 'Help & Policy Center',
      icon: Headphones,
      view: 'settings-policy',
      allowedRoles: ['admin', 'executive']
    },
    {
      id: 'cloud-db',
      label: 'Cloud Backend & Sync',
      icon: Database,
      view: 'settings-config',
      allowedRoles: ['admin', 'executive'],
      badge: 'Firebase'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      subMenus: [
        { label: 'General Setting', view: 'settings-general' },
        { label: 'Help & Policy Center', view: 'settings-policy' },
        { label: 'Appointment & Slots', view: 'appointment-settings' },
        { label: 'Logo & Favicon', view: 'settings-logo' },
        { label: 'System Configuration', view: 'settings-config' },
        { label: 'SEO Configuration', view: 'settings-seo' }
      ],
      allowedRoles: ['admin'] // Strictly Admin-only configuration settings
    }
  ];

  useEffect(() => {
    const parentMenu = menuItems.find(item => item.subMenus?.some(sub => sub.view === activeView));
    if (parentMenu) {
      setExpandedMenus({ [parentMenu.id]: true });
    } else {
      setExpandedMenus({});
    }
  }, [activeView]);

  const renderRoleBadge = () => {
    switch (currentRole) {
      case 'admin':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Owner Admin</span>;
      case 'executive':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Executive Staff</span>;
      case 'provider':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Service Partner</span>;
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-opacity"
          id="sidebar-backdrop"
        />
      )}

      {/* Sidebar Container - Restyled in corporate deep blue */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 bg-[#106ad2] text-white flex flex-col z-50 transition-all duration-300 shadow-2xl ${
          isOpen ? 'w-72 sm:w-80 md:w-64 translate-x-0' : 'w-72 sm:w-80 -translate-x-full md:translate-x-0 md:w-20'
        }`}
        id="sidebar-container"
      >
        {/* Brand Header styled like BrandPeak in screenshot */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-blue-700/50 select-none bg-[#0e5fbdf0] shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <Logo size="sm" variant={isOpen ? "full" : "icon"} showTagline={isOpen} className="text-white" />
          </div>

          {/* Mobile Close Button neatly aligned in the sidebar header */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 rounded-xl bg-blue-700/80 hover:bg-blue-800 text-blue-100 hover:text-white border border-blue-500/50 transition cursor-pointer shrink-0 flex items-center justify-center active:scale-95"
            id="sidebar-mobile-close-btn"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User profile details info - styled for high contrast blue */}
        <div className={`p-3.5 border-b border-blue-700/50 bg-[#0e5fbd70] select-none ${!isOpen && 'md:p-2 md:text-center'}`}>
          <div className="flex items-center gap-3">
            <div className="relative group shrink-0">
              <img
                src={displayAvatar}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50 border border-white/20 bg-blue-900 shadow-md"
              />
              {onChangePhoto && (
                <button
                  onClick={onChangePhoto}
                  title="Change Profile Photo (Avengers Edition)"
                  className="absolute -bottom-1 -right-1 p-1 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-md ring-2 ring-[#106ad2] transition cursor-pointer"
                  id="sidebar-change-photo-btn"
                >
                  <Camera className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
            <div className={`min-w-0 transition-opacity ${!isOpen && 'md:hidden'}`}>
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs font-extrabold text-white truncate">{userName}</h4>
                {onChangePhoto && (
                  <button
                    onClick={onChangePhoto}
                    className="text-[10px] text-amber-300 hover:text-white font-bold underline decoration-amber-400/50 cursor-pointer shrink-0 ml-1"
                  >
                    Edit Photo
                  </button>
                )}
              </div>
              <div className="mt-0.5">
                <span className="bg-white/15 text-white border border-white/25 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {currentRole === 'admin' ? 'Owner Admin' : currentRole === 'executive' ? 'Executive Staff' : 'Service Partner'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main navigation menu listings with clean white-contrast styles */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-scrollbar select-none" id="sidebar-menu-list">
          {menuItems
              .filter(item => item.allowedRoles.includes(currentRole))
              .map(item => {
                const hasSubMenus = !!item.subMenus;
                const isExpanded = expandedMenus[item.id];
                const isCurrentViewActive = item.view === activeView || 
                  (item.subMenus && item.subMenus.some(sub => sub.view === activeView));

                return (
                  <div key={item.id} className="space-y-1">
                    {hasSubMenus ? (
                      // Collapsible parent header
                      <button
                        onClick={() => toggleSubMenu(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition duration-150 cursor-pointer ${
                          isCurrentViewActive 
                            ? 'bg-[#0d59b2] text-white shadow-xs border border-white/10' 
                            : 'text-blue-100 hover:bg-[#0e5fbd] hover:text-white'
                        }`}
                        id={`sidebar-menu-${item.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`w-4.5 h-4.5 ${isCurrentViewActive ? 'text-white' : 'text-blue-200'}`} />
                          <span className={!isOpen ? 'md:hidden' : ''}>{item.label}</span>
                        </div>
                        {isOpen && (
                          <div>
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </div>
                        )}
                      </button>
                    ) : (
                      // Regular view trigger
                      <button
                        onClick={() => handleSelectView(item.view || 'dashboard')}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition duration-150 cursor-pointer ${
                          activeView === item.view 
                            ? 'bg-white text-[#106ad2] shadow-md' 
                            : 'text-blue-100 hover:bg-[#0e5fbd] hover:text-white'
                        }`}
                        id={`sidebar-menu-${item.id}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <item.icon className={`w-4.5 h-4.5 shrink-0 ${activeView === item.view ? 'text-[#106ad2]' : 'text-blue-200'}`} />
                          <span className={`truncate ${!isOpen ? 'md:hidden' : ''}`}>{item.label}</span>
                        </div>
                        {item.badge && isOpen && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-900 shadow-xs tracking-wider shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    )}

                    {/* Render Sub-menus with nice lists if they exist and are open */}
                    {hasSubMenus && isExpanded && isOpen && (
                      <div className="pl-8 pr-1 py-1 space-y-1 bg-black/10 rounded-lg border-l border-white/20 ml-5" id={`sidebar-submenu-${item.id}`}>
                        {item.subMenus?.map((sub, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectView(sub.view)}
                            className={`w-full text-left py-1.5 px-3 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                              activeView === sub.view 
                                ? 'bg-white/20 text-white font-bold' 
                                : 'text-blue-200 hover:text-white hover:bg-white/5'
                            }`}
                            id={`sidebar-submenu-${item.id}-${idx}`}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
        </div>

        {/* Footer Navigation & Credits */}
        <div className="p-3.5 sm:p-4 border-t border-blue-700/50 space-y-2.5">
          {/* Back to main customer website */}
          <a
            href="https://durgapurfix.in"
            target="_top"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-800/80 hover:bg-blue-700 border border-blue-500/40 cursor-pointer transition shadow-xs group"
            id="sidebar-back-to-website-btn"
            title="Return to main customer website: durgapurfix.in"
          >
            <Globe className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform shrink-0" />
            <span className={!isOpen ? 'md:hidden' : 'truncate'}>durgapurfix.in</span>
            <ArrowUpRight className={`w-3.5 h-3.5 text-blue-300 group-hover:text-white ml-auto shrink-0 ${!isOpen ? 'md:hidden' : ''}`} />
          </a>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-100 hover:bg-rose-600 hover:text-white cursor-pointer transition duration-150"
            id="sidebar-logout-btn"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className={!isOpen ? 'md:hidden' : ''}>Sign Out Portal</span>
          </button>

          <div className={`pt-2 border-t border-blue-700/30 text-[10px] text-blue-200/90 leading-tight ${!isOpen ? 'hidden md:hidden' : 'block'}`}>
            <p className="font-semibold text-white/90">Official Operations: <span className="font-extrabold text-amber-300">Durgapur Fix</span></p>
            <p className="text-[9px] text-blue-200/70">Support: <span className="font-bold text-white/80">durgapurfix@gmail.com</span></p>
          </div>
        </div>
      </aside>
    </>
  );
}
