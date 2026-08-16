import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function initializeAdmin() {
  if (getApps().length) return;
  const rawCredentials = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!rawCredentials) throw new Error("FIREBASE_SERVICE_ACCOUNT is not configured.");
  const credentials = JSON.parse(rawCredentials);
  initializeApp({
    credential: cert({
      projectId: credentials.project_id,
      clientEmail: credentials.client_email,
      privateKey: credentials.private_key?.replace(/\\n/g, "\n"),
    }),
    projectId: credentials.project_id,
  });
}

initializeAdmin();

const handlers = await import("../functions/src/index.js");

const publicActions = new Set(["checkLoginAllowed", "recordFailedLogin"]);
const availableActions = new Set([
  "evaluateInterviewAnswer",
  "analyzePlacementReadiness",
  "getChallengeArena",
  "submitChallengeAttempt",
  "checkLoginAllowed",
  "recordFailedLogin",
  "registerSecuritySession",
  "getSecurityOverview",
  "revokeSecuritySession",
  "markPasswordUpdated",
  "getAdminWorkspace",
  "updatePlatformUser",
  "savePlatformSettings",
  "getMentorWorkspace",
  "submitMentorFeedback",
]);

function originAllowed(origin) {
  if (!origin) return true;
  const configured = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const defaults = [
    "https://preptrack-ai-sepia.vercel.app",
    "https://preptrack-ai-8f7d6.web.app",
    "https://preptrack-ai-8f7d6.firebaseapp.com",
    "http://localhost:5173",
  ];
  return [...defaults, ...configured].includes(origin);
}

function errorStatus(code) {
  if (["unauthenticated", "permission-denied"].includes(code)) return 401;
  if (["invalid-argument", "failed-precondition"].includes(code)) return 400;
  if (code === "not-found") return 404;
  if (code === "already-exists") return 409;
  if (code === "resource-exhausted") return 429;
  return 500;
}

export default async function handler(request, response) {
  const origin = request.headers.origin;
  if (!originAllowed(origin)) return response.status(403).json({ error: { code: "permission-denied", message: "Origin is not allowed." } });
  if (origin) response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Cache-Control", "no-store");
  if (request.method === "OPTIONS") return response.status(204).end();
  if (request.method !== "POST") return response.status(405).json({ error: { code: "method-not-allowed", message: "Use POST." } });

  const action = String(request.body?.action || "");
  if (!availableActions.has(action)) return response.status(404).json({ error: { code: "not-found", message: "Unknown API action." } });

  try {
    let auth = null;
    const bearer = request.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (bearer) {
      const token = await getAuth().verifyIdToken(bearer, true);
      auth = { uid: token.uid, token };
    }
    if (!publicActions.has(action) && !auth) {
      return response.status(401).json({ error: { code: "unauthenticated", message: "Sign in to continue." } });
    }

    const callable = handlers[action];
    if (!callable?.run) throw new Error(`Handler ${action} is unavailable.`);
    const data = await callable.run({
      auth,
      data: request.body?.data ?? {},
      rawRequest: {
        headers: request.headers,
        ip: request.headers["x-forwarded-for"]?.split(",")[0]?.trim() || request.socket?.remoteAddress || "unknown",
      },
    });
    return response.status(200).json({ data });
  } catch (error) {
    const code = error?.code || "internal";
    const normalizedCode = String(code).replace(/^functions\//, "");
    console.error("PrepTrack API error", { action, code: normalizedCode, message: error?.message });
    return response.status(errorStatus(normalizedCode)).json({
      error: {
        code: normalizedCode,
        message: normalizedCode === "internal" ? "The service is temporarily unavailable." : error?.message || "Request failed.",
      },
    });
  }
}
