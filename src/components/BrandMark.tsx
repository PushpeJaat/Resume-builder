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
          "relative overflow-hidden rounded-xl transition-transform duration-200 group-hover:scale-[1.02]",
          compact ? "h-14 w-[156px]" : "h-16 w-[188px]",
          dark
            ? "bg-transparent shadow-[0_10px_24px_-18px_rgba(6,182,212,0.55)]"
            : "bg-transparent shadow-[0_10px_24px_-18px_rgba(15,23,42,0.3)]",
        )}
      >
        <Image
          src="/logo.png"
          alt="CVpilot"
          fill
          priority={compact}
          className="object-contain"
          sizes={compact ? "156px" : "188px"}
        />
      </div>
    </Link>
  );
}