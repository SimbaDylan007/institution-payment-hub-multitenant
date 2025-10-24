// src/types.ts


/**
 * Represents the main school or institution entity.
 * This matches the Institution.java model on the backend.
 */
export interface Institution {
    id: number;
    name: string;
    address?: string;
    schoolEmail?: string; // <-- ADDED to match backend
}

/**
 * --- ADDED: Represents a specific bank account linked to an Institution. ---
 * This matches the InstitutionAccount.java model.
 * The nested 'institution' object is crucial for the UI logic.
 */
export interface InstitutionAccount {
    id: number;
    institutionId: string; // e.g., "METHODIST-ZWG"
    accountName: string;
    institution: Institution; // This nesting is critical for the UI
}

/**
 * --- CORRECTED: Represents a payment alert from the bank API. ---
 * Updated to include the parent Institution for multitenancy.
 */
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
    studentName?: string;
    studentSurname?: string;
    regNumber?: string;
    institution?: Institution;
}



export interface Role {
    id: number;
    name: string;
}

export interface GradeDTO {
    studentId: string;
    subjectId: string;
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
    institution?: Institution;
}

export interface User {
    id: number;
    name: string;
    email: string;
    enabled: boolean;
    role: string;
    username?: string;
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
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    department?: string;
    position?: string;
    employmentStatus: string;
    hireDate?: string;
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

export interface TimetableEntry {
    id?: number;
    subject: string;
    teacher: string;
    grade: string;
    section: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room: string;
    academicYear: string;
    institution?: Institution;
}

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
    institutionId?: number;
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
    institution?: Institution;
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
    } | null;
}

export interface CurrencyBalance {
    balances: { [key: string]: number };
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
    number: number;
    totalElements: number;
    size: number;
}