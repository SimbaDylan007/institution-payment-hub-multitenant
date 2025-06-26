
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:8080/api/communication";

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

// Message API functions
export async function getAllMessages() {
  return fetchWithErrorHandling(`${API_BASE_URL}/messages`);
}

export async function getMessageById(id: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/messages/${id}`);
}

export async function getSentMessages(senderId: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/messages/sent/${senderId}`);
}

export async function getReceivedMessages(receiverId: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/messages/received/${receiverId}`);
}

export async function getUnreadMessages(receiverId: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/messages/unread/${receiverId}`);
}

export async function getConversation(senderId: number, receiverId: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/messages/conversation/${senderId}/${receiverId}`);
}

export async function getMessagesByUser(userId: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/messages/user/${userId}`);
}

export async function sendMessage(message: any) {
  return fetchWithErrorHandling(`${API_BASE_URL}/messages`, {
    method: "POST",
    body: JSON.stringify(message),
  });
}

export async function markAsRead(messageId: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/messages/${messageId}/read`, {
    method: "PUT",
  });
}

export async function markAllAsRead(receiverId: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/messages/read-all/${receiverId}`, {
    method: "PUT",
  });
}

export async function sendAnnouncement(title: string, content: string, senderId: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/announcements?title=${encodeURIComponent(title)}&content=${encodeURIComponent(content)}&senderId=${senderId}`, {
    method: "POST",
  });
}

export async function deleteMessage(messageId: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/messages/${messageId}`, {
    method: "DELETE",
  });
}

export async function getUnreadMessageCount(userId: number) {
  return fetchWithErrorHandling(`${API_BASE_URL}/messages/unread-count/${userId}`);
}
