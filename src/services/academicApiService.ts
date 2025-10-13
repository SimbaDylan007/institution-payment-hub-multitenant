import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient"; // 1. Import the centralized apiFetch

const API_BASE_URL = "http://localhost:8082/api/academic";

// 2. The local fetchWithErrorHandling function is no longer needed and has been removed.

// A helper function to process the response from apiFetch
async function processResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Try to parse a specific error message from the API, otherwise use a generic one
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    } catch (e) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  }
  // If the response is OK, parse and return the JSON body
  return await response.json();
}


// --- Subject API functions ---

export async function getAllSubjects() {
  const response = await apiFetch(`${API_BASE_URL}/subjects`);
  return processResponse(response);
}

export async function getSubjectsByGrade(grade: string) {
  const response = await apiFetch(`${API_BASE_URL}/subjects/grade/${grade}`);
  return processResponse(response);
}

export async function createSubject(subject: any) {
  const response = await apiFetch(`${API_BASE_URL}/subjects`, {
    method: "POST",
    body: JSON.stringify(subject),
  });
  return processResponse(response);
}

export async function updateSubject(id: number, subject: any) {
  const response = await apiFetch(`${API_BASE_URL}/subjects/${id}`, {
    method: "PUT",
    body: JSON.stringify(subject),
  });
  return processResponse(response);
}


// --- Timetable API functions ---

export async function getTimetableByClass(grade: string, section: string) {
  const response = await apiFetch(`${API_BASE_URL}/timetable/class/${grade}/${section}`);
  return processResponse(response);
}

export async function getTimetableByTeacher(teacherId: number) {
  const response = await apiFetch(`${API_BASE_URL}/timetable/teacher/${teacherId}`);
  return processResponse(response);
}

export async function createTimetableEntry(timetable: any) {
  const response = await apiFetch(`${API_BASE_URL}/timetable`, {
    method: "POST",
    body: JSON.stringify(timetable),
  });
  return processResponse(response);
}


// --- Grade API functions ---

export async function getStudentGrades(studentId: number) {
  const response = await apiFetch(`${API_BASE_URL}/grades/student/${studentId}`);
  return processResponse(response);
}

export async function getStudentGradesByYear(studentId: number, academicYear: string) {
  const response = await apiFetch(`${API_BASE_URL}/grades/student/${studentId}/year/${academicYear}`);
  return processResponse(response);
}

export async function addGrade(grade: any) {
  const response = await apiFetch(`${API_BASE_URL}/grades`, {
    method: "POST",
    body: JSON.stringify(grade),
  });
  return processResponse(response);
}


// --- Exam API functions ---

export async function getExamsByClass(grade: string, section: string) {
  const response = await apiFetch(`${API_BASE_URL}/exams/class/${grade}/${section}`);
  return processResponse(response);
}

export async function getUpcomingExams() {
  const response = await apiFetch(`${API_BASE_URL}/exams/upcoming`);
  return processResponse(response);
}

export async function scheduleExam(exam: any) {
  const response = await apiFetch(`${API_BASE_URL}/exams`, {
    method: "POST",
    body: JSON.stringify(exam),
  });
  return processResponse(response);
}

export async function updateExamStatus(examId: number, status: string) {
  const response = await apiFetch(`${API_BASE_URL}/exams/${examId}/status?status=${status}`, {
    method: "PUT",
    // No body needed for this request
  });
  return processResponse(response);
}