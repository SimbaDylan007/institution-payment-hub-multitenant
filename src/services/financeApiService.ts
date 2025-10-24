import { apiFetch } from "@/utils/apiClient"; // 1. Import the centralized apiFetch

const API_BASE_URL = "http://194.163.141.113:8082/api/finance";

// 2. The local `fetchWithErrorHandling` function is no longer needed.

/**
 * A helper function to process the response from apiFetch.
 * It handles JSON parsing and throws a detailed error if the request was not successful.
 * @param response The Response object from apiFetch.
 * @returns The parsed JSON data.
 */
async function processApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Request failed with status: ${response.status}`;
    try {
      // Try to get a more specific error message from the API's response body
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore if the error response is not valid JSON
    }
    throw new Error(errorMessage);
  }

  // Handle successful responses that might not have a body (e.g., 204 No Content)
  if (response.status === 204) {
    return null as T;
  }

  return await response.json();
}

// --- Fee management API functions (Refactored) ---

export async function getAllFees() {
  const response = await apiFetch(`${API_BASE_URL}/fees`);
  return processApiResponse(response);
}

export async function getFeeById(id: number) {
  const response = await apiFetch(`${API_BASE_URL}/fees/${id}`);
  return processApiResponse(response);
}

export async function getFeesByStudent(studentId: number) {
  const response = await apiFetch(`${API_BASE_URL}/fees/student/${studentId}`);
  return processApiResponse(response);
}

export async function getFeesByType(type: string) {
  const response = await apiFetch(`${API_BASE_URL}/fees/type/${type}`);
  return processApiResponse(response);
}

export async function getFeesByStatus(status: string) {
  const response = await apiFetch(`${API_BASE_URL}/fees/status/${status}`);
  return processApiResponse(response);
}

export async function getOverdueFees() {
  const response = await apiFetch(`${API_BASE_URL}/fees/overdue`);
  return processApiResponse(response);
}

export async function createFee(fee: any) {
  const response = await apiFetch(`${API_BASE_URL}/fees`, {
    method: "POST",
    body: JSON.stringify(fee),
  });
  return processApiResponse(response);
}

export async function updateFee(id: number, fee: any) {
  const response = await apiFetch(`${API_BASE_URL}/fees/${id}`, {
    method: "PUT",
    body: JSON.stringify(fee),
  });
  return processApiResponse(response);
}

export async function processPayment(feeId: number, paymentMethod: string, transactionId: string) {
  const url = `${API_BASE_URL}/fees/${feeId}/payment?paymentMethod=${paymentMethod}&transactionId=${transactionId}`;
  const response = await apiFetch(url, {
    method: "POST",
  });
  return processApiResponse(response);
}

// --- Financial reporting API functions (Refactored) ---

export async function getFinancialSummary() {
  const response = await apiFetch(`${API_BASE_URL}/reports/summary`);
  return processApiResponse(response);
}

export async function updateOverdueFees() {
  const response = await apiFetch(`${API_BASE_URL}/maintenance/update-overdue`, {
    method: "POST",
  });
  return processApiResponse(response);
}