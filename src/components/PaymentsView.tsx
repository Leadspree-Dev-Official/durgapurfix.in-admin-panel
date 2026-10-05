import React, { useState } from 'react';
import { PaymentTransaction, WithdrawalRequest } from '../types';
import { Check, X, ShieldAlert, Landmark, CreditCard, Search } from 'lucide-react';

interface PaymentsViewProps {
  activeView: string; // 'payments-pending' | 'payments-approved' | ... or 'withdrawals'
  payments: PaymentTransaction[];
  withdrawals: WithdrawalRequest[];
  onUpdatePayments: (pays: PaymentTransaction[]) => void;
  onUpdateWithdrawals: (withs: WithdrawalRequest[]) => void;
}

export default function PaymentsView({
  activeView,
  payments,
  withdrawals,
  onUpdatePayments,
  onUpdateWithdrawals
}: PaymentsViewProps) {

  const isWithdrawals = activeView === 'withdrawals';
  const [searchTerm, setSearchTerm] = useState('');

  const getFilteredPayments = () => {
    let filtered = [...payments];

    switch (activeView) {
      case 'payments-pending':
        filtered = filtered.filter(p => p.status === 'pending');
        break;
      case 'payments-approved':
        filtered = filtered.filter(p => p.status === 'approved');
        break;
      case 'payments-successful':
        filtered = filtered.filter(p => p.status === 'successful');
        break;
      case 'payments-rejected':
        filtered = filtered.filter(p => p.status === 'rejected');
        break;
      case 'payments-initiated':
        filtered = filtered.filter(p => p.status === 'initiated');
        break;
      default:
        break;
    }

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.method.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const handleUpdatePaymentStatus = (id: string, status: PaymentTransaction['status']) => {
    onUpdatePayments(payments.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleUpdateWithdrawalStatus = (id: string, status: WithdrawalRequest['status']) => {
    onUpdateWithdrawals(withdrawals.map(w => w.id === id ? { ...w, status } : w));
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'successful': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'approved': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'initiated': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 select-none" id="payments-view-root">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 capitalize">
          {isWithdrawals ? 'Provider Withdrawal Requests' : `${activeView.replace('payments-', ' ')} Operations`}
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          {isWithdrawals
            ? 'Process earnings extraction requests filed by active service professionals.'
            : 'Track client transactions, moderate pending online charges, or trace COD orders.'}
        </p>
      </div>

      <div className="space-y-4">
        {/* Search tool */}
        <div className="relative max-w-sm" id="pay-search-wrapper">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isWithdrawals ? "Search by provider..." : "Search by client, order ID..."}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {isWithdrawals ? (
            /* WITHDRAWALS LIST VIEW */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-bold">Provider Identity</th>
                    <th className="py-3 px-4 font-bold">Amount</th>
                    <th className="py-3 px-4 font-bold">Payout Method</th>
                    <th className="py-3 px-4 font-bold">Account / Wallet Details</th>
                    <th className="py-3 px-4 text-center font-bold">Status</th>
                    <th className="py-3 px-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {withdrawals
                    .filter(w => searchTerm ? w.providerName.toLowerCase().includes(searchTerm.toLowerCase()) : true)
                    .map((w) => (
                      <tr key={w.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4">
                          <p className="font-extrabold text-slate-800 text-sm">{w.providerName}</p>
                          <p className="text-[10px] text-slate-400 font-mono font-semibold">Date requested: {w.date}</p>
                        </td>
                        <td className="py-4 px-4 font-extrabold text-slate-850 font-mono text-sm">
                          ₹{w.amount}
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-extrabold">
                            <Landmark className="w-3.5 h-3.5 text-blue-600" />
                            {w.method}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-500 text-xs font-mono font-semibold" title={w.accountDetails}>
                          {w.accountDetails}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {w.status === 'approved' ? (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">Approved</span>
                          ) : w.status === 'rejected' ? (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 uppercase tracking-wider">Rejected</span>
                          ) : (
                            <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">Pending</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                          {w.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateWithdrawalStatus(w.id, 'approved')}
                                className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg cursor-pointer inline-flex transition shadow-xs"
                                title="Approve Payout"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateWithdrawalStatus(w.id, 'rejected')}
                                className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg cursor-pointer inline-flex transition shadow-xs"
                                title="Reject Payout"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* PAYMENTS TRANSACTIONS LIST VIEW */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-bold">Trans ID / Order ID</th>
                    <th className="py-3 px-4 font-bold">Payee / Customer</th>
                    <th className="py-3 px-4 font-bold">Amount</th>
                    <th className="py-3 px-4 font-bold">Payment Method</th>
                    <th className="py-3 px-4 font-bold">Date Logged</th>
                    <th className="py-3 px-4 text-center font-bold">Status</th>
                    <th className="py-3 px-4 text-right font-bold">Verification Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getFilteredPayments().map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4">
                        <div className="text-[11px] font-mono">
                          <p className="font-extrabold text-slate-800">{p.id}</p>
                          <p className="text-slate-400 font-semibold">Order: {p.orderId}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-extrabold text-slate-800 text-sm">{p.userName}</td>
                      <td className="py-4 px-4 font-extrabold text-slate-800 font-mono text-sm">
                        ₹{p.amount}
                      </td>
                      <td className="py-4 px-4 text-slate-650 font-bold">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{p.method}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 text-xs font-mono font-medium">{p.date}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider capitalize ${getPaymentBadge(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                        {p.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdatePaymentStatus(p.id, 'successful')}
                              className="py-1.5 px-3 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 cursor-pointer transition shadow-xs"
                            >
                              Approve Pay
                            </button>
                            <button
                              onClick={() => handleUpdatePaymentStatus(p.id, 'rejected')}
                              className="py-1.5 px-3 text-[10px] font-bold bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 cursor-pointer transition shadow-xs"
                            >
                              Reject Pay
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {getFilteredPayments().length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400 font-semibold">No payment transaction logs matching this filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
