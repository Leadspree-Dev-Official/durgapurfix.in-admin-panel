import React, { useState } from 'react';
import { Coupon, Slider, ServiceCategory } from '../types';
import { Plus, Trash2, Percent, Sliders as SlidersIcon, ToggleLeft, ToggleRight, AlertCircle, Edit2, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { compressImage } from '../lib/imageUtils';

interface ZonesCouponsSlidersProps {
  viewType: 'coupons' | 'sliders';
  coupons: Coupon[];
  sliders: Slider[];
  categories: ServiceCategory[];
  onUpdateCoupons: (coupons: Coupon[]) => void;
  onUpdateSliders: (sliders: Slider[]) => void;
}

export default function ZonesCouponsSliders({
  viewType,
  coupons,
  sliders,
  categories,
  onUpdateCoupons,
  onUpdateSliders
}: ZonesCouponsSlidersProps) {

  const [showAdd, setShowAdd] = useState(false);

  // Coupon State
  const [coupCode, setCoupCode] = useState('');
  const [coupType, setCoupType] = useState<'percentage' | 'fixed'>('fixed');
  const [coupVal, setCoupVal] = useState<number>(100);
  const [coupMin, setCoupMin] = useState<number>(500);
  const [coupMax, setCoupMax] = useState<number>(100);
  const [coupExpiry, setCoupExpiry] = useState('2026-12-31');

  // Slider State
  const [slidTitle, setSlidTitle] = useState('');
  const [slidSubtitle, setSlidSubtitle] = useState('');
  const [slidImage, setSlidImage] = useState('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80');
  const [slidImageInputMode, setSlidImageInputMode] = useState<'url' | 'file'>('url');
  const [slidLinkType, setSlidLinkType] = useState<'category' | 'service' | 'external'>('category');
  const [slidLinkVal, setSlidLinkVal] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [sliderUploadError, setSliderUploadError] = useState('');

  const handleSliderImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderUploadError('');
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 1200, 600, 0.75);
        setSlidImage(compressed);
        setSliderUploadError('');
      } catch (err) {
        setSliderUploadError('Failed to process image banner. Please try another image.');
      }
    }
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupCode || !coupVal) return;

    if (editingId) {
      onUpdateCoupons(coupons.map(c => 
        c.id === editingId 
          ? { 
              ...c, 
              code: coupCode.toUpperCase(), 
              discountType: coupType, 
              discountValue: Number(coupVal),
              minPurchase: Number(coupMin),
              maxDiscount: Number(coupMax),
              expiryDate: coupExpiry 
            } 
          : c
      ));
    } else {
      const newC: Coupon = {
        id: 'coup-' + Date.now(),
        code: coupCode.toUpperCase().trim(),
        discountType: coupType,
        discountValue: Number(coupVal),
        minPurchase: Number(coupMin),
        maxDiscount: Number(coupMax),
        expiryDate: coupExpiry,
        status: 'active'
      };
      onUpdateCoupons([...coupons, newC]);
    }
    resetForm();
  };

  const handleSaveSlider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slidTitle) return;

    if (editingId) {
      onUpdateSliders(sliders.map(s => 
        s.id === editingId 
          ? { 
              ...s, 
              title: slidTitle, 
              subtitle: slidSubtitle, 
              image: slidImage, 
              linkType: slidLinkType, 
              linkValue: slidLinkVal 
            } 
          : s
      ));
    } else {
      const newS: Slider = {
        id: 'slid-' + Date.now(),
        title: slidTitle,
        subtitle: slidSubtitle,
        image: slidImage,
        linkType: slidLinkType,
        linkValue: slidLinkVal,
        status: 'active'
      };
      onUpdateSliders([...sliders, newS]);
    }
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setShowAdd(false);
    setCoupCode('');
    setCoupVal(100);
    setCoupMin(500);
    setCoupMax(100);
    setSlidTitle('');
    setSlidSubtitle('');
    setSlidImage('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80');
    setSlidImageInputMode('url');
    setSlidLinkVal('');
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setShowAdd(true);
    if (viewType === 'coupons') {
      setCoupCode(item.code);
      setCoupType(item.discountType);
      setCoupVal(item.discountValue);
      setCoupMin(item.minPurchase);
      setCoupMax(item.maxDiscount);
      setCoupExpiry(item.expiryDate);
    } else if (viewType === 'sliders') {
      setSlidTitle(item.title);
      setSlidSubtitle(item.subtitle);
      setSlidImage(item.image);
      setSlidImageInputMode(item.image.startsWith('data:') ? 'file' : 'url');
      setSlidLinkType(item.linkType);
      setSlidLinkVal(item.linkValue);
    }
  };

  const handleDelete = (id: string) => {
    if (viewType === 'coupons') {
      onUpdateCoupons(coupons.filter(c => c.id !== id));
    } else if (viewType === 'sliders') {
      onUpdateSliders(sliders.filter(s => s.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    if (viewType === 'coupons') {
      onUpdateCoupons(coupons.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c));
    } else if (viewType === 'sliders') {
      onUpdateSliders(sliders.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
    }
  };

  const renderIcon = () => {
    switch (viewType) {
      case 'coupons': return <Percent className="w-5 h-5 text-amber-400" />;
      case 'sliders': return <SlidersIcon className="w-5 h-5 text-teal-400" />;
    }
  };

  return (
    <div className="space-y-6 select-none" id="zones-coupons-sliders-root">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">
            {viewType === 'coupons' ? 'Coupon Codes & Discounts' : 'Promo Banners & Carousel Sliders'}
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            {viewType === 'coupons' && 'Declare discount promotional codes with minimum purchase limits to drive orders.'}
            {viewType === 'sliders' && 'Add, edit, or remove mobile app hero carousel promo banners and promotional announcements.'}
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAdd(!showAdd);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto transition-colors"
          id="add-zcs-btn"
        >
          <Plus className="w-4 h-4" />
          <span>{editingId ? 'Edit Item' : (viewType === 'coupons' ? 'Add New Coupon' : 'Add New Promo Banner')}</span>
        </button>
      </div>

      {showAdd && (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-md max-w-xl" id="zcs-form">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            {renderIcon()}
            <span>{editingId ? 'Edit Existing' : 'Create New'} {viewType === 'coupons' ? 'Coupon' : 'Promo Banner'}</span>
          </h3>

          {viewType === 'coupons' && (
            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Promo Code</label>
                  <input
                    type="text"
                    value={coupCode}
                    onChange={(e) => setCoupCode(e.target.value)}
                    placeholder="e.g. DURGAPUR50"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 uppercase focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Discount Type</label>
                  <select
                    value={coupType}
                    onChange={(e) => setCoupType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  >
                    <option value="fixed">Fixed Rupees (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Discount Value</label>
                  <input
                    type="number"
                    value={coupVal}
                    onChange={(e) => setCoupVal(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Min Basket (₹)</label>
                  <input
                    type="number"
                    value={coupMin}
                    onChange={(e) => setCoupMin(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={coupMax}
                    onChange={(e) => setCoupMax(Number(e.target.value))}
                    disabled={coupType === 'fixed'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition disabled:opacity-55"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Expiry Date</label>
                <input
                  type="date"
                  value={coupExpiry}
                  onChange={(e) => setCoupExpiry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 rounded-xl text-xs cursor-pointer transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition">Save Coupon</button>
              </div>
            </form>
          )}

          {viewType === 'sliders' && (
            <form onSubmit={handleSaveSlider} className="space-y-4">
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Promo Slide Title</label>
                <input
                  type="text"
                  value={slidTitle}
                  onChange={(e) => setSlidTitle(e.target.value)}
                  placeholder="e.g. Beat the Summer Heat"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Subtitle / Description</label>
                <input
                  type="text"
                  value={slidSubtitle}
                  onChange={(e) => setSlidSubtitle(e.target.value)}
                  placeholder="e.g. Get 20% Off on AC Repairs"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-600 text-xs font-bold">Promo Banner Image Source</label>
                  <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSlidImageInputMode('url')}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition ${slidImageInputMode === 'url' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Image URL</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlidImageInputMode('file')}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition ${slidImageInputMode === 'file' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>Direct File Upload</span>
                    </button>
                  </div>
                </div>

                {slidImageInputMode === 'url' ? (
                  <input
                    type="url"
                    value={slidImage}
                    onChange={(e) => setSlidImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-mono text-[10px]"
                    required
                  />
                ) : (
                  <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/70 rounded-xl p-4 text-center cursor-pointer transition-colors relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSliderImageFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center gap-1 text-slate-500 group-hover:text-emerald-600">
                      <Upload className="w-6 h-6 stroke-1.5" />
                      <p className="text-xs font-bold text-slate-700">Click or drag & drop banner image to upload</p>
                      <p className="text-[10px] text-slate-400 font-medium">Supports PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  </div>
                )}

                {slidImage && (
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200 mt-2">
                    <img
                      src={slidImage}
                      alt="Banner Preview"
                      className="h-14 w-28 object-cover rounded-lg border border-slate-200 shrink-0 bg-white"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="text-[11px] text-slate-600 truncate flex-1">
                      <span className="font-bold text-slate-700 block">Banner Preview Selected</span>
                      <span className="text-[10px] text-slate-400 truncate block font-mono">
                        {slidImage.length > 60 ? slidImage.slice(0, 60) + '...' : slidImage}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Action Target Type</label>
                  <select
                    value={slidLinkType}
                    onChange={(e) => setSlidLinkType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  >
                    <option value="category">Redirect to Category</option>
                    <option value="service">Redirect to Service ID</option>
                    <option value="external">External Redirect URL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 text-xs font-bold mb-1.5">Target Value / ID</label>
                  {slidLinkType === 'category' ? (
                    <select
                      value={slidLinkVal}
                      onChange={(e) => setSlidLinkVal(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                      required
                    >
                      <option value="">-- Choose Category --</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={slidLinkVal}
                      onChange={(e) => setSlidLinkVal(e.target.value)}
                      placeholder={slidLinkType === 'service' ? 'srv-101' : 'https://...'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                      required
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 rounded-xl text-xs cursor-pointer transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition">Save Slide</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Lists display depending on viewType */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {viewType === 'coupons' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Coupon Code</th>
                  <th className="py-3 px-4 font-bold">Benefits</th>
                  <th className="py-3 px-4 font-bold">Min Spend</th>
                  <th className="py-3 px-4 font-bold">Expiry</th>
                  <th className="py-3 px-4 text-center font-bold">Status</th>
                  <th className="py-3 px-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-amber-700 bg-amber-50/40 border-r border-slate-100 tracking-wider text-sm select-all">{c.code}</td>
                    <td className="py-4 px-4">
                      {c.discountType === 'percentage' ? (
                        <span className="font-extrabold text-slate-800 text-sm">{c.discountValue}% Off <span className="text-slate-500 font-normal text-xs">(Up to ₹{c.maxDiscount})</span></span>
                      ) : (
                        <span className="font-extrabold text-slate-800 text-sm">Flat ₹{c.discountValue} Off</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-bold">₹{c.minPurchase}</td>
                    <td className="py-4 px-4 text-slate-500 text-[11px] font-mono font-medium">{c.expiryDate}</td>
                    <td className="py-4 px-4 text-center">
                      <button onClick={() => toggleStatus(c.id)} className="cursor-pointer transition hover:opacity-80">
                        {c.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">Active</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">Inactive</span>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right space-x-1">
                      <button onClick={() => handleEdit(c)} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 cursor-pointer transition shadow-xs" title="Edit Coupon"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 hover:text-red-700 cursor-pointer transition shadow-xs" title="Delete Coupon"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewType === 'sliders' && (
          <div className="grid grid-cols-1 md:grid-cols-2 p-6 gap-6 bg-slate-50/20" id="sliders-grid">
            {sliders.map((s) => (
              <div key={s.id} className="relative rounded-xl overflow-hidden border border-slate-200 bg-white hover:border-slate-300 transition flex flex-col justify-between shadow-xs hover:shadow-md">
                <div className="h-40 overflow-hidden relative border-b border-slate-100">
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover opacity-85 hover:scale-103 transition duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-blue-600 border border-slate-200 shadow-xs">
                    Target: {s.linkType} ({s.linkValue})
                  </div>
                  <div className="absolute top-3 right-3">
                    <button onClick={() => toggleStatus(s.id)} className="cursor-pointer transition hover:scale-105">
                      {s.status === 'active' ? (
                        <span className="bg-emerald-600/90 backdrop-blur text-white font-extrabold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">ACTIVE</span>
                      ) : (
                        <span className="bg-slate-500/90 backdrop-blur text-white font-extrabold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">INACTIVE</span>
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{s.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">{s.subtitle}</p>
                  <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-slate-100">
                    <button onClick={() => handleEdit(s)} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 cursor-pointer transition shadow-xs" title="Edit Slider"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 hover:text-red-700 cursor-pointer transition shadow-xs" title="Delete Slider"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))}
            {sliders.length === 0 && (
              <div className="col-span-2 text-center py-8 text-slate-400 font-semibold">No sliders declared in setup. Add promotional carousel banner sliders above.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
