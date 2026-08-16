import { apiRequest } from "./apiClient";

export async function loadChallengeArena() {
  return apiRequest("getChallengeArena", {}, { timeout: 65_000 });
}

export async function submitChallenge(challengeId, answer) {
  return apiRequest("submitChallengeAttempt", { challengeId, answer }, { timeout: 65_000 });
}
