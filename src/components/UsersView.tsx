import React, { useState } from 'react';
import { CustomerUser, UserNotification } from '../types';
import { ShieldAlert, ShieldCheck, Search, Bell, Send, Check, Camera, Sparkles } from 'lucide-react';
import { getDefaultAvatar } from '../data/avengers';

interface UsersViewProps {
  activeView: string; // 'users-active' | 'users-banned' | 'users-all' | 'users-notify' | 'users-pending'
  users: CustomerUser[];
  appUsers?: CustomerUser[];
  notifications: UserNotification[];
  onUpdateUsers: (users: CustomerUser[]) => void;
  onUpdateNotifications: (notifs: UserNotification[]) => void;
  onVerifyUser?: (userId: string, verified: boolean) => void;
  onEditUserPhoto?: (user: CustomerUser) => void;
}

export default function UsersView({
  activeView,
  users,
  appUsers = [],
  notifications,
  onUpdateUsers,
  onUpdateNotifications,
  onVerifyUser,
  onEditUserPhoto
}: UsersViewProps) {

  const isNotificationMode = activeView === 'users-notify';
  const [searchTerm, setSearchTerm] = useState('');

  // Notification form state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifTarget, setNotifTarget] = useState<'all_users' | 'all_providers'>('all_users');
  const [successAlert, setSuccessAlert] = useState(false);

  // Verification / access badge (mobile app users show Verified|Pending)
  const renderStatusBadge = (u: CustomerUser, compact = false) => {
    const pad = compact ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px] tracking-wider';
    const base = `inline-flex rounded-full font-bold border uppercase ${pad}`;
    if (u.source === 'app') {
      return u.verified
        ? <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}>Verified</span>
        : <span className={`${base} bg-amber-50 text-amber-700 border-amber-200`}>Pending</span>;
    }
    return u.status === 'active'
      ? <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}>Active</span>
      : <span className={`${base} bg-red-50 text-red-700 border-red-200`}>Banned</span>;
  };

  // Filter users based on submenu Selection
  const getFilteredUsers = () => {
    let filtered = [...users, ...appUsers];

    if (activeView === 'users-pending') {
      filtered = filtered.filter(u => u.source === 'app' && !u.verified);
    } else if (activeView === 'users-active') {
      filtered = filtered.filter(u => u.status === 'active');
    } else if (activeView === 'users-banned') {
      filtered = filtered.filter(u => u.status === 'banned');
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term) ||
        u.phone.includes(searchTerm)
      );
    }

    return filtered;
  };

  const toggleBanStatus = (id: string) => {
    const updated = users.map(u => {
      if (u.id === id) {
        return {
          ...u,
          status: u.status === 'active' ? 'banned' as const : 'active' as const
        };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMsg) return;

    const newNotif: UserNotification = {
      id: 'not-' + Date.now(),
      targetType: notifTarget,
      title: notifTitle,
      message: notifMsg,
      sender: 'Operations Command Office',
      date: new Date().toISOString().split('T')[0]
    };

    onUpdateNotifications([...notifications, newNotif]);
    setNotifTitle('');
    setNotifMsg('');
    setSuccessAlert(true);
    setTimeout(() => setSuccessAlert(false), 4000);
  };

  return (
    <div className="space-y-6 select-none" id="users-view-root">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 capitalize">
          {isNotificationMode ? 'Broadcasting System Notifications' : 'Registered Customers Directory'}
        </h2>
        <p className="text-slate-500 text-xs font-semibold mt-1">
          {isNotificationMode 
            ? 'Broadcast push announcements, vouchers, or server maintenance alerts to clients and partners.'
            : 'Access user contact records, verify historic orders, or regulate access credentials.'}
        </p>
      </div>

      {successAlert && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs" id="notif-success-alert">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>System announcement dispatched to {notifTarget.replace('_', ' ')} successfully!</span>
        </div>
      )}

      {isNotificationMode ? (
        /* Create & Dispatch System push notification */
        <div className="max-w-xl bg-white border border-slate-200 rounded-2xl p-6 shadow-xs" id="notif-form-panel">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-5 h-5 text-emerald-600" />
            <span>Draft Dispatch Notification</span>
          </h3>

          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-slate-600 text-xs font-bold mb-1.5">Target Recipient Audience</label>
              <select
                value={notifTarget}
                onChange={(e) => setNotifTarget(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              >
                <option value="all_users">All Registered Customers (Users)</option>
                <option value="all_providers">All Service Providers (Partners)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 text-xs font-bold mb-1.5">Notification Header Title</label>
              <input
                type="text"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                placeholder="e.g. Server Maintenance Notice"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 text-xs font-bold mb-1.5">Detailed Message Content</label>
              <textarea
                value={notifMsg}
                onChange={(e) => setNotifMsg(e.target.value)}
                placeholder="Write detailed messaging here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition h-28 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md transition"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch System Broadcaster</span>
            </button>
          </form>
        </div>
      ) : (
        /* Regular User Listing Directory */
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-sm" id="user-search-wrapper">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            {/* Mobile Users Cards (< sm) */}
            <div className="sm:hidden divide-y divide-slate-100" id="users-mobile-cards">
              {getFilteredUsers().map((u) => (
                <div key={u.id} className="p-3.5 space-y-2.5 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative shrink-0">
                        <img
                          src={u.avatar || getDefaultAvatar(u.gender, u.name)}
                          alt={u.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs bg-slate-100"
                        />
                        {onEditUserPhoto && (
                          <button
                            onClick={() => onEditUserPhoto(u)}
                            title="Change Customer Photo"
                            className="absolute -bottom-1 -right-1 p-1 bg-red-600 text-white rounded-md shadow-xs transition cursor-pointer"
                          >
                            <Camera className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs">{u.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono">{u.phone}</p>
                      </div>
                    </div>
                    {renderStatusBadge(u, true)}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-400 font-mono text-[10px] truncate max-w-[170px]">{u.email || '—'}</span>
                    {u.source === 'app' ? (
                      u.verified ? (
                        <button
                          type="button"
                          onClick={() => onVerifyUser?.(u.id, false)}
                          className="py-1 px-2.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold rounded-lg cursor-pointer transition flex items-center gap-1 shadow-2xs"
                        >
                          <ShieldAlert className="w-3 h-3" />
                          <span>Mark Pending</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onVerifyUser?.(u.id, true)}
                          className="py-1 px-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-lg cursor-pointer transition flex items-center gap-1 shadow-2xs"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verify</span>
                        </button>
                      )
                    ) : u.status === 'active' ? (
                      <button
                        type="button"
                        onClick={() => toggleBanStatus(u.id)}
                        className="py-1 px-2.5 bg-red-50 border border-red-150 text-red-600 text-[10px] font-bold rounded-lg cursor-pointer transition flex items-center gap-1 shadow-2xs"
                      >
                        <ShieldAlert className="w-3 h-3" />
                        <span>Ban</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleBanStatus(u.id)}
                        className="py-1 px-2.5 bg-emerald-50 border border-emerald-150 text-emerald-750 text-[10px] font-bold rounded-lg cursor-pointer transition flex items-center gap-1 shadow-2xs"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>Restore</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {getFilteredUsers().length === 0 && (
                <p className="text-center py-8 text-slate-400 font-medium text-xs">No matching customer logs found.</p>
              )}
            </div>

            {/* Desktop Table (sm+) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4">Registration Date</th>
                    <th className="py-3 px-4 text-center">Platform Status</th>
                    <th className="py-3 px-4 text-right">Access Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getFilteredUsers().map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-extrabold text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="relative group shrink-0">
                            <img
                              src={u.avatar || getDefaultAvatar(u.gender, u.name)}
                              alt={u.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs bg-slate-100"
                            />
                            {onEditUserPhoto && (
                              <button
                                onClick={() => onEditUserPhoto(u)}
                                title="Change Customer Profile Photo"
                                className="absolute -bottom-1 -right-1 p-1 bg-red-600 hover:bg-red-500 text-white rounded-md shadow-xs transition cursor-pointer"
                              >
                                <Camera className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-800 text-xs">{u.name}</p>
                            {onEditUserPhoto && (
                              <button
                                onClick={() => onEditUserPhoto(u)}
                                className="text-[10px] text-red-600 hover:text-red-700 font-bold underline cursor-pointer"
                              >
                                Change Photo
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-550 font-mono text-xs font-semibold">{u.email || '—'}</td>
                      <td className="py-4 px-4 text-slate-600 font-mono text-xs font-bold">{u.phone}</td>
                      <td className="py-4 px-4 text-slate-400 font-mono text-[11px] font-semibold">{u.joinDate}</td>
                      <td className="py-4 px-4 text-center">
                        {renderStatusBadge(u)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {u.source === 'app' ? (
                          u.verified ? (
                            <button
                              onClick={() => onVerifyUser?.(u.id, false)}
                              className="py-1.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-[10px] font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5 ml-auto shadow-xs"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>Mark Pending</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onVerifyUser?.(u.id, true)}
                              className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5 ml-auto shadow-xs"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Verify Account</span>
                            </button>
                          )
                        ) : u.status === 'active' ? (
                          <button
                            onClick={() => toggleBanStatus(u.id)}
                            className="py-1.5 px-3 bg-red-50 hover:bg-red-100 border border-red-150 text-red-600 text-[10px] font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5 ml-auto shadow-xs"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Ban Account</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleBanStatus(u.id)}
                            className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 text-emerald-750 text-[10px] font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5 ml-auto shadow-xs"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Restore Access</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {getFilteredUsers().length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">No matching customer logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
