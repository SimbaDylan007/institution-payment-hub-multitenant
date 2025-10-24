import { PaymentAlert, PickPaymentRequest } from "@/types";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient"; // 1. Import the centralized apiFetch

const API_BASE_URL = "http://194.163.141.113:8082/api/payments";

// 2. The local `fetchWithErrorHandling` function is no longer needed.
//    Authentication, Content-Type headers, and basic error toasts are now handled by `apiFetch`.

/**
 * A helper function to process the server's response.
 * If the response is not OK, it attempts to parse an error message from the body.
 * @param response The Response object from apiFetch.
 * @param defaultErrorMessage A fallback error message.
 * @returns The parsed JSON data.
 * @throws An error with a message from the API or the default message.
 */
async function processApiResponse<T>(response: Response, defaultErrorMessage: string): Promise<T> {
  if (response.ok) {
    // For 204 No Content, there might not be a body to parse
    if (response.status === 204) {
      return null as T;
    }
    return await response.json();
  } else {
    let errorMessage = defaultErrorMessage;
    try {
      // Attempt to get a more specific error message from the API response
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore if the error response is not valid JSON
    }
    // Let the calling function's catch block handle this
    throw new Error(errorMessage);
  }
}

// 3. Refactor all service functions to use `apiFetch`

/**
 * Picks all pending payments from the external API via our backend.
 */
export async function pickAllPendingPayments(
    request: PickPaymentRequest
): Promise<PaymentAlert[]> {
    // eslint-disable-next-line no-useless-catch
  try {
    const response = await apiFetch(`${API_BASE_URL}/pick-all-pending`, {
      method: "POST",
      body: JSON.stringify(request),
    });
    return await processApiResponse<PaymentAlert[]>(response, "Failed to fetch pending payments");
  } catch (error) {
    // The toast is handled in apiFetch for network/auth errors.
    // Re-throwing allows component-level catch blocks to execute.
    throw error;
  }
}

/**
 * Gets all payments for an institution from our backend.
 */
export async function getAllPayments(
    request: PickPaymentRequest
): Promise<PaymentAlert[]> {
  try {
    const response = await apiFetch(`${API_BASE_URL}/all-payments`, {
      method: "POST",
      body: JSON.stringify(request),
    });
    return await processApiResponse<PaymentAlert[]>(response, "Failed to fetch payments");
  } catch (error) {
    throw error;
  }
}

/**
 * Resets a payment's status in the local database via our backend.
 */
export async function resetPayment(paymentId: string): Promise<boolean> {
  try {
    // Note: A GET request typically shouldn't change state, but we follow the existing pattern.
    // A PUT or POST to /reset might be more conventional.
    const response = await apiFetch(`${API_BASE_URL}/reset/${paymentId}`, {
      method: "GET", // Changed from POST in original to GET as per original code.
    });
    return await processApiResponse<boolean>(response, "Failed to reset payment");
  } catch (error) {
    throw error;
  }
}

/**
 * Gets all payments stored in the local database as a fallback.
 */
export async function getLocalPayments(): Promise<PaymentAlert[]> {
  try {
    const response = await apiFetch(`${API_BASE_URL}/local`, {
      method: "GET",
    });
    return await processApiResponse<PaymentAlert[]>(response, "Failed to fetch local payments");
  } catch (error) {
    throw error;
  }
}