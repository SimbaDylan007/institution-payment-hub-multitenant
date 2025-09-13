import { apiFetch } from "@/utils/apiClient"; // 1. Import the centralized apiFetch

const API_BASE_URL = "http://PacheduJuniorSchool-env-1.eba-avekqyut.eu-north-1.elasticbeanstalk.com/api/students";

// 2. The local `fetchWithErrorHandling` function has been removed.

/**
 * A helper to process the Response from apiFetch. It handles JSON parsing
 * and throws a detailed error if the request was not successful.
 * @param response The Response object from the fetch call.
 * @returns The parsed JSON data or a success indicator for empty responses.
 */
async function processApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Request failed with status: ${response.status}`;
    try {
      // Attempt to get a more specific error from the API's response body
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // The error response was not JSON, so we stick with the status code message.
    }
    throw new Error(errorMessage);
  }

  // Handle successful requests that might not return a body (e.g., DELETE with 204 No Content)
  if (response.status === 204) {
    return true as T; // Return a truthy value to indicate success
  }

  return response.json();
}


// --- Student API functions (Refactored) ---

export async function getAllStudents() {
  const response = await apiFetch(`${API_BASE_URL}`);
  return processApiResponse(response);
}

export async function getStudentById(id: number) {
  const response = await apiFetch(`${API_BASE_URL}/${id}`);
  return processApiResponse(response);
}

export async function createStudent(student: any) {
  const response = await apiFetch(`${API_BASE_URL}`, {
    method: "POST",
    body: JSON.stringify(student),
  });
  return processApiResponse(response);
}

export async function updateStudent(id: number, student: any) {
  const response = await apiFetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(student),
  });
  return processApiResponse(response);
}

export async function deleteStudent(id: number) {
  const response = await apiFetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });
  return processApiResponse(response);
}

export async function getStudentsByStatus(status: string) {
  const response = await apiFetch(`${API_BASE_URL}/status/${status}`);
  return processApiResponse(response);
}

export async function getStudentsByGrade(grade: string) {
  const response = await apiFetch(`${API_BASE_URL}/grade/${grade}`);
  return processApiResponse(response);
}

export async function searchStudents(query: string) {
  const response = await apiFetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
  return processApiResponse(response);
}


// --- Guardian API functions (Refactored) ---

export async function getStudentGuardians(studentId: number) {
  const response = await apiFetch(`${API_BASE_URL}/${studentId}/guardians`);
  return processApiResponse(response);
}

export async function addGuardian(studentId: number, guardian: any) {
  const response = await apiFetch(`${API_BASE_URL}/${studentId}/guardians`, {
    method: "POST",
    body: JSON.stringify(guardian),
  });
  return processApiResponse(response);
}


// --- Medical records API functions (Refactored) ---

export async function getStudentMedicalRecords(studentId: number) {
  const response = await apiFetch(`${API_BASE_URL}/${studentId}/medical-records`);
  return processApiResponse(response);
}

export async function addMedicalRecord(studentId: number, record: any) {
  const response = await apiFetch(`${API_BASE_URL}/${studentId}/medical-records`, {
    method: "POST",
    body: JSON.stringify(record),
  });
  return processApiResponse(response);
}


// --- Academic records API functions (Refactored) ---

export async function getStudentAcademicRecords(studentId: number) {
  const response = await apiFetch(`${API_BASE_URL}/${studentId}/academic-records`);
  return processApiResponse(response);
}

export async function addAcademicRecord(studentId: number, record: any) {
  const response = await apiFetch(`${API_BASE_URL}/${studentId}/academic-records`, {
    method: "POST",
    body: JSON.stringify(record),
  });
  return processApiResponse(response);
}