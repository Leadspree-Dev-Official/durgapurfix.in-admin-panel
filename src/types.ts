export type UserRole = 'admin' | 'executive' | 'provider';

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
  status: 'active' | 'inactive';
  servicesCount: number;
}

export interface ServiceSubCategory {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string;
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

export interface UserNotification {
  id: string;
  targetType: 'all_users' | 'all_providers' | 'individual';
  targetName?: string;
  title: string;
  message: string;
  sender: string;
  date: string;
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
