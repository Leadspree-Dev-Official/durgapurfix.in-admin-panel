import React, { useState } from 'react';
import { ServiceCategory, ServiceSubCategory } from '../types';
import { Plus, Edit2, Trash2, FolderPlus, ToggleLeft, ToggleRight, Check, AlertTriangle, Image as ImageIcon, Upload, Link as LinkIcon, Sparkles, X } from 'lucide-react';
import { compressImage } from '../lib/imageUtils';

interface CategoriesViewProps {
  viewType: 'category' | 'subcategory';
  categories: ServiceCategory[];
  subCategories: ServiceSubCategory[];
  onUpdateCategories: (cats: ServiceCategory[]) => void;
  onUpdateSubCategories: (subs: ServiceSubCategory[]) => void;
}

const PRESET_CATEGORY_IMAGES: Record<string, string> = {
  'AC Mechanic': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
  'Plumbing': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=80',
  'Beautician': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
  'Electrician': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&auto=format&fit=crop&q=80',
  'Chefs & Cooks': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&auto=format&fit=crop&q=80',
  'Home Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
  'Carpentry': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&auto=format&fit=crop&q=80',
  'Painting': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
  'Appliance Repair': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
  'Pest Control': 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=600&auto=format&fit=crop&q=80'
};

export default function CategoriesView({ 
  viewType, 
  categories, 
  subCategories, 
  onUpdateCategories, 
  onUpdateSubCategories 
}: CategoriesViewProps) {
  
  // State for forms
  const [showAddForm, setShowAddForm] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIcon, setCatIcon] = useState('Home');
  const [catImage, setCatImage] = useState('');

  const [subName, setSubName] = useState('');
  const [subDesc, setSubDesc] = useState('');
  const [subParentCatId, setSubParentCatId] = useState('');
  const [subImage, setSubImage] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imageTab, setImageTab] = useState<'upload' | 'url' | 'presets'>('upload');

  // Direct quick image editor modal
  const [quickImageItem, setQuickImageItem] = useState<{ id: string; name: string; currentImage?: string; type: 'category' | 'subcategory' } | null>(null);
  const [quickImageUrl, setQuickImageUrl] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'category' | 'subcategory' | 'quick') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploadLoading(true);
    try {
      const compressed = await compressImage(file, 600, 600, 0.82);
      if (target === 'category') {
        setCatImage(compressed);
      } else if (target === 'subcategory') {
        setSubImage(compressed);
      } else if (target === 'quick') {
        setQuickImageUrl(compressed);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setImageUploadLoading(false);
    }
  };

  // Add category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;

    const finalImage = catImage || PRESET_CATEGORY_IMAGES[catName] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80';

    if (editingId) {
      const updated = categories.map(c => 
        c.id === editingId ? { 
          ...c, 
          name: catName, 
          description: catDesc, 
          icon: catIcon,
          image: finalImage
        } : c
      );
      onUpdateCategories(updated);
      setEditingId(null);
    } else {
      const newCat: ServiceCategory = {
        id: 'cat-' + Date.now(),
        name: catName,
        description: catDesc,
        icon: catIcon,
        image: finalImage,
        status: 'active',
        servicesCount: 0
      };
      onUpdateCategories([...categories, newCat]);
    }

    // Reset
    setCatName('');
    setCatDesc('');
    setCatIcon('Home');
    setCatImage('');
    setShowAddForm(false);
  };

  // Add subcategory
  const handleAddSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName || !subParentCatId) return;

    const parentCat = categories.find(c => c.id === subParentCatId);
    if (!parentCat) return;

    const finalImage = subImage || parentCat.image || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=500&auto=format&fit=crop&q=80';

    if (editingId) {
      const updated = subCategories.map(s => 
        s.id === editingId 
          ? { 
              ...s, 
              name: subName, 
              description: subDesc, 
              categoryId: subParentCatId,
              categoryName: parentCat.name,
              image: finalImage
            } 
          : s
      );
      onUpdateSubCategories(updated);
      setEditingId(null);
    } else {
      const newSub: ServiceSubCategory = {
        id: 'sub-' + Date.now(),
        categoryId: subParentCatId,
        categoryName: parentCat.name,
        name: subName,
        description: subDesc,
        image: finalImage,
        status: 'active'
      };
      onUpdateSubCategories([...subCategories, newSub]);
    }

    // Reset
    setSubName('');
    setSubDesc('');
    setSubParentCatId('');
    setSubImage('');
    setShowAddForm(false);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setShowAddForm(true);
    if (viewType === 'category') {
      setCatName(item.name);
      setCatDesc(item.description);
      setCatIcon(item.icon || 'Home');
      setCatImage(item.image || '');
    } else {
      setSubName(item.name);
      setSubDesc(item.description);
      setSubParentCatId(item.categoryId);
      setSubImage(item.image || '');
    }
  };

  const handleSaveQuickImage = () => {
    if (!quickImageItem || !quickImageUrl) return;

    if (quickImageItem.type === 'category') {
      const updated = categories.map(c => 
        c.id === quickImageItem.id ? { ...c, image: quickImageUrl } : c
      );
      onUpdateCategories(updated);
    } else {
      const updated = subCategories.map(s => 
        s.id === quickImageItem.id ? { ...s, image: quickImageUrl } : s
      );
      onUpdateSubCategories(updated);
    }
    setQuickImageItem(null);
    setQuickImageUrl('');
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category? Nested sub-categories will also be removed.')) {
      onUpdateCategories(categories.filter(c => c.id !== id));
      onUpdateSubCategories(subCategories.filter(s => s.categoryId !== id));
    }
  };

  const handleDeleteSubCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this sub-category?')) {
      onUpdateSubCategories(subCategories.filter(s => s.id !== id));
    }
  };

  const toggleCategoryStatus = (id: string) => {
    onUpdateCategories(categories.map(c => 
      c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
    ));
  };

  const toggleSubCategoryStatus = (id: string) => {
    onUpdateSubCategories(subCategories.map(s => 
      s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
    ));
  };

  return (
    <div className="space-y-6 select-none" id="categories-view-root">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 capitalize flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-emerald-600" />
            <span>{viewType === 'category' ? 'Service Categories & Visual Media' : 'Service Sub-Categories & Images'}</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            {viewType === 'category' 
              ? 'Manage primary home service verticals, high-res category display cards, and mobile app visuals.' 
              : 'Add specialized service listings and thumbnail images nested inside your primary categories.'}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setCatName('');
            setCatDesc('');
            setCatImage('');
            setSubName('');
            setSubDesc('');
            setSubImage('');
            setShowAddForm(!showAddForm);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-md cursor-pointer transition"
          id="toggle-category-form-btn"
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>{viewType === 'category' ? 'Add New Category' : 'Add New Sub-Category'}</span>
            </>
          )}
        </button>
      </div>

      {/* Add / Edit Form Modal / Card */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-emerald-600" />
              <span>
                {editingId 
                  ? (viewType === 'category' ? 'Edit Category & Image' : 'Edit Sub-Category & Image') 
                  : (viewType === 'category' ? 'Create New Category' : 'Create New Sub-Category')}
              </span>
            </h3>
            <button 
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={viewType === 'category' ? handleAddCategory : handleAddSubCategory} className="space-y-5">
            {viewType === 'category' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-700 text-xs font-bold mb-1.5">Category Name *</label>
                    <input
                      type="text"
                      value={catName}
                      onChange={(e) => {
                        setCatName(e.target.value);
                        if (!catImage && PRESET_CATEGORY_IMAGES[e.target.value]) {
                          setCatImage(PRESET_CATEGORY_IMAGES[e.target.value]);
                        }
                      }}
                      placeholder="e.g. AC Mechanic, Painting, Carpentry"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs font-bold mb-1.5">Description</label>
                    <textarea
                      value={catDesc}
                      onChange={(e) => setCatDesc(e.target.value)}
                      placeholder="Short description of services offered under this category..."
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                {/* Category Image Upload & Preview */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-700 text-xs font-bold flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Category Display Image / Photo</span>
                    </label>
                    <div className="flex gap-1 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setImageTab('upload')}
                        className={`px-2 py-0.5 rounded-md ${imageTab === 'upload' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageTab('url')}
                        className={`px-2 py-0.5 rounded-md ${imageTab === 'url' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageTab('presets')}
                        className={`px-2 py-0.5 rounded-md ${imageTab === 'presets' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Presets
                      </button>
                    </div>
                  </div>

                  {imageTab === 'upload' && (
                    <div className="flex items-center gap-3">
                      <label className="flex-1 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition text-center">
                        <Upload className="w-5 h-5 text-emerald-600 mb-1" />
                        <span className="text-[11px] font-bold text-slate-700">Choose Image from Device</span>
                        <span className="text-[9px] text-slate-400">Auto-compressed & optimized for mobile</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'category')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  {imageTab === 'url' && (
                    <div>
                      <input
                        type="url"
                        value={catImage}
                        onChange={(e) => setCatImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  )}

                  {imageTab === 'presets' && (
                    <div className="grid grid-cols-5 gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {Object.entries(PRESET_CATEGORY_IMAGES).map(([name, url]) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            setCatImage(url);
                            if (!catName) setCatName(name);
                          }}
                          className={`relative rounded-lg overflow-hidden border-2 transition aspect-square group ${catImage === url ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-transparent hover:opacity-80'}`}
                          title={name}
                        >
                          <img src={url} alt={name} className="w-full h-full object-cover" />
                          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-bold px-1 py-0.5 truncate text-center">
                            {name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Image Preview Box */}
                  {catImage && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white h-28 flex items-center justify-center group">
                      <img src={catImage} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCatImage('')}
                          className="bg-red-600 text-white p-1.5 rounded-lg text-xs font-bold"
                          title="Remove Image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-700 text-xs font-bold mb-1.5">Parent Category *</label>
                    <select
                      value={subParentCatId}
                      onChange={(e) => setSubParentCatId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                      required
                    >
                      <option value="">-- Select Parent Category --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs font-bold mb-1.5">Sub-Category Name *</label>
                    <input
                      type="text"
                      value={subName}
                      onChange={(e) => setSubName(e.target.value)}
                      placeholder="e.g. Split AC Servicing, Water Pipe Repair"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-xs font-bold mb-1.5">Description</label>
                    <textarea
                      value={subDesc}
                      onChange={(e) => setSubDesc(e.target.value)}
                      placeholder="Details of what this specific sub-service includes..."
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                {/* Sub-Category Image */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-700 text-xs font-bold flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sub-Category Thumbnail Image</span>
                    </label>
                  </div>

                  <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition text-center">
                    <Upload className="w-5 h-5 text-emerald-600 mb-1" />
                    <span className="text-[11px] font-bold text-slate-700">Upload Sub-Category Image</span>
                    <span className="text-[9px] text-slate-400">PNG, JPG, WebP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'subcategory')}
                      className="hidden"
                    />
                  </label>

                  <div>
                    <label className="block text-slate-500 text-[10px] font-bold mb-1">Or paste image URL:</label>
                    <input
                      type="url"
                      value={subImage}
                      onChange={(e) => setSubImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {subImage && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white h-24 flex items-center justify-center">
                      <img src={subImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={imageUploadLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-md cursor-pointer transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{editingId ? 'Save Changes' : 'Publish to Catalog'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Direct Quick Image Modal */}
      {quickImageItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Update Image for {quickImageItem.name}</h3>
                <p className="text-[11px] text-slate-500">Changes will reflect instantly on web & mobile apps</p>
              </div>
              <button onClick={() => setQuickImageItem(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="border-2 border-dashed border-emerald-300 hover:bg-emerald-50/30 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition text-center">
                <Upload className="w-6 h-6 text-emerald-600 mb-1" />
                <span className="text-xs font-bold text-slate-700">Choose Image from Computer/Phone</span>
                <span className="text-[10px] text-slate-400">Automatic WebP compression</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'quick')}
                  className="hidden"
                />
              </label>

              <div>
                <label className="block text-slate-600 text-[11px] font-bold mb-1">Or paste image URL:</label>
                <input
                  type="url"
                  value={quickImageUrl}
                  onChange={(e) => setQuickImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {quickImageUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 h-36 bg-slate-100 flex items-center justify-center">
                  <img src={quickImageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickImageItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuickImage}
                disabled={!quickImageUrl}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-md cursor-pointer transition"
              >
                Save Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category List / Sub-Category List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              {viewType === 'category' ? `All Categories (${categories.length})` : `All Sub-Categories (${subCategories.length})`}
            </span>
          </div>
        </div>

        {viewType === 'category' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Banner / Image</th>
                  <th className="py-3 px-4 font-bold">Category Name</th>
                  <th className="py-3 px-4 font-bold">Description</th>
                  <th className="py-3 px-4 text-center font-bold">Status</th>
                  <th className="py-3 px-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="relative group w-16 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setQuickImageItem({ id: cat.id, name: cat.name, currentImage: cat.image, type: 'category' });
                            setQuickImageUrl(cat.image || '');
                          }}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[9px] font-bold text-white cursor-pointer"
                          title="Change Image"
                        >
                          <Edit2 className="w-3 h-3 mb-0.5" />
                          <span>Change</span>
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-800 text-sm">
                      <div className="flex items-center gap-2">
                        <span>{cat.name}</span>
                        <span className="text-slate-400 font-normal text-xs">({cat.servicesCount || 0} services)</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500 max-w-sm truncate font-medium" title={cat.description}>{cat.description}</td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => toggleCategoryStatus(cat.id)}
                        className="cursor-pointer transition hover:opacity-80"
                      >
                        {cat.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
                            Inactive
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setQuickImageItem({ id: cat.id, name: cat.name, currentImage: cat.image, type: 'category' });
                          setQuickImageUrl(cat.image || '');
                        }}
                        className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 cursor-pointer transition shadow-2xs"
                        title="Upload / Change Category Image"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 cursor-pointer transition shadow-2xs"
                        title="Edit Category Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 rounded-lg bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 hover:text-red-700 cursor-pointer transition shadow-2xs"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 font-medium">No categories declared in configuration.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Thumbnail</th>
                  <th className="py-3 px-4 font-bold">Parent Category</th>
                  <th className="py-3 px-4 font-bold">Sub-Category Name</th>
                  <th className="py-3 px-4 font-bold">Description</th>
                  <th className="py-3 px-4 text-center font-bold">Status</th>
                  <th className="py-3 px-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subCategories.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="relative group w-14 h-11 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
                        {sub.image ? (
                          <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setQuickImageItem({ id: sub.id, name: sub.name, currentImage: sub.image, type: 'subcategory' });
                            setQuickImageUrl(sub.image || '');
                          }}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[8px] font-bold text-white cursor-pointer"
                          title="Change Thumbnail"
                        >
                          <Edit2 className="w-2.5 h-2.5 mb-0.5" />
                          <span>Change</span>
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-extrabold text-blue-600">{sub.categoryName}</td>
                    <td className="py-4 px-4 font-extrabold text-slate-800 text-sm">{sub.name}</td>
                    <td className="py-4 px-4 text-slate-500 max-w-sm truncate font-medium" title={sub.description}>{sub.description}</td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => toggleSubCategoryStatus(sub.id)}
                        className="cursor-pointer transition hover:opacity-80"
                      >
                        {sub.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
                            Inactive
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setQuickImageItem({ id: sub.id, name: sub.name, currentImage: sub.image, type: 'subcategory' });
                          setQuickImageUrl(sub.image || '');
                        }}
                        className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 cursor-pointer transition shadow-2xs"
                        title="Upload / Change Thumbnail"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEdit(sub)}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 cursor-pointer transition shadow-2xs"
                        title="Edit Subcategory Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubCategory(sub.id)}
                        className="p-2 rounded-lg bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 hover:text-red-700 cursor-pointer transition shadow-2xs"
                        title="Delete Subcategory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {subCategories.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">No nested sub-categories declared. Please select add to create one.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
