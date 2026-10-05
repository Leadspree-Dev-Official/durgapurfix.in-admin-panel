import React, { useState } from 'react';
import { ServiceCategory, ServiceSubCategory } from '../types';
import { Plus, Edit2, Trash2, FolderPlus, ToggleLeft, ToggleRight, Check, AlertTriangle } from 'lucide-react';

interface CategoriesViewProps {
  viewType: 'category' | 'subcategory';
  categories: ServiceCategory[];
  subCategories: ServiceSubCategory[];
  onUpdateCategories: (cats: ServiceCategory[]) => void;
  onUpdateSubCategories: (subs: ServiceSubCategory[]) => void;
}

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

  const [subName, setSubName] = useState('');
  const [subDesc, setSubDesc] = useState('');
  const [subParentCatId, setSubParentCatId] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);

  // Add category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;

    if (editingId) {
      // Edit
      const updated = categories.map(c => 
        c.id === editingId ? { ...c, name: catName, description: catDesc, icon: catIcon } : c
      );
      onUpdateCategories(updated);
      setEditingId(null);
    } else {
      // New
      const newCat: ServiceCategory = {
        id: 'cat-' + Date.now(),
        name: catName,
        description: catDesc,
        icon: catIcon,
        status: 'active',
        servicesCount: 0
      };
      onUpdateCategories([...categories, newCat]);
    }

    // Reset
    setCatName('');
    setCatDesc('');
    setCatIcon('Home');
    setShowAddForm(false);
  };

  // Add subcategory
  const handleAddSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName || !subParentCatId) return;

    const parentCat = categories.find(c => c.id === subParentCatId);
    if (!parentCat) return;

    if (editingId) {
      // Edit
      const updated = subCategories.map(s => 
        s.id === editingId 
          ? { 
              ...s, 
              name: subName, 
              description: subDesc, 
              categoryId: subParentCatId,
              categoryName: parentCat.name
            } 
          : s
      );
      onUpdateSubCategories(updated);
      setEditingId(null);
    } else {
      // New
      const newSub: ServiceSubCategory = {
        id: 'sub-' + Date.now(),
        categoryId: subParentCatId,
        categoryName: parentCat.name,
        name: subName,
        description: subDesc,
        status: 'active'
      };
      onUpdateSubCategories([...subCategories, newSub]);
    }

    // Reset
    setSubName('');
    setSubDesc('');
    setSubParentCatId('');
    setShowAddForm(false);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setShowAddForm(true);
    if (viewType === 'category') {
      setCatName(item.name);
      setCatDesc(item.description);
      setCatIcon(item.icon);
    } else {
      setSubName(item.name);
      setSubDesc(item.description);
      setSubParentCatId(item.categoryId);
    }
  };

  const handleDeleteCategory = (id: string) => {
    onUpdateCategories(categories.filter(c => c.id !== id));
    onUpdateSubCategories(subCategories.filter(s => s.categoryId !== id));
  };

  const handleDeleteSubCategory = (id: string) => {
    onUpdateSubCategories(subCategories.filter(s => s.id !== id));
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
          <h2 className="text-2xl font-extrabold text-slate-800 capitalize">
            {viewType === 'category' ? 'Service Categories' : 'Service Sub-Categories'}
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            {viewType === 'category' 
              ? 'Organize primary home service verticals such as Plumbing, Cleaning, and AC Service.' 
              : 'Add specialized service listings nested inside your primary categories.'}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setCatName('');
            setCatDesc('');
            setSubName('');
            setSubDesc('');
            setShowAddForm(!showAddForm);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto transition-colors"
          id="add-category-btn"
        >
          <Plus className="w-4 h-4" />
          <span>{editingId ? 'Edit Item' : `Add New ${viewType === 'category' ? 'Category' : 'Sub-Category'}`}</span>
        </button>
      </div>

      {/* Add / Edit Form */}
      {showAddForm && (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-md max-w-xl" id="category-form">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <FolderPlus className="w-5 h-5 text-emerald-600" />
            <span>{editingId ? 'Edit Existing' : 'Create New'} {viewType === 'category' ? 'Category' : 'Sub-Category'}</span>
          </h3>

          {viewType === 'category' ? (
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Category Name</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Beautician, Electrician"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Description</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Provide brief details about the types of services..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition h-20 resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Icon Visual Alias (Lucide Icon name)</label>
                <select
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                >
                  <option value="AirConditioner">AirConditioner</option>
                  <option value="Droplet">Droplet</option>
                  <option value="Sparkles">Sparkles</option>
                  <option value="Zap">Zap</option>
                  <option value="Utensils">Utensils</option>
                  <option value="Trash2">Trash2</option>
                  <option value="Home">Home</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-200 cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Save Category
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAddSubCategory} className="space-y-4">
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Select Parent Category</label>
                <select
                  value={subParentCatId}
                  onChange={(e) => setSubParentCatId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  required
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Sub-Category Name</label>
                <input
                  type="text"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Split AC Jet Wash, Deep Clean 2BHK"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs font-bold mb-1.5">Description</label>
                <textarea
                  value={subDesc}
                  onChange={(e) => setSubDesc(e.target.value)}
                  placeholder="Provide subcategory details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition h-20 resize-none"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-200 cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Save Sub-Category
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tables representation of categories/subcategories */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {viewType === 'category' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Icon</th>
                  <th className="py-3 px-4 font-bold">Category Name</th>
                  <th className="py-3 px-4 font-bold">Description</th>
                  <th className="py-3 px-4 text-center font-bold">Status</th>
                  <th className="py-3 px-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4">
                      <span className="text-xl bg-slate-50 p-2.5 rounded-xl border border-slate-200 inline-block font-extrabold shadow-xs">
                        {cat.name === 'AC Mechanic' ? '❄️' : cat.name === 'Plumbing' ? '💧' : cat.name === 'Beautician' ? '💅' : cat.name === 'Electrician' ? '⚡' : cat.name === 'Chefs & Cooks' ? '👨‍🍳' : cat.name === 'Home Cleaning' ? '🧹' : '🛠️'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-800 text-sm">{cat.name}</td>
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
                    <td className="py-4 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 cursor-pointer transition shadow-xs"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 rounded-lg bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 hover:text-red-700 cursor-pointer transition shadow-xs"
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
                    <td className="py-4 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleEdit(sub)}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 cursor-pointer transition shadow-xs"
                        title="Edit Subcategory"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubCategory(sub.id)}
                        className="p-2 rounded-lg bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 hover:text-red-700 cursor-pointer transition shadow-xs"
                        title="Delete Subcategory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {subCategories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 font-medium">No nested sub-categories declared. Please select add to create one.</td>
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
