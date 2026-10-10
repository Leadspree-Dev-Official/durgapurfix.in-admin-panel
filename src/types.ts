export type UserRole = 'admin' | 'executive' | 'provider';

export interface DurgapurUser {
  uid: string;
  name: string;
  phone: string;        // e.g. "+919832104567"
  phone10: string;      // 10-digit number, e.g. "9832104567"
  status: string;       // "pending" (default on sign-up) or "verified"
  verified: boolean;
  createdAt: number;    // epoch milliseconds
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  gender?: 'male' | 'female';
  providerId?: string; // If role is provider, link to provider profile
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  image?: string; // High-res Category Display Banner / Image
  status: 'active' | 'inactive';
  servicesCount: number;
}

export interface ServiceSubCategory {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string;
  image?: string; // Sub Category Thumbnail Image
  status: 'active' | 'inactive';
}

export interface Zone {
  id: string;
  name: string;
  coordinates: string;
  status: 'active' | 'inactive';
  providersCount: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  maxDiscount: number;
  expiryDate: string;
  status: 'active' | 'inactive';
}

export interface Slider {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  linkType: 'category' | 'service' | 'external';
  linkValue: string;
  status: 'active' | 'inactive';
}

export interface Review {
  id: string;
  orderId: string;
  customerName: string;
  providerName: string;
  serviceName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'approved' | 'pending' | 'hidden';
}

export interface ServiceItem {
  id: string;
  categoryId: string;
  categoryName: string;
  subCategoryId: string;
  subCategoryName: string;
  name: string;
  price: number;
  duration: string; // e.g., "1 hour"
  description: string;
  image: string;
  status: 'approved' | 'pending' | 'rejected';
}

export type OrderStatus = 'pending' | 'confirmed' | 'initiated' | 'ongoing' | 'completed' | 'canceled';

export interface OrderExpense {
  item: string;
  cost: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceName: string;
  serviceId: string;
  zone: string;
  address: string;
  date: string;
  timeSlot: string;
  amount: number;
  status: OrderStatus;
  paymentStatus: 'pending' | 'initiated' | 'approved' | 'successful' | 'rejected';
  paymentMode?: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | string;
  paymentConfirmedByPartner?: boolean;
  paymentConfirmedAt?: string;
  providerId?: string;
  providerName?: string;
  complaint?: string;
  expenses?: OrderExpense[];
  providerFeedback?: string;
  createdAt: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  gender?: 'male' | 'female';
  status: 'active' | 'banned';
  joinDate: string;
  ordersCount: number;
  // Mobile app sign-ups carry an admin-controlled verification flag.
  verified?: boolean;
  source?: 'web' | 'app';
}

export type ProviderStatus = 
  | 'active' 
  | 'banned' 
  | 'email_unverified' 
  | 'mobile_unverified' 
  | 'kyc_unverified' 
  | 'kyc_pending';

export interface KycDocuments {
  // Mandatory Documents
  aadhaarNumber?: string;
  aadhaarFront?: string;
  aadhaarBack?: string;
  
  panNumber?: string;
  panImage?: string;
  
  policeCertNumber?: string;
  policeCertImage?: string;

  // Optional Documents (Voter ID or Driving License)
  optionalDocType?: 'Voter Identity Card' | 'Driving License' | string;
  optionalDocNumber?: string;
  optionalDocImage?: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string; // Service category
  avatar?: string;
  gender?: 'male' | 'female';
  status: ProviderStatus;
  kycDocType?: string; // Summary main doc type
  kycDocNumber?: string;
  kycDocImageFront?: string;
  kycDocImageBack?: string;
  kycDocs?: KycDocuments;
  rating: number;
  balance: number;
  joinDate: string;
  jobsCompleted: number;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  userType: 'customer' | 'provider';
  userName: string;
  amount: number;
  method: string;
  status: 'pending' | 'approved' | 'successful' | 'rejected' | 'initiated';
  date: string;
}

export interface WithdrawalRequest {
  id: string;
  providerId: string;
  providerName: string;
  amount: number;
  method: string;
  accountDetails: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface AppointmentTimeSlot {
  id: string;
  startTime: string; // e.g. "08:00 AM"
  endTime: string;   // e.g. "10:00 AM"
  label: string;     // e.g. "08:00 AM - 10:00 AM"
  isActive: boolean;
  maxCapacity?: number; // max bookings per window
}

export interface AppointmentSettings {
  maxAdvanceBookingDays: number; // e.g. 7 or 14 days
  sameDayBookingLeadTimeHours: number; // e.g. 2 hours
  enableSameDayBooking: boolean;
  enableSundayBooking: boolean;
  autoConfirmSlots: boolean;
  timeSlots: AppointmentTimeSlot[];
}

export interface UserNotification {
  id: string;
  targetType: 'all_users' | 'all_providers' | 'zone' | 'individual';
  targetName?: string;
  targetZone?: string;
  title: string;
  message: string;
  imageUrl?: string;
  actionUrl?: string;
  priority?: 'normal' | 'high' | 'urgent';
  sender: string;
  date: string;
  status?: 'sent' | 'scheduled';
}

export interface LoginLog {
  id: string;
  userId: string;
  userName: string;
  userType: 'customer' | 'provider' | 'staff';
  ipAddress: string;
  device: string;
  date: string;
}

export interface HelpCenterFAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface HelpCenterSettings {
  supportPhone: string;
  supportEmail: string;
  whatsappNumber: string;
  supportHours: string;
  helpDeskMessage: string;
  faqs: HelpCenterFAQ[];
}

export interface SystemSettings {
  general: {
    siteName: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    currency: string;
    commissionRate: number; // e.g., 15 for 15%
    enablePlatformFee: boolean; // toggle platform fee on/off
    platformFee: number; // e.g. 49
    enableGstTax: boolean; // toggle GST tax on/off
    gstTaxRate: number; // e.g. 5 for 5% GST
  };
  logo: {
    primaryLogo: string;
    favicon: string;
  };
  configuration: {
    maintenanceMode: boolean;
    emailVerification: boolean;
    smsVerification: boolean;
    kycMandatory: boolean;
  };
  appointmentSettings?: AppointmentSettings;
  helpCenter?: HelpCenterSettings;
  policyPages: {
    aboutUs: string;
    termsConditions: string;
    privacyPolicy: string;
    refundPolicy: string;
    receiptTerms?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
}
