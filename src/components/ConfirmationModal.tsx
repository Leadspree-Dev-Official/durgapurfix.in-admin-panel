import React from 'react';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  targetName: string;
  actionType: 'verify' | 'pending';
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  targetName,
  actionType,
  isLoading,
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const isVerify = actionType === 'verify';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isVerify ? 'bg-emerald-100 text-[#10B981]' : 'bg-amber-100 text-[#D97706]'
            }`}>
              {isVerify ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <p className="text-[11px] text-slate-500 font-medium">Customer: {targetName}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            {message}
          </p>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span>Target Record:</span>
              <span className="font-bold text-slate-800">{targetName}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>New Status:</span>
              <span className={`font-bold ${isVerify ? 'text-[#10B981]' : 'text-[#D97706]'}`}>
                {isVerify ? 'Verified (status="verified", verified=true)' : 'Pending (status="pending", verified=false)'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              isVerify
                ? 'bg-[#10B981] hover:bg-emerald-600 active:bg-emerald-700'
                : 'bg-[#D97706] hover:bg-amber-600 active:bg-amber-700'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Applying...</span>
              </>
            ) : (
              <span>Confirm {isVerify ? 'Verification' : 'Pending Status'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
