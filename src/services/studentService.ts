
import { ApiResponse, ErrorDetails, StudentRegistration, StudentRegistrationRequest } from "@/types";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:8080/api/billpay";

// Generic fetch function with error handling (similar to apiService)
async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, options);
    const status = response.status;
    
    if (status === 200 || status === 201) {
      const data = await response.json();
      return { data, status };
    } else {
      let error: ErrorDetails;
      try {
        error = await response.json();
      } catch (e) {
        error = {
          message: `Request failed with status ${status}`,
          timestamp: new Date().toISOString()
        };
      }
      
      // Show toast for error
      toast.error(error.message || "An error occurred");
      return { error, status };
    }
  } catch (error) {
    console.error("Network error:", error);
    const errorDetails: ErrorDetails = {
      message: error instanceof Error ? error.message : "Network error",
      timestamp: new Date().toISOString()
    };
    
    // Show toast for network errors
    toast.error("Network error. Please check your connection.");
    return { error: errorDetails, status: 0 };
  }
}

// Create or update student registration
export async function createOrUpdateStudentRegistration(
  request: StudentRegistrationRequest
): Promise<StudentRegistration | null> {
  console.log("Sending student registration request:", request);
  
  try {
    const response = await fetchWithErrorHandling<StudentRegistration>(
      `${API_BASE_URL}/student-details`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
      }
    );
    
    if (response.data) {
      console.log("Student registration successful:", response.data);
      return response.data;
    } else {
      console.error("Failed to register student:", response.error);
      return null;
    }
  } catch (error) {
    console.error("Error in createOrUpdateStudentRegistration:", error);
    return null;
  }
}

// Get all student registrations
export async function getAllStudentRegistrations(): Promise<StudentRegistration[]> {
  const response = await fetchWithErrorHandling<StudentRegistration[]>(
    `${API_BASE_URL}/student-details`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
  
  if (response.data) {
    return response.data;
  } else {
    return [];
  }
}

// Get student registrations by biller ID
export async function getStudentRegistrationsByBillerId(
  billerId: string
): Promise<StudentRegistration[]> {
  const response = await fetchWithErrorHandling<StudentRegistration[]>(
    `${API_BASE_URL}/student-details/${billerId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
  
  if (response.data) {
    return response.data;
  } else {
    return [];
  }
}

// Get student registration by biller ID and customer account
export async function getStudentRegistration(
  billerId: string,
  customerAccount: string
): Promise<StudentRegistration | null> {
  const response = await fetchWithErrorHandling<StudentRegistration>(
    `${API_BASE_URL}/student-details/${billerId}/${customerAccount}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
  
  if (response.data) {
    return response.data;
  } else {
    return null;
  }
}
