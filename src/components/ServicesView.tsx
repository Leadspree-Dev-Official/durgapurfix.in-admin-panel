import React, { useState } from 'react';
import { ServiceItem, Review, ServiceCategory, ServiceSubCategory } from '../types';
import { CheckCircle2, XCircle, Hourglass, Plus, Trash2, Edit2, ShieldAlert, Star, ThumbsUp, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { compressImage } from '../lib/imageUtils';

interface ServicesViewProps {
  activeView: string; // 'reviews' or 'services-all' | 'services-pending' | 'services-approved' | 'services-rejected'
  services: ServiceItem[];
  reviews: Review[];
  categories: ServiceCategory[];
  subCategories: ServiceSubCategory[];
  onUpdateServices: (srvs: ServiceItem[]) => void;
  onUpdateReviews: (revs: Review[]) => void;
}

export default function ServicesView({
  activeView,
  services,
  reviews,
  categories,
  subCategories,
  onUpdateServices,
  onUpdateReviews
}: ServicesViewProps) {

  const isReviews = activeView === 'reviews';
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [srvName, setSrvName] = useState('');
  const [srvPrice, setSrvPrice] = useState<number>(399);
  const [srvDuration, setSrvDuration] = useState('1 hour');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvImg, setSrvImg] = useState('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80');
  const [imageInputMode, setImageInputMode] = useState<'url' | 'file'>('url');
  const [srvCatId, setSrvCatId] = useState('');
  const [srvSubCatId, setSrvSubCatId] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [srvUploadError, setSrvUploadError] = useState('');
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);

  const handleConfirmDeleteService = () => {
    if (!serviceToDelete) return;
    onUpdateServices(services.filter(s => s.id !== serviceToDelete.id));
    setServiceToDelete(null);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSrvUploadError('');
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 600, 0.75);
        setSrvImg(compressed);
        setSrvUploadError('');
      } catch (err) {
        setSrvUploadError('Failed to process image. Please try another file.');
      }
    }
  };

  // Filtered Services based on sub-view status
  const getFilteredServices = () => {
    switch (activeView) {
      case 'services-pending': return services.filter(s => s.status === 'pending');
      case 'services-approved': return services.filter(s => s.status === 'approved');
      case 'services-rejected': return services.filter(s => s.status === 'rejected');
      default: return services;
    }
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName || !srvCatId || !srvSubCatId) return;

    const cat = categories.find(c => c.id === srvCatId);
    const sub = subCategories.find(s => s.id === srvSubCatId);
    if (!cat || !sub) return;

    if (editingId) {
      onUpdateServices(services.map(s => 
        s.id === editingId 
          ? { 
              ...s, 
              name: srvName, 
              price: Number(srvPrice), 
              duration: srvDuration, 
              description: srvDesc, 
              image: srvImg,
              categoryId: srvCatId,
              categoryName: cat.name,
              subCategoryId: srvSubCatId,
              subCategoryName: sub.name
            } 
          : s
      ));
    } else {
      const newS: ServiceItem = {
        id: 'srv-' + Date.now(),
        categoryId: srvCatId,
        categoryName: cat.name,
        subCategoryId: srvSubCatId,
        subCategoryName: sub.name,
        name: srvName,
        price: Number(srvPrice),
        duration: srvDuration,
        description: srvDesc,
        image: srvImg,
        status: 'pending' // Initially pending approval by default
      };
      onUpdateServices([...services, newS]);
    }

    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setShowAddForm(false);
    setSrvName('');
    setSrvPrice(399);
    setSrvDuration('1 hour');
    setSrvDesc('');
    setSrvImg('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80');
    setImageInputMode('url');
    setSrvCatId('');
    setSrvSubCatId('');
  };

  const handleEdit = (srv: ServiceItem) => {
    setEditingId(srv.id);
    setShowAddForm(true);
    setSrvName(srv.name);
    setSrvPrice(srv.price);
    setSrvDuration(srv.duration);
    setSrvDesc(srv.description);
    setSrvImg(srv.image);
    setImageInputMode(srv.image.startsWith('data:') ? 'file' : 'url');
    setSrvCatId(srv.categoryId);
    setSrvSubCatId(srv.subCategoryId);
  };

  const handleDeleteService = (id: string) => {
    onUpdateServices(services.filter(s => s.id !== id));
  };

  const setStatus = (id: string, status: 'approved' | 'rejected' | 'pending') => {
    onUpdateServices(services.map(s => s.id === id ? { ...s, status } : s));
  };

  // Review Actions
  const approveReview = (id: string) => {
    onUpdateReviews(reviews.map(r => r.id === id ? { ...r, status: 'approved' } : r));
  };

  const hideReview = (id: string) => {
    onUpdateReviews(reviews.map(r => r.id === id ? { ...r, status: 'hidden' } : r));
  };

  const deleteReview = (id: string) => {
    onUpdateReviews(reviews.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6 select-none" id="services-view-root">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 capitalize">
            {isReviews ? 'Manage Customer Reviews' : `Services: ${activeView.replace('services-', '')} List`}
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            {isReviews 
              ? 'Moderate ratings, comments, and public feedback given by consumers to service partners.'
              : 'Add specialized service packages, update pricing tiers, and moderate provider submission requests.'}
          </p>
        </div>
        {!isReviews && (
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(!showAddForm);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto transition-colors"
            id="create-service-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Service Package</span>
          </button>
        )}
      </div>

      {showAddForm && !isReviews && (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-md max-w-2xl" id="service-form">
          <h3 className="text-sm font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-3">
            {editingId ? 'Edit Existing' : 'Create New'} Professional Service Package
          </h3>
          <form onSubmit={handleSaveService} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Select Category</label>
                <select
                  value={srvCatId}
                  onChange={(e) => {
                    setSrvCatId(e.target.value);
                    setSrvSubCatId('');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  required
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Select Sub-Category</label>
                <select
                  value={srvSubCatId}
                  onChange={(e) => setSrvSubCatId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 transition"
                  disabled={!srvCatId}
                  required
                >
                  <option value="">-- Choose Subcategory --</option>
                  {subCategories
                    .filter(s => s.categoryId === srvCatId)
                    .map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 text-xs font-bold mb-1.5">Service Package Title</label>
              <input
                type="text"
                value={srvName}
                onChange={(e) => setSrvName(e.target.value)}
                placeholder="e.g. Split AC Water Jet Servicing"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Standard Base Price (₹)</label>
                <input
                  type="number"
                  value={srvPrice}
                  onChange={(e) => setSrvPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Expected Duration</label>
                <input
                  type="text"
                  value={srvDuration}
                  onChange={(e) => setSrvDuration(e.target.value)}
                  placeholder="e.g. 1 hour, 45 minutes"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 text-xs font-bold mb-1.5">Detailed Service Package Description</label>
              <textarea
                value={srvDesc}
                onChange={(e) => setSrvDesc(e.target.value)}
                placeholder="Provide bullet points or step by step list of everything included..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition h-24 resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-slate-600 text-xs font-bold">Banner Image Source</label>
                <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setImageInputMode('url')}
                    className={`px-3 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition ${imageInputMode === 'url' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>Image URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode('file')}
                    className={`px-3 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition ${imageInputMode === 'file' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Upload className="w-3 h-3" />
                    <span>Direct File Upload</span>
                  </button>
                </div>
              </div>

              {imageInputMode === 'url' ? (
                <input
                  type="url"
                  value={srvImg}
                  onChange={(e) => setSrvImg(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-mono text-[10px]"
                  required
                />
              ) : (
                <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/70 rounded-xl p-4 text-center cursor-pointer transition-colors relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-1 text-slate-500 group-hover:text-emerald-600">
                    <Upload className="w-6 h-6 stroke-1.5" />
                    <p className="text-xs font-bold text-slate-700">Click or drag & drop image file to upload</p>
                    <p className="text-[10px] text-slate-400 font-medium">Supports PNG, JPG, WEBP up to 5MB</p>
                  </div>
                </div>
              )}

              {srvImg && (
                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200 mt-2">
                  <img
                    src={srvImg}
                    alt="Banner Preview"
                    className="h-14 w-24 object-cover rounded-lg border border-slate-200 shrink-0 bg-white"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="text-[11px] text-slate-600 truncate flex-1">
                    <span className="font-bold text-slate-700 block">Image Preview Selected</span>
                    <span className="text-[10px] text-slate-400 truncate block font-mono">
                      {srvImg.length > 60 ? srvImg.slice(0, 60) + '...' : srvImg}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 rounded-xl text-xs transition">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition">Save Package</button>
            </div>
          </form>
        </div>
      )}

      {/* Content Rendering Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {isReviews ? (
          /* Reviews View list */
          <div className="p-5 space-y-4" id="reviews-list-panel">
            {reviews.map((rev) => {
              const getReviewStatus = (status: string) => {
                switch (status) {
                  case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  case 'hidden': return 'bg-slate-100 text-slate-500 border-slate-200';
                  default: return 'bg-amber-50 text-amber-700 border-amber-200';
                }
              };
              return (
                <div key={rev.id} className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 flex flex-col md:flex-row justify-between gap-4 hover:border-slate-300 transition-colors">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-extrabold text-slate-800 text-xs">{rev.customerName}</span>
                      <span className="text-slate-400 text-[10px]">— rated —</span>
                      <span className="font-extrabold text-blue-600 text-xs">{rev.providerName}</span>
                      <span className="text-[10px] text-slate-600 bg-slate-100 py-0.5 px-2 rounded font-mono border border-slate-200">{rev.serviceName}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getReviewStatus(rev.status)}`}>{rev.status}</span>
                    </div>
                    {/* Stars bar */}
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'text-amber-400 fill-current' : 'text-slate-300'}`} />
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-600 italic">"{rev.comment}"</p>
                    <p className="text-[10px] text-slate-400 font-mono">Date logged: {rev.date}</p>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {rev.status !== 'approved' && (
                      <button 
                        onClick={() => approveReview(rev.id)}
                        className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-200 cursor-pointer transition shadow-xs"
                      >
                        Approve public
                      </button>
                    )}
                    {rev.status !== 'hidden' && (
                      <button 
                        onClick={() => hideReview(rev.id)}
                        className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200 cursor-pointer transition shadow-xs"
                      >
                        Hide/Unapprove
                      </button>
                    )}
                    <button 
                      onClick={() => deleteReview(rev.id)}
                      className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold rounded-lg border border-red-100 cursor-pointer transition shadow-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
            {reviews.length === 0 && (
              <p className="text-center py-6 text-slate-400 text-xs font-semibold">No customer reviews logged in database.</p>
            )}
          </div>
        ) : (
          /* Services View List */
          <div>
            {/* Mobile Services Card List (< sm) */}
            <div className="sm:hidden divide-y divide-slate-100" id="services-mobile-cards">
              {getFilteredServices().map((srv) => {
                const getSrvStatus = (status: string) => {
                  switch (status) {
                    case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
                    default: return 'bg-amber-50 text-amber-700 border-amber-200';
                  }
                };
                return (
                  <div key={srv.id} className="p-3.5 space-y-2.5 bg-white">
                    <div className="flex items-start gap-3">
                      <img src={srv.image} alt={srv.name} className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0" referrerPolicy="no-referrer" />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-extrabold text-slate-800 text-xs truncate">{srv.name}</h4>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize shrink-0 ${getSrvStatus(srv.status)}`}>
                            {srv.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-blue-600 font-bold">{srv.categoryName} • {srv.subCategoryName}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{srv.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm">₹{srv.price}</span>
                        <span className="text-[10px] text-slate-400 ml-1">({srv.duration})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {srv.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => setStatus(srv.id, 'approved')}
                              className="px-2 py-1 text-[10px] font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => setStatus(srv.id, 'rejected')}
                              className="px-2 py-1 text-[10px] font-bold rounded-lg bg-red-50 text-red-700 border border-red-200 cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => handleEdit(srv)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer"
                          title="Edit Service"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setServiceToDelete(srv)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 cursor-pointer"
                          title="Delete Service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {getFilteredServices().length === 0 && (
                <p className="text-center py-8 text-slate-400 font-medium text-xs">No service packages registered inside this filtered state.</p>
              )}
            </div>

            {/* Desktop Table (sm+) */}
            <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Service Details</th>
                  <th className="py-3 px-4 font-bold">Category / Sub-Category</th>
                  <th className="py-3 px-4 font-bold">Duration & Pricing</th>
                  <th className="py-3 px-4 text-center font-bold">Status</th>
                  <th className="py-3 px-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getFilteredServices().map((srv) => {
                  const getSrvStatus = (status: string) => {
                    switch (status) {
                      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
                      default: return 'bg-amber-50 text-amber-700 border-amber-200';
                    }
                  };
                  return (
                    <tr key={srv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img src={srv.image} alt={srv.name} className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-xs" referrerPolicy="no-referrer" />
                          <div className="space-y-0.5">
                            <h4 className="font-extrabold text-slate-800 text-sm">{srv.name}</h4>
                            <p className="text-[10px] text-slate-500 max-w-xs truncate font-medium" title={srv.description}>{srv.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 space-y-0.5">
                        <p className="font-extrabold text-blue-600 text-xs">{srv.categoryName}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{srv.subCategoryName}</p>
                      </td>
                      <td className="py-4 px-4 space-y-0.5">
                        <p className="font-extrabold text-slate-800 text-sm">₹{srv.price}</p>
                        <p className="text-[10px] text-slate-500 font-medium">Takes ~ {srv.duration}</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${getSrvStatus(srv.status)}`}>
                          {srv.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                        {srv.status === 'pending' && (
                          <>
                            <button
                              onClick={() => setStatus(srv.id, 'approved')}
                              className="p-1.5 px-3 text-[10px] font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer transition shadow-xs"
                              title="Approve Service"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setStatus(srv.id, 'rejected')}
                              className="p-1.5 px-3 text-[10px] font-bold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 cursor-pointer transition shadow-xs"
                              title="Reject Service"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEdit(srv)}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 cursor-pointer transition shadow-xs inline-flex"
                          title="Edit Service"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setServiceToDelete(srv)}
                          className="p-2 rounded-lg bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 hover:text-red-700 cursor-pointer transition shadow-xs inline-flex"
                          title="Delete Service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {getFilteredServices().length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 font-medium">No service packages registered inside this filtered state.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </div>

      {/* Delete Service Confirmation Modal */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Delete Service?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <strong className="text-slate-700">{serviceToDelete.name}</strong> (₹{serviceToDelete.price})? This will permanently remove it from the catalog and mobile app.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteService}
                className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-xs transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
