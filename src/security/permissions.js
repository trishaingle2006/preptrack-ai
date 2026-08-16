export const PERMISSIONS = Object.freeze({
  VIEW_DASHBOARD: "dashboard:view",
  USE_PRACTICE: "practice:use",
  MANAGE_OWN_NOTES: "notes:manage-own",
  USE_INTERVIEWS: "interviews:use",
  VIEW_OWN_READINESS: "readiness:view-own",
  USE_CHALLENGES: "challenges:use",
  MANAGE_OWN_SECURITY: "security:manage-own",
  REVIEW_STUDENTS: "students:review",
  PROVIDE_FEEDBACK: "feedback:create",
  MANAGE_USERS: "users:manage",
  MANAGE_ROLES: "roles:manage",
  MANAGE_PLATFORM: "platform:manage",
});

export const ROLE_PERMISSIONS = Object.freeze({
  student: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.USE_PRACTICE,
    PERMISSIONS.MANAGE_OWN_NOTES,
    PERMISSIONS.USE_INTERVIEWS,
    PERMISSIONS.VIEW_OWN_READINESS,
    PERMISSIONS.USE_CHALLENGES,
    PERMISSIONS.MANAGE_OWN_SECURITY,
  ],
  mentor: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.REVIEW_STUDENTS,
    PERMISSIONS.PROVIDE_FEEDBACK,
    PERMISSIONS.MANAGE_OWN_SECURITY,
  ],
  admin: ["*"],
});

export function hasPermission(role, permission) {
  const normalizedRole = String(role || "").trim().toLowerCase();
  const permissions = ROLE_PERMISSIONS[normalizedRole] ?? [];
  return permissions.includes("*") || permissions.includes(permission);
}
