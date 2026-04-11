import Link from "next/link";

const updatedOn = "April 11, 2026";

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_42%,#f8fafc_100%)] px-4 py-14 text-slate-900 sm:px-6 lg:px-8">
      <article className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Terms &amp; Conditions</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Terms of use for CVpilot</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {updatedOn}</p>

        <div className="mt-7 space-y-7 text-sm leading-7 text-slate-700 sm:text-[15px]">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">1. Business identity</h2>
            <p className="mt-2">
              This platform is owned and operated by Fap Corporation. GST Number: 09KUTPS9606H2ZG. For support and
              dispute handling, write to support@cvpilot.info.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">2. Service scope</h2>
            <p className="mt-2">
              CVpilot provides resume creation, editing, and export services. Features may be updated, expanded, or
              revised to improve quality, security, and compliance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">3. Account responsibilities</h2>
            <p className="mt-2">
              You are responsible for accurate registration details, account security, and all activity performed
              through your account. Sharing credentials with unauthorized users is not permitted.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">4. Payments and downloads</h2>
            <p className="mt-2">
              Certain exports may require successful payment confirmation via our payment partner. Download access is
              granted once payment is verified for the relevant resume export flow.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">5. Acceptable use</h2>
            <p className="mt-2">
              You agree not to use the service for unlawful, misleading, fraudulent, or abusive activities, including
              unauthorized data scraping, service disruption, or attempts to bypass payment or account controls.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">6. Intellectual property</h2>
            <p className="mt-2">
              The platform design, source elements, and service workflows remain the intellectual property of Fap
              Corporation. Your resume content remains yours.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">7. Limitation of liability</h2>
            <p className="mt-2">
              The service is provided on an as-available basis. While we aim for reliable operation, we do not warrant
              uninterrupted availability and are not liable for indirect losses arising from service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">8. Changes to these terms</h2>
            <p className="mt-2">
              We may update these terms to reflect business, legal, or technical changes. Continued use of the service
              after updates constitutes acceptance of the revised terms.
            </p>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/refunds-cancellations"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
          >
            Refunds &amp; Cancellations
          </Link>
          <Link
            href="/contact-us"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
          >
            Contact Us
          </Link>
        </div>
      </article>
    </main>
  );
}
