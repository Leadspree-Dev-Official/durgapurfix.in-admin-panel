import React, { useState } from 'react';
import { UserRole } from '../types';
import { Shield, Briefcase, UserCheck, Key, Home, Sparkles, AlertCircle, ArrowLeft, Globe, Loader2, CheckCircle2, Lock, Mail, User as UserIcon, Phone as PhoneIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { DEFAULT_MAN_AVATAR } from '../data/avengers';
import Logo from './Logo';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthScreenProps {
  onLoginSuccess: (email: string, role: UserRole, name: string, providerId?: string, avatar?: string) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<UserRole>('admin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [providerCategory, setProviderCategory] = useState('AC Mechanic');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    if (isSignUp && !name.trim()) {
      setError('Full name is required for registration.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    if (auth) {
      try {
        if (isSignUp) {
          // 1. Create user in Firebase Authentication
          const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          const user = userCredential.user;

          // Update display name
          await updateProfile(user, { displayName: name });

          const providerId = role === 'provider' ? `prov_${user.uid.substring(0, 8)}` : undefined;

          // 2. Save profile record in Firestore
          if (db) {
            try {
              if (role === 'provider') {
                await setDoc(doc(db, 'providers', providerId || user.uid), {
                  id: providerId || user.uid,
                  name: name,
                  email: cleanEmail,
                  phone: phone || '',
                  category: providerCategory,
                  status: 'pending',
                  rating: 5.0,
                  balance: 0,
                  jobsCompleted: 0,
                  joinDate: new Date().toISOString().split('T')[0],
                  avatar: DEFAULT_MAN_AVATAR
                }, { merge: true });
              } else {
                await setDoc(doc(db, 'users', user.uid), {
                  id: user.uid,
                  name: name,
                  email: cleanEmail,
                  phone: phone || '',
                  role: role,
                  status: 'active',
                  joinDate: new Date().toISOString().split('T')[0],
                  avatar: DEFAULT_MAN_AVATAR
                }, { merge: true });
              }
            } catch (fsErr) {
              console.warn('Profile sync to Firestore deferred:', fsErr);
            }
          }

          setSuccessMessage('Account registered successfully! Accessing portal...');
          setTimeout(() => {
            onLoginSuccess(cleanEmail, role, name, providerId, DEFAULT_MAN_AVATAR);
          }, 500);
          return;
        } else {
          // 2. Sign In with Firebase Authentication
          const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
          const user = userCredential.user;

          // Check if user has an existing role in Firestore or fallback to profile
          let detectedRole: UserRole = role;
          let detectedName = user.displayName || name || cleanEmail.split('@')[0];
          let detectedProviderId: string | undefined = undefined;

          if (db) {
            try {
              // Check in users doc
              const userSnap = await getDoc(doc(db, 'users', user.uid));
              if (userSnap.exists()) {
                const userData = userSnap.data();
                if (userData.role) detectedRole = userData.role;
                if (userData.name) detectedName = userData.name;
              } else {
                // Check if provider
                const provSnap = await getDoc(doc(db, 'providers', `prov_${user.uid.substring(0, 8)}`));
                if (provSnap.exists()) {
                  detectedRole = 'provider';
                  detectedProviderId = `prov_${user.uid.substring(0, 8)}`;
                }
              }
            } catch (e) {
              console.warn('Could not read user profile from firestore:', e);
            }
          }

          onLoginSuccess(cleanEmail, detectedRole, detectedName, detectedProviderId, DEFAULT_MAN_AVATAR);
          return;
        }
      } catch (authErr: any) {
        console.error('Firebase Auth error:', authErr.code, authErr.message);
        setIsLoading(false);

        if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/wrong-password' || authErr.code === 'auth/invalid-credential') {
          setError('Invalid email or password. Please check your credentials or create a new account.');
        } else if (authErr.code === 'auth/email-already-in-use') {
          setError('This email is already registered. Please sign in instead.');
        } else if (authErr.code === 'auth/weak-password') {
          setError('Password must be at least 6 characters.');
        } else if (authErr.code === 'auth/invalid-email') {
          setError('Please enter a valid email address.');
        } else if (authErr.code === 'auth/too-many-requests') {
          setError('Too many unsuccessful attempts. Please try again later.');
        } else {
          setError(authErr.message || 'Authentication failed. Please check your credentials.');
        }
      }
    } else {
      setIsLoading(false);
      setError('Firebase authentication service is currently unavailable.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 select-none relative overflow-hidden" id="auth-container">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Back button to main website */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between z-10">
        <a
          href="https://durgapurfix.in"
          target="_top"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-blue-700 text-xs font-bold border border-slate-200 shadow-xs transition group cursor-pointer"
          title="Return to main website: durgapurfix.in"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 group-hover:text-blue-600 transition-all shrink-0" />
          <span>Back to main website: <strong>durgapurfix.in</strong></span>
        </a>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-10"
        id="auth-card"
      >
        <div className="p-6 sm:p-8 text-center border-b border-slate-100 bg-white flex flex-col items-center">
          <Logo size="lg" className="mb-2" />
          <p className="text-slate-500 text-xs font-bold mt-1">Unified Multi-Role Operations Portal</p>
        </div>

        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Joydev Sen"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium placeholder-slate-400"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-600 text-xs font-bold mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@durgapurfix.in"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium placeholder-slate-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 text-xs font-bold mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium placeholder-slate-400"
                  required
                />
              </div>
            </div>

            {isSignUp && (
              <>
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Phone Number</label>
                  <div className="relative">
                    <PhoneIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit number (e.g. 9832100000)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium placeholder-slate-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Account Role Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['admin', 'executive', 'provider'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-2 px-2.5 rounded-xl border text-xs capitalize cursor-pointer text-center font-bold transition shadow-xs ${
                          role === r
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-extrabold ring-2 ring-emerald-500/10'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {role === 'provider' && (
                  <div>
                    <label className="block text-slate-600 text-xs font-bold mb-1.5">Service Specialty Category</label>
                    <select
                      value={providerCategory}
                      onChange={(e) => setProviderCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    >
                      <option value="AC Mechanic">AC Mechanic</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Beautician">Beautician</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Chefs & Cooks">Chefs & Cooks</option>
                      <option value="Home Cleaning">Home Cleaning</option>
                    </select>
                    <p className="text-[10px] text-amber-700 font-bold mt-2 flex items-center gap-1.5 bg-amber-50 p-2.5 rounded-lg border border-amber-200 shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                      <span>Providers will require profile review & approval by Admin to receive live assignments.</span>
                    </p>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-xs hover:shadow-md cursor-pointer transition mt-6 flex items-center justify-center gap-2"
              id="submit-auth-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>{isSignUp ? 'Create Account & Access' : 'Sign In'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setError('');
                setSuccessMessage('');
                setIsSignUp(!isSignUp);
              }}
              className="text-emerald-700 hover:text-emerald-800 text-xs font-bold cursor-pointer"
              id="toggle-auth-mode"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Register New User / Provider'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
