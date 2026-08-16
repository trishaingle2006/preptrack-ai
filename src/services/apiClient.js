import { auth } from "../lib/firebase";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export async function apiRequest(action, data = {}, { authenticated = true, timeout = 65_000 } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (authenticated) {
    const user = auth?.currentUser;
    if (!user) throw new Error("Sign in to continue.");
    headers.Authorization = `Bearer ${await user.getIdToken()}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(`${apiBaseUrl}/api`, {
      method: "POST",
      headers,
      body: JSON.stringify({ action, data }),
      signal: controller.signal,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body?.error?.message || `Request failed with status ${response.status}.`);
    return body.data;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("The service took too long to respond. Please try again.");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
