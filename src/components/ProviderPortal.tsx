import React, { useState, useEffect } from 'react';
import { ServiceProvider, Order, OrderExpense, SystemSettings } from '../types';
import { calculateOrderFinalBill } from '../utils/billing';
import { 
  Briefcase, Star, Wallet, FileText, CheckCircle2, XCircle, Hourglass, 
  UserCheck, Plus, Trash2, ArrowUpRight, DollarSign, Clock, Settings, UploadCloud,
  ShieldCheck, ShieldAlert, FileCheck, Camera, Sparkles, Receipt
} from 'lucide-react';
import { getDefaultAvatar } from '../data/avengers';
import { compressImage } from '../lib/imageUtils';

interface ProviderPortalProps {
  activeView?: string;
  provider: ServiceProvider;
  orders: Order[];
  settings?: SystemSettings;
  onUpdateProvider: (prov: ServiceProvider) => void;
  onUpdateOrders: (orders: Order[]) => void;
  onChangePhoto?: () => void;
  onViewBill?: (order: Order) => void;
}

export default function ProviderPortal({
  activeView,
  provider,
  orders,
  settings,
  onUpdateProvider,
  onUpdateOrders,
  onChangePhoto,
  onViewBill
}: ProviderPortalProps) {

  // Selected active tab: 'jobs' | 'kyc'
  const [portalTab, setPortalTab] = useState<'jobs' | 'kyc'>(
    activeView === 'partner-kyc' ? 'kyc' : 'jobs'
  );

  useEffect(() => {
    if (activeView === 'partner-kyc') {
      setPortalTab('kyc');
    } else if (activeView === 'partner-jobs') {
      setPortalTab('jobs');
    }
  }, [activeView]);

  // Selected active order
  const [activeJob, setActiveJob] = useState<Order | null>(null);

  // KYC Submission Form States
  // Mandatory Documents (Aadhaar Card, PAN Card, Police Certificate)
  const [aadhaarNum, setAadhaarNum] = useState<string>(provider.kycDocs?.aadhaarNumber || provider.kycDocNumber || '');
  const [aadhaarFront, setAadhaarFront] = useState<string>(provider.kycDocs?.aadhaarFront || provider.kycDocImageFront || '');
  const [aadhaarBack, setAadhaarBack] = useState<string>(provider.kycDocs?.aadhaarBack || provider.kycDocImageBack || '');

  const [panNum, setPanNum] = useState<string>(provider.kycDocs?.panNumber || '');
  const [panImage, setPanImage] = useState<string>(provider.kycDocs?.panImage || '');

  const [policeCertNum, setPoliceCertNum] = useState<string>(provider.kycDocs?.policeCertNumber || '');
  const [policeCertImage, setPoliceCertImage] = useState<string>(provider.kycDocs?.policeCertImage || '');

  // Optional Secondary Document (Voter ID or Driving License)
  const [optionalDocType, setOptionalDocType] = useState<string>(provider.kycDocs?.optionalDocType || 'Voter Identity Card');
  const [optionalDocNum, setOptionalDocNum] = useState<string>(provider.kycDocs?.optionalDocNumber || '');
  const [optionalDocImage, setOptionalDocImage] = useState<string>(provider.kycDocs?.optionalDocImage || '');

  const [jobPhoto, setJobPhoto] = useState<string>('');
  const [kycError, setKycError] = useState<string>('');
  const [kycSuccess, setKycSuccess] = useState(false);

  // File upload handler for KYC document photos
  const handleGenericFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 900, 900, 0.75);
      setter(compressed);
      setKycError('');
    } catch (err) {
      setKycError('Failed to process image. Please try another photo.');
    }
  };

  // Job site photo upload
  const handleJobPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 800, 800, 0.75);
      setJobPhoto(compressed);
    } catch (err) {
      console.warn('Job photo compression failed:', err);
    }
  };

  // Completed job billing items
  const [billingCost, setBillingCost] = useState<number>(provider.category === 'AC Mechanic' ? 499 : 249);
  const [itemsList, setItemsList] = useState<OrderExpense[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemCost, setItemCost] = useState<number>(0);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Pending'>('Cash');

  const isApproved = provider.status === 'active';

  // Filter jobs assigned to this provider
  const myJobs = orders.filter(o => o.providerId === provider.id);

  // Submit KYC application
  const handleSubmitKYC = (e: React.FormEvent) => {
    e.preventDefault();
    setKycError('');

    // MANDATORY DOCUMENT VALIDATION (Aadhaar Card, PAN Card, Police Certificate)
    if (!aadhaarNum.trim()) {
      setKycError('Aadhaar Card number is required to complete KYC.');
      return;
    }
    if (!panNum.trim()) {
      setKycError('PAN Card number is required to complete KYC.');
      return;
    }
    if (!policeCertNum.trim()) {
      setKycError('Police Verification Certificate reference number is required to complete KYC.');
      return;
    }

    const updatedKycDocs = {
      aadhaarNumber: aadhaarNum.trim(),
      aadhaarFront,
      aadhaarBack,
      panNumber: panNum.trim(),
      panImage,
      policeCertNumber: policeCertNum.trim(),
      policeCertImage,
      optionalDocType: optionalDocNum.trim() ? optionalDocType : undefined,
      optionalDocNumber: optionalDocNum.trim() || undefined,
      optionalDocImage: optionalDocImage || undefined
    };

    onUpdateProvider({
      ...provider,
      status: 'kyc_pending',
      kycDocType: 'Aadhaar + PAN + Police Cert',
      kycDocNumber: `UID: ${aadhaarNum.trim()}`,
      kycDocImageFront: aadhaarFront || panImage || policeCertImage,
      kycDocImageBack: aadhaarBack,
      kycDocs: updatedKycDocs
    });

    setKycSuccess(true);
    setTimeout(() => setKycSuccess(false), 5000);
  };

  // Job Actions
  const handleAcceptJob = (jobId: string) => {
    const updated = orders.map(o => {
      if (o.id === jobId) {
        return { ...o, status: 'ongoing' as const };
      }
      return o;
    });
    onUpdateOrders(updated);
    // Sync active view
    setActiveJob(updated.find(o => o.id === jobId) || null);
  };

  const handleRejectJob = (jobId: string) => {
    const updated = orders.map(o => {
      if (o.id === jobId) {
        return { 
          ...o, 
          status: 'pending' as const, // Put back to allocation pool
          providerId: undefined,
          providerName: undefined
        };
      }
      return o;
    });
    onUpdateOrders(updated);
    setActiveJob(null);
  };

  // Billing Expenses Builder
  const handleAddItem = () => {
    if (!itemName || itemCost <= 0) return;
    setItemsList([...itemsList, { item: itemName, cost: Number(itemCost) }]);
    setItemName('');
    setItemCost(0);
  };

  const handleRemoveItem = (idx: number) => {
    setItemsList(itemsList.filter((_, i) => i !== idx));
  };

  // Complete Job & Update final amount
  const handleCompleteJob = (jobId: string) => {
    const totalExpenses = itemsList.reduce((sum, item) => sum + item.cost, 0);
    const finalBillingSum = Number(billingCost);
    const isPaidNow = selectedPaymentMode !== 'Pending';
    const nowStr = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const updatedOrders = orders.map(o => {
      if (o.id === jobId) {
        return {
          ...o,
          status: 'completed' as const,
          amount: finalBillingSum,
          expenses: itemsList,
          paymentStatus: isPaidNow ? ('successful' as const) : ('pending' as const),
          paymentMode: isPaidNow ? selectedPaymentMode : undefined,
          paymentConfirmedByPartner: isPaidNow,
          paymentConfirmedAt: isPaidNow ? nowStr : undefined,
          providerFeedback: isPaidNow
            ? `Job completed by partner. Payment confirmed received via ${selectedPaymentMode}.`
            : 'Job completed by partner. Payment pending from customer.'
        };
      }
      return o;
    });

    onUpdateOrders(updatedOrders);

    // Update provider wallet balance & jobs count
    // Deducting 15% platform commission as set in settings
    const commissionDeduction = finalBillingSum * 0.15;
    const providerEarning = finalBillingSum - commissionDeduction;

    onUpdateProvider({
      ...provider,
      balance: provider.balance + providerEarning,
      jobsCompleted: provider.jobsCompleted + 1
    });

    // Reset list & modal
    setItemsList([]);
    setActiveJob(null);
  };

  // Confirm receipt of payment from customer explicitly
  const handleConfirmPayment = (orderId: string, mode: 'Cash' | 'UPI' | 'Bank Transfer') => {
    const nowStr = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        const bill = calculateOrderFinalBill(o, settings);
        return {
          ...o,
          paymentStatus: 'successful' as const,
          paymentMode: mode,
          paymentConfirmedByPartner: true,
          paymentConfirmedAt: nowStr,
          providerFeedback: `Payment of ₹${bill.finalTotal} confirmed received via ${mode} by partner on ${nowStr}.`
        };
      }
      return o;
    });

    onUpdateOrders(updatedOrders);
    if (activeJob && activeJob.id === orderId) {
      const updatedJob = updatedOrders.find(o => o.id === orderId) || null;
      setActiveJob(updatedJob);
    }
  };

  return (
    <div className="space-y-6 select-none" id="provider-portal-root">
      
      {/* HEADER BAR & PARTNER NAVIGATION */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 min-w-0">
          <div className="relative group shrink-0">
            <img
              src={provider.avatar || getDefaultAvatar(provider.gender, provider.name)}
              alt={provider.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/30 border border-slate-200 shadow-md bg-slate-100"
            />
            {onChangePhoto && (
              <button
                onClick={onChangePhoto}
                title="Change Profile Photo"
                className="absolute -bottom-1 -right-1 p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-md ring-2 ring-white transition cursor-pointer"
                id="partner-change-photo-btn"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-800 leading-tight">Partner Portal: {provider.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 ${
                isApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {isApproved ? 'Verified Partner' : 'Verification Pending'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-slate-500 text-xs font-medium whitespace-nowrap">{provider.category} Specialty Partner</p>
              {onChangePhoto && (
                <button
                  onClick={onChangePhoto}
                  className="text-[11px] text-red-600 hover:text-red-700 font-bold inline-flex items-center gap-1 cursor-pointer bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200/80 transition whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>Change Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>



        {isApproved && (
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto">
            <div className="space-y-0.5 text-right border-r border-slate-200 pr-3">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Ratings</p>
              <p className="text-xs font-extrabold text-amber-600 flex items-center justify-end gap-1">
                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                <span>{provider.rating} / 5</span>
              </p>
            </div>
            <div className="space-y-0.5 text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Wallet Balance</p>
              <p className="text-xs font-extrabold text-emerald-700 font-mono">₹{provider.balance.toFixed(0)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Segmented Tab Switcher (App-like Feel) */}
      <div className="flex items-center p-1 bg-slate-200/70 rounded-xl gap-1 max-w-sm" id="provider-portal-tabs">
        <button
          type="button"
          onClick={() => setPortalTab('jobs')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            portalTab === 'jobs' 
              ? 'bg-white text-slate-900 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4 text-blue-600" />
          <span>Jobs Feed</span>
          {isApproved && myJobs.length > 0 && (
            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full text-[10px] font-extrabold">
              {myJobs.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setPortalTab('kyc')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            portalTab === 'kyc' 
              ? 'bg-white text-slate-900 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>KYC Credentials</span>
          {!isApproved && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* DEDICATED PARTNER KYC VERIFICATION TAB */}
      {portalTab === 'kyc' && (
        <div className="space-y-6" id="partner-kyc-tab-view">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <span>Partner KYC & Identity Verification</span>
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Compliance and identity credentials verification portal for Durgapur Fix service partners.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isApproved ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Verified Partner Credential
                  </span>
                ) : provider.status === 'kyc_pending' ? (
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                    <Hourglass className="w-4 h-4 animate-spin text-amber-600" />
                    Document Review Pending
                  </span>
                ) : (
                  <span className="bg-cyan-50 text-cyan-700 border border-cyan-200 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                    <ShieldAlert className="w-4 h-4 text-cyan-600" />
                    KYC Unverified
                  </span>
                )}
              </div>
            </div>

            {/* Success Alert Banner */}
            {kycSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>KYC identity documents submitted successfully! Your credentials are now queued for operations audit.</span>
              </div>
            )}

            {/* Mandatory vs Optional Policy Banner */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs">
              <div className="space-y-1">
                <p className="font-extrabold text-slate-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Mandatory vs Optional KYC Requirements Policy
                </p>
                <p className="text-slate-600 font-medium leading-relaxed">
                  To complete verification, you <strong>MUST</strong> submit <strong>Aadhaar Card</strong>, <strong>PAN Card</strong>, and <strong>Police Verification Certificate</strong>. Submitting a <strong>Voter ID Card</strong> or <strong>Driving License</strong> is optional.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-200 font-bold rounded-lg text-[10px] uppercase">
                  3 Mandatory Items
                </span>
                <span className="px-3 py-1 bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] uppercase">
                  1 Optional Item
                </span>
              </div>
            </div>

            {/* Error Alert Banner */}
            {kycError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-xl flex items-center gap-2.5 animate-in fade-in">
                <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{kycError}</span>
              </div>
            )}

            {/* Success Alert Banner */}
            {kycSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>KYC identity documents submitted successfully! Your credentials are now queued for operations audit.</span>
              </div>
            )}

            {/* Main Grid: Left Status Checklist / Right Upload Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT: Credentials & Compliance Checklist */}
              <div className="space-y-4 lg:col-span-1">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Compliance Checklist</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    {/* Partner Summary */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Partner:</span>
                        <span className="font-bold text-slate-800">{provider.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Trade:</span>
                        <span className="font-bold text-slate-800">{provider.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Status:</span>
                        <span className="font-bold uppercase text-emerald-700 font-mono text-[10px]">{provider.status}</span>
                      </div>
                    </div>

                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider pt-2">Mandatory Documents Checklist</p>

                    {/* Aadhaar Item */}
                    <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                      aadhaarNum.trim() ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-red-50/50 border-red-200 text-red-900'
                    }`}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>1. Aadhaar Card</span>
                          <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded font-extrabold uppercase">Required</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">{aadhaarNum.trim() || 'Not Provided'}</p>
                      </div>
                      {aadhaarNum.trim() ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                    </div>

                    {/* PAN Item */}
                    <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                      panNum.trim() ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-red-50/50 border-red-200 text-red-900'
                    }`}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>2. PAN Card</span>
                          <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded font-extrabold uppercase">Required</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">{panNum.trim() || 'Not Provided'}</p>
                      </div>
                      {panNum.trim() ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                    </div>

                    {/* Police Cert Item */}
                    <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                      policeCertNum.trim() ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-red-50/50 border-red-200 text-red-900'
                    }`}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>3. Police Verification Cert</span>
                          <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.2 rounded font-extrabold uppercase">Required</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">{policeCertNum.trim() || 'Not Provided'}</p>
                      </div>
                      {policeCertNum.trim() ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                    </div>

                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider pt-2">Optional Secondary Document</p>

                    {/* Optional Item */}
                    <div className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                      optionalDocNum.trim() ? 'bg-blue-50/60 border-blue-200 text-blue-900' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>4. {optionalDocType}</span>
                          <span className="text-[9px] bg-slate-300 text-slate-700 px-1.5 py-0.2 rounded font-extrabold uppercase">Optional</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">{optionalDocNum.trim() || 'Not Added (Optional)'}</p>
                      </div>
                      {optionalDocNum.trim() ? <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" /> : <span className="text-[10px] text-slate-400 font-bold">Optional</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Detailed KYC Document Upload Form */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 space-y-6">
                <form onSubmit={handleSubmitKYC} className="space-y-6">
                  
                  {/* SECTION 1: AADHAAR CARD (MANDATORY) */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-red-600" />
                        <span>1. Aadhaar Card (Mandatory)</span>
                      </h4>
                      <span className="px-2 py-0.5 bg-red-600 text-white font-extrabold rounded text-[9px] uppercase tracking-wider">
                        Mandatory
                      </span>
                    </div>

                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1">12-Digit Aadhaar Number *</label>
                      <input
                        type="text"
                        value={aadhaarNum}
                        onChange={(e) => setAadhaarNum(e.target.value)}
                        placeholder="e.g. 4832 9904 1234"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Aadhaar Front */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-600 flex justify-between">
                          <span>Aadhaar Front Photo</span>
                          {aadhaarFront && <span className="text-emerald-600 font-extrabold text-[10px]">✓ Selected</span>}
                        </span>
                        {aadhaarFront ? (
                          <div className="relative rounded-xl border border-emerald-200 bg-emerald-50/50 p-2 flex items-center gap-2">
                            <img src={aadhaarFront} alt="Aadhaar Front" className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-bold text-slate-800 truncate">Aadhaar Front Scan</p>
                              <p className="text-[9px] text-emerald-700 font-medium">Uploaded</p>
                            </div>
                            <button type="button" onClick={() => setAadhaarFront('')} className="p-1 text-slate-400 hover:text-red-600">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 rounded-xl p-3 flex flex-col items-center justify-center gap-1 text-center cursor-pointer transition group">
                            <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                            <span className="text-[11px] font-bold text-slate-700">Upload Front Image</span>
                            <input type="file" accept="image/*" onChange={(e) => handleGenericFileUpload(e, setAadhaarFront)} className="hidden" />
                          </label>
                        )}
                      </div>

                      {/* Aadhaar Back */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-600 flex justify-between">
                          <span>Aadhaar Back Photo</span>
                          {aadhaarBack && <span className="text-emerald-600 font-extrabold text-[10px]">✓ Selected</span>}
                        </span>
                        {aadhaarBack ? (
                          <div className="relative rounded-xl border border-emerald-200 bg-emerald-50/50 p-2 flex items-center gap-2">
                            <img src={aadhaarBack} alt="Aadhaar Back" className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-bold text-slate-800 truncate">Aadhaar Back Scan</p>
                              <p className="text-[9px] text-emerald-700 font-medium">Uploaded</p>
                            </div>
                            <button type="button" onClick={() => setAadhaarBack('')} className="p-1 text-slate-400 hover:text-red-600">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 rounded-xl p-3 flex flex-col items-center justify-center gap-1 text-center cursor-pointer transition group">
                            <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                            <span className="text-[11px] font-bold text-slate-700">Upload Back Image</span>
                            <input type="file" accept="image/*" onChange={(e) => handleGenericFileUpload(e, setAadhaarBack)} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: PAN CARD (MANDATORY) */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-red-600" />
                        <span>2. PAN Card (Mandatory)</span>
                      </h4>
                      <span className="px-2 py-0.5 bg-red-600 text-white font-extrabold rounded text-[9px] uppercase tracking-wider">
                        Mandatory
                      </span>
                    </div>

                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1">10-Character PAN Number *</label>
                      <input
                        type="text"
                        value={panNum}
                        onChange={(e) => setPanNum(e.target.value.toUpperCase())}
                        placeholder="e.g. ABCDE1234F"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-600 flex justify-between">
                        <span>PAN Card Copy / Photo</span>
                        {panImage && <span className="text-emerald-600 font-extrabold text-[10px]">✓ Selected</span>}
                      </span>
                      {panImage ? (
                        <div className="relative rounded-xl border border-emerald-200 bg-emerald-50/50 p-2 flex items-center gap-2">
                          <img src={panImage} alt="PAN Scan" className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold text-slate-800 truncate">PAN Card Photo</p>
                            <p className="text-[9px] text-emerald-700 font-medium">Uploaded</p>
                          </div>
                          <button type="button" onClick={() => setPanImage('')} className="p-1 text-slate-400 hover:text-red-600">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 rounded-xl p-3 flex flex-col items-center justify-center gap-1 text-center cursor-pointer transition group">
                          <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                          <span className="text-[11px] font-bold text-slate-700">Upload PAN Card Image</span>
                          <input type="file" accept="image/*" onChange={(e) => handleGenericFileUpload(e, setPanImage)} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* SECTION 3: POLICE VERIFICATION CERTIFICATE (MANDATORY) */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-red-600" />
                        <span>3. Police Verification Certificate (Mandatory)</span>
                      </h4>
                      <span className="px-2 py-0.5 bg-red-600 text-white font-extrabold rounded text-[9px] uppercase tracking-wider">
                        Mandatory
                      </span>
                    </div>

                    <div>
                      <label className="block text-slate-700 text-xs font-bold mb-1">Police Clearance Certificate No. / Issue Ref *</label>
                      <input
                        type="text"
                        value={policeCertNum}
                        onChange={(e) => setPoliceCertNum(e.target.value)}
                        placeholder="e.g. POL/DGP/2026/8841"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-600 flex justify-between">
                        <span>Police Clearance Document Copy</span>
                        {policeCertImage && <span className="text-emerald-600 font-extrabold text-[10px]">✓ Selected</span>}
                      </span>
                      {policeCertImage ? (
                        <div className="relative rounded-xl border border-emerald-200 bg-emerald-50/50 p-2 flex items-center gap-2">
                          <img src={policeCertImage} alt="Police Cert Scan" className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold text-slate-800 truncate">Police Certificate Photo</p>
                            <p className="text-[9px] text-emerald-700 font-medium">Uploaded</p>
                          </div>
                          <button type="button" onClick={() => setPoliceCertImage('')} className="p-1 text-slate-400 hover:text-red-600">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 rounded-xl p-3 flex flex-col items-center justify-center gap-1 text-center cursor-pointer transition group">
                          <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                          <span className="text-[11px] font-bold text-slate-700">Upload Police Certificate Document Image</span>
                          <input type="file" accept="image/*" onChange={(e) => handleGenericFileUpload(e, setPoliceCertImage)} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* SECTION 4: OPTIONAL SECONDARY DOCUMENT (NOT MANDATORY) */}
                  <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>4. Additional Document (Voter ID or Driving License)</span>
                      </h4>
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-extrabold rounded text-[9px] uppercase tracking-wider">
                        Optional / Not Mandatory
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 text-xs font-bold mb-1">Select Document Type</label>
                        <select
                          value={optionalDocType}
                          onChange={(e) => setOptionalDocType(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none"
                        >
                          <option value="Voter Identity Card">Voter Identity Card (EPIC)</option>
                          <option value="Driving License">Driving License (DL)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 text-xs font-bold mb-1">Document Number (Optional)</label>
                        <input
                          type="text"
                          value={optionalDocNum}
                          onChange={(e) => setOptionalDocNum(e.target.value)}
                          placeholder="e.g. WB/18/042/109823"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-600 flex justify-between">
                        <span>{optionalDocType} Photo (Optional)</span>
                        {optionalDocImage && <span className="text-blue-600 font-extrabold text-[10px]">✓ Selected</span>}
                      </span>
                      {optionalDocImage ? (
                        <div className="relative rounded-xl border border-blue-200 bg-blue-50/50 p-2 flex items-center gap-2">
                          <img src={optionalDocImage} alt="Optional Doc Scan" className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold text-slate-800 truncate">{optionalDocType} Photo</p>
                            <p className="text-[9px] text-blue-700 font-medium">Uploaded</p>
                          </div>
                          <button type="button" onClick={() => setOptionalDocImage('')} className="p-1 text-slate-400 hover:text-red-600">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/30 rounded-xl p-3 flex flex-col items-center justify-center gap-1 text-center cursor-pointer transition group">
                          <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                          <span className="text-[11px] font-bold text-slate-700">Upload {optionalDocType} Photo (Optional)</span>
                          <input type="file" accept="image/*" onChange={(e) => handleGenericFileUpload(e, setOptionalDocImage)} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <UploadCloud className="w-4.5 h-4.5" />
                    <span>{isApproved ? 'Update & Re-Submit Compliance Documents' : 'Submit Mandatory Documents for Administrative Audit'}</span>
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* JOBS TAB CONTENT */}
      {portalTab === 'jobs' && (
        !isApproved ? (
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-xl space-y-6" id="application-wait-screen">
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Partner Application review stage</span>
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed font-semibold">
                Before you can receive live home service orders and start earning, Durgapur Fix requires verifying your identity credentials to maintain safety and compliance.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <p className="font-extrabold text-slate-700">Status Check:</p>
              {provider.status === 'kyc_pending' ? (
                <div className="space-y-1 text-amber-700 font-bold">
                  <p className="font-extrabold uppercase flex items-center gap-1">
                    <Hourglass className="w-4 h-4 animate-spin text-amber-600" />
                    Awaiting Administrative Review
                  </p>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed">Your submitted documents (Aadhaar, PAN & Police Certificate) are currently being reviewed by the operations team.</p>
                </div>
              ) : provider.status === 'banned' ? (
                <div className="text-red-700 space-y-1 font-bold">
                  <p className="font-extrabold uppercase flex items-center gap-1">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Access Revoked / Banned
                  </p>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed">Your platform credentials have been restricted due to failure to meet quality safety standards.</p>
                </div>
              ) : (
                <div className="text-blue-700 space-y-1 font-bold">
                  <p className="font-extrabold uppercase flex items-center gap-1">
                    <UploadCloud className="w-4 h-4 text-blue-600" />
                    Documentation Verification Pending
                  </p>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed">Please navigate to the <strong>KYC Verification tab</strong> above or use the form below to upload Aadhaar or PAN details.</p>
                </div>
              )}
            </div>

            {/* Quick instructions cheat sheet */}
            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl">
              <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-1.5">💡 Operations Tip:</p>
              <p className="text-[11px] text-amber-900 leading-relaxed font-semibold">
                You can log out, sign in with the <strong>Admin demo account</strong>, navigate to "Manage Provider" in the sidebar, locate your partner name, and click <strong>"Verify & Approve"</strong>. Once approved, log back in here to see the active job assignment dashboard!
              </p>
            </div>
          </div>
        ) : (
          /* APPROVED PORTAL ACTIVE DASHBOARD */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* LEFT: Jobs allocated list */}
          <div className="xl:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Your Job Allocations ({myJobs.length})</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="provider-jobs-grid">
              {myJobs.map((job) => {
                const isPendingAccept = job.status === 'confirmed'; // Confirmed by staff, waiting for provider acceptance
                return (
                  <div 
                    key={job.id}
                    onClick={() => setActiveJob(job)}
                    className={`p-4 rounded-xl border bg-white hover:border-slate-300 transition cursor-pointer flex flex-col justify-between space-y-3.5 shadow-xs ${
                      activeJob?.id === job.id ? 'border-emerald-500 bg-emerald-50/10 shadow-md' : 'border-slate-200'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-emerald-700">{job.id}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{job.status}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 truncate">{job.serviceName}</h4>
                      <p className="text-[10px] text-blue-600 font-bold">{job.zone} District</p>
                      <p className="text-[11px] text-slate-500 font-semibold">Time Slot: {job.date} | {job.timeSlot}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold">Est Base: ₹{job.amount}</span>
                        <span className="font-extrabold text-emerald-800 text-xs font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80 w-fit">
                          Final Bill: ₹{calculateOrderFinalBill(job, settings).finalTotal}
                        </span>
                      </div>
                      
                      {isPendingAccept ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptJob(job.id);
                            }}
                            className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer shadow-xs transition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRejectJob(job.id);
                            }}
                            className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold rounded-lg border border-red-200 cursor-pointer transition shadow-xs"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewBill && onViewBill(job);
                            }}
                            className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-lg cursor-pointer transition shadow-2xs flex items-center gap-1"
                            title="View Itemised Bill"
                            id={`provider-view-bill-${job.id}`}
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Bill</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveJob(job);
                            }}
                            className="py-1.5 px-3 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-700 text-[10px] font-bold rounded-lg cursor-pointer transition shadow-xs"
                          >
                            View Controls
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {myJobs.length === 0 && (
                <div className="col-span-2 text-center py-10 bg-slate-50 rounded-xl border border-slate-200 text-slate-400 font-semibold text-xs">
                  No active home service orders assigned to your account. Payout allocations are dispatched by executive staff.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Active selected job controls */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-fit space-y-4" id="provider-job-controls">
            {activeJob ? (
              <>
                <div className="space-y-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-emerald-700">{activeJob.id} Details</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-extrabold uppercase">{activeJob.status}</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">{activeJob.serviceName}</h3>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-750">
                    <p className="font-bold">Client Address details:</p>
                    <p className="text-slate-500 font-medium">{activeJob.address}</p>
                    <p className="text-slate-500 font-medium">Client contact: <span className="font-bold text-slate-800">{activeJob.customerName}</span> ({activeJob.customerPhone})</p>
                  </div>

                  {/* Final Bill Highlight Card */}
                  {(() => {
                    const bill = calculateOrderFinalBill(activeJob, settings);
                    return (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200/90 rounded-xl space-y-1.5 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-700 text-[11px]">
                          <span>Base Service Charge:</span>
                          <span>₹{bill.basePrice}</span>
                        </div>
                        {bill.totalExpensesCost > 0 && (
                          <div className="flex items-center justify-between text-slate-600 text-[11px] font-medium">
                            <span>Spare Parts / Expenses:</span>
                            <span>+ ₹{bill.totalExpensesCost}</span>
                          </div>
                        )}
                        {bill.platformFee > 0 && (
                          <div className="flex items-center justify-between text-slate-600 text-[11px] font-medium">
                            <span>Platform Convenience Fee:</span>
                            <span>+ ₹{bill.platformFee}</span>
                          </div>
                        )}
                        {bill.gstTax > 0 && (
                          <div className="flex items-center justify-between text-slate-600 text-[11px] font-medium">
                            <span>Statutory GST ({bill.gstRate}%):</span>
                            <span>+ ₹{bill.gstTax}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between font-extrabold text-emerald-900 pt-1.5 border-t border-emerald-200/80 text-xs font-mono">
                          <span className="uppercase tracking-wider">Final Bill Total:</span>
                          <span className="text-sm bg-white px-2 py-0.5 rounded border border-emerald-300 shadow-2xs">₹{bill.finalTotal}</span>
                        </div>
                      </div>
                    );
                  })()}

                  <button
                    onClick={() => onViewBill && onViewBill(activeJob)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    id="provider-active-job-view-bill-btn"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Full Itemised Bill & Invoice</span>
                  </button>
                </div>

                {activeJob.status === 'ongoing' && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                      <span>Active Ongoing Commission</span>
                    </p>

                    {/* Billing Updates Area */}
                    <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Update Billing details</p>
                      
                      <div className="space-y-1.5">
                        <label className="block text-slate-600 text-[10px] font-bold">Total Service Charge Received (₹)</label>
                        <input
                          type="number"
                          value={billingCost}
                          onChange={(e) => setBillingCost(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                        />
                      </div>

                      {/* Expense Itemizer */}
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <label className="block text-slate-500 text-[10px] uppercase font-bold">Add Itemized Expenses (Parts, Materials)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            placeholder="e.g. Teflon Tape, Filter nozzle"
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-800"
                          />
                          <input
                            type="number"
                            value={itemCost}
                            onChange={(e) => setItemCost(Number(e.target.value))}
                            placeholder="Cost"
                            className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-800 text-center font-mono font-semibold"
                          />
                          <button
                            type="button"
                            onClick={handleAddItem}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-emerald-700 rounded-lg text-xs font-bold cursor-pointer inline-flex transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* List of expenses itemized */}
                        {itemsList.length > 0 && (
                          <div className="space-y-1 pt-1 max-h-24 overflow-y-auto">
                            {itemsList.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[11px] bg-white border border-slate-100 px-2 py-1 rounded">
                                <span className="text-slate-700 font-bold truncate max-w-[130px]">{item.item}</span>
                                <span className="text-slate-500 font-mono font-semibold">₹{item.cost}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-red-600 hover:text-red-700 ml-1.5 cursor-pointer transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Payment Collection Mode Selection */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-200">
                        <label className="block text-slate-700 text-[10px] uppercase font-bold">
                          Select Payment Mode Received from Client
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedPaymentMode('Cash')}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border flex items-center justify-center gap-1 cursor-pointer transition ${
                              selectedPaymentMode === 'Cash'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Cash</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedPaymentMode('UPI')}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border flex items-center justify-center gap-1 cursor-pointer transition ${
                              selectedPaymentMode === 'UPI'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>UPI / QR</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedPaymentMode('Bank Transfer')}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border flex items-center justify-center gap-1 cursor-pointer transition ${
                              selectedPaymentMode === 'Bank Transfer'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            <span>Bank / Card</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedPaymentMode('Pending')}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border flex items-center justify-center gap-1 cursor-pointer transition ${
                              selectedPaymentMode === 'Pending'
                                ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <Hourglass className="w-3.5 h-3.5" />
                            <span>Pending</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleCompleteJob(activeJob.id)}
                        className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs hover:shadow-md transition flex items-center justify-center gap-1.5"
                        id="provider-complete-job-btn"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Complete Job</span>
                      </button>
                      <button
                        onClick={() => {
                          const updated = orders.map(o => o.id === activeJob.id ? { ...o, status: 'canceled' as const } : o);
                          onUpdateOrders(updated);
                          setActiveJob(null);
                        }}
                        className="py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl cursor-pointer transition shadow-xs flex items-center justify-center gap-1.5"
                        id="provider-cancel-job-btn"
                      >
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span>Cancel Job</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* PARTNER PAYMENT RECEIPT CONFIRMATION SECTION */}
                {(() => {
                  const bill = calculateOrderFinalBill(activeJob, settings);
                  const isConfirmed = activeJob.paymentStatus === 'successful' || activeJob.paymentConfirmedByPartner;

                  if (isConfirmed) {
                    return (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200/90 rounded-2xl space-y-2 text-xs shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-emerald-800 uppercase text-[10px] tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            Payment Confirmed Received
                          </span>
                          <span className="px-2.5 py-1 bg-emerald-600 text-white font-extrabold rounded-lg text-[10px] font-mono uppercase shadow-2xs">
                            {activeJob.paymentMode || 'Cash'}
                          </span>
                        </div>
                        <p className="text-slate-700 text-[11px] font-medium leading-relaxed">
                          Partner confirmed receipt of <strong className="text-emerald-900 font-mono">₹{bill.finalTotal}</strong> via <strong className="text-emerald-900">{activeJob.paymentMode || 'Cash'}</strong>.
                        </p>
                        {activeJob.paymentConfirmedAt && (
                          <p className="text-[10px] text-slate-500 font-medium">
                            Confirmed at: {activeJob.paymentConfirmedAt}
                          </p>
                        )}
                        <div className="pt-2 border-t border-emerald-200/80 flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500 font-bold">Change Mode:</span>
                          <button
                            onClick={() => handleConfirmPayment(activeJob.id, 'Cash')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${activeJob.paymentMode === 'Cash' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
                          >
                            Cash
                          </button>
                          <button
                            onClick={() => handleConfirmPayment(activeJob.id, 'UPI')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${activeJob.paymentMode === 'UPI' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
                          >
                            UPI
                          </button>
                          <button
                            onClick={() => handleConfirmPayment(activeJob.id, 'Bank Transfer')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${activeJob.paymentMode === 'Bank Transfer' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
                          >
                            Bank
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-2xl space-y-2.5 text-xs shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-amber-900 uppercase text-[10px] tracking-wider flex items-center gap-1">
                          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                          Confirm Payment Receipt
                        </span>
                        <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 font-bold rounded text-[10px] uppercase">
                          Payment Pending
                        </span>
                      </div>
                      <p className="text-amber-900 text-[11px] font-medium leading-relaxed">
                        Partner must verify if customer paid <strong>₹{bill.finalTotal}</strong>. Select the payment mode received below:
                      </p>

                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        <button
                          onClick={() => handleConfirmPayment(activeJob.id, 'Cash')}
                          className="py-2 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] cursor-pointer transition flex items-center justify-center gap-1 shadow-2xs"
                        >
                          💵 Cash
                        </button>
                        <button
                          onClick={() => handleConfirmPayment(activeJob.id, 'UPI')}
                          className="py-2 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] cursor-pointer transition flex items-center justify-center gap-1 shadow-2xs"
                        >
                          📱 UPI / QR
                        </button>
                        <button
                          onClick={() => handleConfirmPayment(activeJob.id, 'Bank Transfer')}
                          className="py-2 px-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-[11px] cursor-pointer transition flex items-center justify-center gap-1 shadow-2xs"
                        >
                          🏦 Bank / Card
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {activeJob.status === 'completed' && (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 text-emerald-700 text-xs rounded-xl space-y-1 shadow-xs">
                    <p className="font-bold uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                      Job Execution Completed
                    </p>
                    <p className="text-slate-500 text-[11px] font-medium leading-relaxed">Payout ledger updated. Platform commission has been credited to aggregations account.</p>
                  </div>
                )}

                {activeJob.status === 'canceled' && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl space-y-1 shadow-xs">
                    <p className="font-bold uppercase flex items-center gap-1">
                      <XCircle className="w-4.5 h-4.5 text-red-500" />
                      Service Order Canceled
                    </p>
                    <p className="text-slate-500 text-[11px] font-medium leading-relaxed">No funds settled. Customer re-allocation has been initialized.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-slate-400 space-y-2 font-semibold">
                <Briefcase className="w-9 h-9 mx-auto text-slate-350" />
                <p className="text-xs">Select any job assignment from your queue list to view customer contact info, coordinate billing, or file completed report cards.</p>
              </div>
            )}
          </div>

        </div>
      ))}
    </div>
  );
}
