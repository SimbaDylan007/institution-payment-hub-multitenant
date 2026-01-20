import { StudentRegistration, StudentRegistrationRequest } from "@/types";
import { toast } from "sonner";
import { apiFetch } from "@/utils/apiClient"; // 1. Import the centralized apiFetch

const API_BASE_URL = "/api/billpay";

// 2. The local `fetchWithErrorHandling` function has been removed.
//    Authentication, headers, and network error toasts are now handled by `apiFetch`.

/**
 * Creates or updates a student registration record for bill payments.
 * @param request The student registration data.
 * @returns The created/updated StudentRegistration object, or null on failure.
 */
export async function createOrUpdateStudentRegistration(
    request: StudentRegistrationRequest
): Promise<StudentRegistration | null> {
  console.log("Sending student registration request:", request);

  try {
    const response = await apiFetch(`${API_BASE_URL}/student-details`, {
      method: "POST",
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      // Try to get a specific error message from the server
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed with status ${response.status}`);
    }

    const data: StudentRegistration = await response.json();
    console.log("Student registration successful:", data);
    return data;
  } catch (error) {
    // apiFetch will have already shown a toast for network/auth errors.
    // We log the specific error here and return null as per the function's contract.
    console.error("Error in createOrUpdateStudentRegistration:", error);
    toast.error((error as Error).message || "Failed to save student registration.");
    return null;
  }
}

/**
 * Retrieves all student registration records.
 * @returns An array of StudentRegistration objects, or an empty array on failure.
 */
export async function getAllStudentRegistrations(): Promise<StudentRegistration[]> {
  try {
    const response = await apiFetch(`${API_BASE_URL}/student-details`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch student registrations");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching all student registrations:", error);
    return []; // Return an empty array on failure as per the original contract.
  }
}

/**
 * Retrieves student registrations for a specific biller ID.
 * @param billerId The ID of the biller.
 * @returns An array of StudentRegistration objects, or an empty array on failure.
 */
export async function getStudentRegistrationsByBillerId(
    billerId: string
): Promise<StudentRegistration[]> {
  try {
    const response = await apiFetch(`${API_BASE_URL}/student-details/${billerId}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch registrations for biller ID ${billerId}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching registrations for biller ${billerId}:`, error);
    return [];
  }
}

/**
 * Retrieves a specific student registration by biller ID and customer account.
 * @param billerId The ID of the biller.
 * @param customerAccount The student's account number with the biller.
 * @returns A StudentRegistration object, or null on failure.
 */
export async function getStudentRegistration(
    billerId: string,
    customerAccount: string
): Promise<StudentRegistration | null> {
  try {
    const response = await apiFetch(
        `${API_BASE_URL}/student-details/${billerId}/${customerAccount}`,
        {
          method: "GET",
        }
    );

    if (!response.ok) {
      // A 404 Not Found is a valid case here, so we don't need to throw an error.
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch student registration");
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching registration for ${billerId}/${customerAccount}:`, error);
    return null;
  }
}