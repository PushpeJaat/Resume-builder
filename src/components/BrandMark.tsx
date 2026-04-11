import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  href?: string;
  theme?: "light" | "dark";
  size?: "sm" | "md";
  onClick?: () => void;
  className?: string;
};

export function BrandMark({
  href = "/",
  theme = "light",
  size = "md",
  onClick,
  className,
}: BrandMarkProps) {
  const dark = theme === "dark";
  const compact = size === "sm";

  return (
    <Link href={href} className={cn("group inline-flex items-center gap-3", className)} onClick={onClick}>
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-200 group-hover:scale-105",
          compact ? "h-9 w-9" : "h-10 w-10",
          dark
            ? "bg-gradient-to-br from-sky-500 to-cyan-400 shadow-sky-500/25"
            : "bg-gradient-to-br from-sky-600 to-cyan-500 shadow-sky-500/20",
        )}
      >
        <Sparkles className={compact ? "h-4.5 w-4.5" : "h-5 w-5"} />
      </div>
      <span
        className={cn(
          "font-semibold tracking-tight transition-colors",
          compact ? "text-lg" : "text-xl",
          dark ? "text-white" : "text-slate-950",
        )}
      >
        CVpilot
      </span>
    </Link>
  );
}