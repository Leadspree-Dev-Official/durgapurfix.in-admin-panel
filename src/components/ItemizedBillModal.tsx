import React, { useState } from 'react';
import { Order, SystemSettings } from '../types';
import { X, Printer, Copy, Check, FileText, ShieldCheck, MapPin, Calendar, Clock, User, Phone, Mail, Wrench, Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import Logo from './Logo';

interface ItemizedBillModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  settings?: SystemSettings;
}

export default function ItemizedBillModal({ order, isOpen, onClose, settings }: ItemizedBillModalProps) {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen || !order) return null;

  const basePrice = order.amount || 0;
  const expenses = order.expenses || [];
  const totalExpensesCost = expenses.reduce((sum, exp) => sum + (exp.cost || 0), 0);
  
  // Dynamic Platform Fee & Service GST calculation from Admin System Settings
  const isPlatformFeeEnabled = settings?.general?.enablePlatformFee ?? true;
  const isGstTaxEnabled = settings?.general?.enableGstTax ?? true;

  const platformFee = isPlatformFeeEnabled ? (settings?.general?.platformFee ?? 49) : 0;
  const gstRate = isGstTaxEnabled ? (settings?.general?.gstTaxRate ?? 5) : 0;
  const gstTax = isGstTaxEnabled ? Math.round((basePrice + totalExpensesCost) * (gstRate / 100)) : 0;
  const grandTotal = basePrice + totalExpensesCost + platformFee + gstTax;

  const handleCopyText = () => {
    const summary = `
========================================
       DURGAPUR FIX - ITEMIZED TAX BILL
========================================
Order ID      : ${order.id}
Date          : ${order.date} (${order.timeSlot})
Customer      : ${order.customerName} (${order.customerPhone})
Service       : ${order.serviceName}
Location      : ${order.address}, ${order.zone}
Assigned Pro  : ${order.providerName || 'Unassigned'}
----------------------------------------
ITEMIZED COST BREAKDOWN:
- Base Service Charge: ₹${basePrice}
${expenses.map(e => `- ${e.item}: ₹${e.cost}`).join('\n')}
${isPlatformFeeEnabled ? `- Platform & Convenience Fee: ₹${platformFee}\n` : ''}${isGstTaxEnabled ? `- Service GST (${gstRate}%): ₹${gstTax}\n` : ''}----------------------------------------
TOTAL AMOUNT  : ₹${grandTotal}
PAYMENT STATUS: ${(order.paymentStatus || 'Pending').toUpperCase()}
STATUS        : ${order.status.toUpperCase()}
========================================
Thank you for choosing Durgapur Fix!
    `.trim();

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      // Dark Header Background
      pdf.setFillColor(15, 23, 42); // slate 900
      pdf.rect(0, 0, 210, 32, 'F');

      // Title / Brand Header
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.text('DURGAPUR FIX', 14, 15);

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(16, 185, 129); // emerald 500
      pdf.text('SPOTLESS HOME SERVICES & REPAIRS', 14, 22);

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('OFFICIAL INVOICE', 196, 15, { align: 'right' });
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Order ID: ${order.id}`, 196, 22, { align: 'right' });

      // Customer & Order Information Box
      let y = 40;
      pdf.setFillColor(248, 250, 252); // slate 50
      pdf.roundedRect(14, y, 182, 38, 3, 3, 'F');

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('CUSTOMER & ORDER DETAILS', 18, y + 8);

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      pdf.text('Customer Name:', 18, y + 16);
      pdf.text('Phone Number:', 18, y + 22);
      pdf.text('Service Address:', 18, y + 28);
      pdf.text('Service Zone:', 18, y + 34);

      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${order.customerName}`, 52, y + 16);
      pdf.text(`${order.customerPhone}`, 52, y + 22);
      pdf.text(`${order.address || 'City Centre, Durgapur'}`, 52, y + 28);
      pdf.text(`${order.zone || 'Central'} District`, 52, y + 34);

      pdf.setTextColor(100, 116, 139);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Booking Date:', 120, y + 16);
      pdf.text('Time Slot:', 120, y + 22);
      pdf.text('Assigned Partner:', 120, y + 28);
      pdf.text('Payment Status:', 120, y + 34);

      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${order.date}`, 155, y + 16);
      pdf.text(`${order.timeSlot || 'Standard'}`, 155, y + 22);
      pdf.text(`${order.providerName || 'Durgapur Fix Partner'}`, 155, y + 28);
      pdf.text(`${(order.paymentStatus || 'Pending').toUpperCase()}`, 155, y + 34);

      // Itemized Table Title
      y += 46;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('ITEMIZED BILL BREAKDOWN', 14, y);

      // Table Header
      y += 4;
      pdf.setFillColor(226, 232, 240); // slate 200
      pdf.rect(14, y, 182, 8, 'F');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(51, 65, 85);
      pdf.text('Item Description', 18, y + 5.5);
      pdf.text('Type', 130, y + 5.5);
      pdf.text('Amount', 192, y + 5.5, { align: 'right' });

      y += 8;
      // Base Price Row
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text(`${order.serviceName} (Base Service)`, 18, y + 6);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      pdf.text('Base Charge', 130, y + 6);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text(`Rs. ${basePrice}`, 192, y + 6, { align: 'right' });
      pdf.setDrawColor(241, 245, 249);
      pdf.line(14, y + 9, 196, y + 9);
      y += 9;

      // Expenses / Parts
      expenses.forEach((exp) => {
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(51, 65, 85);
        pdf.text(`${exp.item}`, 18, y + 6);
        pdf.setTextColor(100, 116, 139);
        pdf.text('Spare Parts / Material', 130, y + 6);
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Rs. ${exp.cost}`, 192, y + 6, { align: 'right' });
        pdf.setDrawColor(241, 245, 249);
        pdf.line(14, y + 9, 196, y + 9);
        y += 9;
      });

      // Platform Fee
      if (isPlatformFeeEnabled) {
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(51, 65, 85);
        pdf.text('Safety, Insurance & Platform Convenience Fee', 18, y + 6);
        pdf.setTextColor(100, 116, 139);
        pdf.text('Platform', 130, y + 6);
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Rs. ${platformFee}`, 192, y + 6, { align: 'right' });
        pdf.setDrawColor(241, 245, 249);
        pdf.line(14, y + 9, 196, y + 9);
        y += 9;
      }

      // GST Tax
      if (isGstTaxEnabled) {
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(51, 65, 85);
        pdf.text(`Statutory GST (${gstRate}% Home Services Tax)`, 18, y + 6);
        pdf.setTextColor(100, 116, 139);
        pdf.text('Tax', 130, y + 6);
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Rs. ${gstTax}`, 192, y + 6, { align: 'right' });
        pdf.setDrawColor(241, 245, 249);
        pdf.line(14, y + 9, 196, y + 9);
        y += 9;
      }

      // Grand Total Banner
      y += 4;
      pdf.setFillColor(16, 185, 129); // Emerald 500
      pdf.roundedRect(14, y, 182, 16, 2, 2, 'F');

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text('FINAL GRAND TOTAL AMOUNT DUE', 20, y + 10.5);
      pdf.setFontSize(14);
      pdf.text(`Rs. ${grandTotal}`, 190, y + 10.5, { align: 'right' });

      // Terms Footer
      y += 28;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 116, 139);
      pdf.text('TERMS & CONDITIONS:', 14, y);
      pdf.setFont('helvetica', 'normal');

      const customTermsStr = settings?.policyPages?.receiptTerms || '1. All home service warranties are valid for 30 days from completion date.\n2. This is a computer-generated official tax invoice issued by Durgapur Fix Services.\n3. For support or invoice inquiries, contact: support@durgapurfix.com';
      const termLines = customTermsStr.split('\n');
      termLines.forEach((line, idx) => {
        pdf.text(line.trim(), 14, y + 5 + (idx * 4));
      });

      pdf.save(`DurgapurFix_Invoice_${order.id}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF download:", err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        id="itemized-bill-modal-content"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight">Itemized Service Invoice</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Official Bill
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Invoice #{order.id}</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            id="close-bill-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div 
          id="printable-invoice-content"
          className="p-6 overflow-y-auto space-y-6 text-slate-800 custom-scrollbar bg-white"
        >
          
          {/* Header Branding & Order Meta */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Logo size="sm" showTagline={true} />
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0">
                  Verified Invoice
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">City Centre, Durgapur, West Bengal 713216</p>
              <p className="text-[11px] text-slate-500 font-mono">GSTIN: 19AAACD4012K1Z8</p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <p className="text-xs font-mono font-bold text-slate-800">
                Booking ID: <span className="text-emerald-700 font-extrabold">{order.id}</span>
              </p>
              <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1 sm:justify-end">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{order.date}</span>
              </p>
              <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1 sm:justify-end">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{order.timeSlot}</span>
              </p>
            </div>
          </div>

          {/* Customer & Provider Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Box */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Customer Information</span>
              </p>
              <div>
                <p className="text-xs font-bold text-slate-900">{order.customerName}</p>
                <p className="text-[11px] text-slate-600 font-mono flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{order.customerPhone}</span>
                </p>
                <p className="text-[11px] text-slate-600 truncate flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{order.customerEmail}</span>
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2 font-medium">{order.address}, {order.zone}</span>
              </div>
            </div>

            {/* Provider Box */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                <span>Assigned Technician</span>
              </p>
              {order.providerName ? (
                <div>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{order.providerName}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">Verified Home Service Expert</p>
                  <p className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5 inline-block mt-2 font-bold">
                    Partner ID: {order.providerId || 'PROV-VERIFIED'}
                  </p>
                </div>
              ) : (
                <div className="py-2 text-center text-slate-400 text-xs italic">
                  Partner allocation pending for this job.
                </div>
              )}
            </div>
          </div>

          {/* Requested Service Title */}
          <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Booked Service Title</p>
              <p className="text-xs font-extrabold text-slate-900 mt-0.5">{order.serviceName}</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
              Zone: {order.zone}
            </span>
          </div>

          {/* Itemized Billing Breakdown Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Itemized Line Items Breakdown
            </h4>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-extrabold">Item Description</th>
                    <th className="py-2.5 px-3 font-extrabold text-center">Category</th>
                    <th className="py-2.5 px-3 font-extrabold text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {/* Base Service Fee Row */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {order.serviceName} (Base Standard Rate)
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                        Service
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-right text-slate-900">
                      ₹{basePrice}
                    </td>
                  </tr>

                  {/* Added Parts & Itemized Materials Rows */}
                  {expenses.map((exp, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 bg-amber-50/20">
                      <td className="py-2.5 px-3 font-medium text-slate-800 flex items-center gap-1.5">
                        <span className="text-[10px] text-amber-600 font-bold">●</span>
                        <span>{exp.item}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                          Parts / Material
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-right text-slate-900">
                        ₹{exp.cost}
                      </td>
                    </tr>
                  ))}

                  {/* Platform & Convenience Fee */}
                  {isPlatformFeeEnabled && (
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-medium text-slate-600">
                        Safety, Insurance & Platform Convenience Fee
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                          Platform
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-right text-slate-800">
                        ₹{platformFee}
                      </td>
                    </tr>
                  )}

                  {/* GST Tax Row */}
                  {isGstTaxEnabled && (
                    <tr className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-medium text-slate-600">
                        Statutory GST ({gstRate}% Home Services Tax)
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                          Tax
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-right text-slate-800">
                        ₹{gstTax}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Total Calculation Footer */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Final Total Payable</p>
                  <p className="text-xs text-emerald-400 font-medium">All taxes & itemized parts included</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black font-mono tracking-tight text-emerald-400">
                    ₹{grandTotal}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Order Status Row */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Payment Collection & Mode</span>
              <p className="text-xs font-extrabold capitalize text-slate-800 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${order.paymentStatus === 'successful' || order.paymentConfirmedByPartner ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span>
                  {order.paymentStatus === 'successful' || order.paymentConfirmedByPartner 
                    ? `Paid (${order.paymentMode || 'Cash'})` 
                    : 'Payment Pending (Unconfirmed)'}
                </span>
              </p>
              {order.paymentConfirmedAt && (
                <p className="text-[10px] text-slate-400 font-medium">Confirmed: {order.paymentConfirmedAt}</p>
              )}
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Job Execution Status</span>
              <p className="text-xs font-extrabold capitalize text-slate-800 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${order.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                <span>{order.status}</span>
              </p>
              {order.providerName && (
                <p className="text-[10px] text-slate-400 font-medium truncate">Partner: {order.providerName}</p>
              )}
            </div>
          </div>

          {/* Provider Feedback Note if available */}
          {order.providerFeedback && (
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-1 text-emerald-900">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Technician Work Summary & Feedback</p>
              <p className="text-xs italic font-medium">"{order.providerFeedback}"</p>
            </div>
          )}

          {/* Guarantee & Receipt Terms Footer */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-[10px] font-extrabold uppercase text-slate-700 tracking-wider">
                Receipt & Invoice Terms & Conditions
              </span>
            </div>
            <p className="text-[10px] text-slate-600 font-mono whitespace-pre-line leading-relaxed pl-6">
              {settings?.policyPages?.receiptTerms || '1. All home service warranties are valid for 30 days from completion date.\n2. This is a computer-generated official tax invoice issued by Durgapur Fix Services.\n3. For support or invoice inquiries, contact: support@durgapurfix.com'}
            </p>
          </div>

        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleCopyText}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-2 shadow-2xs"
            id="copy-itemized-bill-btn"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Summary Copied!' : 'Copy Bill Summary'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              id="print-receipt-btn"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-2 shadow-xs"
              id="download-pdf-receipt-btn"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download PDF Receipt</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
              id="done-itemized-bill-btn"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
