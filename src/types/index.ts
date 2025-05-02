
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface PaymentAlert {
  id: string;
  amount: number;
  date: {
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
  };
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
  studentName?: string; // Added for student info
  studentSurname?: string; // Added for student info
  regNumber?: string; // Added for student reg number
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

export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface SearchFilters {
  startDate?: Date;
  endDate?: Date;
  regNumber?: string;
  minAmount?: number;
  maxAmount?: number;
  name?: string;
  surname?: string;
}
