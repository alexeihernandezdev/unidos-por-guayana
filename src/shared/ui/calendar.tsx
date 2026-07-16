"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { cn } from "@/shared/lib/utils";

export function Calendar({
  className,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      className={cn(
        "[--rdp-accent-background-color:var(--muted)] [--rdp-accent-color:var(--primary)] [--rdp-day-height:2.75rem] [--rdp-day-width:2.75rem] [--rdp-day_button-height:2.75rem] [--rdp-day_button-width:2.75rem] [--rdp-months-gap:1rem]",
        className,
      )}
      {...props}
    />
  );
}
