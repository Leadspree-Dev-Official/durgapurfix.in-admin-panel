import React, { useState } from 'react';
import { UserNotification, CustomerUser, ServiceProvider, Zone } from '../types';
import { 
  Bell, Send, Users, UserCheck, MapPin, Sparkles, CheckCircle2, 
  Trash2, RefreshCw, Image as ImageIcon, Upload, Link as LinkIcon, 
  AlertCircle, ShieldCheck, Check, Clock, Radio, ArrowUpRight
} from 'lucide-react';
import { syncDocToFirestore, removeDocFromFirestore } from '../lib/firestoreSync';
import { compressImage } from '../lib/imageUtils';

interface PushNotificationCenterProps {
  notifications: UserNotification[];
  users: CustomerUser[];
  providers: ServiceProvider[];
  zones: Zone[];
  currentUserEmail: string;
  onUpdateNotifications: (notifications: UserNotification[]) => void;
}

export default function PushNotificationCenter({
  notifications,
  users,
  providers,
  zones,
  currentUserEmail,
  onUpdateNotifications
}: PushNotificationCenterProps) {

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'all_users' | 'all_providers' | 'zone' | 'individual'>('all_users');
  const [targetName, setTargetName] = useState('');
  const [targetZone, setTargetZone] = useState(zones[0]?.name || 'City Centre Zone');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('high');
  const [imageUrl, setImageUrl] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 800, 500, 0.8);
      setImageUrl(compressed);
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);
    setSendSuccess(false);

    let finalTargetName = '';
    if (targetType === 'all_users') {
      finalTargetName = 'All Registered Customers & Guests';
    } else if (targetType === 'all_providers') {
      finalTargetName = 'All On-Duty Service Technicians';
    } else if (targetType === 'zone') {
      finalTargetName = `Zone: ${targetZone}`;
    } else {
      finalTargetName = targetName || 'Selected Recipient';
    }

    const newNotification: UserNotification = {
      id: 'notif-' + Date.now(),
      title: title.trim(),
      message: message.trim(),
      targetType,
      targetName: finalTargetName,
      targetZone: targetType === 'zone' ? targetZone : undefined,
      imageUrl: imageUrl || undefined,
      actionUrl: actionUrl || undefined,
      priority,
      sender: currentUserEmail || 'Admin Operations Desk',
      date: new Date().toISOString().split('T')[0],
      status: 'sent'
    };

    // 1. Update local & parent state
    const updatedList = [newNotification, ...notifications];
    onUpdateNotifications(updatedList);

    // 2. Persist directly to Firestore collection 'notifications' and 'push_notifications'
    try {
      await syncDocToFirestore('notifications', newNotification.id, newNotification);
      await syncDocToFirestore('push_notifications', newNotification.id, newNotification);
    } catch (err) {
      console.warn('Notification Firestore sync warning:', err);
    }

    setIsSending(false);
    setSendSuccess(true);

    // Reset Form
    setTitle('');
    setMessage('');
    setImageUrl('');
    setActionUrl('');
    setTargetName('');

    setTimeout(() => setSendSuccess(false), 4000);
  };

  const handleDelete = async (id: string) => {
    const filtered = notifications.filter(n => n.id !== id);
    onUpdateNotifications(filtered);
    try {
      await removeDocFromFirestore('notifications', id);
      await removeDocFromFirestore('push_notifications', id);
    } catch (e) {}
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'all') return true;
    return n.targetType === filterType;
  });

  return (
    <div className="space-y-6 select-none" id="push-notification-center-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-emerald-600" />
            <span>Push Notification Dispatch Center</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Broadcast instant push messages, alerts, promotional offers, and operational notices directly to mobile apps and staff.
          </p>
        </div>
      </div>

      {sendSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-3 font-semibold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Push Notification successfully broadcasted and logged in Firestore cloud!</span>
        </div>
      )}

      {/* Grid: Send Form + History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Composer Form (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Send className="w-4 h-4 text-emerald-600" />
            <span>Compose Push Broadcast</span>
          </h3>

          <form onSubmit={handleSendNotification} className="space-y-4">
            {/* Target Audience */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5">Target Audience</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetType('all_users')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    targetType === 'all_users' 
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-500/10' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>All Customers</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType('all_providers')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    targetType === 'all_providers' 
                      ? 'bg-blue-50 border-blue-400 text-blue-800 ring-2 ring-blue-500/10' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>All Technicians</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType('zone')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    targetType === 'zone' 
                      ? 'bg-purple-50 border-purple-400 text-purple-800 ring-2 ring-purple-500/10' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Specific Zone</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType('individual')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    targetType === 'individual' 
                      ? 'bg-amber-50 border-amber-400 text-amber-800 ring-2 ring-amber-500/10' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Individual</span>
                </button>
              </div>
            </div>

            {/* Target Selectors */}
            {targetType === 'zone' && (
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1.5">Select Operating Zone</label>
                <select
                  value={targetZone}
                  onChange={(e) => setTargetZone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.name}>{z.name}</option>
                  ))}
                </select>
              </div>
            )}

            {targetType === 'individual' && (
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1.5">Recipient Name / Phone / Email</label>
                <input
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  placeholder="e.g. Joydev Sen (9832100000)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
            )}

            {/* Notification Title */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5">Notification Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. ⚡ 20% Off AC Servicing in Durgapur this weekend!"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5">Message Content *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your push notification message body here..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>

            {/* Priority & Deep Link */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1.5">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High (Standard)</option>
                  <option value="urgent">Urgent / Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1.5">App Screen Target</label>
                <input
                  type="text"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="e.g. /services/ac-repair"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Optional Banner Image */}
            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 flex items-center justify-between">
                <span>Optional Rich Banner Image</span>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-[10px] text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </label>

              <div className="flex items-center gap-2">
                <label className="flex-1 border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-xl p-2.5 flex items-center justify-center gap-2 cursor-pointer transition text-xs font-bold text-slate-700">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or paste URL"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>

              {imageUrl && (
                <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 h-24 bg-slate-100">
                  <img src={imageUrl} alt="Notification Banner" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-xs hover:shadow-md cursor-pointer transition flex items-center justify-center gap-2"
              id="send-push-btn"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Broadcasting to Firebase...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-white" />
                  <span>Send Push Notification Now</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* History / Logs (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Notification Dispatch History ({notifications.length})</span>
              </h3>
            </div>

            <div className="flex gap-1">
              {(['all', 'all_users', 'all_providers', 'zone'] as const).map((ft) => (
                <button
                  key={ft}
                  onClick={() => setFilterType(ft)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition cursor-pointer ${
                    filterType === ft ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ft === 'all' ? 'All' : ft.replace('all_', '')}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto p-2">
            {filteredNotifications.map((notif) => (
              <div key={notif.id} className="p-4 hover:bg-slate-50/60 rounded-xl transition flex flex-col sm:flex-row items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                      notif.targetType === 'all_users' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      notif.targetType === 'all_providers' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      notif.targetType === 'zone' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {notif.targetName || notif.targetType}
                    </span>

                    {notif.priority === 'urgent' && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-700">
                        Urgent
                      </span>
                    )}

                    <span className="text-[10px] text-slate-400 font-medium">
                      {notif.date} • by {notif.sender?.split('@')[0] || 'Admin'}
                    </span>
                  </div>

                  <h4 className="text-xs font-extrabold text-slate-800">{notif.title}</h4>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed">{notif.message}</p>

                  {notif.imageUrl && (
                    <div className="mt-2 w-32 h-16 rounded-lg overflow-hidden border border-slate-200">
                      <img src={notif.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete Notification Log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredNotifications.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                No notifications logged under this category.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
