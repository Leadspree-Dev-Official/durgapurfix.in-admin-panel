import React, { useState } from 'react';
import { AppConfigGlobal } from '../types';
import { 
  Smartphone, DollarSign, Wallet, Bot, Clock, ShieldCheck, 
  ExternalLink, Sparkles, CheckCircle2, Save, RefreshCw, Cpu
} from 'lucide-react';
import { syncDocToFirestore } from '../lib/firestoreSync';

interface AndroidConfigViewProps {
  config: AppConfigGlobal;
  onUpdateConfig: (config: AppConfigGlobal) => void;
}

export default function AndroidConfigView({
  config,
  onUpdateConfig
}: AndroidConfigViewProps) {
  const [formData, setFormData] = useState<AppConfigGlobal>(config);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Time slot input helper
  const [newSlot, setNewSlot] = useState('');
  const [newChip, setNewChip] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    // Live push to Firestore collection `app_config`, doc `global`
    setIsSyncingCloud(true);
    setSyncStatus('Pushing to Firestore app_config/global...');
    try {
      await syncDocToFirestore('app_config', 'global', formData);
      setSyncStatus('Synced to live Firestore app_config/global successfully!');
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (err: any) {
      setSyncStatus(`Firestore sync failed: ${err?.message || 'Check rules'}`);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const addTimeSlot = () => {
    if (!newSlot.trim()) return;
    if (formData.booking.timeSlots.includes(newSlot.trim())) return;
    setFormData({
      ...formData,
      booking: {
        ...formData.booking,
        timeSlots: [...formData.booking.timeSlots, newSlot.trim()]
      }
    });
    setNewSlot('');
  };

  const removeTimeSlot = (index: number) => {
    setFormData({
      ...formData,
      booking: {
        ...formData.booking,
        timeSlots: formData.booking.timeSlots.filter((_, i) => i !== index)
      }
    });
  };

  const addSuggestionChip = () => {
    if (!newChip.trim()) return;
    if (formData.ai.suggestionChips.includes(newChip.trim())) return;
    setFormData({
      ...formData,
      ai: {
        ...formData.ai,
        suggestionChips: [...formData.ai.suggestionChips, newChip.trim()]
      }
    });
    setNewChip('');
  };

  const removeSuggestionChip = (index: number) => {
    setFormData({
      ...formData,
      ai: {
        ...formData.ai,
        suggestionChips: formData.ai.suggestionChips.filter((_, i) => i !== index)
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-500/20 rounded-xl text-indigo-300 border border-indigo-400/30">
                <Smartphone className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold tracking-tight">Android App Dynamic Configuration</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                app_config/global
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 max-w-2xl">
              Control your live Android app's pricing rules, wallet balance, OTP safety windows, booking slots, and Gemini AI assistant in real-time without recompiling the mobile APK.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSyncingCloud}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSyncingCloud ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSyncingCloud ? 'Syncing...' : 'Save & Push to App'}</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Settings saved locally and queued for Cloud Firestore live dispatch.</span>
          </div>
        )}

        {syncStatus && (
          <div className="mt-2 text-xs font-mono text-cyan-300 bg-cyan-950/50 p-2.5 rounded-xl border border-cyan-500/30">
            {syncStatus}
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Pricing & Markup Controls */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Dynamic Pricing, GST & Platform Fee</h3>
              <p className="text-[11px] text-slate-500">Live values injected into the Android checkout and invoice calculators</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Platform Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.pricing.platformFee}
                onChange={(e) => setFormData({
                  ...formData,
                  pricing: { ...formData.pricing, platformFee: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden transition"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Standard ₹49 convenience charge</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Checkout Tax (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.pricing.checkoutTaxPercent}
                onChange={(e) => setFormData({
                  ...formData,
                  pricing: { ...formData.pricing, checkoutTaxPercent: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden transition"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Usually 0% (or included)</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Invoice GST Tax (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.pricing.invoiceTaxPercent}
                onChange={(e) => setFormData({
                  ...formData,
                  pricing: { ...formData.pricing, invoiceTaxPercent: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden transition"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Official GST rate (e.g. 18%)</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Price Markup (%)
              </label>
              <input
                type="number"
                min="0"
                max="200"
                value={formData.pricing.priceMarkupPercent}
                onChange={(e) => setFormData({
                  ...formData,
                  pricing: { ...formData.pricing, priceMarkupPercent: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden transition"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Generates "Original Strikethrough Price"</span>
            </div>
          </div>
        </div>

        {/* Section 2: Wallet & OTP Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Wallet className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Customer In-App Wallet</h3>
                <p className="text-[11px] text-slate-500">Sign-up welcome cash and wallet availability</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-800">Enable In-App Wallet</p>
                  <p className="text-[10px] text-slate-500">Allows customers to pay via wallet coins</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.wallet.enabled}
                    onChange={(e) => setFormData({
                      ...formData,
                      wallet: { ...formData.wallet, enabled: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Starting Balance for New Sign-ups (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.wallet.startingBalance}
                  onChange={(e) => setFormData({
                    ...formData,
                    wallet: { ...formData.wallet, startingBalance: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden transition"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Previously hardcoded to 450, recommended 0 or promotional 50</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">OTP Limits & Booking Window</h3>
                <p className="text-[11px] text-slate-500">Security gates and advance scheduling days</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Max OTP Attempts
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.otp.maxAttempts}
                  onChange={(e) => setFormData({
                    ...formData,
                    otp: { ...formData.otp, maxAttempts: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  OTP Window (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={formData.otp.windowMinutes}
                  onChange={(e) => setFormData({
                    ...formData,
                    otp: { ...formData.otp, windowMinutes: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Advance Booking Days Allowed
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.booking.advanceBookingDays}
                  onChange={(e) => setFormData({
                    ...formData,
                    booking: { ...formData.booking, advanceBookingDays: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Dynamic Time Slots Array */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Dynamic Appointment Time Slots</h3>
                <p className="text-[11px] text-slate-500">Android app fetches these slots dynamically on the booking calendar</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.booking.timeSlots.map((slot, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold"
              >
                <span>{slot}</span>
                <button
                  type="button"
                  onClick={() => removeTimeSlot(idx)}
                  className="text-blue-400 hover:text-rose-600 cursor-pointer font-black text-sm"
                  title="Remove slot"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 max-w-md pt-2">
            <input
              type="text"
              placeholder="e.g. 08:00 AM - 10:00 AM"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
            <button
              type="button"
              onClick={addTimeSlot}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              + Add Slot
            </button>
          </div>
        </div>

        {/* Section 4: HomeCare AI Assistant Persona & Suggestion Chips */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Bot className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">HomeCare AI Assistant (Gemini)</h3>
                <p className="text-[11px] text-slate-500">Configures model, greeting, and system persona served to mobile users</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.ai.enabled}
                onChange={(e) => setFormData({
                  ...formData,
                  ai: { ...formData.ai, enabled: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gemini Model Version
              </label>
              <input
                type="text"
                value={formData.ai.model}
                onChange={(e) => setFormData({
                  ...formData,
                  ai: { ...formData.ai, model: e.target.value }
                })}
                placeholder="gemini-2.5-flash"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Temperature (0.0 - 1.0)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={formData.ai.temperature}
                onChange={(e) => setFormData({
                  ...formData,
                  ai: { ...formData.ai, temperature: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-hidden transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Greeting Message
              </label>
              <input
                type="text"
                value={formData.ai.greeting}
                onChange={(e) => setFormData({
                  ...formData,
                  ai: { ...formData.ai, greeting: e.target.value }
                })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-hidden transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                AI System Persona & Prompt
              </label>
              <textarea
                rows={3}
                value={formData.ai.systemPrompt}
                onChange={(e) => setFormData({
                  ...formData,
                  ai: { ...formData.ai, systemPrompt: e.target.value }
                })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-hidden transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quick Suggestion Chips
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.ai.suggestionChips.map((chip, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-xl text-xs font-semibold"
                  >
                    <span>{chip}</span>
                    <button
                      type="button"
                      onClick={() => removeSuggestionChip(idx)}
                      className="text-purple-400 hover:text-rose-600 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="e.g. AC Gas Leakage"
                  value={newChip}
                  onChange={(e) => setNewChip(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-hidden"
                />
                <button
                  type="button"
                  onClick={addSuggestionChip}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  + Add Chip
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Feature Flags & Home Social Proof */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Cpu className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Feature Flags & Home Branding</h3>
              <p className="text-[11px] text-slate-500">Toggle mobile modules on/off dynamically</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.features.wallet}
                onChange={(e) => setFormData({
                  ...formData,
                  features: { ...formData.features, wallet: e.target.checked }
                })}
                className="rounded-md text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-700">Wallet</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.features.aiChat}
                onChange={(e) => setFormData({
                  ...formData,
                  features: { ...formData.features, aiChat: e.target.checked }
                })}
                className="rounded-md text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-700">AI Chat</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.features.referrals}
                onChange={(e) => setFormData({
                  ...formData,
                  features: { ...formData.features, referrals: e.target.checked }
                })}
                className="rounded-md text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-700">Referrals</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.features.afterSales}
                onChange={(e) => setFormData({
                  ...formData,
                  features: { ...formData.features, afterSales: e.target.checked }
                })}
                className="rounded-md text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-700">After Sales</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Social Proof Label (Home Screen)
              </label>
              <input
                type="text"
                value={formData.home.socialProofLabel}
                onChange={(e) => setFormData({
                  ...formData,
                  home: { ...formData.home, socialProofLabel: e.target.value }
                })}
                placeholder="e.g. Trusted by 5,000+ Durgapur homes"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Invoice Number Prefix
              </label>
              <input
                type="text"
                value={formData.invoice.prefix}
                onChange={(e) => setFormData({
                  ...formData,
                  invoice: { ...formData.invoice, prefix: e.target.value }
                })}
                placeholder="INV-DH"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSyncingCloud}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isSyncingCloud ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Commit & Sync app_config/global</span>
          </button>
        </div>
      </form>
    </div>
  );
}
