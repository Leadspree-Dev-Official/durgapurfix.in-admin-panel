import React, { useState } from 'react';
import { HomePackage, PartCatalogItem, PromotionItem } from '../types';
import { 
  Package, Wrench, Sparkles, Plus, Trash2, Edit3, CheckCircle2, 
  ExternalLink, Image, IndianRupee, Star, CloudUpload, RefreshCw
} from 'lucide-react';
import { syncDocToFirestore, removeDocFromFirestore } from '../lib/firestoreSync';

interface PackagesCatalogViewProps {
  packages: HomePackage[];
  onUpdatePackages: (packages: HomePackage[]) => void;
  partsCatalog: PartCatalogItem[];
  onUpdatePartsCatalog: (parts: PartCatalogItem[]) => void;
  promotions: PromotionItem[];
  onUpdatePromotions: (promotions: PromotionItem[]) => void;
}

export default function PackagesCatalogView({
  packages,
  onUpdatePackages,
  partsCatalog,
  onUpdatePartsCatalog,
  promotions,
  onUpdatePromotions
}: PackagesCatalogViewProps) {
  const [activeTab, setActiveTab] = useState<'packages' | 'parts' | 'promotions'>('packages');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // New Package Modal
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [packageForm, setPackageForm] = useState<Partial<HomePackage>>({
    section: 'most_booked',
    title: '',
    subtitle: '',
    price: 499,
    originalPrice: 699,
    rating: 4.8,
    reviews: 50,
    duration: '45 mins',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
    order: 1,
    active: true
  });

  // New Part Modal
  const [showPartModal, setShowPartModal] = useState(false);
  const [partForm, setPartForm] = useState<Partial<PartCatalogItem>>({
    name: '',
    price: 350,
    category: 'AC Mechanic',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80',
    active: true,
    warrantyMonths: 6
  });

  // Save new package
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = packageForm.id || `pkg_${Date.now()}`;
    const newPkg: HomePackage = {
      id,
      section: packageForm.section || 'most_booked',
      title: packageForm.title || 'Special Package',
      subtitle: packageForm.subtitle || '',
      price: Number(packageForm.price || 0),
      originalPrice: Number(packageForm.originalPrice || 0),
      rating: Number(packageForm.rating || 4.8),
      reviews: Number(packageForm.reviews || 10),
      duration: packageForm.duration || '30 mins',
      imageUrl: packageForm.imageUrl || '',
      order: Number(packageForm.order || 1),
      active: packageForm.active ?? true
    };

    const updated = packages.some(p => p.id === id)
      ? packages.map(p => p.id === id ? newPkg : p)
      : [...packages, newPkg];

    onUpdatePackages(updated);
    setShowPackageModal(false);

    // Sync to Firestore
    try {
      setSyncStatus(`Syncing package ${newPkg.title} to Firestore...`);
      await syncDocToFirestore('packages', newPkg.id, newPkg);
      setSyncStatus('Package synced successfully to Firestore!');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err: any) {
      setSyncStatus(`Sync warning: ${err?.message || 'Check Firestore rules'}`);
    }
  };

  // Delete package
  const handleDeletePackage = async (id: string) => {
    const updated = packages.filter(p => p.id !== id);
    onUpdatePackages(updated);
    try {
      await removeDocFromFirestore('packages', id);
    } catch (e) {}
  };

  // Save new part
  const handleSavePart = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = partForm.id || `part_${Date.now()}`;
    const newPart: PartCatalogItem = {
      id,
      name: partForm.name || 'Spare Part',
      price: Number(partForm.price || 0),
      category: partForm.category || 'General',
      imageUrl: partForm.imageUrl || '',
      active: partForm.active ?? true,
      warrantyMonths: Number(partForm.warrantyMonths || 6)
    };

    const updated = partsCatalog.some(p => p.id === id)
      ? partsCatalog.map(p => p.id === id ? newPart : p)
      : [...partsCatalog, newPart];

    onUpdatePartsCatalog(updated);
    setShowPartModal(false);

    try {
      setSyncStatus(`Syncing part ${newPart.name} to Firestore...`);
      await syncDocToFirestore('parts_catalog', newPart.id, newPart);
      setSyncStatus('Part synced successfully to Firestore!');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err: any) {
      setSyncStatus(`Sync warning: ${err?.message || 'Check Firestore rules'}`);
    }
  };

  // Delete part
  const handleDeletePart = async (id: string) => {
    const updated = partsCatalog.filter(p => p.id !== id);
    onUpdatePartsCatalog(updated);
    try {
      await removeDocFromFirestore('parts_catalog', id);
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-500/20 rounded-xl text-indigo-300 border border-indigo-400/30">
                <Package className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold tracking-tight">Android Deals, Packages & Parts Catalog</h2>
            </div>
            <p className="text-xs text-indigo-200/80 max-w-2xl">
              Dynamically populate the Android Home screen "Most Booked / Popular Deals" feed and replace the hardcoded "Parts & Prices" catalog via Cloud Firestore.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'packages' && (
              <button
                type="button"
                onClick={() => {
                  setPackageForm({
                    section: 'most_booked',
                    title: '',
                    subtitle: '',
                    price: 499,
                    originalPrice: 699,
                    rating: 4.8,
                    reviews: 25,
                    duration: '45 mins',
                    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
                    order: packages.length + 1,
                    active: true
                  });
                  setShowPackageModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Package</span>
              </button>
            )}

            {activeTab === 'parts' && (
              <button
                type="button"
                onClick={() => {
                  setPartForm({
                    name: '',
                    price: 250,
                    category: 'AC Mechanic',
                    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80',
                    active: true,
                    warrantyMonths: 6
                  });
                  setShowPartModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Spare Part</span>
              </button>
            )}
          </div>
        </div>

        {syncStatus && (
          <div className="mt-3 text-xs font-mono text-cyan-300 bg-cyan-950/50 p-2.5 rounded-xl border border-cyan-500/30">
            {syncStatus}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('packages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
            activeTab === 'packages'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Home Deal Packages ({packages.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('parts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
            activeTab === 'parts'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Parts & Prices Catalog ({partsCatalog.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('promotions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
            activeTab === 'promotions'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Promo Carousels ({promotions.length})</span>
        </button>
      </div>

      {/* Tab 1: Home Packages */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition group"
            >
              <div>
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  <img
                    src={pkg.imageUrl}
                    alt={pkg.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    pkg.section === 'most_booked' ? 'bg-amber-500 text-white' :
                    pkg.section === 'popular_deals' ? 'bg-rose-500 text-white' :
                    'bg-indigo-600 text-white'
                  }`}>
                    {pkg.section.replace('_', ' ')}
                  </span>
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{pkg.rating} ({pkg.reviews})</span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1">{pkg.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{pkg.subtitle}</p>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-base font-black text-slate-900">₹{pkg.price}</span>
                    {pkg.originalPrice > pkg.price && (
                      <span className="text-xs text-slate-400 line-through">₹{pkg.originalPrice}</span>
                    )}
                    <span className="text-[11px] text-emerald-600 font-bold ml-auto">{pkg.duration}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  pkg.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {pkg.active ? 'Active on App' : 'Hidden'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPackageForm(pkg);
                      setShowPackageModal(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    title="Edit Package"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Package"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Spare Parts Catalog */}
      {activeTab === 'parts' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {partsCatalog.map((part) => (
            <div
              key={part.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition group"
            >
              <div>
                <div className="relative h-36 bg-slate-100 overflow-hidden">
                  <img
                    src={part.imageUrl}
                    alt={part.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-white">
                    {part.category}
                  </span>
                </div>

                <div className="p-3.5 space-y-1">
                  <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">{part.name}</h4>
                  <p className="text-sm font-black text-emerald-600">₹{part.price}</p>
                  {part.warrantyMonths && (
                    <p className="text-[10px] text-slate-400">{part.warrantyMonths} Months Warranty</p>
                  )}
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 font-mono">ID: {part.id}</span>
                <button
                  type="button"
                  onClick={() => handleDeletePart(part.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Promotions */}
      {activeTab === 'promotions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div className="relative h-44 bg-slate-100">
                <img
                  src={promo.imageUrl}
                  alt={promo.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-black uppercase bg-rose-600 text-white shadow-md">
                  {promo.badgeText}
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900">{promo.title}</h3>
                <p className="text-xs text-slate-500">{promo.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Package Modal */}
      {showPackageModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              {packageForm.id ? 'Edit Deal Package' : 'Create New Home Deal Package'}
            </h3>

            <form onSubmit={handleSavePackage} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Package Title</label>
                <input
                  type="text"
                  required
                  value={packageForm.title || ''}
                  onChange={(e) => setPackageForm({ ...packageForm, title: e.target.value })}
                  placeholder="e.g. AC Deep Foam Jet Servicing"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Features</label>
                <input
                  type="text"
                  value={packageForm.subtitle || ''}
                  onChange={(e) => setPackageForm({ ...packageForm, subtitle: e.target.value })}
                  placeholder="e.g. Indoor & Outdoor coil clean with anti-bacterial spray"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Section in App</label>
                  <select
                    value={packageForm.section || 'most_booked'}
                    onChange={(e) => setPackageForm({ ...packageForm, section: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="most_booked">Most Booked</option>
                    <option value="popular_deals">Popular Deals</option>
                    <option value="recommended">Recommended For You</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={packageForm.duration || ''}
                    onChange={(e) => setPackageForm({ ...packageForm, duration: e.target.value })}
                    placeholder="e.g. 45 mins"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={packageForm.price || 0}
                    onChange={(e) => setPackageForm({ ...packageForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={packageForm.originalPrice || 0}
                    onChange={(e) => setPackageForm({ ...packageForm, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={packageForm.imageUrl || ''}
                  onChange={(e) => setPackageForm({ ...packageForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPackageModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
                >
                  Save & Push to App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Part Modal */}
      {showPartModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Add Spare Part</h3>
            <form onSubmit={handleSavePart} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Part Name</label>
                <input
                  type="text"
                  required
                  value={partForm.name || ''}
                  onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
                  placeholder="e.g. Copper Flare Nut 1/4 inch"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={partForm.category || ''}
                    onChange={(e) => setPartForm({ ...partForm, category: e.target.value })}
                    placeholder="AC Mechanic"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={partForm.price || 0}
                    onChange={(e) => setPartForm({ ...partForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Warranty (Months)</label>
                <input
                  type="number"
                  value={partForm.warrantyMonths || 6}
                  onChange={(e) => setPartForm({ ...partForm, warrantyMonths: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={partForm.imageUrl || ''}
                  onChange={(e) => setPartForm({ ...partForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPartModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  Save Spare Part
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
