// src/config/academicConfig.ts

// This file is the single source of truth for academic periods.
// To add a new year, simply add it to the 'academicYears' array.
// To change semester names or add more, update the 'semesters' array.

export const academicYears: string[] = [
    "2032-2033",
    "2031-2032",
    "2030-2031",
    "2028-2029",
    "2027-2028",
    "2025-2026",
    "2024-2025",
    "2023-2024",
    "2022-2023",
];

export interface Semester {
    value: string;  // The value sent to the backend (e.g., "SEMESTER_1")
    label: string;  // The text displayed to the user (e.g., "Semester 1")
}

export const semesters: Semester[] = [
    { value: "SEMESTER_1", label: "Term 1" },
    { value: "SEMESTER_2", label: "Term 2" },
    { value: "SEMESTER_3", label: "Term 3" },
];

// We can also export the current default year and semester from here
export const currentAcademicYear = academicYears[0]; // Defaults to the latest year
export const currentSemester = semesters[0].value; // Defaults to the first semester