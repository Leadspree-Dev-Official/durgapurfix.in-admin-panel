import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  key?: React.Key;
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

function ToastItem({
  toast,
  onDismiss
}: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === 'success';

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-2 duration-200 bg-white ${
        isSuccess ? 'border-emerald-200 text-slate-900' : 'border-rose-200 text-slate-900'
      }`}
      role="alert"
    >
      <div className={`mt-0.5 shrink-0 ${isSuccess ? 'text-[#10B981]' : 'text-rose-600'}`}>
        {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-900">{toast.title}</p>
        {toast.description && (
          <p className="text-[11px] text-slate-500 mt-0.5 leading-normal font-normal">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-lg transition cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
