export type AccessLevel = "PUBLIC" | "USER" | "ADMIN";
export type UnauthenticatedBehavior = "redirect" | "overlay";

export interface RouteConfig {
  access: AccessLevel;
  unauthenticated?: UnauthenticatedBehavior;
}

export const ROUTE_ACCESS_CONFIG: Record<string, RouteConfig> = {
  "/": { access: "PUBLIC" },
  "/about": { access: "PUBLIC" },
  "/features": { access: "PUBLIC" },
  "/contact": { access: "PUBLIC" },
  "/privacy": { access: "PUBLIC" },
  "/terms": { access: "PUBLIC" },
  "/login": { access: "PUBLIC" },
  "/register": { access: "PUBLIC" },
  "/courses": { access: "USER", unauthenticated: "overlay" },
  "/subjects": { access: "USER", unauthenticated: "overlay" },
  "/dashboard": { access: "USER", unauthenticated: "redirect" },
  "/profile": { access: "USER", unauthenticated: "redirect" },
  "/notes": { access: "USER", unauthenticated: "redirect" },
  "/admin": { access: "ADMIN", unauthenticated: "redirect" },
};
