// Reference map of endpoint prefix -> access level requirement.
// Documentational and architectural reference map for frontend-backend contract alignment.

export const API_PREFIXES = {
  PUBLIC: [
    "/auth/",
    "/courses",
    "/notes/subjects/popular",
  ],
  USER: [
    "/users/",
    "/user/",
    "/notes",
  ],
  ADMIN: [
    "/admin/",
  ],
} as const;
