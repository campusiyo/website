export const Role = {
  STUDENT: "STUDENT",
  ADMIN: "ADMIN",
} as const;

export type RoleType = (typeof Role)[keyof typeof Role];
