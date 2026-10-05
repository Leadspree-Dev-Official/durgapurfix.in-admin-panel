import React, { useState } from 'react';
import { SystemSettings, AppointmentSettings, AppointmentTimeSlot } from '../types';
import { 
  Clock, Calendar, Plus, Trash2, Check, AlertCircle, Sparkles, 
  Settings, CheckCircle2, ShieldCheck, ArrowRight, Eye, RefreshCw, Layers,
  Edit2, Pencil, X, Sliders
} from 'lucide-react';
import { syncDocToFirestore } from '../lib/firestoreSync';

interface AppointmentSettingsViewProps {
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
}

const DEFAULT_SLOTS: AppointmentTimeSlot[] = [
  { id: 'slot-1', startTime: '08:00 AM', endTime: '10:00 AM', label: '08:00 AM - 10:00 AM', isActive: true, maxCapacity: 10 },
  { id: 'slot-2', startTime: '10:00 AM', endTime: '12:00 PM', label: '10:00 AM - 12:00 PM', isActive: true, maxCapacity: 15 },
  { id: 'slot-3', startTime: '12:00 PM', endTime: '02:00 PM', label: '12:00 PM - 02:00 PM', isActive: true, maxCapacity: 12 },
  { id: 'slot-4', startTime: '02:00 PM', endTime: '04:00 PM', label: '02:00 PM - 04:00 PM', isActive: true, maxCapacity: 15 },
  { id: 'slot-5', startTime: '04:00 PM', endTime: '06:00 PM', label: '04:00 PM - 06:00 PM', isActive: true, maxCapacity: 15 },
  { id: 'slot-6', startTime: '06:00 PM', endTime: '08:00 PM', label: '06:00 PM - 08:00 PM', isActive: true, maxCapacity: 8 }
];

export default function AppointmentSettingsView({
  settings,
  onUpdateSettings
}: AppointmentSettingsViewProps) {

  const initialAppointment: AppointmentSettings = settings.appointmentSettings || {
    maxAdvanceBookingDays: 7,
    sameDayBookingLeadTimeHours: 2,
    enableSameDayBooking: true,
    enableSundayBooking: true,
    autoConfirmSlots: false,
    timeSlots: DEFAULT_SLOTS
  };

  const [appointmentData, setAppointmentData] = useState<AppointmentSettings>(initialAppointment);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Slot State
  const [newStartTime, setNewStartTime] = useState('08:00 AM');
  const [newEndTime, setNewEndTime] = useState('10:00 AM');
  const [newCapacity, setNewCapacity] = useState(10);
  const [showAddSlot, setShowAddSlot] = useState(false);

  // Edit Slot State
  const [editingSlot, setEditingSlot] = useState<AppointmentTimeSlot | null>(null);

  // Preview interactive state
  const [previewSelectedDate, setPreviewSelectedDate] = useState<number>(0);
  const [previewSelectedSlot, setPreviewSelectedSlot] = useState<string>(
    appointmentData.timeSlots.find(s => s.isActive)?.label || '08:00 AM - 10:00 AM'
  );

  // Generate next N days for live preview
  const generatePreviewDates = (daysCount: number) => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      dates.push({
        index: i,
        dayName,
        monthDay,
        fullDate: d.toISOString().split('T')[0]
      });
    }
    return dates;
  };

  const previewDates = generatePreviewDates(appointmentData.maxAdvanceBookingDays || 7);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const updatedSettings: SystemSettings = {
      ...settings,
      appointmentSettings: appointmentData
    };

    onUpdateSettings(updatedSettings);

    // Sync directly to Firestore collection 'settings' / 'global' and 'appointment_slots'
    try {
      await syncDocToFirestore('settings', 'global', updatedSettings);
      await syncDocToFirestore('settings', 'appointments', appointmentData);
    } catch (err) {
      console.warn('Firestore appointment settings sync warning:', err);
    }

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleToggleSlot = (slotId: string) => {
    setAppointmentData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map(slot => 
        slot.id === slotId ? { ...slot, isActive: !slot.isActive } : slot
      )
    }));
  };

  const handleDeleteSlot = (slotId: string) => {
    setAppointmentData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter(slot => slot.id !== slotId)
    }));
  };

  const handleUpdateSlotCapacity = (slotId: string, capacity: number) => {
    const val = Math.max(1, capacity);
    setAppointmentData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map(slot => 
        slot.id === slotId ? { ...slot, maxCapacity: val } : slot
      )
    }));
  };

  const handleSetAllCapacities = (cap: number) => {
    setAppointmentData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map(slot => ({ ...slot, maxCapacity: cap }))
    }));
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const label = `${newStartTime} - ${newEndTime}`;
    const newSlot: AppointmentTimeSlot = {
      id: 'slot-' + Date.now(),
      startTime: newStartTime,
      endTime: newEndTime,
      label,
      isActive: true,
      maxCapacity: Number(newCapacity) || 10
    };

    setAppointmentData(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, newSlot]
    }));

    setShowAddSlot(false);
  };

  const handleSaveEditedSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    setAppointmentData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map(s => 
        s.id === editingSlot.id ? editingSlot : s
      )
    }));

    setEditingSlot(null);
  };

  return (
    <div className="space-y-6 select-none" id="appointment-settings-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-emerald-600" />
            <span>Appointment & Arrival Time Window Control</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Configure customer appointment dates, booking horizons, same-day cutoff times, and technician arrival windows.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-xs hover:shadow-md cursor-pointer transition"
          id="save-appointment-settings-btn"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Check className="w-4 h-4 text-white" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Settings to Cloud'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-3 font-semibold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Appointment calendar & time slot controls successfully saved and synced to live customer applications!</span>
        </div>
      )}

      {/* Main Grid: Control Panel + Live Mobile Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Slot Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Appointment Date Rules */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>1. Appointment Date Rules & Advance Booking Window</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1.5">
                  Advance Booking Horizon (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={appointmentData.maxAdvanceBookingDays}
                  onChange={(e) => setAppointmentData({ ...appointmentData, maxAdvanceBookingDays: Math.max(1, Number(e.target.value)) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Number of upcoming days visible for customer selection.</p>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-bold mb-1.5">
                  Same-Day Lead Time (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={appointmentData.sameDayBookingLeadTimeHours}
                  onChange={(e) => setAppointmentData({ ...appointmentData, sameDayBookingLeadTimeHours: Math.max(0, Number(e.target.value)) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Minimum hours notice required before same-day slot arrival.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Allow Same-Day Booking</span>
                  <span className="text-[10px] text-slate-400">Customers can book for today if slots remain</span>
                </div>
                <input
                  type="checkbox"
                  checked={appointmentData.enableSameDayBooking}
                  onChange={(e) => setAppointmentData({ ...appointmentData, enableSameDayBooking: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Allow Sunday Bookings</span>
                  <span className="text-[10px] text-slate-400">Technicians available for Sunday service</span>
                </div>
                <input
                  type="checkbox"
                  checked={appointmentData.enableSundayBooking}
                  onChange={(e) => setAppointmentData({ ...appointmentData, enableSundayBooking: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Section 2: Arrival Time Windows Management */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>2. Arrival Time Windows & Concurrent Booking Capacity</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Adjust how many simultaneous bookings your technicians can handle in each arrival time slot.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddSlot(!showAddSlot)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Time Window</span>
              </button>
            </div>

            {/* Quick Bulk Capacity Presets */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Bulk Apply Capacity to All Slots:</span>
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[5, 10, 15, 20, 25, 50].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleSetAllCapacities(num)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition shadow-2xs cursor-pointer"
                  >
                    {num} Slots
                  </button>
                ))}
              </div>
            </div>

            {/* Add Custom Slot Form */}
            {showAddSlot && (
              <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-3 animate-in fade-in duration-150">
                <span className="text-xs font-bold text-emerald-800 block">Create New Arrival Time Window</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Start Time</label>
                    <input
                      type="text"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      placeholder="e.g. 08:00 AM"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">End Time</label>
                    <input
                      type="text"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      placeholder="e.g. 10:00 AM"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Max Concurrent Capacity</label>
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={newCapacity}
                      onChange={(e) => setNewCapacity(Number(e.target.value))}
                      placeholder="10"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddSlot(false)}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSlot}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-2xs"
                  >
                    Save Slot
                  </button>
                </div>
              </div>
            )}

            {/* List of Time Slots */}
            <div className="space-y-2.5">
              {appointmentData.timeSlots.map((slot) => (
                <div 
                  key={slot.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                    slot.isActive 
                      ? 'bg-white border-slate-200 shadow-2xs' 
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleSlot(slot.id)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center cursor-pointer transition ${
                        slot.isActive ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                      }`}
                      title={slot.isActive ? 'Disable Time Slot' : 'Enable Time Slot'}
                    >
                      {slot.isActive && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 block">
                        {slot.label}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {slot.isActive ? 'Active Slot' : 'Slot Temporarily Disabled'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
                    {/* Max Concurrent Capacity Adjuster */}
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase px-1">Concurrent Cap:</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateSlotCapacity(slot.id, (slot.maxCapacity || 10) - 1)}
                        className="w-6 h-6 rounded bg-white hover:bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center border border-slate-200 text-xs shadow-2xs cursor-pointer"
                        title="Decrease capacity"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={slot.maxCapacity || 10}
                        onChange={(e) => handleUpdateSlotCapacity(slot.id, parseInt(e.target.value) || 1)}
                        className="w-12 text-center text-xs font-extrabold text-slate-800 bg-white border border-slate-200 rounded py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateSlotCapacity(slot.id, (slot.maxCapacity || 10) + 1)}
                        className="w-6 h-6 rounded bg-white hover:bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center border border-slate-200 text-xs shadow-2xs cursor-pointer"
                        title="Increase capacity"
                      >
                        +
                      </button>
                      <span className="text-[10px] font-semibold text-slate-500 pr-1">slots</span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                      slot.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {slot.isActive ? 'Active' : 'Disabled'}
                    </span>

                    <button
                      type="button"
                      onClick={() => setEditingSlot({ ...slot })}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg transition shadow-2xs cursor-pointer shrink-0"
                      title="Edit Time Window & Capacity"
                    >
                      <Pencil className="w-3 h-3 text-emerald-600" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0 cursor-pointer"
                      title="Remove Slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Live Mobile App Experience Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800 space-y-5 sticky top-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Live Customer Screen Preview
                </span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                Interactive
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              This preview accurately represents how customers view and select appointment slots in the customer checkout flow:
            </p>

            {/* 1. Select Appointment Date (Matching user uploaded screenshot) */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <span className="text-blue-400 font-bold">1.</span>
                <span>Select Appointment Date</span>
              </h4>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {previewDates.map((item) => {
                  const isSelected = previewSelectedDate === item.index;
                  return (
                    <button
                      key={item.index}
                      type="button"
                      onClick={() => setPreviewSelectedDate(item.index)}
                      className={`shrink-0 flex flex-col items-center justify-center rounded-2xl px-4 py-3 min-w-[72px] transition cursor-pointer ${
                        isSelected 
                          ? 'bg-[#0b1c3d] text-white ring-2 ring-blue-400/50 shadow-md font-bold' 
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium'
                      }`}
                    >
                      <span className={`text-[11px] mb-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {item.dayName}
                      </span>
                      <span className="text-xs font-extrabold text-white">
                        {item.monthDay}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Select Arrival Time Window (Matching user uploaded screenshot) */}
            <div className="space-y-2.5 pt-2">
              <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <span className="text-blue-400 font-bold">2.</span>
                <span>Select Arrival Time Window</span>
              </h4>

              <div className="grid grid-cols-2 gap-2">
                {appointmentData.timeSlots
                  .filter(s => s.isActive)
                  .map((slot) => {
                    const isSelected = previewSelectedSlot === slot.label;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setPreviewSelectedSlot(slot.label)}
                        className={`py-2.5 px-3 rounded-xl text-center transition cursor-pointer text-xs font-bold ${
                          isSelected 
                            ? 'bg-[#0b1c3d] text-white ring-2 ring-blue-400/50 shadow-md' 
                            : 'bg-slate-800 hover:bg-slate-800/90 text-slate-300'
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* 3. Summary Box */}
            <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Customer Selected Slot:</span>
              <p className="text-emerald-300 font-extrabold">
                {previewDates[previewSelectedDate]?.dayName}, {previewDates[previewSelectedDate]?.monthDay} ({previewDates[previewSelectedDate]?.fullDate})
              </p>
              <p className="text-slate-200 font-bold">
                Arrival Window: {previewSelectedSlot}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Time Window & Capacity Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Edit Arrival Time Window</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Configure slot timing and concurrent capacity</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedSlot} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={editingSlot.startTime}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setEditingSlot({
                        ...editingSlot,
                        startTime: newStart,
                        label: `${newStart} - ${editingSlot.endTime}`
                      });
                    }}
                    placeholder="08:00 AM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={editingSlot.endTime}
                    onChange={(e) => {
                      const newEnd = e.target.value;
                      setEditingSlot({
                        ...editingSlot,
                        endTime: newEnd,
                        label: `${editingSlot.startTime} - ${newEnd}`
                      });
                    }}
                    placeholder="10:00 AM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Slot Display Label</label>
                <input
                  type="text"
                  value={editingSlot.label}
                  onChange={(e) => setEditingSlot({ ...editingSlot, label: e.target.value })}
                  placeholder="08:00 AM - 10:00 AM"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Max Concurrent Capacity</label>
                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {editingSlot.maxCapacity || 10} Bookings
                  </span>
                </div>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={editingSlot.maxCapacity || 10}
                  onChange={(e) => setEditingSlot({ ...editingSlot, maxCapacity: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Maximum simultaneous customers who can book this arrival window.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSlot.isActive}
                    onChange={(e) => setEditingSlot({ ...editingSlot, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-700">Active in Mobile App</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSlot(null)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Update Slot</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
