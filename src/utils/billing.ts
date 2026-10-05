import { Order, SystemSettings } from '../types';

export function calculateOrderFinalBill(order: Order, settings?: SystemSettings) {
  const basePrice = order.amount || 0;
  const expenses = order.expenses || [];
  const totalExpensesCost = expenses.reduce((sum, exp) => sum + (exp.cost || 0), 0);
  
  const isPlatformFeeEnabled = settings?.general?.enablePlatformFee ?? true;
  const isGstTaxEnabled = settings?.general?.enableGstTax ?? true;

  const platformFee = isPlatformFeeEnabled ? (settings?.general?.platformFee ?? 49) : 0;
  const gstRate = isGstTaxEnabled ? (settings?.general?.gstTaxRate ?? 5) : 0;
  const gstTax = isGstTaxEnabled ? Math.round((basePrice + totalExpensesCost) * (gstRate / 100)) : 0;
  const finalTotal = basePrice + totalExpensesCost + platformFee + gstTax;

  return {
    basePrice,
    totalExpensesCost,
    platformFee,
    gstRate,
    gstTax,
    finalTotal
  };
}
