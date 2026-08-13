"use client";

import React from "react";
import RouteGuard from "@/guards/RouteGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RouteGuard access="ADMIN">{children}</RouteGuard>;
}
