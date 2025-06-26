
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:8080/api/students";

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

// Student API functions
export async function getAllStudents() {
  return fetchWithErrorHandling(`${API_BASE_URL}`);
}

export async function getStudentById(id: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/${id}`);
}

export async function createStudent(student: any) {
  return fetchWithErrorHandling(`${API_BASE_URL}`, {
    method: "POST",
    body: JSON.stringify(student),
  });
}

export async function updateStudent(id: number, student: any) {
  return fetchWithErrorHandling(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(student),
  });
}

export async function deleteStudent(id: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function getStudentsByStatus(status: string) {
  return fetchWithErrorHandling(`${API_BASE_URL}/status/${status}`);
}

export async function getStudentsByGrade(grade: string) {
  return fetchWithErrorHandling(`${API_BASE_URL}/grade/${grade}`);
}

export async function searchStudents(query: string) {
  return fetchWithErrorHandling(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
}

// Guardian API functions
export async function getStudentGuardians(studentId: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/${studentId}/guardians`);
}

export async function addGuardian(studentId: number, guardian: any) {
  return fetchWithErrorHandling(`${API_BASE_URL}/${studentId}/guardians`, {
    method: "POST",
    body: JSON.stringify(guardian),
  });
}

// Medical records API functions
export async function getStudentMedicalRecords(studentId: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/${studentId}/medical-records`);
}

export async function addMedicalRecord(studentId: number, record: any) {
  return fetchWithErrorHandling(`${API_BASE_URL}/${studentId}/medical-records`, {
    method: "POST",
    body: JSON.stringify(record),
  });
}

// Academic records API functions
export async function getStudentAcademicRecords(studentId: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/${studentId}/academic-records`);
}

export async function addAcademicRecord(studentId: number, record: any) {
  return fetchWithErrorHandling(`${API_BASE_URL}/${studentId}/academic-records`, {
    method: "POST",
    body: JSON.stringify(record),
  });
}
