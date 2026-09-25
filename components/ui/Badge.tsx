"use client";

import { ReactNode } from "react";

type Tone = "brand" | "gray" | "green" | "red" | "amber";

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  brand: "bg-gray-200 text-gray-900",
  gray: "bg-gray-100 text-gray-600",
  green: "bg-gray-200 text-gray-700",
  red: "bg-gray-200 text-gray-900",
  amber: "bg-gray-100 text-gray-700",
};

export default function Badge({ children, tone = "brand", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}