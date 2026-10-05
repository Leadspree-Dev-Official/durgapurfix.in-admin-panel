import React from 'react';
import { PaymentTransaction, LoginLog, UserNotification } from '../types';
import { FileBarChart2, FileText, Key, Bell, Shield, Smartphone } from 'lucide-react';

interface ReportsViewProps {
  activeView: string; // 'reports-user-trans' | 'reports-prov-trans' | 'reports-user-login' | 'reports-prov-login' | 'reports-user-notif'
  payments: PaymentTransaction[];
  loginLogs: LoginLog[];
  notifications: UserNotification[];
}

export default function ReportsView({
  activeView,
  payments,
  loginLogs,
  notifications
}: ReportsViewProps) {

  const isUserTrans = activeView === 'reports-user-trans';
  const isProvTrans = activeView === 'reports-prov-trans';
  const isUserLogin = activeView === 'reports-user-login';
  const isProvLogin = activeView === 'reports-prov-login';
  const isUserNotif = activeView === 'reports-user-notif';

  // Calculations
  const userTransactions = payments.filter(p => p.userType === 'customer');
  const providerTransactions = payments.filter(p => p.userType === 'provider');
  const userLogins = loginLogs.filter(l => l.userType === 'customer' || l.userType === 'staff');
  const providerLogins = loginLogs.filter(l => l.userType === 'provider');

  return (
    <div className="space-y-6 select-none" id="reports-view-root">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 capitalize">
          System Analytics: {activeView.replace('reports-', ' ').replace('-', ' ')}
        </h2>
        <p className="text-slate-500 text-xs font-semibold mt-1">
          Review historical login logs, financial ledger items, and communication transcripts from Durgapur Homes servers.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {/* User Transactions List */}
        {isUserTrans && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Payee Name</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-blue-600">{t.id}</td>
                    <td className="py-4 px-4 font-extrabold text-slate-800">{t.userName}</td>
                    <td className="py-4 px-4 font-extrabold text-slate-900 font-mono text-xs">₹{t.amount}</td>
                    <td className="py-4 px-4 text-slate-500 font-medium">{t.method}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Provider Transactions List */}
        {isProvTrans && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Record ID</th>
                  <th className="py-3 px-4">Provider Beneficiary</th>
                  <th className="py-3 px-4">Total Settled</th>
                  <th className="py-3 px-4">Settlement Channels</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Seed a simulated provider payout item or withdrawal log */}
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-blue-600">SET-4491</td>
                  <td className="py-4 px-4 font-extrabold text-slate-800">Subir Dey (AC Mechanic)</td>
                  <td className="py-4 px-4 font-extrabold text-slate-900 font-mono text-xs">₹1,500</td>
                  <td className="py-4 px-4 text-slate-500 font-medium">Direct Bank Deposit (IMPS)</td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">SUCCESS</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-blue-600">SET-3021</td>
                  <td className="py-4 px-4 font-extrabold text-slate-800">Rita Paul (Beautician)</td>
                  <td className="py-4 px-4 font-extrabold text-slate-900 font-mono text-xs">₹800</td>
                  <td className="py-4 px-4 text-slate-500 font-medium">UPI GPay Transfer</td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">PENDING</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* User & Admin Login Auditing */}
        {isUserLogin && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Operator Name</th>
                  <th className="py-3 px-4">Security Type</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Authorized Agent / Device</th>
                  <th className="py-3 px-4 text-right">Access Stamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userLogins.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-slate-450" />
                        <span className="font-extrabold text-slate-800">{log.userName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-blue-600 capitalize">{log.userType} Access</td>
                    <td className="py-4 px-4 font-mono text-slate-650 text-xs font-semibold">{log.ipAddress}</td>
                    <td className="py-4 px-4 text-slate-500 font-medium max-w-xs truncate" title={log.device}>{log.device}</td>
                    <td className="py-4 px-4 text-right font-mono text-slate-400 text-[10px] font-bold">{log.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Provider Login Auditing */}
        {isProvLogin && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Partner Name</th>
                  <th className="py-3 px-4">IP Credentials</th>
                  <th className="py-3 px-4">Agent Device</th>
                  <th className="py-3 px-4 text-right">Access Stamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {providerLogins.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 font-extrabold text-slate-800">{log.userName}</td>
                    <td className="py-4 px-4 font-mono text-slate-650 text-xs font-semibold">{log.ipAddress}</td>
                    <td className="py-4 px-4 text-slate-500 font-medium max-w-xs truncate" title={log.device}>{log.device}</td>
                    <td className="py-4 px-4 text-right font-mono text-slate-400 text-[10px] font-bold">{log.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Dispatched Push System Notification Transcripts */}
        {isUserNotif && (
          <div className="p-6 space-y-4" id="notifications-archive">
            {notifications.map((not) => (
              <div key={not.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3.5 hover:bg-slate-100/50 transition-colors">
                <div className="p-2.5 bg-emerald-50 text-emerald-750 rounded-lg border border-emerald-200 shrink-0 shadow-xs">
                  <Bell className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{not.title}</h4>
                    <span className="text-[10px] bg-white border border-slate-200 py-0.5 px-2 rounded-full font-mono text-slate-550 font-bold uppercase">{not.targetType.replace('_', ' ')}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed">{not.message}</p>
                  <p className="text-[9px] text-slate-400 font-mono font-medium">Dispatched by: {not.sender} | Date: {not.date}</p>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-center py-6 text-slate-400 text-xs font-semibold">No dispatches logged in system historical logs.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
