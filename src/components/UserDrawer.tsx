import React from 'react';
import { DurgapurUser } from '../types';
import { 
  X, ShieldCheck, Clock, Phone, User, Hash, 
  CheckCircle2, AlertCircle, Copy, Check, Calendar
} from 'lucide-react';

interface UserDrawerProps {
  user: DurgapurUser | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestVerify: (user: DurgapurUser) => void;
  onRequestPending: (user: DurgapurUser) => void;
}

export default function UserDrawer({
  user,
  isOpen,
  onClose,
  onRequestVerify,
  onRequestPending
}: UserDrawerProps) {
  const [copiedUid, setCopiedUid] = React.useState(false);

  if (!isOpen || !user) return null;

  const isVerified = user.status === 'verified' && user.verified;
  const isPending = !isVerified;

  const formatDate = (ms: number) => {
    if (!ms) return 'Unknown';
    try {
      const d = new Date(ms);
      return d.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return String(ms);
    }
  };

  const getRelativeTime = (ms: number) => {
    if (!ms) return '';
    try {
      const diffSec = Math.floor((Date.now() - ms) / 1000);
      if (diffSec < 60) return 'just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      const diffDays = Math.floor(diffHr / 24);
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  const handleCopyUid = () => {
    if (!user.uid) return;
    navigator.clipboard.writeText(user.uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-40 overflow-hidden select-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="p-6 bg-[#0F2C59] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-amber-300 text-lg border border-white/10">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">{user.name || 'Unnamed Customer'}</h2>
                <p className="text-xs text-slate-300 font-mono">{user.phone10 || user.phone || 'No phone'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Alert Banner */}
          <div className={`px-6 py-3.5 flex items-center justify-between border-b ${
            isVerified 
              ? 'bg-emerald-50/70 border-emerald-100 text-emerald-800' 
              : 'bg-amber-50/70 border-amber-100 text-amber-900'
          }`}>
            <div className="flex items-center gap-2">
              {isVerified ? (
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
              )}
              <span className="text-xs font-bold">
                Account Status: {isVerified ? 'Verified Customer' : 'Pending Verification'}
              </span>
            </div>
            <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
              isVerified 
                ? 'bg-emerald-100/80 text-[#10B981] border-emerald-300' 
                : 'bg-amber-100/80 text-[#D97706] border-amber-300'
            }`}>
              {user.status || 'pending'}
            </span>
          </div>

          {/* Drawer Body - Exact Fields from durgapur_users */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Customer Record (durgapur_users)
              </h3>
              
              <div className="space-y-3.5">
                {/* Field: uid */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-slate-400" />
                      Document ID (uid)
                    </span>
                    <button
                      onClick={handleCopyUid}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F2C59] hover:underline cursor-pointer"
                    >
                      {copiedUid ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-800 break-all select-all">
                    {user.uid}
                  </div>
                </div>

                {/* Field: name */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Full Name (name)
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {user.name || '—'}
                  </div>
                </div>

                {/* Field: phone */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Full Phone with Code (phone)
                  </div>
                  <div className="text-sm font-bold text-slate-900 font-mono">
                    {user.phone || '—'}
                  </div>
                </div>

                {/* Field: phone10 */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    10-Digit Mobile (phone10)
                  </div>
                  <div className="text-sm font-bold text-slate-900 font-mono">
                    {user.phone10 || '—'}
                  </div>
                </div>

                {/* Field: status */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    Verification Status String (status)
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      isVerified
                        ? 'bg-emerald-100 text-[#10B981] border border-emerald-200'
                        : 'bg-amber-100 text-[#D97706] border border-amber-200'
                    }`}>
                      {user.status || 'pending'}
                    </span>
                  </div>
                </div>

                {/* Field: verified */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                    Boolean Flag (verified)
                  </div>
                  <div className="font-mono text-xs font-bold">
                    {user.verified ? (
                      <span className="text-[#10B981]">true</span>
                    ) : (
                      <span className="text-[#D97706]">false</span>
                    )}
                  </div>
                </div>

                {/* Field: createdAt */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Registration Timestamp (createdAt)
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {formatDate(user.createdAt)}
                    {getRelativeTime(user.createdAt) && (
                      <span className="text-xs text-slate-500 font-normal ml-2">
                        ({getRelativeTime(user.createdAt)})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    Epoch ms: {user.createdAt || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-2.5">
            <div className="text-xs font-bold text-slate-700">Quick Verification Actions:</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onRequestVerify(user)}
                disabled={isVerified}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-[#10B981] hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify</span>
              </button>

              <button
                type="button"
                onClick={() => onRequestPending(user)}
                disabled={isPending}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-[#D97706] hover:bg-amber-600 active:bg-amber-700 text-white shadow-xs"
              >
                <Clock className="w-4 h-4" />
                <span>Set Pending</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center leading-normal">
              Admin operations strictly modify only `status` and `verified` fields.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
