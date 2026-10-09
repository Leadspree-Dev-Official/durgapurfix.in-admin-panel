import React, { useState, useEffect } from 'react';
import { Menu, Globe, ArrowUpRight, ArrowLeft, Database, CloudUpload } from 'lucide-react';
import { 
  UserSession, UserRole, ServiceCategory, ServiceSubCategory, Zone, 
  Coupon, Slider, Review, ServiceItem, Order, CustomerUser, 
  ServiceProvider, PaymentTransaction, WithdrawalRequest, UserNotification, 
  LoginLog, SystemSettings 
} from './types';

// Initial seed datasets
import {
  initialCategories, initialSubCategories, initialZones, initialCoupons,
  initialSliders, initialReviews, initialServices, initialProviders,
  initialOrders, initialUsers, initialPayments, initialWithdrawals,
  initialNotifications, initialLoginLogs, defaultSettings
} from './data';

// Component Views
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import Logo from './components/Logo';
import DashboardStats from './components/DashboardStats';
import CategoriesView from './components/CategoriesView';
import ZonesCouponsSliders from './components/ZonesCouponsSliders';
import ServicesView from './components/ServicesView';
import OrdersView from './components/OrdersView';
import UsersView from './components/UsersView';
import ProvidersView from './components/ProvidersView';
import PaymentsView from './components/PaymentsView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import ProviderPortal from './components/ProviderPortal';
import ProfilePhotoModal from './components/ProfilePhotoModal';
import ItemizedBillModal from './components/ItemizedBillModal';
import MobileBottomNav from './components/MobileBottomNav';
import PushNotificationCenter from './components/PushNotificationCenter';
import AppointmentSettingsView from './components/AppointmentSettingsView';
import { getDefaultAvatar, DEFAULT_MAN_AVATAR } from './data/avengers';
import { db, auth } from './lib/firebase';
import { doc, getDocFromServer, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { syncDocToFirestore, removeDocFromFirestore, subscribeToCollection } from './lib/firestoreSync';

export default function App() {
  // Session State
  const [session, setSession] = useState<UserSession | null>(null);

  // Database States
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [subCategories, setSubCategories] = useState<ServiceSubCategory[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<CustomerUser[]>([]);
  // Mobile app sign-ups live in the "durgapur_users" collection.
  const [appUsers, setAppUsers] = useState<CustomerUser[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);

  // Active View selection state
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return false;
  });

  // Ensure sidebar is closed on mobile initial load or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Itemized Bill Modal State
  const [billModalOrder, setBillModalOrder] = useState<Order | null>(null);

  // Profile Photo Modal State
  const [photoModal, setPhotoModal] = useState<{
    isOpen: boolean;
    targetType: 'session' | 'user' | 'provider';
    targetId?: string;
    targetName?: string;
    currentPhoto?: string;
  }>({
    isOpen: false,
    targetType: 'session'
  });

  const openPhotoModal = (
    targetType: 'session' | 'user' | 'provider',
    targetId?: string,
    targetName?: string,
    currentPhoto?: string
  ) => {
    setPhotoModal({
      isOpen: true,
      targetType,
      targetId,
      targetName: targetName || session?.name,
      currentPhoto: currentPhoto || session?.avatar || DEFAULT_MAN_AVATAR
    });
  };

  const handleSavePhotoModal = (newPhotoUrl: string) => {
    if (photoModal.targetType === 'session' && session) {
      const updatedSession: UserSession = {
        ...session,
        avatar: newPhotoUrl
      };
      setSession(updatedSession);
      localStorage.setItem('durgapur_session', JSON.stringify(updatedSession));

      // If provider session, sync with providers array
      if (session.role === 'provider' && session.providerId) {
        const updatedProvs = providers.map(p => p.id === session.providerId ? { ...p, avatar: newPhotoUrl } : p);
        updateAndPersist('providers', updatedProvs, setProviders);
      }
    } else if (photoModal.targetType === 'user' && photoModal.targetId) {
      const updatedUsers = users.map(u => u.id === photoModal.targetId ? { ...u, avatar: newPhotoUrl } : u);
      updateAndPersist('users', updatedUsers, setUsers);
    } else if (photoModal.targetType === 'provider' && photoModal.targetId) {
      const updatedProvs = providers.map(p => p.id === photoModal.targetId ? { ...p, avatar: newPhotoUrl } : p);
      updateAndPersist('providers', updatedProvs, setProviders);

      // If updating currently logged in provider
      if (session?.role === 'provider' && session?.providerId === photoModal.targetId) {
        const updatedSession = { ...session, avatar: newPhotoUrl };
        setSession(updatedSession);
        localStorage.setItem('durgapur_session', JSON.stringify(updatedSession));
      }
    }
  };

  // Load from LocalStorage or seed defaults
  useEffect(() => {
    const loadOrSeed = <T,>(key: string, seed: T, setter: React.Dispatch<React.SetStateAction<T>>) => {
      const stored = localStorage.getItem(`durgapur_${key}`);
      if (stored) {
        try {
          setter(JSON.parse(stored));
        } catch (e) {
          setter(seed);
        }
      } else {
        setter(seed);
        localStorage.setItem(`durgapur_${key}`, JSON.stringify(seed));
      }
    };

    loadOrSeed('categories', initialCategories, setCategories);
    loadOrSeed('subcategories', initialSubCategories, setSubCategories);
    loadOrSeed('zones', initialZones, setZones);
    loadOrSeed('coupons', initialCoupons, setCoupons);
    loadOrSeed('sliders', initialSliders, setSliders);
    loadOrSeed('reviews', initialReviews, setReviews);
    loadOrSeed('services', initialServices, setServices);
    loadOrSeed('orders', initialOrders, setOrders);
    loadOrSeed('users', initialUsers, setUsers);
    loadOrSeed('providers', initialProviders, setProviders);
    loadOrSeed('payments', initialPayments, setPayments);
    loadOrSeed('withdrawals', initialWithdrawals, setWithdrawals);
    loadOrSeed('notifications', initialNotifications, setNotifications);
    loadOrSeed('loginlogs', initialLoginLogs, setLoginLogs);
    loadOrSeed('settings', defaultSettings, setSettings);

    // Retrieve active user session if exists
    const savedSession = localStorage.getItem('durgapur_session');
    if (savedSession) {
      try {
        setSession(JSON.parse(savedSession));
      } catch (e) {}
    }

    // Subscribe to live Firestore collections for real-time multi-device sync
    const unsubs: (() => void)[] = [];
    if (db) {
      unsubs.push(subscribeToCollection<ServiceCategory>('categories', (items) => {
        if (items && items.length > 0) {
          setCategories(items);
          localStorage.setItem('durgapur_categories', JSON.stringify(items));
        }
      }));

      unsubs.push(subscribeToCollection<ServiceSubCategory>('subcategories', (items) => {
        if (items && items.length > 0) {
          setSubCategories(items);
          localStorage.setItem('durgapur_subcategories', JSON.stringify(items));
        }
      }));

      unsubs.push(subscribeToCollection<Zone>('zones', (items) => {
        if (items && items.length > 0) {
          setZones(items);
          localStorage.setItem('durgapur_zones', JSON.stringify(items));
        }
      }));

      unsubs.push(subscribeToCollection<Coupon>('coupons', (items) => {
        if (items && items.length > 0) {
          setCoupons(items);
          localStorage.setItem('durgapur_coupons', JSON.stringify(items));
        }
      }));

      unsubs.push(subscribeToCollection<Slider>('sliders', (items) => {
        if (items && items.length > 0) {
          setSliders(items);
          localStorage.setItem('durgapur_sliders', JSON.stringify(items));
        }
      }));

      unsubs.push(subscribeToCollection<ServiceItem>('services', (items) => {
        if (items && items.length > 0) {
          setServices(items);
          localStorage.setItem('durgapur_services', JSON.stringify(items));
        }
      }));

      unsubs.push(subscribeToCollection<Order>('orders', (items) => {
        if (items && items.length > 0) {
          setOrders(items);
          localStorage.setItem('durgapur_orders', JSON.stringify(items));
        }
      }));

      // Listen to Android Mobile App bookings collection (durgapur_bookings)
      unsubs.push(subscribeToCollection<any>('durgapur_bookings', (mobileBookings) => {
        if (mobileBookings && mobileBookings.length > 0) {
          setOrders((prevOrders) => {
            const map = new Map<string, Order>();
            // Keep existing orders
            prevOrders.forEach(o => map.set(o.id, o));
            // Merge mobile bookings
            mobileBookings.forEach((b: any) => {
              const formattedOrder: Order = {
                id: b.id || b.bookingId || `mb_${Date.now()}`,
                customerName: b.customerName || b.userName || 'App Customer',
                customerPhone: b.customerPhone || b.phone || '9832100000',
                customerEmail: b.customerEmail || b.email || 'customer@durgapurfix.in',
                serviceName: b.serviceName || b.category || 'Home Service',
                serviceId: b.serviceId || 'srv-1',
                zone: b.zone || b.location || 'City Centre Zone',
                address: b.customerAddress || b.address || 'Durgapur, WB',
                date: b.date || b.bookingDate || new Date().toISOString().split('T')[0],
                timeSlot: b.timeSlot || b.time || '10:00 AM - 12:00 PM',
                status: (b.status === 'cancelled' || b.status === 'canceled') ? 'canceled' : (b.status || 'pending'),
                amount: Number(b.amount || b.price || b.totalAmount || 399),
                paymentStatus: b.paymentStatus || 'pending',
                paymentMode: b.paymentMode || b.paymentMethod || 'Cash',
                providerId: b.providerId || b.technicianId,
                providerName: b.providerName || b.technicianName,
                complaint: b.complaint || b.notes || b.instructions,
                createdAt: b.createdAt || new Date().toISOString()
              };
              map.set(formattedOrder.id, formattedOrder);
            });
            const merged = Array.from(map.values());
            localStorage.setItem('durgapur_orders', JSON.stringify(merged));
            return merged;
          });
        }
      }));

      unsubs.push(subscribeToCollection<CustomerUser>('users', (items) => {
        if (items && items.length > 0) {
          setUsers(items);
          localStorage.setItem('durgapur_users', JSON.stringify(items));
        }
      }));

      // Listen to Android Mobile App registered users (durgapur_users)
      unsubs.push(subscribeToCollection<any>('durgapur_users', (mobileUsers) => {
        const mapped: CustomerUser[] = (mobileUsers || []).map((u: any) => ({
          id: u.id || u.uid || `mu_${Math.random().toString(36).slice(2, 8)}`,
          name: u.name || 'App Customer',
          email: u.email || '',
          phone: u.phone || u.phone10 || '',
          avatar: u.avatar,
          gender: u.gender,
          status: 'active' as const,
          joinDate: u.createdAt
            ? new Date(Number(u.createdAt)).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          ordersCount: 0,
          verified: u.verified === true || u.status === 'verified',
          source: 'app' as const
        }));
        setAppUsers(mapped);
        localStorage.setItem('durgapur_app_users', JSON.stringify(mapped));
      }));

      unsubs.push(subscribeToCollection<ServiceProvider>('providers', (items) => {
        if (items && items.length > 0) {
          setProviders(items);
          localStorage.setItem('durgapur_providers', JSON.stringify(items));
        }
      }));

      unsubs.push(subscribeToCollection<UserNotification>('notifications', (items) => {
        if (items && items.length > 0) {
          setNotifications(items);
          localStorage.setItem('durgapur_notifications', JSON.stringify(items));
        }
      }));

      try {
        const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
          if (docSnap.exists()) {
            const liveSettings = docSnap.data() as SystemSettings;
            setSettings(liveSettings);
            localStorage.setItem('durgapur_settings', JSON.stringify(liveSettings));
          }
        });
        unsubs.push(unsubSettings);
      } catch (e) {}
    }

    // Validate Connection to Firestore on application boot
    async function testConnection() {
      if (!db) return;
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log('[Backend] Firestore connection verified and active.');
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error('Please check your Firebase configuration.');
        }
      }
    }
    testConnection();

    return () => {
      unsubs.forEach(unsub => {
        try { unsub(); } catch (e) {}
      });
    };
  }, []);

  // Save states to local storage automatically and sync to Firestore
  const updateAndPersist = <T,>(key: string, data: T, setter: React.Dispatch<React.SetStateAction<T>>) => {
    // Detect deleted items to also delete from Firestore
    if (db && Array.isArray(data)) {
      try {
        const prevJson = localStorage.getItem(`durgapur_${key}`);
        if (prevJson) {
          const prevItems = JSON.parse(prevJson);
          if (Array.isArray(prevItems)) {
            const currentIds = new Set(data.map((item: any) => String(item?.id)));
            prevItems.forEach((prevItem: any) => {
              if (prevItem?.id && !currentIds.has(String(prevItem.id))) {
                removeDocFromFirestore(key, String(prevItem.id)).catch(() => {});
              }
            });
          }
        }
      } catch (e) {}
    }

    setter(data);
    localStorage.setItem(`durgapur_${key}`, JSON.stringify(data));

    // Live sync to Firestore in background
    if (db && Array.isArray(data)) {
      data.forEach(item => {
        if (item && item.id) {
          syncDocToFirestore(key, item.id, item).catch(() => {});
        }
      });
    } else if (db && key === 'settings') {
      syncDocToFirestore('settings', 'global', data).catch(() => {});
    }
  };

  // Admin verification for mobile app sign-ups (writes to durgapur_users only)
  const handleVerifyAppUser = (userId: string, verified: boolean) => {
    const updated = appUsers.map(u => (u.id === userId ? { ...u, verified } : u));
    setAppUsers(updated);
    localStorage.setItem('durgapur_app_users', JSON.stringify(updated));
    syncDocToFirestore('durgapur_users', userId, {
      status: verified ? 'verified' : 'pending',
      verified
    }).catch(() => {});
  };

  // Auth triggers
  const handleLoginSuccess = (email: string, role: UserRole, name: string, providerId?: string, avatar?: string) => {
    const defaultAvatar = avatar || getDefaultAvatar(undefined, name);
    const newSession: UserSession = {
      id: role === 'provider' ? (providerId || 'prov-1') : 'staff-' + Date.now(),
      name,
      email,
      role,
      avatar: defaultAvatar,
      providerId: role === 'provider' ? (providerId || 'prov-1') : undefined
    };
    setSession(newSession);
    localStorage.setItem('durgapur_session', JSON.stringify(newSession));
    
    // Add simulated login log
    const newLog: LoginLog = {
      id: 'log-' + Date.now(),
      userId: newSession.id,
      userName: name,
      userType: role === 'provider' ? 'provider' : 'staff',
      ipAddress: '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
      device: navigator.userAgent.includes('Mobi') ? 'Chrome Mobile on Android' : 'Chrome on Windows 11',
      date: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    const updatedLogs = [newLog, ...loginLogs];
    updateAndPersist('loginlogs', updatedLogs, setLoginLogs);

    // Set corresponding default views based on RLS access roles
    if (role === 'provider') {
      setActiveView('provider-portal');
    } else {
      setActiveView('dashboard');
    }
  };

  const handleLogout = () => {
    if (auth) {
      signOut(auth).catch(() => {});
    }
    setSession(null);
    localStorage.removeItem('durgapur_session');
    setActiveView('dashboard');
  };

  // Sub-views dispatcher
  const renderActiveView = () => {
    if (!session) return null;

    // Special Route Guard: Service Provider access is routed directly to the Partner Portal
    if (session.role === 'provider') {
      const activePartnerProfile = providers.find(p => p.id === session.providerId) || {
        id: session.providerId || 'prov-1',
        name: session.name,
        email: session.email,
        phone: '9876543210',
        category: 'AC Mechanic',
        avatar: session.avatar || DEFAULT_MAN_AVATAR,
        status: 'kyc_unverified' as const,
        rating: 0,
        balance: 0,
        joinDate: '2026-07-21',
        jobsCompleted: 0
      };

      return (
        <ProviderPortal 
          activeView={activeView}
          provider={activePartnerProfile}
          orders={orders}
          settings={settings}
          onChangePhoto={() => openPhotoModal('provider', activePartnerProfile.id, activePartnerProfile.name, activePartnerProfile.avatar || DEFAULT_MAN_AVATAR)}
          onViewBill={(order) => setBillModalOrder(order)}
          onUpdateProvider={(updatedProf) => {
            // Find in list & replace, then save
            const updatedList = providers.map(p => p.id === updatedProf.id ? updatedProf : p);
            // If newly registered (not yet in providers), append it
            if (!providers.some(p => p.id === updatedProf.id)) {
              updatedList.push(updatedProf);
            }
            updateAndPersist('providers', updatedList, setProviders);
          }}
          onUpdateOrders={(updatedOrders) => updateAndPersist('orders', updatedOrders, setOrders)}
        />
      );
    }

    // Admin & Executive staff routes
    if (activeView === 'dashboard') {
      return (
        <DashboardStats 
          users={users}
          providers={providers}
          services={services}
          orders={orders}
          payments={payments}
          categories={categories}
          subCategories={subCategories}
          zones={zones}
          coupons={coupons}
          sliders={sliders}
          settings={settings}
          onNavigateToView={(view) => setActiveView(view)}
          onViewBill={(order) => setBillModalOrder(order)}
        />
      );
    }

    if (activeView === 'category' || activeView === 'subcategory') {
      return (
        <CategoriesView 
          viewType={activeView}
          categories={categories}
          subCategories={subCategories}
          onUpdateCategories={(updatedCats) => updateAndPersist('categories', updatedCats, setCategories)}
          onUpdateSubCategories={(updatedSubs) => updateAndPersist('subcategories', updatedSubs, setSubCategories)}
        />
      );
    }

    if (activeView === 'coupons' || activeView === 'sliders') {
      return (
        <ZonesCouponsSliders 
          viewType={activeView}
          coupons={coupons}
          sliders={sliders}
          categories={categories}
          onUpdateCoupons={(updatedCoupons) => updateAndPersist('coupons', updatedCoupons, setCoupons)}
          onUpdateSliders={(updatedSliders) => updateAndPersist('sliders', updatedSliders, setSliders)}
        />
      );
    }

    if (activeView === 'reviews' || activeView.startsWith('services-')) {
      return (
        <ServicesView 
          activeView={activeView}
          services={services}
          reviews={reviews}
          categories={categories}
          subCategories={subCategories}
          onUpdateServices={(updatedServices) => updateAndPersist('services', updatedServices, setServices)}
          onUpdateReviews={(updatedReviews) => updateAndPersist('reviews', updatedReviews, setReviews)}
        />
      );
    }

    if (activeView.startsWith('orders-')) {
      return (
        <OrdersView 
          activeView={activeView}
          orders={orders}
          providers={providers}
          settings={settings}
          onUpdateOrders={(updatedOrders) => updateAndPersist('orders', updatedOrders, setOrders)}
          onUpdateProviders={(updatedProviders) => updateAndPersist('providers', updatedProviders, setProviders)}
          onViewBill={(order) => setBillModalOrder(order)}
        />
      );
    }

    if (activeView === 'notifications-center' || activeView === 'users-notify' || activeView === 'providers-notify') {
      return (
        <PushNotificationCenter 
          notifications={notifications}
          users={users}
          providers={providers}
          zones={zones}
          currentUserEmail={session.email}
          onUpdateNotifications={(updatedNotifs) => updateAndPersist('notifications', updatedNotifs, setNotifications)}
        />
      );
    }

    if (activeView === 'appointment-settings') {
      return (
        <AppointmentSettingsView 
          settings={settings}
          onUpdateSettings={(updatedSettings) => updateAndPersist('settings', updatedSettings, setSettings)}
        />
      );
    }

    if (activeView.startsWith('users-')) {
      return (
        <UsersView 
          activeView={activeView}
          users={users}
          appUsers={appUsers}
          notifications={notifications}
          onVerifyUser={handleVerifyAppUser}
          onEditUserPhoto={(u) => openPhotoModal('user', u.id, u.name, u.avatar || DEFAULT_MAN_AVATAR)}
          onUpdateUsers={(updatedUsers) => updateAndPersist('users', updatedUsers, setUsers)}
          onUpdateNotifications={(updatedNotifs) => updateAndPersist('notifications', updatedNotifs, setNotifications)}
        />
      );
    }

    if (activeView.startsWith('providers-')) {
      return (
        <ProvidersView 
          activeView={activeView}
          providers={providers}
          notifications={notifications}
          onEditProviderPhoto={(p) => openPhotoModal('provider', p.id, p.name, p.avatar || DEFAULT_MAN_AVATAR)}
          onUpdateProviders={(updatedProviders) => updateAndPersist('providers', updatedProviders, setProviders)}
          onUpdateNotifications={(updatedNotifs) => updateAndPersist('notifications', updatedNotifs, setNotifications)}
        />
      );
    }

    if (activeView.startsWith('payments-') || activeView === 'withdrawals') {
      return (
        <PaymentsView 
          activeView={activeView}
          payments={payments}
          withdrawals={withdrawals}
          onUpdatePayments={(updatedPayments) => updateAndPersist('payments', updatedPayments, setPayments)}
          onUpdateWithdrawals={(updatedWithdrawals) => updateAndPersist('withdrawals', updatedWithdrawals, setWithdrawals)}
        />
      );
    }

    if (activeView.startsWith('reports-')) {
      return (
        <ReportsView 
          activeView={activeView}
          payments={payments}
          loginLogs={loginLogs}
          notifications={notifications}
        />
      );
    }

    if (activeView.startsWith('settings-')) {
      return (
        <SettingsView 
          activeView={activeView}
          settings={settings}
          onChangePhoto={() => openPhotoModal('session', session.id, session.name, session.avatar || DEFAULT_MAN_AVATAR)}
          onUpdateSettings={(updatedSettings) => updateAndPersist('settings', updatedSettings, setSettings)}
          fullAppData={{
            categories,
            subcategories: subCategories,
            zones,
            coupons,
            sliders,
            services,
            providers,
            orders,
            users,
            settings
          }}
        />
      );
    }

    // Fallback default
    return <div className="text-slate-450 p-8">Section is initialized under sandbox rules.</div>;
  };

  // If session is empty, present full page screen auth
  if (!session) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-800 flex font-sans" id="app-layout-frame">
      {/* Interactive Collapsible Sidebar */}
      <Sidebar 
        currentRole={session.role}
        userName={session.name}
        userAvatar={session.avatar}
        userGender={session.gender}
        onChangePhoto={() => openPhotoModal('session', session.id, session.name, session.avatar || getDefaultAvatar(session.gender, session.name))}
        activeView={activeView}
        onSelectView={(view) => setActiveView(view)}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Panel Area */}
      <main className={`flex-1 min-w-0 transition-all duration-300 flex flex-col pb-20 md:pb-0 ${
        isSidebarOpen ? 'md:pl-64' : 'md:pl-20'
      }`}>
        {/* Sticky Top Header Bar modeled after native app navbar */}
        <header className="h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs select-none safe-top">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Hamburger / Menu Toggle Button for both Mobile & Desktop */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200 shadow-2xs transition cursor-pointer shrink-0 flex items-center justify-center active:scale-95"
              title="Toggle Menu"
              id="navbar-hamburger-btn"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile / Small screen Brand Logo in Navbar */}
            <div className="flex items-center gap-2 md:hidden">
              <Logo size="sm" showTagline={false} />
            </div>

            {/* Desktop Brand Context Title */}
            <span className="text-slate-600 font-semibold text-sm hidden lg:inline-block">
              Durgapur Fix Operations
            </span>
            <span className="text-slate-300 hidden lg:inline">|</span>
            <div className="flex items-center gap-1 text-xs text-slate-500 min-w-0">
              <span className="hover:text-blue-600 cursor-pointer hidden sm:inline">Admin</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-blue-600 font-semibold capitalize truncate max-w-[90px] sm:max-w-none">
                {activeView.replace('services-', ' ').replace('orders-', ' ').replace('users-', ' ').replace('providers-', ' ').replace('payments-', ' ').replace('reports-', ' ').replace('settings-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Back to main website durgapurfix.in */}
            <a
              href="https://durgapurfix.in"
              target="_top"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#106ad2] hover:text-blue-800 rounded-xl text-xs font-bold border border-blue-200 transition-colors shadow-2xs group cursor-pointer"
              title="Return to Main Website (durgapurfix.in)"
              id="header-back-to-website-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#106ad2] group-hover:-translate-x-0.5 transition-transform shrink-0" />
              <span className="hidden sm:inline">durgapurfix.in</span>
              <span className="sm:hidden text-[10px]">Website</span>
            </a>

            {/* Direct Cloud Backend / Firebase Sync Button */}
            <button
              onClick={() => setActiveView('settings-config')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer group active:scale-95"
              title="Cloud Database & Sync Center (durgapurfix-1935c)"
              id="header-cloud-sync-btn"
            >
              <Database className="w-3.5 h-3.5 text-blue-200 group-hover:rotate-12 transition-transform shrink-0" />
              <span className="hidden md:inline">Cloud Sync</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Connected to Firebase" />
            </button>

            {/* Broom & Sparkles indicator representing premium home services (desktop) */}
            <div className="hidden xl:flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-full text-xs font-semibold border border-blue-100 whitespace-nowrap">
              <span>🧹</span>
              <span>Spotless Services Portal</span>
              <span>✨</span>
            </div>

            {/* User Session Role Badge */}
            <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-slate-200">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{session.role}</span>
            </div>

            {/* Profile Avatar modeled after reference image */}
            <button 
              onClick={() => openPhotoModal('session', session.id, session.name, session.avatar || getDefaultAvatar(session.gender, session.name))}
              className="flex items-center gap-2.5 hover:bg-slate-50 p-1 rounded-xl transition cursor-pointer group text-left border border-transparent hover:border-slate-200 active:scale-95"
              title="Change Profile Photo"
              id="top-header-profile-btn"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-emerald-500 bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative group-hover:scale-105 transition">
                <img 
                  src={session.avatar || getDefaultAvatar(session.gender, session.name)} 
                  alt={session.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px] group-hover:text-emerald-700 transition">{session.name}</p>
                <p className="text-[10px] text-emerald-600 font-bold capitalize flex items-center gap-0.5">
                  <span>Change Photo</span>
                </p>
              </div>
            </button>
          </div>
        </header>

        {/* View Box Area */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 flex flex-col justify-between" id="main-content-panel">
          {/* Active component view content */}
          <div className="animate-fade-in" id="rendered-view-box">
            {renderActiveView()}
          </div>

          {/* Global Footer Credits */}
          <footer className="pt-6 mt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Logo size="sm" showTagline={false} />
              <span className="text-slate-300">|</span>
              <span className="font-semibold text-slate-700">Home Services Platform</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-[11px]">
              <p className="flex items-center gap-1.5">
                <span>Official Operations: <strong className="text-slate-800 font-bold">Durgapur Fix</strong></span>
                <span className="text-slate-300">•</span>
                <span>Contact: <strong className="text-slate-800 font-bold">durgapurfix@gmail.com</strong></span>
              </p>
              <span className="hidden sm:inline text-slate-300">|</span>
              <p className="flex items-center gap-1 font-medium">
                <span>Developer :</span>
                <a 
                  href="https://leadspree.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition"
                  title="Visit LeadSpree Business Solutions (leadspree.in)"
                >
                  LeadSpree Business Solutions
                </a>
              </p>
            </div>
          </footer>
        </div>
      </main>

      {/* Native App-like Bottom Navigation Bar */}
      <MobileBottomNav 
        currentRole={session.role}
        activeView={activeView}
        onSelectView={(view) => setActiveView(view)}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        pendingOrdersCount={orders.filter(o => o.status === 'pending').length}
      />

      {/* Global Profile Photo Modal (Avengers Edition) */}
      <ProfilePhotoModal
        isOpen={photoModal.isOpen}
        onClose={() => setPhotoModal(prev => ({ ...prev, isOpen: false }))}
        currentPhoto={photoModal.currentPhoto}
        userName={photoModal.targetName}
        userRole={photoModal.targetType}
        onSavePhoto={handleSavePhotoModal}
      />

      {/* Global Itemized Bill Modal */}
      <ItemizedBillModal
        order={billModalOrder}
        isOpen={!!billModalOrder}
        onClose={() => setBillModalOrder(null)}
        settings={settings}
      />
    </div>
  );
}
