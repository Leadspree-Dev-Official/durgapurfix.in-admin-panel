import React, { useState } from 'react';
import { Order, ServiceProvider, SystemSettings } from '../types';
import { calculateOrderFinalBill } from '../utils/billing';
import { 
  Briefcase, CheckCircle2, XCircle, Hourglass, ArrowUpRight, 
  MapPin, Phone, Mail, User, AlertTriangle, Check, FileText, Trash2,
  ChevronDown, ChevronUp, X, Clock
} from 'lucide-react';

interface OrdersViewProps {
  activeView: string; // 'orders-all' | 'orders-pending' | 'orders-confirmed' | 'orders-initiated' | 'orders-canceled'
  orders: Order[];
  providers: ServiceProvider[];
  settings?: SystemSettings;
  onUpdateOrders: (orders: Order[]) => void;
  onUpdateProviders: (provs: ServiceProvider[]) => void;
  onViewBill?: (order: Order) => void;
}

// Map service to provider category
const getEligibleProviders = (order: Order, providersList: ServiceProvider[]) => {
  const categoryMap: Record<string, string> = {
    'srv-1': 'AC Mechanic',
    'srv-2': 'Plumbing',
    'srv-3': 'Beautician',
    'srv-4': 'Electrician',
    'srv-5': 'Chefs & Cooks',
    'srv-6': 'Home Cleaning'
  };
  const orderCat = categoryMap[order.serviceId] || '';
  const filtered = providersList.filter(p => (orderCat ? p.category === orderCat : true) && p.status === 'active');
  return filtered.length > 0 ? filtered : providersList.filter(p => p.status === 'active');
};

const getBadge = (s: string) => {
  switch (s) {
    case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'confirmed': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case 'initiated': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'ongoing': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'canceled': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

// Compact Order Details Component placed directly below the order
interface CompactOrderDetailsProps {
  order: Order;
  orders: Order[];
  providers: ServiceProvider[];
  settings?: SystemSettings;
  onUpdateOrders: (orders: Order[]) => void;
  onClose: () => void;
  onViewBill?: (order: Order) => void;
  onDeleteOrder: (order: Order) => void;
  setAlertMsg: (msg: string) => void;
}

function CompactOrderDetails({
  order,
  orders,
  providers,
  settings,
  onUpdateOrders,
  onClose,
  onViewBill,
  onDeleteOrder,
  setAlertMsg
}: CompactOrderDetailsProps) {
  const [selectedProvId, setSelectedProvId] = useState(order.providerId || '');
  const [complaintText, setComplaintText] = useState('');

  const bill = calculateOrderFinalBill(order, settings);
  const eligibleProviders = getEligibleProviders(order, providers);

  // Allocate / Reassign provider
  const handleAllocate = () => {
    if (!selectedProvId) return;
    const provider = providers.find(p => p.id === selectedProvId);
    if (!provider) return;

    const updated = orders.map(o => {
      if (o.id === order.id) {
        return {
          ...o,
          providerId: provider.id,
          providerName: provider.name,
          status: 'confirmed' as const,
          paymentStatus: o.paymentStatus === 'pending' ? 'initiated' : o.paymentStatus
        };
      }
      return o;
    });

    onUpdateOrders(updated);
    setAlertMsg(`Job #${order.id} allocated to partner ${provider.name}!`);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  // Status Change override
  const handleStatusChange = (newStatus: Order['status']) => {
    const updated = orders.map(o => o.id === order.id ? { ...o, status: newStatus } : o);
    onUpdateOrders(updated);
    setAlertMsg(`Order #${order.id} status updated to ${newStatus}`);
    setTimeout(() => setAlertMsg(''), 3000);
  };

  // Payment Mode toggle
  const handlePaymentMode = (mode: string) => {
    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const updated = orders.map(o => o.id === order.id ? {
      ...o,
      paymentStatus: 'successful' as const,
      paymentMode: mode,
      paymentConfirmedByPartner: true,
      paymentConfirmedAt: nowStr
    } : o);
    onUpdateOrders(updated);
    setAlertMsg(`Payment for #${order.id} recorded via ${mode}`);
    setTimeout(() => setAlertMsg(''), 3000);
  };

  // Complaint Handling
  const handleRaiseComplaint = () => {
    if (!complaintText.trim()) return;
    const updated = orders.map(o => o.id === order.id ? { ...o, complaint: complaintText.trim() } : o);
    onUpdateOrders(updated);
    setComplaintText('');
    setAlertMsg(`Complaint filed for order #${order.id}`);
    setTimeout(() => setAlertMsg(''), 3000);
  };

  const handleResolveComplaint = () => {
    const updated = orders.map(o => o.id === order.id ? { ...o, complaint: undefined } : o);
    onUpdateOrders(updated);
    setAlertMsg(`Complaint for order #${order.id} resolved`);
    setTimeout(() => setAlertMsg(''), 3000);
  };

  return (
    <div 
      className="bg-white/95 border-2 border-emerald-500/50 rounded-2xl p-3.5 sm:p-4 shadow-md space-y-3.5 text-xs text-slate-700 animate-in fade-in duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Compact Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-black text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300">
            ORDER #{order.id}
          </span>
          <span className="font-bold text-slate-900 text-xs sm:text-sm">
            {order.serviceName}
          </span>
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {order.date}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border capitalize ${getBadge(order.status)}`}>
            {order.status}
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={() => onViewBill && onViewBill(order)}
            className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95"
            title="View Itemised Tax Bill & Invoice"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Itemised Bill</span>
          </button>

          <button
            type="button"
            onClick={() => onDeleteOrder(order)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition cursor-pointer"
            title="Delete Order Permanently"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer ml-1"
            title="Close compact details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3-Column Compact Grid on tablet/desktop, Clean stack on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Column 1: Client Information */}
        <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Client Details</span>
            <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{order.zone}</span>
          </div>
          <div className="space-y-1.5 text-slate-700">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-bold text-slate-900 truncate">{order.customerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-mono text-slate-800 font-semibold">{order.customerPhone}</span>
              <a
                href={`tel:${order.customerPhone}`}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 ml-auto transition"
              >
                Call
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] text-slate-500 truncate max-w-[190px]">{order.customerEmail}</span>
            </div>
            <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="text-[11px] text-slate-600 leading-tight">{order.address}</span>
            </div>
          </div>
        </div>

        {/* Column 2: Final Bill & Payment Collection */}
        <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Bill & Payment</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                order.paymentStatus === 'successful' || order.paymentConfirmedByPartner
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {order.paymentStatus === 'successful' || order.paymentConfirmedByPartner
                  ? `Paid (${order.paymentMode || 'Cash'})`
                  : 'Pending'}
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-slate-600 font-medium">
              <div className="flex justify-between">
                <span>Base Service:</span>
                <span className="font-mono">₹{bill.basePrice}</span>
              </div>
              {bill.totalExpensesCost > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Spare Parts:</span>
                  <span className="font-mono">+₹{bill.totalExpensesCost}</span>
                </div>
              )}
              {bill.platformFee > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Platform Fee:</span>
                  <span className="font-mono">+₹{bill.platformFee}</span>
                </div>
              )}
              {bill.gstTax > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>GST ({bill.gstRate}%):</span>
                  <span className="font-mono">+₹{bill.gstTax}</span>
                </div>
              )}
              <div className="flex justify-between items-center font-extrabold text-slate-900 pt-1 border-t border-slate-200 text-xs">
                <span>Final Total:</span>
                <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ₹{bill.finalTotal}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Payment Mode Setter */}
          <div className="pt-2 border-t border-slate-200/60">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Collect:</span>
              <div className="flex gap-1">
                {['Cash', 'UPI', 'Bank Transfer'].map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => handlePaymentMode(m)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                      order.paymentMode === m && (order.paymentStatus === 'successful' || order.paymentConfirmedByPartner)
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Partner Allocation & Status Controls */}
        <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2.5 flex flex-col justify-between">
          {/* Partner Allocation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Assigned Partner
              </span>
              {order.providerName ? (
                <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {order.providerName}
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-amber-600 italic">Unallocated</span>
              )}
            </div>

            <div className="flex gap-1.5">
              <select
                value={selectedProvId}
                onChange={(e) => setSelectedProvId(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
              >
                <option value="">-- Choose Partner --</option>
                {eligibleProviders.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAllocate}
                disabled={!selectedProvId || selectedProvId === order.providerId}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg font-bold text-[10px] shrink-0 transition cursor-pointer"
              >
                Assign
              </button>
            </div>
          </div>

          {/* Status Override Chips */}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Status Override
            </span>
            <div className="flex flex-wrap gap-1">
              {(['pending', 'confirmed', 'initiated', 'ongoing', 'completed', 'canceled'] as const).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition border cursor-pointer ${
                    order.status === st
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Complaint Section */}
          {order.complaint ? (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg space-y-1 text-red-700">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  Active Complaint
                </span>
                <button
                  type="button"
                  onClick={handleResolveComplaint}
                  className="text-[10px] font-bold text-red-700 hover:text-red-900 underline cursor-pointer"
                >
                  Mark Resolved
                </button>
              </div>
              <p className="text-[10px] italic leading-tight text-red-800">"{order.complaint}"</p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/60">
              <input
                type="text"
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Complaint note..."
                className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-400"
              />
              <button
                type="button"
                onClick={handleRaiseComplaint}
                disabled={!complaintText.trim()}
                className="px-2 py-1 text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg disabled:opacity-40 transition cursor-pointer"
              >
                Note Issue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrdersView({
  activeView,
  orders,
  providers,
  settings,
  onUpdateOrders,
  onUpdateProviders,
  onViewBill
}: OrdersViewProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [alertMsg, setAlertMsg] = useState('');
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const handleConfirmDelete = () => {
    if (!orderToDelete) return;
    const updated = orders.filter(o => o.id !== orderToDelete.id);
    onUpdateOrders(updated);
    if (selectedOrder?.id === orderToDelete.id) {
      setSelectedOrder(null);
    }
    setOrderToDelete(null);
    setAlertMsg(`Order #${orderToDelete.id} deleted successfully`);
    setTimeout(() => setAlertMsg(''), 3000);
  };

  // Toggle order details accordion
  const handleToggleOrder = (order: Order) => {
    setSelectedOrder(prev => prev?.id === order.id ? null : order);
  };

  // Filtering orders based on sidebar sub-menu triggers
  const getFilteredOrders = () => {
    switch (activeView) {
      case 'orders-pending': return orders.filter(o => o.status === 'pending');
      case 'orders-confirmed': return orders.filter(o => o.status === 'confirmed');
      case 'orders-initiated': return orders.filter(o => o.status === 'initiated');
      case 'orders-canceled': return orders.filter(o => o.status === 'canceled' || (o.status as string) === 'cancelled');
      default: return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="space-y-6 select-none" id="orders-view-root">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 capitalize">
          {activeView.replace('orders-', ' ')} Orders Management
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Monitor service orders, assign verified local technicians, communicate with clients, and resolve complaints. Click any order to open compact details directly below it.
        </p>
      </div>

      {alertMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs animate-in fade-in" id="orders-success-alert">
          <Check className="w-4 h-4" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Main Full-Width Orders Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Mobile App Cards Feed (< sm) with inline compact details directly below the order */}
        <div className="sm:hidden divide-y divide-slate-100" id="orders-mobile-card-list">
          {filteredOrders.map((order) => {
            const bill = calculateOrderFinalBill(order, settings);
            const isSelected = selectedOrder?.id === order.id;

            return (
              <div
                key={order.id}
                className={`p-3.5 space-y-2.5 transition cursor-pointer ${
                  isSelected ? 'bg-emerald-50/30 border-l-4 border-emerald-500' : 'hover:bg-slate-50/60'
                }`}
                onClick={() => handleToggleOrder(order)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono font-extrabold text-xs text-blue-600">
                    <span>{order.id}</span>
                    {order.complaint && (
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Active Complaint!" />
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getBadge(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{order.serviceName}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{order.customerName} • {order.zone}</p>
                  </div>
                  <div className="text-right shrink-0 font-mono">
                    <span className="text-xs font-extrabold text-emerald-800">₹{bill.finalTotal}</span>
                    <p className="text-[9px] text-slate-400 font-sans">Total Bill</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <div className="text-slate-500 text-[10px]">
                    {order.providerName ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {order.providerName}
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold italic">Unallocated</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onViewBill && onViewBill(order)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3 h-3 text-emerald-600" />
                      <span>Bill</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleOrder(order)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg flex items-center gap-1 shadow-xs cursor-pointer transition ${
                        isSelected 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-[#106ad2] text-white hover:bg-blue-700'
                      }`}
                    >
                      <span>{isSelected ? 'Close' : 'Details'}</span>
                      {isSelected ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderToDelete(order)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition"
                      title="Delete Order"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Compact Details directly beneath this order card */}
                {isSelected && (
                  <div className="pt-2">
                    <CompactOrderDetails
                      order={order}
                      orders={orders}
                      providers={providers}
                      settings={settings}
                      onUpdateOrders={onUpdateOrders}
                      onClose={() => setSelectedOrder(null)}
                      onViewBill={onViewBill}
                      onDeleteOrder={(o) => setOrderToDelete(o)}
                      setAlertMsg={setAlertMsg}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400 font-semibold">
              No orders currently logged in this submenu group.
            </div>
          )}
        </div>

        {/* Desktop & Tablet Table (sm+) with inline compact details directly below the order row */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Order ID</th>
                <th className="py-3 px-4 font-bold">Client Detail</th>
                <th className="py-3 px-4 font-bold">Service Required</th>
                <th className="py-3 px-4 font-bold">Final Bill</th>
                <th className="py-3 px-4 font-bold">Assigned Partner</th>
                <th className="py-3 px-4 text-center font-bold">Status</th>
                <th className="py-3 px-4 text-right font-bold">Operational Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                const bill = calculateOrderFinalBill(order, settings);

                return (
                  <React.Fragment key={order.id}>
                    <tr 
                      className={`hover:bg-slate-50/80 transition cursor-pointer ${
                        isSelected ? 'bg-emerald-50/40 border-l-4 border-emerald-500' : ''
                      }`}
                      onClick={() => handleToggleOrder(order)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span>{order.id}</span>
                          {order.complaint && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Active Complaint Raised!" />
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800">{order.customerName}</p>
                          <p className="text-[10px] text-slate-500 font-mono font-medium">{order.customerPhone}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-slate-850 max-w-[180px] truncate" title={order.serviceName}>
                            {order.serviceName}
                          </p>
                          <p className="text-[10px] text-blue-600 font-bold">{order.zone}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 font-mono">
                          <p className="font-extrabold text-emerald-800 text-xs">
                            ₹{bill.finalTotal}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">Base: ₹{order.amount}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {order.providerName ? (
                          <span className="text-emerald-700 font-extrabold text-xs flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {order.providerName}
                          </span>
                        ) : (
                          <span className="text-amber-600 font-bold text-xs italic">Unallocated</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${getBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        <button 
                          type="button"
                          onClick={() => onViewBill && onViewBill(order)}
                          className="py-1.5 px-2.5 text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg cursor-pointer transition shadow-2xs inline-flex items-center gap-1 font-bold"
                          title="View Itemised Tax Bill"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Bill</span>
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleToggleOrder(order)}
                          className={`py-1.5 px-3 text-[10px] rounded-lg cursor-pointer transition shadow-xs inline-flex items-center gap-1 font-bold ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                          }`}
                        >
                          <span>{isSelected ? 'Close' : 'Details'}</span>
                          {isSelected ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        <button 
                          type="button"
                          onClick={() => setOrderToDelete(order)}
                          className="py-1.5 px-2 text-[10px] bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer transition shadow-xs inline-flex items-center gap-1 font-bold"
                          title="Delete Order Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>

                    {/* Inline Compact Details Row directly beneath this order's table row */}
                    {isSelected && (
                      <tr className="bg-slate-50/70 border-b border-emerald-500/30">
                        <td colSpan={7} className="p-3 sm:p-4">
                          <CompactOrderDetails
                            order={order}
                            orders={orders}
                            providers={providers}
                            settings={settings}
                            onUpdateOrders={onUpdateOrders}
                            onClose={() => setSelectedOrder(null)}
                            onViewBill={onViewBill}
                            onDeleteOrder={(o) => setOrderToDelete(o)}
                            setAlertMsg={setAlertMsg}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 font-semibold">
                    No orders currently logged in this submenu group.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Delete Order #{orderToDelete.id}?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete this order for <strong className="text-slate-700">{orderToDelete.customerName}</strong> ({orderToDelete.serviceName})? This will permanently delete the booking from the admin panel and mobile database.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-xs transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

