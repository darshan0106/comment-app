const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchApi(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "An API error occurred");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const apiRegister = (data: any) =>
  fetchApi("/auth/register", { method: "POST", body: JSON.stringify(data) });
export const apiLogin = (data: any) =>
  fetchApi("/auth/login", { method: "POST", body: JSON.stringify(data) });

export const apiGetTopLevelPosts = () => fetchApi("/comments");
export const apiGetPostById = (id: string) => fetchApi(`/comments/${id}`);
export const apiGetRepliesForPost = (parentId: string) =>
  fetchApi(`/comments?parentId=${parentId}`);
export const apiCreatePost = (data: { content: string; parentId?: string }) =>
  fetchApi("/comments", { method: "POST", body: JSON.stringify(data) });
export const apiEditPost = (id: string, data: { content: string }) =>
  fetchApi(`/comments/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const apiDeletePost = (id: string) =>
  fetchApi(`/comments/${id}`, { method: "DELETE" });
export const apiRestorePost = (id: string) =>
  fetchApi(`/comments/${id}/restore`, { method: "POST" });

export const apiGetAllNotifications = () => fetchApi("/notifications/all");
export const apiMarkNotificationAsRead = (id: string) =>
  fetchApi(`/notifications/${id}/read`, { method: "POST" });

export const apiGetUnreadNotifications = () =>
  fetchApi("/notifications/unread");
