export const PLANS = [
  { id: 'starter', name: 'Starter', monthlyPrice: 999, annualPrice: 799, icon: '🌱', students: 200, admins: 3, faculty: 15, isHot: false, features: ['Manage 200 Students', '3 Admins & 15 Faculty', 'Basic Attendance', 'Collect Fees', 'Public Web Page'] },
  { id: 'basic', name: 'Basic', monthlyPrice: 2499, annualPrice: 1999, icon: '📘', students: 800, admins: 8, faculty: 60, isHot: false, features: ['Manage 800 Students', '8 Admins & 60 Faculty', 'Faculty Attendance', 'Exams & Timetable', 'Financial Reporting'] },
  { id: 'professional', name: 'Professional', monthlyPrice: 5999, annualPrice: 4799, icon: '🚀', students: 3000, admins: 20, faculty: 200, isHot: true, features: ['Manage 3000 Students', '20 Admins & 200 Faculty', 'AI Performance Analytics', 'Biometric Integration', 'Priority Support'] },
  { id: 'enterprise', name: 'Enterprise', monthlyPrice: 12999, annualPrice: 10399, icon: '🏛', students: 'Unlimited', admins: 'Unlimited', faculty: 'Unlimited', isHot: false, features: ['Unlimited Everything', 'Dedicated Account Manager', 'Custom App Branding', 'SLA Uptime Guarantee', 'Free Data Migration'] },
];

export const ADDONS = [
  { name: 'Extra Student Pack', desc: '+100 students', price: '₹299/mo' },
  { name: 'Extra Faculty Pack', desc: '+10 faculty', price: '₹199/mo' },
  { name: 'SMS Bundle', desc: '5,000 SMS credits', price: '₹499/mo' },
  { name: 'White-label App', desc: 'Your own branding', price: '₹999/mo + setup' },
  { name: 'Biometric Integration', desc: 'Connect scanners', price: '₹499/mo + setup' },
  { name: 'Custom Domain SSL', desc: 'For Public Page', price: '₹999/yr' }
];
