import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Lock, Mail, AlertCircle, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface LoginScreenProps {
  onSuccess?: () => void;
}

export default function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Firebase Auth Login Error:', err);
      const code = err?.code || '';
      
      switch (code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
          setErrorMessage('Invalid email or password. Please verify your credentials.');
          break;
        case 'auth/user-not-found':
          setErrorMessage('No admin account found for this email address.');
          break;
        case 'auth/invalid-email':
          setErrorMessage('The email address format is not valid.');
          break;
        case 'auth/user-disabled':
          setErrorMessage('This admin account has been disabled.');
          break;
        case 'auth/too-many-requests':
          setErrorMessage('Access temporarily blocked due to multiple failed attempts. Please try again later.');
          break;
        case 'auth/network-request-failed':
          setErrorMessage('Network connection failure. Please check your internet connection.');
          break;
        case 'auth/operation-not-allowed':
          setErrorMessage('Email/Password sign-in is not enabled in Firebase Console.');
          break;
        default:
          setErrorMessage(err?.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center px-4 py-12 select-none">
      {/* Decorative background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#0F2C59]/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0F2C59] text-white shadow-lg mb-4 ring-4 ring-[#0F2C59]/15">
            <ShieldCheck className="w-9 h-9 text-amber-400" />
          </div>
          <h1 className="text-2xl font-black text-[#0F2C59] tracking-tight">
            Durgapur Fix
          </h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
            Admin Web Console • Customer Verification
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 sm:p-9">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Sign in to Admin Console</h2>
            <p className="text-xs text-slate-500 mt-1">
              Internal access for customer review and verification operations.
            </p>
          </div>

          {errorMessage && (
            <div 
              role="alert" 
              className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="email-input">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-input"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@durgapurfix.in"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C59] focus:border-[#0F2C59] transition"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700" htmlFor="password-input">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C59] focus:border-[#0F2C59] transition"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#0F2C59] hover:bg-[#153e7a] active:bg-[#0b2144] text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md shadow-[#0F2C59]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Console</span>
              )}
            </button>
          </form>

          {/* Security notice */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 leading-normal">
              Admin credentials are provisioned manually in the Firebase console.
              Public registration is disabled.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 font-medium">
          Durgapur Fix • Home Services Marketplace
        </div>
      </div>
    </div>
  );
}
