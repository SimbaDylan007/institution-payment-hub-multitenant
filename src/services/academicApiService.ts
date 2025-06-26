
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:8080/api/academic";

// Generic fetch function with error handling
async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    toast.error(error instanceof Error ? error.message : "Network error");
    throw error;
  }
}

// Subject API functions
export async function getAllSubjects() {
  return fetchWithErrorHandling(`${API_BASE_URL}/subjects`);
}

export async function getSubjectsByGrade(grade: string) {
  return fetchWithErrorHandling(`${API_BASE_URL}/subjects/grade/${grade}`);
}

export async function createSubject(subject: any) {
  return fetchWithErrorHandling(`${API_BASE_URL}/subjects`, {
    method: "POST",
    body: JSON.stringify(subject),
  });
}

export async function updateSubject(id: number, subject: any) {
  return fetchWithErrorHandling(`${API_BASE_URL}/subjects/${id}`, {
    method: "PUT",
    body: JSON.stringify(subject),
  });
}

// Timetable API functions
export async function getTimetableByClass(grade: string, section: string) {
  return fetchWithErrorHandling(`${API_BASE_URL}/timetable/class/${grade}/${section}`);
}

export async function getTimetableByTeacher(teacherId: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/timetable/teacher/${teacherId}`);
}

export async function createTimetableEntry(timetable: any) {
  return fetchWithErrorHandling(`${API_BASE_URL}/timetable`, {
    method: "POST",
    body: JSON.stringify(timetable),
  });
}

// Grade API functions
export async function getStudentGrades(studentId: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/grades/student/${studentId}`);
}

export async function getStudentGradesByYear(studentId: number, academicYear: string) {
  return fetchWithErrorHandling(`${API_BASE_URL}/grades/student/${studentId}/year/${academicYear}`);
}

export async function addGrade(grade: any) {
  return fetchWithErrorHandling(`${API_BASE_URL}/grades`, {
    method: "POST",
    body: JSON.stringify(grade),
  });
}

// Exam API functions
export async function getExamsByClass(grade: string, section: string) {
  return fetchWithErrorHandling(`${API_BASE_URL}/exams/class/${grade}/${section}`);
}

export async function getUpcomingExams() {
  return fetchWithErrorHandling(`${API_BASE_URL}/exams/upcoming`);
}

export async function scheduleExam(exam: any) {
  return fetchWithErrorHandling(`${API_BASE_URL}/exams`, {
    method: "POST",
    body: JSON.stringify(exam),
  });
}

export async function updateExamStatus(examId: number, status: string) {
  return fetchWithErrorHandling(`${API_BASE_URL}/exams/${examId}/status?status=${status}`, {
    method: "PUT",
  });
}
