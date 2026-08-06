"use client";

import React from "react";

interface ReadingProgressProps {
  currentPage: number;
  totalPages: number;
}

export default function ReadingProgress({ currentPage, totalPages }: ReadingProgressProps) {
  const percent = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-[#262B36] z-50 select-none">
      <div 
        className="h-full bg-[#00A16C] transition-all duration-150 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
