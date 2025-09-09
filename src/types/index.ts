
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  username?: string;
}

export interface LoginCredentials {
  username?: string;
  email?: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  username?: string;
}

export interface Timestamp {
  date: number;
  day: number;
  hours: number;
  minutes: number;
  month: number;
  nanos: number;
  seconds: number;
  time: number;
  timezoneOffset: number;
  year: number;
}

export interface PaymentAlert {
  id: string;
  amount: number;
  currency?: string;
  date: Timestamp | string;
  narrative: string;
  nr1?: string;
  nr2?: string;
  nr3?: string;
  nr4?: string;
  picked: number;
  reference: string;
  source: string;
  status: string;
  tcd?: string;
  transactionDate: string;
  studentName?: string; // Derived from narrative or nr1
  studentSurname?: string; // Derived from narrative or nr1
  regNumber?: string; // Derived from reference
}

export interface PickPaymentRequest {
  institutionId: string;
  password: string;
}

export interface ErrorDetails {
  details?: string;
  message: string;
  timestamp: string;
}

export interface FeeType {
  id: number;
  name: string;
  defaultAmount: number;
  description: string;
  currency: 'USD' | 'ZWG';
}

export interface LedgerEntry {
  id: number;
  transactionType: 'DEBIT' | 'CREDIT';
  amount: number;
  description: string;
  transactionDate: string;
  currency: 'USD' | 'ZWG';
  academicYear?: string;
  semester?: string;
}

export interface CurrencyBalance {
  balances: { [key: string]: number }; // e.g., { "USD": -9450.00, "ZWG": -10.00 }
}

export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface SearchFiltersType {
  searchTerm?: string;
  startDate?: Date;
  endDate?: Date;
  regNumber?: string;
  minAmount?: number;
  maxAmount?: number;
  name?: string;
  surname?: string;
  status?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ErrorDetails;
  status: number;
}

export interface StudentRegistrationRequest {
  billerId: string;
  customerAccount: string;
  customerAccountDetails1: string;
  customerAccountDetails2: string;
  customerName: string;
}

export interface StudentRegistrationId {
  billerId: string;
  customerAccount: string;
}

export interface StudentRegistration {
  id: StudentRegistrationId;
  customerAccountDetails1: string;
  customerAccountDetails2: string;
  customerName: string;
}

export interface StudentBalance {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  currentGrade: string;
  balances: { [key: string]: number };
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  number: number; // Current page number (0-indexed)
  totalElements: number;
  size: number;
}
