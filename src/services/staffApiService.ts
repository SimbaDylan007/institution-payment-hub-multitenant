
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:8080/api/staff";

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

// Staff API functions
export async function getAllStaff() {
  return fetchWithErrorHandling(`${API_BASE_URL}`);
}

export async function getStaffById(id: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/${id}`);
}

export async function createStaff(staff: any) {
  return fetchWithErrorHandling(`${API_BASE_URL}`, {
    method: "POST",
    body: JSON.stringify(staff),
  });
}

export async function updateStaff(id: number, staff: any) {
  return fetchWithErrorHandling(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(staff),
  });
}

export async function deleteStaff(id: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function getStaffByDepartment(department: string) {
  return fetchWithErrorHandling(`${API_BASE_URL}/department/${department}`);
}

export async function getStaffByStatus(status: string) {
  return fetchWithErrorHandling(`${API_BASE_URL}/status/${status}`);
}

// Attendance API functions
export async function getStaffAttendance(staffId: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/${staffId}/attendance`);
}

export async function markAttendance(staffId: number, attendance: any) {
  return fetchWithErrorHandling(`${API_BASE_URL}/${staffId}/attendance`, {
    method: "POST",
    body: JSON.stringify(attendance),
  });
}

// Leave request API functions
export async function getStaffLeaveRequests(staffId: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/${staffId}/leave-requests`);
}

export async function submitLeaveRequest(staffId: number, request: any) {
  return fetchWithErrorHandling(`${API_BASE_URL}/${staffId}/leave-requests`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function approveLeaveRequest(requestId: number, approvedBy: string) {
  return fetchWithErrorHandling(`${API_BASE_URL}/leave-requests/${requestId}/approve?approvedBy=${approvedBy}`, {
    method: "PUT",
  });
}

export async function getLeaveRequestsByStatus(status: string) {
  return fetchWithErrorHandling(`${API_BASE_URL}/leave-requests/status/${status}`);
}
