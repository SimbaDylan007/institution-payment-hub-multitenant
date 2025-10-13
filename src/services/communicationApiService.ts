import { apiFetch } from "@/utils/apiClient"; // 1. Import the centralized apiFetch

const API_BASE_URL = "http://localhost:8082/api/communication";

// 2. The local `fetchWithErrorHandling` function is no longer needed.

/**
 * A helper to parse a detailed error message from an API response.
 * @param response The failed Response object.
 * @returns An Error object with a specific message.
 */
async function parseApiError(response: Response): Promise<Error> {
  let errorMessage = `Request failed with status ${response.status}`;
  try {
    // Attempt to get a more specific message from the server's JSON response
    const errorData = await response.json();
    if (errorData && errorData.message) {
      errorMessage = errorData.message;
    }
  } catch (e) {
    // If the error response isn't JSON, we'll stick with the status code message.
  }
  return new Error(errorMessage);
}


// --- Message API functions (Refactored) ---

export async function getAllMessages() {
  const response = await apiFetch(`${API_BASE_URL}/messages`);
  if (!response.ok) throw await parseApiError(response);
  return await response.json();
}

export async function getMessageById(id: number) {
  const response = await apiFetch(`${API_BASE_URL}/messages/${id}`);
  if (!response.ok) throw await parseApiError(response);
  return await response.json();
}

export async function getSentMessages(senderId: number) {
  const response = await apiFetch(`${API_BASE_URL}/messages/sent/${senderId}`);
  if (!response.ok) throw await parseApiError(response);
  return await response.json();
}

export async function getReceivedMessages(receiverId: number) {
  const response = await apiFetch(`${API_BASE_URL}/messages/received/${receiverId}`);
  if (!response.ok) throw await parseApiError(response);
  return await response.json();
}

export async function getUnreadMessages(receiverId: number) {
  const response = await apiFetch(`${API_BASE_URL}/messages/unread/${receiverId}`);
  if (!response.ok) throw await parseApiError(response);
  return await response.json();
}

export async function getConversation(senderId: number, receiverId: number) {
  const response = await apiFetch(`${API_BASE_URL}/messages/conversation/${senderId}/${receiverId}`);
  if (!response.ok) throw await parseApiError(response);
  return await response.json();
}

export async function getMessagesByUser(userId: number) {
  const response = await apiFetch(`${API_BASE_URL}/messages/user/${userId}`);
  if (!response.ok) throw await parseApiError(response);
  return await response.json();
}

export async function sendMessage(message: any) {
  const response = await apiFetch(`${API_BASE_URL}/messages`, {
    method: "POST",
    body: JSON.stringify(message),
  });
  if (!response.ok) throw await parseApiError(response);
  return await response.json();
}

export async function markAsRead(messageId: number) {
  const response = await apiFetch(`${API_BASE_URL}/messages/${messageId}/read`, {
    method: "PUT",
  });
  if (!response.ok) throw await parseApiError(response);
  // This endpoint might return no content, so we don't try to parse JSON
  return true;
}

export async function markAllAsRead(receiverId: number) {
  const response = await apiFetch(`${API_BASE_URL}/messages/read-all/${receiverId}`, {
    method: "PUT",
  });
  if (!response.ok) throw await parseApiError(response);
  return true;
}

export async function sendAnnouncement(title: string, content: string, senderId: number) {
  const url = `${API_BASE_URL}/announcements?title=${encodeURIComponent(title)}&content=${encodeURIComponent(content)}&senderId=${senderId}`;
  const response = await apiFetch(url, {
    method: "POST",
  });
  if (!response.ok) throw await parseApiError(response);
  return true;
}

export async function deleteMessage(messageId: number) {
  const response = await apiFetch(`${API_BASE_URL}/messages/${messageId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw await parseApiError(response);
  return true;
}

export async function getUnreadMessageCount(userId: number): Promise<number> {
  const response = await apiFetch(`${API_BASE_URL}/messages/unread-count/${userId}`);
  if (!response.ok) throw await parseApiError(response);
  // This endpoint likely returns a plain number, not JSON
  const text = await response.text();
  return Number(text);
}