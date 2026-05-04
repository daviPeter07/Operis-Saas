// Shared API client for frontend services
// Sends requests with credentials (HttpOnly cookies) and handles errors uniformly.

export async function apiClient<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    credentials: 'include', // ensures HttpOnly cookie is sent
    ...init,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorBody}`);
  }

  const data = (await response.json()) as T;
  return data;
}
