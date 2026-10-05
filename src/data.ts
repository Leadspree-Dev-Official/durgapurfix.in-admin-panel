import { 
  ServiceCategory, 
  ServiceSubCategory, 
  Zone, 
  Coupon, 
  Slider, 
  Review, 
  ServiceItem, 
  Order, 
  CustomerUser, 
  ServiceProvider, 
  PaymentTransaction, 
  WithdrawalRequest, 
  UserNotification, 
  LoginLog, 
  SystemSettings 
} from './types';

export const initialCategories: ServiceCategory[] = [
  {
    id: 'cat-1',
    name: 'AC Mechanic',
    description: 'Expert AC repair, servicing, installation, and gas refilling.',
    icon: 'AirConditioner',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
    status: 'active',
    servicesCount: 3
  },
  {
    id: 'cat-2',
    name: 'Plumbing',
    description: 'Leak fixing, tap installation, piping, and bathroom fittings.',
    icon: 'Droplet',
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=80',
    status: 'active',
    servicesCount: 4
  },
  {
    id: 'cat-3',
    name: 'Beautician',
    description: 'Salon services, bridal makeup, facials, and hair styling at home.',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
    status: 'active',
    servicesCount: 3
  },
  {
    id: 'cat-4',
    name: 'Electrician',
    description: 'Fan repair, switchboard repair, house wiring, and short circuit fixes.',
    icon: 'Zap',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&auto=format&fit=crop&q=80',
    status: 'active',
    servicesCount: 3
  },
  {
    id: 'cat-5',
    name: 'Chefs & Cooks',
    description: 'Experienced cooks for home, parties, and daily meal preparation.',
    icon: 'Utensils',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&auto=format&fit=crop&q=80',
    status: 'active',
    servicesCount: 2
  },
  {
    id: 'cat-6',
    name: 'Home Cleaning',
    description: 'Full house deep cleaning, kitchen cleaning, and sofa washing.',
    icon: 'Trash2',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
    status: 'active',
    servicesCount: 3
  }
];

export const initialSubCategories: ServiceSubCategory[] = [
  {
    id: 'sub-1',
    categoryId: 'cat-1',
    categoryName: 'AC Mechanic',
    name: 'Split AC Servicing',
    description: 'Complete wet cleaning and filter cleaning of Split AC.',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
    status: 'active'
  },
  {
    id: 'sub-2',
    categoryId: 'cat-1',
    categoryName: 'AC Mechanic',
    name: 'AC Installation',
    description: 'Proper mounting and pipe installation of AC unit.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
    status: 'active'
  },
  {
    id: 'sub-3',
    categoryId: 'cat-2',
    categoryName: 'Plumbing',
    name: 'Water Pipe Leak Repair',
    description: 'Identify and fix pipeline leakages and blockages.',
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=500&auto=format&fit=crop&q=80',
    status: 'active'
  },
  {
    id: 'sub-4',
    categoryId: 'cat-2',
    categoryName: 'Plumbing',
    name: 'Bathroom Fittings Installation',
    description: 'Installation of showers, taps, and wash basins.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=80',
    status: 'active'
  },
  {
    id: 'sub-5',
    categoryId: 'cat-3',
    categoryName: 'Beautician',
    name: 'Facial & Skin Care',
    description: 'Moisturizing and glowing facials at your doorstep.',
    status: 'active'
  },
  {
    id: 'sub-6',
    categoryId: 'cat-4',
    categoryName: 'Electrician',
    name: 'Switchboard Repair',
    description: 'Fixing loose wiring, sockets, and switches.',
    status: 'active'
  }
];

export const initialZones: Zone[] = [
  {
    id: 'zone-1',
    name: 'City Centre',
    coordinates: '23.5303° N, 87.2917° E',
    status: 'active',
    providersCount: 12
  },
  {
    id: 'zone-2',
    name: 'Benachity',
    coordinates: '23.5532° N, 87.2991° E',
    status: 'active',
    providersCount: 18
  },
  {
    id: 'zone-3',
    name: 'Bidhannagar',
    coordinates: '23.5186° N, 87.3236° E',
    status: 'active',
    providersCount: 9
  },
  {
    id: 'zone-4',
    name: 'Mamra',
    coordinates: '23.5412° N, 87.3314° E',
    status: 'active',
    providersCount: 6
  },
  {
    id: 'zone-5',
    name: 'Durgapur Steel Township (DSP)',
    coordinates: '23.5614° N, 87.2612° E',
    status: 'active',
    providersCount: 15
  }
];

export const initialCoupons: Coupon[] = [
  {
    id: 'coup-1',
    code: 'WELCOME100',
    discountType: 'fixed',
    discountValue: 100,
    minPurchase: 500,
    maxDiscount: 100,
    expiryDate: '2026-12-31',
    status: 'active'
  },
  {
    id: 'coup-2',
    code: 'DURGAPUR20',
    discountType: 'percentage',
    discountValue: 20,
    minPurchase: 300,
    maxDiscount: 200,
    expiryDate: '2026-09-30',
    status: 'active'
  },
  {
    id: 'coup-3',
    code: 'MONSOON50',
    discountType: 'percentage',
    discountValue: 15,
    minPurchase: 600,
    maxDiscount: 150,
    expiryDate: '2026-08-15',
    status: 'active'
  }
];

export const initialSliders: Slider[] = [
  {
    id: 'slid-1',
    title: 'Beat the Summer Heat',
    subtitle: 'Get 20% Off on AC Repairs & Filter Deep Cleaning',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    linkType: 'category',
    linkValue: 'cat-1',
    status: 'active'
  },
  {
    id: 'slid-2',
    title: 'Festive Home Sparkle',
    subtitle: 'Full House Deep Cleaning starting at just ₹1999',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
    linkType: 'category',
    linkValue: 'cat-6',
    status: 'active'
  }
];

export const initialReviews: Review[] = [
  {
    id: 'rev-1',
    orderId: 'ord-1002',
    customerName: 'Arijit Sen',
    providerName: 'Subir Dey',
    serviceName: 'Split AC Servicing',
    rating: 5,
    comment: 'Excellent AC cleaning. Subir arrived right on time and did a neat job with the water jet spray. Highly recommended!',
    date: '2026-07-18',
    status: 'approved'
  },
  {
    id: 'rev-2',
    orderId: 'ord-1003',
    customerName: 'Priyanka Ghosal',
    providerName: 'Rita Paul',
    serviceName: 'Bridal Facial Session',
    rating: 4,
    comment: 'Very professional home salon experience. The products used were of good quality. Rita was gentle and polite.',
    date: '2026-07-19',
    status: 'approved'
  },
  {
    id: 'rev-3',
    orderId: 'ord-1004',
    customerName: 'Sujit Roy',
    providerName: 'Madan Gopal',
    serviceName: 'Kitchen Sink Leaking Fix',
    rating: 3,
    comment: 'Fixed the leak, but was a bit late. The plumbing charges for the pipe part were slightly higher than expected.',
    date: '2026-07-20',
    status: 'approved'
  }
];

export const initialServices: ServiceItem[] = [
  {
    id: 'srv-1',
    categoryId: 'cat-1',
    categoryName: 'AC Mechanic',
    subCategoryId: 'sub-1',
    subCategoryName: 'Split AC Servicing',
    name: 'Advanced Split AC Servicing (Jet Wash)',
    price: 499,
    duration: '1 hr 15 mins',
    description: 'Full high-pressure power jet cleaning of filters, indoor coils, and outdoor condenser coils. Includes gas pressure check.',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    status: 'approved'
  },
  {
    id: 'srv-2',
    categoryId: 'cat-2',
    categoryName: 'Plumbing',
    subCategoryId: 'sub-3',
    subCategoryName: 'Water Pipe Leak Repair',
    name: 'Kitchen Sink Tap & Waste Pipe Fixing',
    price: 249,
    duration: '45 mins',
    description: 'Complete replacement or repair of sink taps, connection hoses, and underlying PVC waste pipe leaks.',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80',
    status: 'approved'
  },
  {
    id: 'srv-3',
    categoryId: 'cat-3',
    categoryName: 'Beautician',
    subCategoryId: 'sub-5',
    subCategoryName: 'Facial & Skin Care',
    name: 'O3+ Bridal Glow Doorstep Facial',
    price: 1499,
    duration: '1 hr 30 mins',
    description: 'Deep pore cleansing, scrub, serum treatment, and premium O3+ glow sheet mask massage.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    status: 'approved'
  },
  {
    id: 'srv-4',
    categoryId: 'cat-4',
    categoryName: 'Electrician',
    subCategoryId: 'sub-6',
    subCategoryName: 'Switchboard Repair',
    name: 'Complete Switchboard Replacement',
    price: 399,
    duration: '1 hour',
    description: 'Safe dismantling of old modular or non-modular switchboard and installing brand new unit up to 12 modules.',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    status: 'approved'
  },
  {
    id: 'srv-5',
    categoryId: 'cat-5',
    categoryName: 'Chefs & Cooks',
    subCategoryId: 'sub-temp-1',
    subCategoryName: 'Party Chef',
    name: 'Bengali Feast Home Cook - Up to 10 guests',
    price: 1999,
    duration: '4 hours',
    description: 'Professional chef prepares rich traditional Bengali meals (Luchi, Chholar Dal, Bhetki Paturi, Mutton Kosha) at your kitchen.',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
    status: 'pending'
  },
  {
    id: 'srv-6',
    categoryId: 'cat-6',
    categoryName: 'Home Cleaning',
    subCategoryId: 'sub-temp-2',
    subCategoryName: 'Full House Cleaning',
    name: '3BHK Eco-friendly Deep Cleaning',
    price: 2999,
    duration: '5 hours',
    description: 'Complete floor scrubbing, window pane cleaning, bathroom sanitization, and dust removal using eco-friendly solutions.',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
    status: 'pending'
  }
];

import { DEFAULT_MAN_AVATAR, DEFAULT_MALE_AVATAR, DEFAULT_FEMALE_AVATAR } from './data/avengers';

export const initialProviders: ServiceProvider[] = [
  {
    id: 'prov-1',
    name: 'Subir Dey',
    email: 'provider@durgapurhomes.com',
    phone: '9876543210',
    category: 'AC Mechanic',
    avatar: DEFAULT_MALE_AVATAR,
    gender: 'male',
    status: 'active',
    kycDocType: 'Aadhaar + PAN + Police Cert',
    kycDocNumber: 'UID: 4832 9912 3421',
    kycDocs: {
      aadhaarNumber: '4832 9912 3421',
      panNumber: 'BKPPD9821K',
      policeCertNumber: 'POL/DGP/2026/8841',
      optionalDocType: 'Voter Identity Card',
      optionalDocNumber: 'WB/18/042/109823'
    },
    rating: 4.9,
    balance: 2450,
    joinDate: '2026-03-10',
    jobsCompleted: 34
  },
  {
    id: 'prov-2',
    name: 'Rita Paul',
    email: 'rita.beauty@gmail.com',
    phone: '8765432109',
    category: 'Beautician',
    avatar: DEFAULT_FEMALE_AVATAR,
    gender: 'female',
    status: 'active',
    kycDocType: 'Aadhaar + PAN + Police Cert',
    kycDocNumber: 'UID: 7741 8832 9102',
    kycDocs: {
      aadhaarNumber: '7741 8832 9102',
      panNumber: 'CRPPP4412L',
      policeCertNumber: 'POL/DGP/2026/3312',
      optionalDocType: 'Driving License',
      optionalDocNumber: 'WB-39202600129'
    },
    rating: 4.7,
    balance: 1200,
    joinDate: '2026-04-15',
    jobsCompleted: 21
  },
  {
    id: 'prov-3',
    name: 'Madan Gopal',
    email: 'madan.plumb@rediffmail.com',
    phone: '7654321098',
    category: 'Plumbing',
    avatar: DEFAULT_MALE_AVATAR,
    gender: 'male',
    status: 'kyc_pending',
    kycDocType: 'Aadhaar + PAN + Police Cert',
    kycDocNumber: 'UID: 9912 4432 1109',
    kycDocs: {
      aadhaarNumber: '9912 4432 1109',
      panNumber: 'APZPG7742K',
      policeCertNumber: 'POL/DGP/2026/9902'
    },
    rating: 4.1,
    balance: 0,
    joinDate: '2026-07-15',
    jobsCompleted: 3
  },
  {
    id: 'prov-4',
    name: 'Kushal Bauri',
    email: 'kushal.electro@gmail.com',
    phone: '6543210987',
    category: 'Electrician',
    avatar: DEFAULT_MALE_AVATAR,
    gender: 'male',
    status: 'kyc_unverified',
    rating: 0,
    balance: 0,
    joinDate: '2026-07-20',
    jobsCompleted: 0
  },
  {
    id: 'prov-5',
    name: 'Bimal Hansda',
    email: 'bimal.clean@outlook.com',
    phone: '9988776655',
    category: 'Home Cleaning',
    avatar: DEFAULT_MALE_AVATAR,
    gender: 'male',
    status: 'banned',
    kycDocType: 'Aadhaar Card',
    kycDocNumber: '9902 3312 8821',
    rating: 2.8,
    balance: 150,
    joinDate: '2026-01-20',
    jobsCompleted: 14
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ord-1001',
    customerName: 'Samir Banerjee',
    customerPhone: '9434102931',
    customerEmail: 'samir.ban@gmail.com',
    serviceName: 'Advanced Split AC Servicing (Jet Wash)',
    serviceId: 'srv-1',
    zone: 'City Centre',
    address: 'A-21, Non-Company Housing, City Centre, Durgapur 713216',
    date: '2026-07-22',
    timeSlot: '10:00 AM - 12:00 PM',
    amount: 499,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: '2026-07-20T14:30:00Z'
  },
  {
    id: 'ord-1002',
    customerName: 'Arijit Sen',
    customerPhone: '9002341234',
    customerEmail: 'arijitsen@yahoo.com',
    serviceName: 'Advanced Split AC Servicing (Jet Wash)',
    serviceId: 'srv-1',
    zone: 'Bidhannagar',
    address: 'Sec-2A, Qtr 14/12, Bidhannagar, Durgapur 713212',
    date: '2026-07-18',
    timeSlot: '02:00 PM - 04:00 PM',
    amount: 499,
    status: 'completed',
    paymentStatus: 'successful',
    paymentMode: 'UPI',
    paymentConfirmedByPartner: true,
    paymentConfirmedAt: '2026-07-18 04:30 PM',
    providerId: 'prov-1',
    providerName: 'Subir Dey',
    expenses: [
      { item: 'High Pressure Water Pump Consumables', cost: 50 },
      { item: 'AC Filter Cleaner Liquid', cost: 40 }
    ],
    providerFeedback: 'AC Servicing completed. Both indoor and outdoor units deep cleaned. Cooling pressure is ideal.',
    createdAt: '2026-07-17T09:15:00Z'
  },
  {
    id: 'ord-1003',
    customerName: 'Priyanka Ghosal',
    customerPhone: '9123456789',
    customerEmail: 'priyagh@outlook.com',
    serviceName: 'O3+ Bridal Glow Doorstep Facial',
    serviceId: 'srv-3',
    zone: 'Benachity',
    address: 'Shanti Path, Behind J.M. Jewellers, Benachity, Durgapur 713213',
    date: '2026-07-19',
    timeSlot: '11:00 AM - 01:00 PM',
    amount: 1499,
    status: 'completed',
    paymentStatus: 'successful',
    providerId: 'prov-2',
    providerName: 'Rita Paul',
    expenses: [
      { item: 'O3+ Premium Facial Kit Disposable', cost: 350 }
    ],
    providerFeedback: 'Facial session completed successfully. Skin looks radiant. Customer was highly pleased.',
    createdAt: '2026-07-18T16:22:00Z'
  },
  {
    id: 'ord-1004',
    customerName: 'Sujit Roy',
    customerPhone: '8811223344',
    customerEmail: 'sujit.roy@gmail.com',
    serviceName: 'Kitchen Sink Tap & Waste Pipe Fixing',
    serviceId: 'srv-2',
    zone: 'Durgapur Steel Township (DSP)',
    address: 'Zone-A, Qtr 4/9, Steel Township, Durgapur 713204',
    date: '2026-07-20',
    timeSlot: '04:00 PM - 06:00 PM',
    amount: 249,
    status: 'completed',
    paymentStatus: 'successful',
    providerId: 'prov-3',
    providerName: 'Madan Gopal',
    expenses: [
      { item: 'PVC Waste Pipe & Teflon Tape', cost: 90 }
    ],
    providerFeedback: 'Successfully fixed waste pipe leakage. New connection hose installed.',
    createdAt: '2026-07-19T11:05:00Z'
  },
  {
    id: 'ord-1005',
    customerName: 'Rajesh Sharma',
    customerPhone: '7788990011',
    customerEmail: 'rajesh.sharma@gmail.com',
    serviceName: 'Complete Switchboard Replacement',
    serviceId: 'srv-4',
    zone: 'City Centre',
    address: 'Phase-2, Block-C, City Centre, Durgapur 713216',
    date: '2026-07-21',
    timeSlot: '09:00 AM - 11:00 AM',
    amount: 399,
    status: 'initiated',
    paymentStatus: 'initiated',
    createdAt: '2026-07-20T18:40:00Z'
  },
  {
    id: 'ord-1006',
    customerName: 'Megha Sen',
    customerPhone: '8877665544',
    customerEmail: 'megha.sen@gmail.com',
    serviceName: 'Kitchen Sink Tap & Waste Pipe Fixing',
    serviceId: 'srv-2',
    zone: 'Mamra',
    address: 'H/No 42, Mamra Bazar Road, Durgapur 713206',
    date: '2026-07-23',
    timeSlot: '01:00 PM - 03:00 PM',
    amount: 249,
    status: 'canceled',
    paymentStatus: 'rejected',
    createdAt: '2026-07-20T10:15:00Z'
  }
];

export const initialUsers: CustomerUser[] = [
  {
    id: 'user-1',
    name: 'Samir Banerjee',
    email: 'samir.ban@gmail.com',
    phone: '9434102931',
    avatar: DEFAULT_MALE_AVATAR,
    gender: 'male',
    status: 'active',
    joinDate: '2026-02-12',
    ordersCount: 5
  },
  {
    id: 'user-2',
    name: 'Arijit Sen',
    email: 'arijitsen@yahoo.com',
    phone: '9002341234',
    avatar: DEFAULT_MALE_AVATAR,
    gender: 'male',
    status: 'active',
    joinDate: '2026-03-01',
    ordersCount: 8
  },
  {
    id: 'user-3',
    name: 'Priyanka Ghosal',
    email: 'priyagh@outlook.com',
    phone: '9123456789',
    avatar: DEFAULT_FEMALE_AVATAR,
    gender: 'female',
    status: 'active',
    joinDate: '2026-05-18',
    ordersCount: 3
  },
  {
    id: 'user-4',
    name: 'Rohan Chanda',
    email: 'rohan.banned@gmail.com',
    phone: '9933221100',
    avatar: DEFAULT_MALE_AVATAR,
    gender: 'male',
    status: 'banned',
    joinDate: '2026-01-10',
    ordersCount: 2
  }
];

export const initialPayments: PaymentTransaction[] = [
  {
    id: 'pay-101',
    orderId: 'ord-1002',
    userType: 'customer',
    userName: 'Arijit Sen',
    amount: 499,
    method: 'UPI (GPay)',
    status: 'successful',
    date: '2026-07-18 15:45'
  },
  {
    id: 'pay-102',
    orderId: 'ord-1003',
    userType: 'customer',
    userName: 'Priyanka Ghosal',
    amount: 1499,
    method: 'Credit Card',
    status: 'successful',
    date: '2026-07-19 13:10'
  },
  {
    id: 'pay-103',
    orderId: 'ord-1004',
    userType: 'customer',
    userName: 'Sujit Roy',
    amount: 249,
    method: 'Cash on Delivery',
    status: 'approved',
    date: '2026-07-20 18:15'
  },
  {
    id: 'pay-104',
    orderId: 'ord-1005',
    userType: 'customer',
    userName: 'Rajesh Sharma',
    amount: 399,
    method: 'UPI',
    status: 'initiated',
    date: '2026-07-20 18:41'
  }
];

export const initialWithdrawals: WithdrawalRequest[] = [
  {
    id: 'with-201',
    providerId: 'prov-1',
    providerName: 'Subir Dey',
    amount: 1500,
    method: 'Bank Transfer',
    accountDetails: 'SBI A/C: 30219904123, IFSC: SBIN0000074',
    status: 'approved',
    date: '2026-07-15'
  },
  {
    id: 'with-202',
    providerId: 'prov-2',
    providerName: 'Rita Paul',
    amount: 800,
    method: 'GPay Phone Number',
    accountDetails: 'UPI: rita.beauty@okaxis',
    status: 'pending',
    date: '2026-07-20'
  }
];

export const initialNotifications: UserNotification[] = [
  {
    id: 'not-301',
    targetType: 'all_users',
    title: 'Monsoon Cleanliness Splash!',
    message: 'Monsoon special: Get 15% discount on home sanitization using code MONSOON50.',
    sender: 'Admin (Durgapur Homes)',
    date: '2026-07-19'
  },
  {
    id: 'not-302',
    targetType: 'all_providers',
    title: 'KYC Updates Mandatory',
    message: 'Please complete your Aadhaar or PAN card verification to avoid profile suspension.',
    sender: 'Executive (Durgapur Homes Operations)',
    date: '2026-07-20'
  }
];

export const initialLoginLogs: LoginLog[] = [
  {
    id: 'log-501',
    userId: 'admin-1',
    userName: 'Durgapur Homes Owner (Admin)',
    userType: 'staff',
    ipAddress: '192.168.1.5',
    device: 'Chrome on Windows 11',
    date: '2026-07-21 08:30:12'
  },
  {
    id: 'log-502',
    userId: 'exec-1',
    userName: 'Executive Team (Joydev)',
    userType: 'staff',
    ipAddress: '192.168.1.12',
    device: 'Safari on macOS',
    date: '2026-07-21 09:12:45'
  },
  {
    id: 'log-503',
    userId: 'prov-1',
    userName: 'Subir Dey (AC Mechanic)',
    userType: 'provider',
    ipAddress: '103.221.11.90',
    device: 'Chrome on Android',
    date: '2026-07-20 10:05:00'
  }
];

export const defaultSettings: SystemSettings = {
  general: {
    siteName: 'Durgapur Fix Service Dashboard',
    contactEmail: 'contact@durgapurfix.com',
    contactPhone: '+91 9434 221100',
    address: 'City Centre, Near Junction Mall, Durgapur, West Bengal, Pin: 713216',
    currency: '₹',
    commissionRate: 15,
    enablePlatformFee: true,
    platformFee: 49,
    enableGstTax: true,
    gstTaxRate: 5
  },
  logo: {
    primaryLogo: 'Durgapur Fix Platform',
    favicon: '🔧'
  },
  configuration: {
    maintenanceMode: false,
    emailVerification: true,
    smsVerification: false,
    kycMandatory: true
  },
  appointmentSettings: {
    maxAdvanceBookingDays: 7,
    sameDayBookingLeadTimeHours: 2,
    enableSameDayBooking: true,
    enableSundayBooking: true,
    autoConfirmSlots: false,
    timeSlots: [
      { id: 'slot-1', startTime: '08:00 AM', endTime: '10:00 AM', label: '08:00 AM - 10:00 AM', isActive: true, maxCapacity: 10 },
      { id: 'slot-2', startTime: '10:00 AM', endTime: '12:00 PM', label: '10:00 AM - 12:00 PM', isActive: true, maxCapacity: 15 },
      { id: 'slot-3', startTime: '12:00 PM', endTime: '02:00 PM', label: '12:00 PM - 02:00 PM', isActive: true, maxCapacity: 12 },
      { id: 'slot-4', startTime: '02:00 PM', endTime: '04:00 PM', label: '02:00 PM - 04:00 PM', isActive: true, maxCapacity: 15 },
      { id: 'slot-5', startTime: '04:00 PM', endTime: '06:00 PM', label: '04:00 PM - 06:00 PM', isActive: true, maxCapacity: 15 },
      { id: 'slot-6', startTime: '06:00 PM', endTime: '08:00 PM', label: '06:00 PM - 08:00 PM', isActive: true, maxCapacity: 8 }
    ]
  },
  helpCenter: {
    supportPhone: '+91 9434 221100',
    supportEmail: 'support@durgapurfix.com',
    whatsappNumber: '+91 9434 221100',
    supportHours: '8:00 AM - 9:00 PM (Monday - Sunday)',
    helpDeskMessage: 'Need quick help with your service booking, pricing, or technician arrival? Our local support team in Durgapur is here for you.',
    faqs: [
      {
        id: 'faq-1',
        question: 'How do I track my technician\'s arrival in Durgapur?',
        answer: 'Once your booking is confirmed, you will receive real-time status updates and SMS/Push notifications. You can also view the assigned technician\'s name and contact number directly under your My Orders screen.',
        category: 'Bookings'
      },
      {
        id: 'faq-2',
        question: 'How does the 30-Day Service Warranty work?',
        answer: 'All repair and servicing work completed through Durgapur Fix comes with a 30-day service warranty. If the same issue recurs within 30 days, we will send a technician for inspection free of charge.',
        category: 'Warranty & Quality'
      },
      {
        id: 'faq-3',
        question: 'Can I reschedule or cancel my appointment?',
        answer: 'Yes! You can reschedule or cancel your appointment free of charge up to 2 hours prior to your scheduled arrival time window via the app or by calling our Help Center.',
        category: 'Cancellations'
      },
      {
        id: 'faq-4',
        question: 'What payment methods are supported?',
        answer: 'We accept Cash After Service (COD), UPI (Google Pay, PhonePe, Paytm), Net Banking, and Debit/Credit cards.',
        category: 'Payments'
      }
    ]
  },
  policyPages: {
    aboutUs: 'Durgapur Fix is the premier home service aggregator platform operating locally in the beautiful steel city of Durgapur. Our mission is to bridge the gap between quality domestic service professionals and homeowners, providing a reliable, safe, and professional experience.',
    termsConditions: 'All service providers registered with Durgapur Fix must abide by the local guidelines, maintain high safety standards, and present genuine KYC documentation before starting jobs. Payments are handled via secure online methods or direct COD as approved by the admin team.',
    privacyPolicy: 'We value our customers\' and service providers\' privacy. Personal information like phone numbers and residential addresses are only shared once an order is allocated and confirmed, ensuring mutual trust and security.',
    refundPolicy: 'In case of service dissatisfaction, customers can register a complaint within 24 hours. Durgapur Fix will re-assign an executive to verify and initiate refund or corrective re-work as needed.',
    receiptTerms: '1. All home service warranties are valid for 30 days from completion date.\n2. This is a computer-generated official tax invoice issued by Durgapur Fix Services.\n3. For support or invoice inquiries, contact: support@durgapurfix.com'
  },
  seo: {
    metaTitle: 'Durgapur Fix - Best Home Services in Durgapur',
    metaDescription: 'Find expert plumbers, ac mechanics, beauticians, and electric experts near City Centre, Benachity, and Bidhannagar in Durgapur.',
    keywords: 'Durgapur, Home Services, Plumber Durgapur, AC repair Durgapur, Beautician Durgapur, Cleaner Durgapur'
  }
};
