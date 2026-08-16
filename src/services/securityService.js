import { apiRequest } from "./apiClient";

export function getDeviceMetadata() {
  let deviceId = localStorage.getItem("preptrackDeviceId");
  if (!deviceId) {
    deviceId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("preptrackDeviceId", deviceId);
  }
  return { deviceId, platform: navigator.userAgentData?.platform || navigator.platform || "Unknown platform", deviceLabel: `${navigator.userAgentData?.mobile ? "Mobile" : "Browser"} on ${navigator.userAgentData?.platform || navigator.platform || "device"}` };
}

export async function checkLogin(email) { return apiRequest("checkLoginAllowed", { email }, { authenticated: false }); }
export async function recordFailedLogin(email) { return apiRequest("recordFailedLogin", { email }, { authenticated: false }); }
export async function registerSession() { return apiRequest("registerSecuritySession", getDeviceMetadata()); }
export async function loadSecurityOverview() { return apiRequest("getSecurityOverview"); }
export async function revokeSession(sessionId) { return apiRequest("revokeSecuritySession", { sessionId }); }
export async function recordPasswordUpdate() { return apiRequest("markPasswordUpdated"); }
