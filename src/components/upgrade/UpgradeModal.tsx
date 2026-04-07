"use client";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function UpgradeModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative max-w-md animate-fade-in rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-slate-900">Upgrade to Pro</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Premium templates (like Creative Designer) and high-fidelity PDF export are part of the Pro tier. Payment
          integration is not wired yet—this modal establishes the upgrade path for your product roadmap.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li className="flex gap-2">
            <span className="text-sky-600">✓</span>
            Unlock premium layouts
          </li>
          <li className="flex gap-2">
            <span className="text-sky-600">✓</span>
            PDF downloads on locked templates
          </li>
          <li className="flex gap-2">
            <span className="text-sky-600">✓</span>
            Priority rendering queue (planned)
          </li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            disabled
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white opacity-70"
          >
            Checkout (coming soon)
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Not now
          </button>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          For local testing, set <code className="rounded bg-slate-100 px-1">plan = PREMIUM</code> on your user row in
          PostgreSQL.
        </p>
      </div>
    </div>
  );
}
