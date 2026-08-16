import { apiRequest } from "./apiClient";

export async function evaluateWithAi(payload) {
  return apiRequest("evaluateInterviewAnswer", payload, { timeout: 50_000 });
}

export async function analyzeReadiness(payload) {
  return apiRequest("analyzePlacementReadiness", payload, { timeout: 65_000 });
}
