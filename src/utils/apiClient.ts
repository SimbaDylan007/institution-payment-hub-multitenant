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
    const headers = new Headers(options.headers || {});

    const token = localStorage.getItem("jwt_token");

    if (token) {
        headers.set("Authorization", "Bearer " + token);
    }


    if (
        options.body &&
        !(options.body instanceof FormData) &&
        !headers.has("Content-Type")
    ) {
        headers.set("Content-Type", "application/json");
    }

    try {
        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            console.error("Authentication Error: Token is invalid or expired.");

        }

        if (response.status === 403) {
            toast.error("Access Denied: You do not have permission to perform this action.");
        }

        return response;
    } catch (error) {
        toast.error("Network Error: Could not connect to the server.");
        throw error;
    }
};
