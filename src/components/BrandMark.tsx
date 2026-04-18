import Image from "next/image";
import Link from "next/link";
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
    <Link href={href} className={cn("group inline-flex items-center", className)} onClick={onClick}>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl shadow-lg transition-transform duration-200 group-hover:scale-[1.02]",
          compact ? "h-12 w-[128px]" : "h-14 w-[152px]",
          dark
            ? "border border-white/20 bg-white/95 shadow-cyan-500/15"
            : "border border-slate-200 bg-white/95 shadow-slate-300/35",
        )}
      >
        <Image
          src="/logo.png"
          alt="CVpilot"
          fill
          priority={compact}
          className="object-contain p-1"
          sizes={compact ? "128px" : "152px"}
        />
      </div>
    </Link>
  );
}