import React, { useState } from 'react';
import { Order, ServiceProvider, SystemSettings } from '../types';
import { calculateOrderFinalBill } from '../utils/billing';
import { 
  Briefcase, CheckCircle2, XCircle, Hourglass, ArrowUpRight, 
  MapPin, Phone, Mail, User, AlertTriangle, RefreshCw, Send, Check, FileText
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
  const [selectedProvId, setSelectedProvId] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

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

  // Filter providers that are eligible for the selected order's category and are active
  const getEligibleProviders = (order: Order) => {
    // We map orders to category strings approximately
    const categoryMap: Record<string, string> = {
      'srv-1': 'AC Mechanic',
      'srv-2': 'Plumbing',
      'srv-3': 'Beautician',
      'srv-4': 'Electrician',
      'srv-5': 'Chefs & Cooks',
      'srv-6': 'Home Cleaning'
    };
    const orderCat = categoryMap[order.serviceId] || '';
    return providers.filter(p => p.category === orderCat && p.status === 'active');
  };

  // Allocation function
  const handleAllocate = () => {
    if (!selectedOrder || !selectedProvId) return;

    const provider = providers.find(p => p.id === selectedProvId);
    if (!provider) return;

    const updatedOrders = orders.map(o => {
      if (o.id === selectedOrder.id) {
        return {
          ...o,
          providerId: provider.id,
          providerName: provider.name,
          status: 'confirmed' as const, // Automatically confirmed on allocate
          paymentStatus: o.paymentStatus === 'pending' ? 'initiated' : o.paymentStatus
        };
      }
      return o;
    });

    onUpdateOrders(updatedOrders);
    
    // Also notify provider with a simulated alert
    setAlertMsg(`Job successfully allocated to Partner ${provider.name}!`);
    setTimeout(() => setAlertMsg(''), 4000);

    // Refresh selected order view details
    const refreshed = updatedOrders.find(o => o.id === selectedOrder.id) || null;
    setSelectedOrder(refreshed);
    setSelectedProvId('');
  };

  // Add/Raise Complaint
  const handleRaiseComplaint = () => {
    if (!selectedOrder || !complaintText.trim()) return;

    const updated = orders.map(o => {
      if (o.id === selectedOrder.id) {
        return {
          ...o,
          complaint: complaintText.trim()
        };
      }
      return o;
    });

    onUpdateOrders(updated);
    setComplaintText('');
    setSelectedOrder(updated.find(o => o.id === selectedOrder.id) || null);
  };

  // Reassign or clear complaint
  const handleResolveComplaint = () => {
    if (!selectedOrder) return;

    const updated = orders.map(o => {
      if (o.id === selectedOrder.id) {
        return {
          ...o,
          complaint: undefined
        };
      }
      return o;
    });

    onUpdateOrders(updated);
    setSelectedOrder(updated.find(o => o.id === selectedOrder.id) || null);
    setAlertMsg('Complaint resolved successfully!');
    setTimeout(() => setAlertMsg(''), 3000);
  };

  const handleStatusChange = (status: any) => {
    if (!selectedOrder) return;

    const updated = orders.map(o => {
      if (o.id === selectedOrder.id) {
        return {
          ...o,
          status: status
        };
      }
      return o;
    });

    onUpdateOrders(updated);
    setSelectedOrder(updated.find(o => o.id === selectedOrder.id) || null);
  };

  return (
    <div className="space-y-6 select-none" id="orders-view-root">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 capitalize">
          {activeView.replace('orders-', ' ')} Orders Management
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Monitor service orders, assign verified local technicians, communicate with clients, and resolve complaints.
        </p>
      </div>

      {alertMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs" id="orders-success-alert">
          <Check className="w-4 h-4" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Main Grid: Left table of orders, Right interactive allocation panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Orders representation: Mobile Cards for phone, Full Table for sm+ */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs h-fit">
          {/* Mobile App Cards Feed */}
          <div className="sm:hidden divide-y divide-slate-100" id="orders-mobile-card-list">
            {getFilteredOrders().map((order) => {
              const bill = calculateOrderFinalBill(order, settings);
              const isSelected = selectedOrder?.id === order.id;
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-3.5 space-y-2.5 transition active:bg-slate-50 cursor-pointer ${
                    isSelected ? 'bg-blue-50/70 border-l-4 border-[#106ad2]' : ''
                  }`}
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
                        <span className="text-emerald-750 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {order.providerName}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-semibold italic">Unallocated</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewBill && onViewBill(order);
                        }}
                        className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3 h-3 text-emerald-600" />
                        <span>Bill</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="px-2.5 py-1 text-[10px] font-bold bg-[#106ad2] text-white rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <span>Manage</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {getFilteredOrders().length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400 font-semibold">
                No orders currently logged in this submenu group.
              </div>
            )}
          </div>

          {/* Desktop & Tablet Table */}
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
                {getFilteredOrders().map((order) => {
                  return (
                    <tr 
                      key={order.id} 
                      className={`hover:bg-slate-50/60 transition cursor-pointer ${selectedOrder?.id === order.id ? 'bg-emerald-50/40 border-l-2 border-emerald-500' : ''}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="py-4 px-4 font-mono font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span>{order.id}</span>
                          {order.complaint && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Active Complaint Raised!" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800">{order.customerName}</p>
                          <p className="text-[10px] text-slate-500 font-mono font-medium">{order.customerPhone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-slate-850 max-w-[150px] truncate" title={order.serviceName}>
                            {order.serviceName}
                          </p>
                          <p className="text-[10px] text-blue-600 font-bold">{order.zone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-0.5 font-mono">
                          <p className="font-extrabold text-emerald-800 text-xs">
                            ₹{calculateOrderFinalBill(order, settings).finalTotal}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">Base: ₹{order.amount}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {order.providerName ? (
                          <span className="text-emerald-750 font-extrabold text-xs flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {order.providerName}
                          </span>
                        ) : (
                          <span className="text-amber-600 font-bold text-xs italic">Unallocated</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${getBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewBill && onViewBill(order);
                          }}
                          className="py-1.5 px-2.5 text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg cursor-pointer transition shadow-2xs inline-flex items-center gap-1 font-bold"
                          title="View Itemised Tax Bill"
                          id={`order-view-bill-${order.id}`}
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Bill</span>
                        </button>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="py-1.5 px-3 text-[10px] bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-650 rounded-lg cursor-pointer transition shadow-xs inline-flex items-center gap-1 font-bold"
                        >
                          <span>Manage</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {getFilteredOrders().length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 font-semibold">No orders currently logged in this submenu group.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Panel for selected order */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-fit space-y-5" id="allocation-control-panel">
          {selectedOrder ? (
            <>
              {/* Order Identity info */}
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-emerald-700">ORDER {selectedOrder.id}</span>
                  <span className="text-[10px] text-slate-400 font-mono font-semibold">Date: {selectedOrder.date}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{selectedOrder.serviceName}</h3>
                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>{selectedOrder.address}</span>
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onViewBill && onViewBill(selectedOrder)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    id="action-panel-view-bill-btn"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Itemised Bill & Invoice</span>
                  </button>
                </div>
              </div>

              {/* Client Contacts */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Client Contact Sheet</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-750 font-bold">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-750 font-bold">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{selectedOrder.customerPhone}</span>
                    <a 
                      href={`tel:${selectedOrder.customerPhone}`}
                      className="text-[10px] bg-white hover:bg-slate-100 text-blue-600 px-2.5 py-1 rounded-lg font-bold ml-auto border border-slate-200 shadow-xs transition"
                    >
                      Call
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-750 font-bold">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[170px] font-medium text-slate-600">{selectedOrder.customerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Final Bill Breakdown Card */}
              {(() => {
                const bill = calculateOrderFinalBill(selectedOrder, settings);
                return (
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/90 rounded-xl space-y-1.5 text-xs">
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">Final Bill Calculation</p>
                    <div className="flex items-center justify-between font-bold text-slate-700 text-[11px]">
                      <span>Base Service:</span>
                      <span>₹{bill.basePrice}</span>
                    </div>
                    {bill.totalExpensesCost > 0 && (
                      <div className="flex items-center justify-between text-slate-600 text-[11px] font-medium">
                        <span>Spare Parts / Expenses:</span>
                        <span>+ ₹{bill.totalExpensesCost}</span>
                      </div>
                    )}
                    {bill.platformFee > 0 && (
                      <div className="flex items-center justify-between text-slate-600 text-[11px] font-medium">
                        <span>Platform Fee:</span>
                        <span>+ ₹{bill.platformFee}</span>
                      </div>
                    )}
                    {bill.gstTax > 0 && (
                      <div className="flex items-center justify-between text-slate-600 text-[11px] font-medium">
                        <span>GST ({bill.gstRate}%):</span>
                        <span>+ ₹{bill.gstTax}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between font-extrabold text-emerald-900 pt-1.5 border-t border-emerald-200/80 text-xs font-mono">
                      <span className="uppercase tracking-wider">Final Bill Amount:</span>
                      <span className="text-sm bg-white px-2 py-0.5 rounded border border-emerald-300 shadow-2xs">₹{bill.finalTotal}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Payment Status & Partner Confirmation Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment Collection</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    selectedOrder.paymentStatus === 'successful' || selectedOrder.paymentConfirmedByPartner
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {selectedOrder.paymentStatus === 'successful' || selectedOrder.paymentConfirmedByPartner
                      ? `Paid via ${selectedOrder.paymentMode || 'Cash'}`
                      : 'Unconfirmed / Pending'}
                  </span>
                </div>
                {selectedOrder.paymentConfirmedAt && (
                  <p className="text-[10px] text-slate-500 font-medium">Confirmed At: {selectedOrder.paymentConfirmedAt}</p>
                )}

                {/* Operations quick toggle payment mode */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-1 text-[11px]">
                  <span className="text-slate-500 font-bold">Set Payment Mode:</span>
                  <div className="flex gap-1">
                    {['Cash', 'UPI', 'Bank Transfer'].map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
                          const updated = orders.map(o => o.id === selectedOrder.id ? {
                            ...o,
                            paymentStatus: 'successful' as const,
                            paymentMode: m,
                            paymentConfirmedByPartner: true,
                            paymentConfirmedAt: nowStr
                          } : o);
                          onUpdateOrders(updated);
                          setSelectedOrder({
                            ...selectedOrder,
                            paymentStatus: 'successful' as const,
                            paymentMode: m,
                            paymentConfirmedByPartner: true,
                            paymentConfirmedAt: nowStr
                          });
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                          selectedOrder.paymentMode === m 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Complaint Box */}
              {selectedOrder.complaint ? (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-2 text-red-700">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-red-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">CUSTOMER COMPLAINT FILED</span>
                  </div>
                  <p className="text-[11px] leading-relaxed italic font-medium">"{selectedOrder.complaint}"</p>
                  <div className="pt-2 border-t border-red-100 flex items-center justify-between gap-2">
                    <button 
                      onClick={handleResolveComplaint}
                      className="w-full text-center py-2 bg-red-600 hover:bg-red-700 rounded-lg text-[10px] font-bold cursor-pointer text-white shadow-xs transition"
                    >
                      Mark Complaint as Resolved
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Register simulated complaint</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={complaintText}
                      onChange={(e) => setComplaintText(e.target.value)}
                      placeholder="e.g. Provider did not arrive..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button 
                      onClick={handleRaiseComplaint}
                      className="px-3 bg-slate-100 border border-slate-200 hover:border-red-400 text-red-600 rounded-xl text-xs font-bold cursor-pointer transition hover:bg-red-50"
                    >
                      Raise
                    </button>
                  </div>
                </div>
              )}

              {/* Provider Assignment Allocation Box */}
              <div className="space-y-3.5 pt-3 border-t border-slate-100">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {selectedOrder.providerId ? 'Re-allocate Provider' : 'Allocate Provider'}
                  </h4>
                  {selectedOrder.providerName ? (
                    <p className="text-xs text-slate-600 mb-3 flex items-center gap-1.5 font-semibold">
                      <span>Currently assigned:</span>
                      <strong className="text-emerald-700 font-extrabold">{selectedOrder.providerName}</strong>
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 italic mb-3 font-semibold">No service professional assigned yet. Allocation pending.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Select eligible service partner</label>
                  <select
                    value={selectedProvId}
                    onChange={(e) => setSelectedProvId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-850 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  >
                    <option value="">-- Choose verified partner --</option>
                    {getEligibleProviders(selectedOrder).map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.category} | Bal: ₹{p.balance})</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAllocate}
                  disabled={!selectedProvId}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-750 disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition cursor-pointer"
                >
                  Confirm Assignment Allocation
                </button>
              </div>

              {/* Order Status Controller (For Executive/Admin forced overriding) */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Override Order Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['pending', 'initiated', 'ongoing', 'completed', 'canceled'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`py-1.5 rounded-lg text-[10px] font-extrabold capitalize border cursor-pointer transition ${
                        selectedOrder.status === st 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2 font-semibold">
              <Briefcase className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">Select an order from the list to view client specifications, register complaints, or allocate service partners.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
