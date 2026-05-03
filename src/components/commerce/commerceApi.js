import { baseUrl } from "../auth/config";


export async function commerceFetch(path, token, options = {}) {
  const headers = {
    Authorization: `Bearer ${token}`,
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }
  return payload?.data ?? payload;
}
