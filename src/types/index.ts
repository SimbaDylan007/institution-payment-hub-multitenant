
// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
//   username?: string;
//   institutionId: number | null;
//   institutionName: string | null;
//   institution?: Institution;
// }
export interface Role {
    id: number;
    name: string;
}

export interface GradeDTO {
    studentId: string;
    subjectId: string; // Or subjectCode, depending on your backend DTO
    assessmentType: string;
    marksObtained: number;
    maxMarks: number;
    letterGrade: string;
    academicYear: string;
    semester: string;
}

export interface Grade {
    id: number;
    student: { studentId: string };
    subject: { code: string; name: string; };
    assessmentType: string;
    marksObtained: number;
    maxMarks: number;
    letterGrade: string;
    academicYear: string;
    semester: string;
    institution?: Institution; // For multi-tenancy
}

export interface User {
    id: number; // The backend sends a number for the ID
    name: string;
    email: string;
    enabled: boolean; // <-- ADDED: Matches the backend 'enabled' field
    role: string;
    username?: string;
    // Tenancy fields
    institutionId?: number | null;
    institutionName?: string | null;
    institution?: Institution;
}

export interface Staff {
    id?: number;
    firstName: string;
    lastName: string;
    employeeId: string;
    email: string;
    phone?: string;
    dateOfBirth?: string; // Should be a "YYYY-MM-DD" string
    gender?: string;
    address?: string;
    department?: string;
    position?: string;
    employmentStatus: string;
    hireDate?: string; // Expect "YYYY-MM-DD" string from backend
    salary?: string;
    qualifications?: string;
    specializations?: string;
    institution?: Institution;
}

export interface Subject {
    id?: number;
    name: string;
    code: string;
    description?: string;
    credits?: number;
    grade: string;
    isActive: boolean;
    institution?: Institution;
}

// This corresponds to your Timetable.java entity
export interface TimetableEntry {
    id?: number;
    subject: string;
    teacher: string; // The backend likely resolves this to a simple string name
    grade: string;
    section: string;
    dayOfWeek: string;
    startTime: string; // "HH:mm:ss"
    endTime: string;   // "HH:mm:ss"
    room: string;
    academicYear: string;
    institution?: Institution;
}

// This corresponds to the DTO used for creation by the form
export interface CreateTimetableEntryRequest {
    subject: string;
    teacher: string;
    grade: string;
    section: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room: string;
    academicYear: string;
    institutionId?: number; // Optional ID for super-admins
}

export interface Institution {
    id: number;
    name: string;
    address?: string;
}

export interface StudentCategory {
    id: number;
    name: string;
    institution?: Institution;
}

export interface LoginCredentials {
  username?: string;
  email?: string;
  password: string;
}

export interface Student {
    id?: number;
    studentId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    currentGrade: string;
    section?: string;
    dateOfBirth: string;
    gender: string;
    address?: string;
    enrollmentDate: string;
    enrollmentStatus: string;
    category: StudentCategory;
    institution?: Institution; // <-- Add this optional property
}

export interface Facility {
    id?: number;
    name: string;
    description?: string;
    type: string;
    capacity?: number;
    location?: string;
    status: string;
    equipment?: string;
    institution?: Institution;
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
    feeType: {
        id: number;
        name: string;
        description:string;
        default_amount:string;
        currency:string;
    } | null; // It can be null for payments or generic charges
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
