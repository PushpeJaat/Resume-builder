import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type FormSectionProps = {
  value: string;
  title: string;
  description: string;
  icon: LucideIcon;
  meta?: string;
  className?: string;
  children: ReactNode;
};

export function FormSection({
  value,
  title,
  description,
  icon: Icon,
  meta,
  className,
  children,
}: FormSectionProps) {
  return (
    <AccordionItem
      value={value}
      className={cn(
        "group/form-section relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_40px_-34px_rgba(15,23,42,0.55)] transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.08),transparent_42%)] before:opacity-0 before:transition-opacity before:duration-300 hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-[0_30px_80px_-58px_rgba(15,23,42,0.8)] hover:before:opacity-100",
        className,
      )}
    >
      <AccordionTrigger className="relative z-10 px-6 py-5 text-slate-800 transition-colors duration-200 hover:text-slate-950 hover:no-underline [&>svg]:ml-2 [&>svg]:text-slate-400 [&>svg]:transition-transform [&>svg]:duration-300 group-data-[state=open]/form-section:[&>svg]:text-slate-600">
        <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 transition-all duration-300 group-hover/form-section:-translate-y-[1px] group-hover/form-section:border-sky-200 group-hover/form-section:bg-sky-50 group-data-[state=open]/form-section:border-sky-200 group-data-[state=open]/form-section:bg-sky-50 group-data-[state=open]/form-section:text-sky-700">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold leading-tight tracking-tight text-slate-900">{title}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{description}</p>
            </div>
          </div>
          {meta ? (
            <span className="hidden shrink-0 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors duration-200 group-data-[state=open]/form-section:border-sky-200 group-data-[state=open]/form-section:bg-sky-50 group-data-[state=open]/form-section:text-sky-700 sm:inline-flex">
              {meta}
            </span>
          ) : null}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1">
        <div className="space-y-4">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}
