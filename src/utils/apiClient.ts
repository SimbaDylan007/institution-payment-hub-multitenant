import { toast } from "sonner";

/**
 * A centralized fetch wrapper that automatically adds the JWT Bearer token to API requests.
 * It also provides consistent error handling for network failures.
 *
 * @param url The API endpoint to call.
 * @param options Standard fetch options (method, body, etc.).
 * @returns The fetch Response promise.
 */
export const apiFetch = async (
    url: string,
    options: RequestInit = {}
) => {
    // 1. Create headers from any options passed in, or create a new Headers object.
    const headers = new Headers(options.headers || {});

    // 2. Get the JWT token from local storage.
    const token = localStorage.getItem("jwt_token");

    // 3. If a token exists, add it to the Authorization header as a Bearer token.
    if (token) {
        headers.set("Authorization", "Bearer " + token);
    }

    // 4. Only set Content-Type to JSON if the body is not FormData.
    // The browser will set the correct multipart boundary automatically for FormData.
    if (
        options.body &&
        !(options.body instanceof FormData) &&
        !headers.has("Content-Type")
    ) {
        headers.set("Content-Type", "application/json");
    }

    try {
        // 5. Make the actual fetch call with the original options and the modified headers.
        const response = await fetch(url, { ...options, headers });

        // 6. Centralized error handling.
        if (response.status === 401) {
            console.error("Authentication Error: Token is invalid or expired.");
            // Optional: force logout or redirect
            // window.location.href = '/logout';
        }

        if (response.status === 403) {
            toast.error("Access Denied: You do not have permission to perform this action.");
        }

        return response;
    } catch (error) {
        // This catches network errors (e.g., the server is down).
        toast.error("Network Error: Could not connect to the server.");
        throw error;
    }
};
