import { apiFetch } from "@/utils/apiClient"; // 1. Import the centralized apiFetch

const API_BASE_URL = "http://194.163.141.113:8082/api/staff";

// 2. The local `fetchWithErrorHandling` function has been removed.

/**
 * A helper to process the Response from apiFetch. It handles JSON parsing
 * and throws a detailed error if the request was not successful.
 * @param response The Response object from the fetch call.
 * @returns The parsed JSON data.
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

  // Handle successful requests that might not return a body (e.g., DELETE, some PUTs)
  if (response.status === 204) {
    return true as T; // Return a truthy value to indicate success
  }

  return response.json();
}


// --- Staff API functions (Refactored) ---

export async function getAllStaff() {
  const response = await apiFetch(`${API_BASE_URL}`);
  return processApiResponse(response);
}

export async function getStaffById(id: number) {
  const response = await apiFetch(`${API_BASE_URL}/${id}`);
  return processApiResponse(response);
}

export async function createStaff(staff: any) {
  const response = await apiFetch(`${API_BASE_URL}`, {
    method: "POST",
    body: JSON.stringify(staff),
  });
  return processApiResponse(response);
}

export async function updateStaff(id: number, staff: any) {
  const response = await apiFetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(staff),
  });
  return processApiResponse(response);
}

export async function deleteStaff(id: number) {
  const response = await apiFetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });
  return processApiResponse(response);
}

export async function getStaffByDepartment(department: string) {
  const response = await apiFetch(`${API_BASE_URL}/department/${department}`);
  return processApiResponse(response);
}

export async function getStaffByStatus(status: string) {
  const response = await apiFetch(`${API_BASE_URL}/status/${status}`);
  return processApiResponse(response);
}


// --- Attendance API functions (Refactored) ---

export async function getStaffAttendance(staffId: number) {
  const response = await apiFetch(`${API_BASE_URL}/${staffId}/attendance`);
  return processApiResponse(response);
}

export async function markAttendance(staffId: number, attendance: any) {
  const response = await apiFetch(`${API_BASE_URL}/${staffId}/attendance`, {
    method: "POST",
    body: JSON.stringify(attendance),
  });
  return processApiResponse(response);
}


// --- Leave request API functions (Refactored) ---

export async function getStaffLeaveRequests(staffId: number) {
  const response = await apiFetch(`${API_BASE_URL}/${staffId}/leave-requests`);
  return processApiResponse(response);
}

export async function submitLeaveRequest(staffId: number, request: any) {
  const response = await apiFetch(`${API_BASE_URL}/${staffId}/leave-requests`, {
    method: "POST",
    body: JSON.stringify(request),
  });
  return processApiResponse(response);
}

export async function approveLeaveRequest(requestId: number, approvedBy: string) {
  const url = `${API_BASE_URL}/leave-requests/${requestId}/approve?approvedBy=${approvedBy}`;
  const response = await apiFetch(url, {
    method: "PUT",
  });
  return processApiResponse(response);
}

export async function getLeaveRequestsByStatus(status: string) {
  const response = await apiFetch(`${API_BASE_URL}/leave-requests/status/${status}`);
  return processApiResponse(response);
}