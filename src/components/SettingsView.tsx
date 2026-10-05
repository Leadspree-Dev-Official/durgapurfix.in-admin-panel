import React, { useState } from 'react';
import { SystemSettings } from '../types';
import { 
  Settings, Image, ShieldAlert, FileText, Globe, Check, Camera, 
  Sparkles, ShieldCheck, Database, RefreshCw, CheckCircle2, AlertCircle,
  Smartphone, Copy, CheckCheck, Code2, CloudUpload, ChevronDown, ChevronUp,
  Layers, BookOpen, Laptop, Radio, Headphones, PhoneCall, MessageSquare, 
  HelpCircle, FileCheck, ExternalLink, Plus, Trash2, Eye, ChevronRight
} from 'lucide-react';
import { HelpCenterFAQ, HelpCenterSettings } from '../types';
import { checkBackendConnection, BackendConnectionResult } from '../lib/firebase';
import { pushAllSeedDataToFirestore, SyncProgress } from '../lib/firestoreSync';
import rawFirebaseConfig from '../../firebase-applet-config.json';

interface SettingsViewProps {
  activeView: string; // 'settings-general' | 'settings-logo' | 'settings-config' | 'settings-policy' | 'settings-seo'
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  onChangePhoto?: () => void;
  fullAppData?: {
    categories: any[];
    subcategories: any[];
    zones: any[];
    coupons: any[];
    sliders: any[];
    services: any[];
    providers: any[];
    orders: any[];
    users: any[];
    settings: any;
  };
}

export default function SettingsView({
  activeView,
  settings,
  onUpdateSettings,
  onChangePhoto,
  fullAppData
}: SettingsViewProps) {

  const isGeneral = activeView === 'settings-general';
  const isLogo = activeView === 'settings-logo';
  const isConfig = activeView === 'settings-config';
  const isPolicy = activeView === 'settings-policy';
  const isSeo = activeView === 'settings-seo';

  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [backendCheck, setBackendCheck] = useState<BackendConnectionResult | null>(null);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);

  // Mobile Sync Panel State
  const currentProjectId = rawFirebaseConfig.projectId || 'durgapurfix-1935c';
  const currentDbId = rawFirebaseConfig.firestoreDatabaseId || '(default)';
  const currentApiKey = rawFirebaseConfig.apiKey || 'AIzaSyDgz922-DOFf3Wy4qtKd-dsE1YiOrnLckE';
  const currentAppId = rawFirebaseConfig.appId || '1:767865264343:web:38cf5fe24b3a4cdc303892';
  const currentAuthDomain = rawFirebaseConfig.authDomain || 'durgapurfix-1935c.firebaseapp.com';
  const currentStorageBucket = rawFirebaseConfig.storageBucket || 'durgapurfix-1935c.firebasestorage.app';
  const currentSenderId = rawFirebaseConfig.messagingSenderId || '767865264343';

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'flutter' | 'react-native' | 'kotlin' | 'rules'>('flutter');
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [syncResult, setSyncResult] = useState<{ success: boolean; count: number; message: string } | null>(null);

  // Policy & Help Center Sub-Tabs
  const [policySubTab, setPolicySubTab] = useState<'help' | 'refund' | 'terms' | 'privacy' | 'about' | 'receipt'>('help');
  const [activePreviewDoc, setActivePreviewDoc] = useState<'help' | 'refund' | 'terms' | null>(null);
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [newFaqCategory, setNewFaqCategory] = useState('Bookings');
  const [showAddFaq, setShowAddFaq] = useState(false);

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handlePushAllToCloud = async () => {
    if (!fullAppData) {
      setSyncResult({
        success: false,
        count: 0,
        message: 'No local dataset found to sync.'
      });
      return;
    }

    setIsSyncingCloud(true);
    setSyncResult(null);
    try {
      const res = await pushAllSeedDataToFirestore(fullAppData, (p) => setSyncProgress(p));
      if (res.success) {
        setSyncResult({
          success: true,
          count: res.totalUploaded,
          message: `Successfully synchronized ${res.totalUploaded} records to Firestore! Your mobile app can now fetch live categories, services, sliders, and orders.`
        });
      } else {
        setSyncResult({
          success: false,
          count: 0,
          message: res.error || 'Failed to sync data to cloud.'
        });
      }
    } catch (err: any) {
      setSyncResult({
        success: false,
        count: 0,
        message: err?.message || 'Sync error occurred.'
      });
    } finally {
      setIsSyncingCloud(false);
      setSyncProgress(null);
    }
  };

  const handleTestBackend = async () => {
    setIsCheckingBackend(true);
    try {
      const res = await checkBackendConnection();
      setBackendCheck(res);
    } catch (e: any) {
      setBackendCheck({
        connected: false,
        projectId: currentProjectId,
        databaseId: currentDbId,
        latencyMs: 0,
        error: e?.message || 'Connection failed',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsCheckingBackend(false);
    }
  };

  // General state update helpers
  const updateGeneral = (field: keyof SystemSettings['general'], value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      general: { ...prev.general, [field]: value }
    }));
  };

  const updateLogo = (field: keyof SystemSettings['logo'], value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      logo: { ...prev.logo, [field]: value }
    }));
  };

  const updateConfig = (field: keyof SystemSettings['configuration'], value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      configuration: { ...prev.configuration, [field]: value }
    }));
  };

  const updatePolicy = (field: keyof SystemSettings['policyPages'], value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      policyPages: { ...prev.policyPages, [field]: value }
    }));
  };

  const updateHelpCenter = (field: keyof HelpCenterSettings, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      helpCenter: {
        supportPhone: prev.helpCenter?.supportPhone || '+91 9434 221100',
        supportEmail: prev.helpCenter?.supportEmail || 'support@durgapurfix.com',
        whatsappNumber: prev.helpCenter?.whatsappNumber || '+91 9434 221100',
        supportHours: prev.helpCenter?.supportHours || '8:00 AM - 9:00 PM (Monday - Sunday)',
        helpDeskMessage: prev.helpCenter?.helpDeskMessage || 'Need quick help with your service booking?',
        faqs: prev.helpCenter?.faqs || [],
        [field]: value
      }
    }));
  };

  const handleAddFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    const newFaq: HelpCenterFAQ = {
      id: 'faq-' + Date.now(),
      question: newFaqQ.trim(),
      answer: newFaqA.trim(),
      category: newFaqCategory
    };
    const currentFaqs = localSettings.helpCenter?.faqs || [];
    updateHelpCenter('faqs', [...currentFaqs, newFaq]);
    setNewFaqQ('');
    setNewFaqA('');
    setShowAddFaq(false);
  };

  const handleDeleteFaq = (faqId: string) => {
    const currentFaqs = localSettings.helpCenter?.faqs || [];
    updateHelpCenter('faqs', currentFaqs.filter(f => f.id !== faqId));
  };

  const updateSeo = (field: keyof SystemSettings['seo'], value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      seo: { ...prev.seo, [field]: value }
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 select-none" id="settings-view-root">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 capitalize">
            {activeView.replace('settings-', ' ')} Configuration Panel
          </h2>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            Fine-tune aggregator rules, customize site metadata, manage verification workflows, and edit client agreement terms.
          </p>
        </div>
        {saveSuccess && (
          <div className="p-2.5 px-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs" id="settings-success">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-3xl">
        <form onSubmit={handleSave} className="space-y-6">

          {/* GENERAL SETTING */}
          {isGeneral && (
            <div className="space-y-6" id="settings-general-form">
              {/* Profile Photo Quick Action Card */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-red-600/20 text-red-400 rounded-2xl border border-red-500/30 shrink-0">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span>Profile Photo Management</span>
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                        Default Avatar Active
                      </span>
                    </h4>
                    <p className="text-slate-300 text-xs mt-0.5 font-medium">
                      Default man image is set for profiles until a custom photo is uploaded.
                    </p>
                  </div>
                </div>

                {onChangePhoto && (
                  <button
                    type="button"
                    onClick={onChangePhoto}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl cursor-pointer transition shadow-sm flex items-center gap-2 shrink-0"
                    id="settings-change-photo-btn"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Change My Profile Photo</span>
                  </button>
                )}
              </div>

              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Settings className="w-4.5 h-4.5 text-emerald-600" />
                <span>General Site & Contact Settings</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Site / Platform Name</label>
                  <input
                    type="text"
                    value={localSettings.general.siteName}
                    onChange={(e) => updateGeneral('siteName', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Platform Contact Email</label>
                  <input
                    type="email"
                    value={localSettings.general.contactEmail}
                    onChange={(e) => updateGeneral('contactEmail', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Contact Help Desk Phone</label>
                  <input
                    type="text"
                    value={localSettings.general.contactPhone}
                    onChange={(e) => updateGeneral('contactPhone', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Local Currency Sign</label>
                  <input
                    type="text"
                    value={localSettings.general.currency}
                    onChange={(e) => updateGeneral('currency', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-center font-extrabold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Aggregator Commission Rate (%)</label>
                  <input
                    type="number"
                    value={localSettings.general.commissionRate}
                    onChange={(e) => updateGeneral('commissionRate', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Office Physical Address</label>
                  <input
                    type="text"
                    value={localSettings.general.address}
                    onChange={(e) => updateGeneral('address', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Itemized Billing & Tax Configuration Card */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl space-y-4">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Billing, Convenience Fees & Statutory Tax Controls</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    Admin flexibility controls: Easily toggle platform fee or GST tax ON or OFF to include or remove them from itemized bills.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Platform Fee Block */}
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">Platform Convenience Fee</h5>
                        <p className="text-[10px] font-semibold text-slate-500">Add or remove platform fee on bills</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.general.enablePlatformFee ?? true}
                          onChange={(e) => updateGeneral('enablePlatformFee', e.target.checked)}
                          className="w-4.5 h-4.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                        />
                      </label>
                    </div>

                    {(localSettings.general.enablePlatformFee ?? true) ? (
                      <div className="pt-2 border-t border-slate-100">
                        <label className="block text-slate-700 text-[11px] font-bold mb-1">
                          Fee Amount (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={localSettings.general.platformFee ?? 49}
                          onChange={(e) => updateGeneral('platformFee', Math.max(0, Number(e.target.value)))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                          required
                        />
                        <p className="text-[10px] text-slate-500 mt-1 font-medium">Flat fee added to customer invoices.</p>
                      </div>
                    ) : (
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center text-[10px] font-bold text-slate-500">
                        🚫 Platform fee is REMOVED from bills.
                      </div>
                    )}
                  </div>

                  {/* GST Tax Block */}
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">Statutory GST Tax</h5>
                        <p className="text-[10px] font-semibold text-slate-500">Add or remove GST tax calculation</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.general.enableGstTax ?? true}
                          onChange={(e) => updateGeneral('enableGstTax', e.target.checked)}
                          className="w-4.5 h-4.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                        />
                      </label>
                    </div>

                    {(localSettings.general.enableGstTax ?? true) ? (
                      <div className="pt-2 border-t border-slate-100">
                        <label className="block text-slate-700 text-[11px] font-bold mb-1">
                          Tax Percentage Rate (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={localSettings.general.gstTaxRate ?? 5}
                          onChange={(e) => updateGeneral('gstTaxRate', Math.max(0, Number(e.target.value)))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                          required
                        />
                        <p className="text-[10px] text-slate-500 mt-1 font-medium">GST calculated on service + parts cost.</p>
                      </div>
                    ) : (
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center text-[10px] font-bold text-slate-500">
                        🚫 Statutory GST is REMOVED from bills.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LOGO & FAVICON */}
          {isLogo && (
            <div className="space-y-4" id="settings-logo-form">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Image className="w-4.5 h-4.5 text-teal-600" />
                <span>Visual Identity: Branding Assets</span>
              </h3>
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Logo Display Name / Brand string</label>
                <input
                  type="text"
                  value={localSettings.logo.primaryLogo}
                  onChange={(e) => updateLogo('primaryLogo', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-extrabold"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Favicon / Visual Icon Alias (Emoji)</label>
                <input
                  type="text"
                  value={localSettings.logo.favicon}
                  onChange={(e) => updateLogo('favicon', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-center text-lg"
                  required
                />
              </div>
            </div>
          )}

          {/* SYSTEM CONFIGURATION */}
          {isConfig && (
            <div className="space-y-5" id="settings-config-form">
              {/* Cloud Database & Backend Infrastructure Card */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-4 border border-slate-800 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30 shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-white">Google Cloud Firestore Backend</h4>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Active & Connected
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        Enterprise NoSQL database cluster backing provider registry, job orders, and system accounts.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestBackend}
                    disabled={isCheckingBackend}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-sm shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingBackend ? 'animate-spin' : ''}`} />
                    <span>{isCheckingBackend ? 'Pinging Cloud...' : 'Test Connection'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800 text-[11px]">
                  <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Cloud Project</span>
                      <span className="font-mono text-slate-200 font-bold truncate block">{currentProjectId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(currentProjectId, 'project')}
                      className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition shrink-0"
                      title="Copy Project ID"
                    >
                      {copiedKey === 'project' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Firestore Database</span>
                      <span className="font-mono text-emerald-400 font-bold truncate block" title={currentDbId}>
                        {currentDbId}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(currentDbId, 'database')}
                      className="p-1.5 hover:bg-slate-700 rounded-lg text-emerald-400 hover:text-emerald-300 transition shrink-0"
                      title="Copy Database ID"
                    >
                      {copiedKey === 'database' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">App ID</span>
                      <span className="font-mono text-indigo-300 font-bold block truncate">{currentAppId.slice(0, 18)}...</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(currentAppId, 'appid')}
                      className="p-1.5 hover:bg-slate-700 rounded-lg text-indigo-300 hover:text-indigo-200 transition shrink-0"
                      title="Copy App ID"
                    >
                      {copiedKey === 'appid' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {backendCheck && (
                  <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold ${
                    backendCheck.connected 
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      {backendCheck.connected ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>
                        {backendCheck.connected
                          ? `Live ping verified in ${backendCheck.latencyMs}ms! Backend cluster is healthy and actively connected.`
                          : `Connection error: ${backendCheck.error}`}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      Checked: {new Date(backendCheck.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                )}

                {/* Cloud Sync & Initial Seeding Action */}
                <div className="p-4 bg-gradient-to-r from-blue-950/70 via-indigo-950/70 to-slate-900 rounded-xl border-2 border-indigo-500/60 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden" id="cloud-sync-card">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
                        <CloudUpload className="w-4 h-4" />
                      </div>
                      <h5 className="text-sm font-extrabold text-white">Sync / Push App Data to Cloud Firestore</h5>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Live Database
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Uploads all categories, services, sliders, zones, and orders to Firestore so your mobile app has real live records immediately.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePushAllToCloud}
                    disabled={isSyncingCloud}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-600 hover:from-blue-400 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold transition disabled:opacity-50 cursor-pointer shadow-md shrink-0 active:scale-95"
                    id="settings-push-all-data-btn"
                  >
                    <CloudUpload className={`w-4 h-4 ${isSyncingCloud ? 'animate-bounce' : ''}`} />
                    <span>{isSyncingCloud ? 'Pushing to Cloud...' : 'Push All Data to Cloud'}</span>
                  </button>
                </div>

                {/* Sync Progress or Results */}
                {syncProgress && (
                  <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-xl text-xs text-blue-300 space-y-1.5">
                    <div className="flex justify-between font-semibold">
                      <span>Syncing collection: <span className="font-mono text-white">{syncProgress.currentCollection}</span></span>
                      <span>{syncProgress.completed} / {syncProgress.total} items</span>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-400 h-full transition-all duration-300"
                        style={{ width: `${Math.round((syncProgress.completed / Math.max(syncProgress.total, 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {syncResult && (
                  <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-medium ${
                    syncResult.success 
                      ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200' 
                      : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
                  }`}>
                    {syncResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                    <div>
                      <p className="font-bold">{syncResult.success ? 'Cloud Synchronization Complete!' : 'Sync Issue'}</p>
                      <p className="text-[11px] opacity-90 mt-0.5">{syncResult.message}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* SHARED MOBILE APP & WEB ADMIN INTEGRATION CENTER */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div 
                  onClick={() => setIsGuideOpen(!isGuideOpen)}
                  className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                          Mobile App & Web Admin Database Integration Center
                        </h4>
                        <span className="hidden sm:inline-block px-2 py-0.5 bg-blue-100 text-blue-700 font-bold text-[10px] rounded-full">
                          Same Database Sync
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Step-by-step connection guide for Flutter, React Native, and Android to control and sync with this Admin Panel.
                      </p>
                    </div>
                  </div>
                  <button className="p-1 text-slate-450 hover:text-slate-700 transition">
                    {isGuideOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {isGuideOpen && (
                  <div className="p-4 sm:p-5 space-y-6 text-slate-700 text-xs">
                    {/* Visual Architecture Diagram */}
                    <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                        <span>How Synchronization Works</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Radio className="w-3 h-3 animate-pulse" /> Live Realtime Sync
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                        {/* Box 1: Web Admin */}
                        <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                          <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 mx-auto flex items-center justify-center font-bold">
                            <Laptop className="w-4 h-4" />
                          </div>
                          <p className="font-bold text-white text-xs">Admin Web App</p>
                          <p className="text-[10px] text-slate-400">Controls prices, validates orders, allocates providers, disables services</p>
                        </div>

                        {/* Box 2: Firestore Center */}
                        <div className="p-3 bg-indigo-950/60 rounded-xl border border-indigo-500/50 space-y-1">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600/40 text-indigo-300 mx-auto flex items-center justify-center font-bold">
                            <Database className="w-4 h-4" />
                          </div>
                          <p className="font-bold text-amber-300 text-xs">Shared Cloud Firestore</p>
                          <p className="text-[10px] text-indigo-200 font-mono">{currentProjectId}</p>
                        </div>

                        {/* Box 3: Mobile App */}
                        <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                          <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 mx-auto flex items-center justify-center font-bold">
                            <Smartphone className="w-4 h-4" />
                          </div>
                          <p className="font-bold text-white text-xs">Mobile App (Client/Partner)</p>
                          <p className="text-[10px] text-slate-400">Books services, receives status changes, submits KYC, views sliders</p>
                        </div>
                      </div>
                    </div>

                    {/* Step 1: Credentials with 1-click copy */}
                    <div className="space-y-2">
                      <h5 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                        Your Official Firebase Project Credentials
                      </h5>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        Connected to your production Firebase project <strong className="text-blue-700">{currentProjectId}</strong>. Both your mobile app and this admin panel access the same live database collections.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                          <div className="truncate pr-2">
                            <span className="text-slate-400 block text-[9px] uppercase font-sans font-bold">Project ID</span>
                            <span className="text-slate-800 font-bold">{currentProjectId}</span>
                          </div>
                          <button 
                            onClick={() => copyToClipboard(currentProjectId, 'c_proj')}
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
                          >
                            {copiedKey === 'c_proj' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                          <div className="truncate pr-2">
                            <span className="text-emerald-700 block text-[9px] uppercase font-sans font-bold">API Key</span>
                            <span className="text-emerald-900 font-bold truncate block">{currentApiKey.slice(0, 16)}...</span>
                          </div>
                          <button 
                            onClick={() => copyToClipboard(currentApiKey, 'c_api')}
                            className="p-1 hover:bg-emerald-100 rounded text-emerald-700 cursor-pointer"
                          >
                            {copiedKey === 'c_api' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Code Snippets per Framework */}
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h5 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                          Mobile App Initialization Code Snippet
                        </h5>

                        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                          {(['flutter', 'react-native', 'kotlin'] as const).map((tab) => (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => setActiveCodeTab(tab)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold capitalize transition cursor-pointer ${
                                activeCodeTab === tab 
                                  ? 'bg-white text-blue-700 shadow-2xs' 
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {tab === 'flutter' ? 'Flutter (Dart)' : tab === 'react-native' ? 'React Native / Expo' : 'Android (Kotlin)'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Code Block */}
                      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-200 p-4 font-mono text-[11px] leading-relaxed">
                        <button
                          type="button"
                          onClick={() => {
                            const snippet = activeCodeTab === 'flutter'
                              ? `// 1. Initialize Firebase with Durgapur Fix Project
await Firebase.initializeApp(
  options: const FirebaseOptions(
    apiKey: "${currentApiKey}",
    appId: "${currentAppId}",
    messagingSenderId: "${currentSenderId}",
    projectId: "${currentProjectId}",
    storageBucket: "${currentStorageBucket}",
  ),
);

// 2. Connect to Cloud Firestore:
final firestore = FirebaseFirestore.instance;

// 3. Listen to live orders placed or managed by Admin:
firestore.collection('orders').snapshots().listen((snapshot) {
  for (var doc in snapshot.docs) {
    print('Order: \${doc.id} - Status: \${doc.data()['status']}');
  }
});`
                              : activeCodeTab === 'react-native'
                              ? `import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "${currentApiKey}",
  authDomain: "${currentAuthDomain}",
  projectId: "${currentProjectId}",
  storageBucket: "${currentStorageBucket}",
  messagingSenderId: "${currentSenderId}",
  appId: "${currentAppId}"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Example: Listen to live services updated from Admin Web Panel
onSnapshot(collection(db, "services"), (snap) => {
  const services = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log('Live services:', services);
});`
                              : `import com.google.firebase.FirebaseApp
import com.google.firebase.firestore.FirebaseFirestore

// 1. Get Firebase instance
val app = FirebaseApp.getInstance()
val db = FirebaseFirestore.getInstance(app)

// 2. Realtime listener to orders
db.collection("orders").addSnapshotListener { snapshot, e ->
    if (e != null) return@addSnapshotListener
    for (doc in snapshot?.documents ?: emptyList()) {
        val status = doc.getString("status")
        val amount = doc.getDouble("amount")
    }
}`;
                            copyToClipboard(snippet, 'snippet');
                          }}
                          className="absolute top-2.5 right-2.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-sans font-bold flex items-center gap-1 cursor-pointer transition"
                        >
                          {copiedKey === 'snippet' ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'snippet' ? 'Copied Code!' : 'Copy Code'}</span>
                        </button>

                        {activeCodeTab === 'flutter' && (
                          <pre className="overflow-x-auto">
{`// 1. Initialize Firebase with Durgapur Fix Project
await Firebase.initializeApp(
  options: const FirebaseOptions(
    apiKey: "${currentApiKey}",
    appId: "${currentAppId}",
    messagingSenderId: "${currentSenderId}",
    projectId: "${currentProjectId}",
    storageBucket: "${currentStorageBucket}",
  ),
);

// 2. Connect to Cloud Firestore
final firestore = FirebaseFirestore.instance;

// 3. Listen in realtime to orders or services from Web Admin
firestore.collection('orders').snapshots().listen((snapshot) {
  for (var doc in snapshot.docs) {
    print('Order: \${doc.id} - Status: \${doc.data()['status']}');
  }
});`}
                          </pre>
                        )}

                        {activeCodeTab === 'react-native' && (
                          <pre className="overflow-x-auto">
{`import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "${currentApiKey}",
  authDomain: "${currentAuthDomain}",
  projectId: "${currentProjectId}",
  storageBucket: "${currentStorageBucket}",
  messagingSenderId: "${currentSenderId}",
  appId: "${currentAppId}"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Example: Listen to live services updated from Admin Web Panel
onSnapshot(collection(db, "services"), (snap) => {
  const services = snap.docs.map(d => ({ id: d.id, ...d.data() }));
});`}
                          </pre>
                        )}

                        {activeCodeTab === 'kotlin' && (
                          <pre className="overflow-x-auto">
{`import com.google.firebase.FirebaseApp
import com.google.firebase.firestore.FirebaseFirestore

// 1. Get default Firebase instance
val app = FirebaseApp.getInstance()
val db = FirebaseFirestore.getInstance(app)

// 2. Realtime order listening
db.collection("orders").addSnapshotListener { snapshot, e ->
    if (e != null) return@addSnapshotListener
    snapshot?.documents?.forEach { doc ->
        val status = doc.getString("status")
        val amount = doc.getDouble("amount")
    }
}`}
                          </pre>
                        )}
                      </div>
                    </div>

                    {/* Step 3: Standard Shared Collections */}
                    <div className="space-y-2">
                      <h5 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
                        Standard Shared Collections & Schema Map
                      </h5>
                      <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-2.5">Collection</th>
                              <th className="p-2.5">Mobile App Action</th>
                              <th className="p-2.5">Web Admin Control</th>
                              <th className="p-2.5">Key Fields</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-600">
                            <tr>
                              <td className="p-2.5 font-mono font-bold text-blue-700">orders</td>
                              <td className="p-2.5">Creates new order booking; listens for status updates</td>
                              <td className="p-2.5 font-semibold text-slate-800">Approves, assigns provider, cancels, updates bill</td>
                              <td className="p-2.5 font-mono text-[10px]">id, customerName, serviceName, status, amount, providerId</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 font-mono font-bold text-blue-700">services</td>
                              <td className="p-2.5">Displays bookable service catalogue & prices</td>
                              <td className="p-2.5 font-semibold text-slate-800">Adds services, edits prices, toggles active/pending</td>
                              <td className="p-2.5 font-mono text-[10px]">id, title, category, price, discount, duration</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 font-mono font-bold text-blue-700">categories</td>
                              <td className="p-2.5">Renders service categories on home grid</td>
                              <td className="p-2.5 font-semibold text-slate-800">Adds/reorders categories, activates/deactivates</td>
                              <td className="p-2.5 font-mono text-[10px]">id, name, icon, status</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 font-mono font-bold text-blue-700">providers</td>
                              <td className="p-2.5">Partner app: views assigned jobs, updates job progress</td>
                              <td className="p-2.5 font-semibold text-slate-800">Verifies KYC documents, updates wallet balance</td>
                              <td className="p-2.5 font-mono text-[10px]">id, name, phone, status, balance, rating</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 font-mono font-bold text-blue-700">sliders</td>
                              <td className="p-2.5">Hero image carousel at top of mobile home</td>
                              <td className="p-2.5 font-semibold text-slate-800">Uploads promotion banners & links</td>
                              <td className="p-2.5 font-mono text-[10px]">id, title, image, status</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 font-mono font-bold text-blue-700">settings</td>
                              <td className="p-2.5">Reads maintenance mode, currency, contact phone</td>
                              <td className="p-2.5 font-semibold text-slate-800">Controls maintenance lock, company details</td>
                              <td className="p-2.5 font-mono text-[10px]">maintenanceMode, currency, companyName</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4 pt-2">
                <ShieldAlert className="w-4.5 h-4.5 text-amber-600" />
                <span>System operational rule triggers</span>
              </h3>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/50 transition-colors">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">System Maintenance Mode</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Toggle site into offline lock, locking client service booking modules temporarily.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.configuration.maintenanceMode}
                    onChange={(e) => updateConfig('maintenanceMode', e.target.checked)}
                    className="w-4.5 h-4.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/50 transition-colors">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">Mandatory Email Audit Verification</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Force providers to pass automated email confirmation links during registry.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.configuration.emailVerification}
                    onChange={(e) => updateConfig('emailVerification', e.target.checked)}
                    className="w-4.5 h-4.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/50 transition-colors">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">Mandatory SMS Verification</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Require 6-digit OTP phone auditing when registering customer users.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.configuration.smsVerification}
                    onChange={(e) => updateConfig('smsVerification', e.target.checked)}
                    className="w-4.5 h-4.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/50 transition-colors">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">Mandatory Provider KYC Verification</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Block newly registered providers from accepting job allocations until KYC docs are audited.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.configuration.kycMandatory}
                    onChange={(e) => updateConfig('kycMandatory', e.target.checked)}
                    className="w-4.5 h-4.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* POLICY & HELP CENTER PAGES */}
          {isPolicy && (
            <div className="space-y-6" id="settings-policy-form">
              {/* Policy Sub-Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto scrollbar-none border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPolicySubTab('help')}
                  className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shrink-0 ${
                    policySubTab === 'help' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5 text-rose-500" />
                  <span>Help Center & Support</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPolicySubTab('refund')}
                  className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shrink-0 ${
                    policySubTab === 'refund' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Refund Policy</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPolicySubTab('terms')}
                  className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shrink-0 ${
                    policySubTab === 'terms' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-purple-500" />
                  <span>Terms & Conditions</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPolicySubTab('privacy')}
                  className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shrink-0 ${
                    policySubTab === 'privacy' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Privacy Policy</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPolicySubTab('about')}
                  className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shrink-0 ${
                    policySubTab === 'about' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span>About Us</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPolicySubTab('receipt')}
                  className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shrink-0 ${
                    policySubTab === 'receipt' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Invoice Terms</span>
                </button>
              </div>

              {/* 1. HELP CENTER & SUPPORT */}
              {policySubTab === 'help' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-rose-500" />
                        <span>Customer Help Center & Support Contact Details</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        These details appear directly under the Help Center button in the customer mobile app.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 text-xs font-bold mb-1.5 flex items-center gap-1.5">
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Customer Helpline Number</span>
                      </label>
                      <input
                        type="text"
                        value={localSettings.helpCenter?.supportPhone || localSettings.general.contactPhone}
                        onChange={(e) => updateHelpCenter('supportPhone', e.target.value)}
                        placeholder="+91 9434 221100"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 text-xs font-bold mb-1.5 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp Support Chat Number</span>
                      </label>
                      <input
                        type="text"
                        value={localSettings.helpCenter?.whatsappNumber || localSettings.general.contactPhone}
                        onChange={(e) => updateHelpCenter('whatsappNumber', e.target.value)}
                        placeholder="+91 9434 221100"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 text-xs font-bold mb-1.5">Support Desk Email</label>
                      <input
                        type="email"
                        value={localSettings.helpCenter?.supportEmail || localSettings.general.contactEmail}
                        onChange={(e) => updateHelpCenter('supportEmail', e.target.value)}
                        placeholder="support@durgapurfix.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 text-xs font-bold mb-1.5">Support Desk Operating Hours</label>
                      <input
                        type="text"
                        value={localSettings.helpCenter?.supportHours || '8:00 AM - 9:00 PM (Monday - Sunday)'}
                        onChange={(e) => updateHelpCenter('supportHours', e.target.value)}
                        placeholder="8:00 AM - 9:00 PM (Monday - Sunday)"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 text-xs font-bold mb-1.5">Help Desk Banner & Welcome Message</label>
                    <textarea
                      value={localSettings.helpCenter?.helpDeskMessage || 'Need quick help with your service booking, pricing, or technician arrival? Our local support team in Durgapur is here for you.'}
                      onChange={(e) => updateHelpCenter('helpDeskMessage', e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* Frequently Asked Questions (FAQs) */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-extrabold text-slate-800 block flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                          <span>Help Center FAQs ({(localSettings.helpCenter?.faqs || []).length})</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Questions displayed in customer help accordion</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddFaq(!showAddFaq)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold border border-blue-200 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add FAQ Question</span>
                      </button>
                    </div>

                    {showAddFaq && (
                      <div className="p-4 bg-blue-50/40 border border-blue-200 rounded-xl space-y-3 animate-in fade-in duration-150">
                        <span className="text-xs font-bold text-blue-900 block">Create Help Question & Answer</span>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">Question *</label>
                          <input
                            type="text"
                            value={newFaqQ}
                            onChange={(e) => setNewFaqQ(e.target.value)}
                            placeholder="e.g. How do I get an invoice for my service?"
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">Answer *</label>
                          <textarea
                            value={newFaqA}
                            onChange={(e) => setNewFaqA(e.target.value)}
                            placeholder="Detailed answer provided to customer..."
                            rows={2}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium"
                          />
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <select
                            value={newFaqCategory}
                            onChange={(e) => setNewFaqCategory(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700"
                          >
                            <option value="Bookings">Bookings & Tracking</option>
                            <option value="Warranty & Quality">Warranty & Quality</option>
                            <option value="Cancellations">Cancellations & Refunds</option>
                            <option value="Payments">Payments & Invoicing</option>
                          </select>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setShowAddFaq(false)}
                              className="px-3 py-1 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleAddFaq}
                              className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-2xs"
                            >
                              Save Question
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {(localSettings.helpCenter?.faqs || []).map((faq) => (
                        <div key={faq.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-extrabold text-slate-800">
                              Q: {faq.question}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-200 text-slate-600">
                                {faq.category || 'General'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteFaq(faq.id)}
                                className="text-slate-400 hover:text-red-600 p-1"
                                title="Delete FAQ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            A: {faq.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. REFUND POLICY */}
              {policySubTab === 'refund' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-amber-500" />
                      <span>Disputes & Customer Refund Policy</span>
                    </h4>
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs font-bold mb-1.5">
                      Refund Guidelines, Timelines & Inspection Process
                    </label>
                    <textarea
                      value={localSettings.policyPages.refundPolicy}
                      onChange={(e) => updatePolicy('refundPolicy', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition h-48 resize-none leading-relaxed"
                      placeholder="Specify your refund policy terms..."
                      required
                    />
                  </div>
                </div>
              )}

              {/* 3. TERMS & CONDITIONS */}
              {policySubTab === 'terms' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-500" />
                      <span>Platform Terms of Service & User Agreements</span>
                    </h4>
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs font-bold mb-1.5">
                      Platform Terms & Conditions
                    </label>
                    <textarea
                      value={localSettings.policyPages.termsConditions}
                      onChange={(e) => updatePolicy('termsConditions', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition h-48 resize-none leading-relaxed"
                      required
                    />
                  </div>
                </div>
              )}

              {/* 4. PRIVACY POLICY */}
              {policySubTab === 'privacy' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Customer & Partner Privacy Policy</span>
                    </h4>
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs font-bold mb-1.5">
                      Privacy & Data Protection Clauses
                    </label>
                    <textarea
                      value={localSettings.policyPages.privacyPolicy}
                      onChange={(e) => updatePolicy('privacyPolicy', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition h-48 resize-none leading-relaxed"
                      required
                    />
                  </div>
                </div>
              )}

              {/* 5. ABOUT US */}
              {policySubTab === 'about' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <span>About Durgapur Fix Aggregator Summary</span>
                    </h4>
                  </div>
                  <div>
                    <label className="block text-slate-600 text-xs font-bold mb-1.5">
                      About Us Summary
                    </label>
                    <textarea
                      value={localSettings.policyPages.aboutUs}
                      onChange={(e) => updatePolicy('aboutUs', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition h-40 resize-none leading-relaxed"
                      required
                    />
                  </div>
                </div>
              )}

              {/* 6. RECEIPT TERMS */}
              {policySubTab === 'receipt' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-indigo-500" />
                      <span>Official Tax Invoice & Receipt Terms</span>
                    </h4>
                  </div>
                  <div>
                    <label className="block text-slate-800 text-xs font-extrabold mb-1">
                      Warranty & Invoice Footnotes (Appears on Customer Bills & PDFs)
                    </label>
                    <textarea
                      value={localSettings.policyPages.receiptTerms || ''}
                      onChange={(e) => updatePolicy('receiptTerms', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition h-32 resize-none leading-relaxed"
                      placeholder="1. All home service warranties are valid for 30 days..."
                      required
                    />
                  </div>
                </div>
              )}

              {/* LIVE CUSTOMER MOBILE APP PREVIEW CARD (Matching user's uploaded screenshot) */}
              <div className="mt-6 p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                      Live Customer Mobile App Screen Preview
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                    Matches Customer Account View
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  Click any menu row below to test how customer apps render your live database content:
                </p>

                {/* Mobile Menu List Items (Matching exact screenshot items) */}
                <div className="bg-white rounded-2xl p-2 text-slate-800 divide-y divide-slate-100 shadow-inner">
                  {/* Help Center Item */}
                  <button
                    type="button"
                    onClick={() => setActivePreviewDoc('help')}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-xl transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                        <Headphones className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-extrabold text-slate-900 group-hover:text-red-600 transition">Help Center</h5>
                        <p className="text-[11px] text-slate-400 font-medium">Get help & support</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition" />
                  </button>

                  {/* Refund Policy Item */}
                  <button
                    type="button"
                    onClick={() => setActivePreviewDoc('refund')}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-xl transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-extrabold text-slate-900 group-hover:text-amber-600 transition">Refund Policy</h5>
                        <p className="text-[11px] text-slate-400 font-medium">Learn about our refund policy</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition" />
                  </button>

                  {/* Terms & Conditions Item */}
                  <button
                    type="button"
                    onClick={() => setActivePreviewDoc('terms')}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-xl transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-extrabold text-slate-900 group-hover:text-purple-600 transition">Terms & Conditions</h5>
                        <p className="text-[11px] text-slate-400 font-medium">Read our terms & conditions</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition" />
                  </button>
                </div>

                {/* Interactive Modal Drawer when clicked */}
                {activePreviewDoc && (
                  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        {activePreviewDoc === 'help' && '🎧 Customer Help Center View'}
                        {activePreviewDoc === 'refund' && '📋 Customer Refund Policy View'}
                        {activePreviewDoc === 'terms' && '📄 Customer Terms & Conditions View'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActivePreviewDoc(null)}
                        className="text-slate-400 hover:text-white text-xs font-bold"
                      >
                        Close Preview
                      </button>
                    </div>

                    {activePreviewDoc === 'help' && (
                      <div className="text-xs text-slate-300 space-y-3">
                        <p className="text-[11px] text-slate-300 italic">{localSettings.helpCenter?.helpDeskMessage}</p>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2 bg-slate-900 rounded-lg border border-slate-700">
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">Helpline</span>
                            <span className="font-extrabold text-white">{localSettings.helpCenter?.supportPhone}</span>
                          </div>
                          <div className="p-2 bg-slate-900 rounded-lg border border-slate-700">
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">WhatsApp</span>
                            <span className="font-extrabold text-emerald-400">{localSettings.helpCenter?.whatsappNumber}</span>
                          </div>
                        </div>
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] uppercase font-extrabold text-slate-400">Sample FAQ Accordion:</span>
                          {(localSettings.helpCenter?.faqs || []).slice(0, 2).map(f => (
                            <div key={f.id} className="p-2 bg-slate-900/60 rounded-lg text-[11px]">
                              <span className="font-bold text-white block">Q: {f.question}</span>
                              <span className="text-slate-400 mt-0.5 block">{f.answer}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activePreviewDoc === 'refund' && (
                      <div className="text-xs text-slate-300 whitespace-pre-line max-h-40 overflow-y-auto leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-700/60">
                        {localSettings.policyPages.refundPolicy}
                      </div>
                    )}

                    {activePreviewDoc === 'terms' && (
                      <div className="text-xs text-slate-300 whitespace-pre-line max-h-40 overflow-y-auto leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-700/60">
                        {localSettings.policyPages.termsConditions}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SEO CONFIGURATION */}
          {isSeo && (
            <div className="space-y-4" id="settings-seo-form">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Globe className="w-4.5 h-4.5 text-cyan-600" />
                <span>Search Engine optimization (SEO)</span>
              </h3>
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Meta Search Title</label>
                <input
                  type="text"
                  value={localSettings.seo.metaTitle}
                  onChange={(e) => updateSeo('metaTitle', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Meta Description Tag</label>
                <textarea
                  value={localSettings.seo.metaDescription}
                  onChange={(e) => updateSeo('metaDescription', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition h-20 resize-none leading-relaxed"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Global Search Keywords (comma separated)</label>
                <input
                  type="text"
                  value={localSettings.seo.keywords}
                  onChange={(e) => updateSeo('keywords', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  required
                />
              </div>
            </div>
          )}

          {/* Save trigger */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-800 text-[11px]">Durgapur Fix Platform Architecture</p>
                <p className="text-[10px] text-slate-500">Official System: <span className="font-extrabold text-slate-800">Durgapur Fix</span> | Contact: <span className="font-extrabold text-slate-800">durgapurfix@gmail.com</span></p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Commit & Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
