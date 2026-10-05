import React, { useState } from 'react';
import { AVENGERS_CHARACTERS, DEFAULT_MALE_AVATAR, DEFAULT_FEMALE_AVATAR, DEFAULT_MAN_AVATAR, getDefaultAvatar } from '../data/avengers';
import { X, Upload, Link as LinkIcon, Sparkles, Check, User, Shield, AlertCircle } from 'lucide-react';
import { compressImage } from '../lib/imageUtils';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhoto?: string;
  userName?: string;
  userRole?: string;
  onSavePhoto: (newPhotoUrl: string) => void;
}

export default function ProfilePhotoModal({
  isOpen,
  onClose,
  currentPhoto,
  userName = 'User Profile',
  userRole = 'Account',
  onSavePhoto
}: ProfilePhotoModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string>(
    currentPhoto || getDefaultAvatar(undefined, userName)
  );
  const [activeTab, setActiveTab] = useState<'upload' | 'avengers' | 'url'>('upload');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [previewError, setPreviewError] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');

  if (!isOpen) return null;

  // Check if current photo matches any Avengers character
  const matchedAvenger = AVENGERS_CHARACTERS.find(
    hero => hero.avatar === selectedPhoto
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 400, 400, 0.8);
        setSelectedPhoto(compressed);
        setPreviewError(false);
        setUploadError('');
      } catch (err) {
        setUploadError('Failed to process image. Please choose another photo.');
      }
    }
  };

  const handleUrlApply = () => {
    if (customUrl.trim()) {
      setSelectedPhoto(customUrl.trim());
      setPreviewError(false);
    }
  };

  const handleSave = () => {
    onSavePhoto(selectedPhoto);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200" id="profile-photo-modal-backdrop">
      <div 
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        id="profile-photo-modal-content"
      >
        {/* MODAL HEADER */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-red-600/20 text-red-400 rounded-2xl border border-red-500/30 shrink-0">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-white flex flex-wrap items-center gap-2">
                <span className="whitespace-nowrap">Change Profile Photo</span>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-600 text-white font-black whitespace-nowrap">
                  Avengers Edition
                </span>
              </h3>
              <p className="text-slate-300 text-xs mt-0.5 font-medium truncate">
                Update avatar for <strong className="text-white">{userName}</strong> ({userRole})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0 ml-2"
            id="close-profile-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ACTIVE PREVIEW BAR */}
        <div className="px-4 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative group shrink-0">
              <img
                src={selectedPhoto}
                alt={userName}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-4 ring-white shadow-md border border-slate-200 bg-slate-200"
                onError={() => setPreviewError(true)}
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 text-white rounded-full ring-2 ring-white">
                <Check className="w-3 h-3" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-xs font-extrabold text-slate-800 whitespace-nowrap">Current Avatar</p>
                {matchedAvenger && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${matchedAvenger.badgeBg}`}>
                    ⚡ {matchedAvenger.name} ({matchedAvenger.alias})
                  </span>
                )}
                {selectedPhoto === DEFAULT_MALE_AVATAR && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Male Default Avatar
                  </span>
                )}
                {selectedPhoto === DEFAULT_FEMALE_AVATAR && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-800">
                    Female Default Avatar
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {selectedPhoto === DEFAULT_MALE_AVATAR
                  ? 'Official Male Vector Avatar'
                  : selectedPhoto === DEFAULT_FEMALE_AVATAR
                    ? 'Official Female Vector Avatar'
                    : matchedAvenger 
                      ? matchedAvenger.teamRole 
                      : 'Custom Profile Image Selected'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedPhoto(DEFAULT_MALE_AVATAR)}
              className={`px-3 py-1.5 border font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                selectedPhoto === DEFAULT_MALE_AVATAR 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
              title="Select Default Male Avatar"
            >
              <img src={DEFAULT_MALE_AVATAR} alt="Male" className="w-5 h-5 rounded-full border border-white" />
              <span>Male Avatar</span>
            </button>
            <button
              onClick={() => setSelectedPhoto(DEFAULT_FEMALE_AVATAR)}
              className={`px-3 py-1.5 border font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                selectedPhoto === DEFAULT_FEMALE_AVATAR 
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs' 
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
              title="Select Default Female Avatar"
            >
              <img src={DEFAULT_FEMALE_AVATAR} alt="Female" className="w-5 h-5 rounded-full border border-white" />
              <span>Female Avatar</span>
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition flex items-center gap-1.5"
              id="save-profile-photo-top-btn"
            >
              <Check className="w-4 h-4" />
              <span>Apply</span>
            </button>
          </div>
        </div>

        {/* MODAL NAVIGATION TABS */}
        <div className="px-6 pt-4 bg-white border-b border-slate-100 flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('avengers')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'avengers'
                ? 'border-red-600 text-red-600 bg-red-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
            id="tab-avengers-btn"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Avengers Characters</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 font-extrabold">
              {AVENGERS_CHARACTERS.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'upload'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
            id="tab-upload-btn"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Upload File</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'url'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
            id="tab-url-btn"
          >
            <LinkIcon className="w-4 h-4 text-indigo-600" />
            <span>Image URL</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: AVENGERS CHARACTERS */}
          {activeTab === 'avengers' && (
            <div>
              <div className="mb-4 bg-gradient-to-r from-red-50 to-amber-50 p-3.5 rounded-2xl border border-red-100 text-slate-700 text-xs flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-slate-800">Select an Avengers Superhero Character</p>
                  <p className="text-[11px] text-slate-500 font-medium">Choose from Earth's Mightiest Heroes as your official avatar badge.</p>
                </div>
                <div className="hidden md:block px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-xs">
                  MARVEL UNIVERSE
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5" id="avengers-grid">
                {AVENGERS_CHARACTERS.map((hero) => {
                  const isSelected = selectedPhoto === hero.avatar;
                  return (
                    <div
                      key={hero.id}
                      onClick={() => {
                        setSelectedPhoto(hero.avatar);
                        setPreviewError(false);
                      }}
                      className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center ${
                        isSelected
                          ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-102 ring-2 ring-red-500'
                          : 'bg-white border-slate-200 hover:border-red-300 hover:bg-slate-50 text-slate-800 shadow-xs'
                      }`}
                      id={`avenger-card-${hero.id}`}
                    >
                      <div className="relative mb-2">
                        <img
                          src={hero.avatar}
                          alt={hero.name}
                          className={`w-16 h-16 rounded-xl object-cover transition-transform group-hover:scale-105 ${
                            isSelected ? 'ring-2 ring-red-500' : 'border border-slate-200'
                          }`}
                        />
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 text-white rounded-full shadow-md">
                            <Check className="w-3 h-3 stroke-3" />
                          </div>
                        )}
                      </div>

                      <h4 className={`text-xs font-black truncate w-full ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                        {hero.name}
                      </h4>
                      <p className={`text-[10px] font-semibold truncate w-full ${isSelected ? 'text-amber-300' : 'text-slate-500'}`}>
                        {hero.alias}
                      </p>
                      
                      <span className={`mt-2 text-[9px] px-2 py-0.5 rounded-md font-extrabold truncate w-full ${hero.badgeBg}`}>
                        {hero.teamRole.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
              <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-2xl p-8 text-center cursor-pointer transition relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center gap-2 text-slate-500 group-hover:text-emerald-700">
                  <div className="p-4 bg-emerald-100 text-emerald-700 rounded-full group-hover:scale-110 transition">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-800">Click or drag & drop profile image here</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">PNG, JPG, WEBP formats up to 5MB</p>
                  </div>
                </div>
              </div>

              {selectedPhoto && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
                  <img
                    src={selectedPhoto}
                    alt="Uploaded Preview"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="text-xs text-slate-700">
                    <p className="font-extrabold text-slate-800">Image Loaded Successfully</p>
                    <p className="text-[11px] text-slate-500 font-mono truncate max-w-sm mt-0.5">
                      {selectedPhoto.slice(0, 50)}...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: IMAGE URL */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Direct Profile Image Web Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={handleUrlApply}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer transition shadow-xs"
                  >
                    Load URL
                  </button>
                </div>
              </div>

              {selectedPhoto && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4">
                  <img
                    src={selectedPhoto}
                    alt="URL Preview"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                  />
                  <div className="text-xs text-slate-700 truncate">
                    <p className="font-extrabold text-slate-800">Live URL Image Preview</p>
                    <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                      {selectedPhoto}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs rounded-xl transition cursor-pointer"
            id="cancel-profile-modal-btn"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition flex items-center gap-2"
            id="save-profile-modal-btn"
          >
            <Check className="w-4 h-4" />
            <span>Save Profile Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
