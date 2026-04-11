import Link from "next/link";

const updatedOn = "April 11, 2026";

export default function RefundsAndCancellationsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_42%,#f8fafc_100%)] px-4 py-14 text-slate-900 sm:px-6 lg:px-8">
      <article className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Refunds &amp; Cancellations</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Refund and cancellation policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {updatedOn}</p>

        <div className="mt-7 space-y-7 text-sm leading-7 text-slate-700 sm:text-[15px]">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">1. Company details</h2>
            <p className="mt-2">
              This policy is published by Fap Corporation (GST: 09KUTPS9606H2ZG). For support, billing clarification,
              or refund requests, contact support@cvpilot.info.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">2. Digital service nature</h2>
            <p className="mt-2">
              CVpilot provides digital resume generation and downloadable files. Since delivery is digital, once a PDF
              has been generated and made available, the order is generally treated as fulfilled.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">3. Eligible refund scenarios</h2>
            <p className="mt-2">Refunds may be approved in the following situations, subject to verification:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>Duplicate charges for the same transaction.</li>
              <li>Payment successful but resume export not delivered due to a confirmed technical failure.</li>
              <li>Unauthorized transaction reports that pass internal review.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">4. Non-refundable scenarios</h2>
            <p className="mt-2">Refunds are generally not provided when:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>The PDF download was successfully completed.</li>
              <li>The request is based on user preference after successful digital delivery.</li>
              <li>Incorrect details were entered by the user and the service was still delivered.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">5. Request timeline and process</h2>
            <p className="mt-2">
              Refund requests should be raised within 7 calendar days of the transaction date. Include registered
              email, order reference, transaction date/time, and issue details for faster processing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">6. Processing timeline</h2>
            <p className="mt-2">
              Approved refunds are initiated within 5 to 7 business days. Final credit timelines may vary by payment
              method and banking partner.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">7. Cancellations</h2>
            <p className="mt-2">
              Orders can be canceled only before successful payment authorization. Once payment is confirmed and digital
              delivery is completed, cancellation is no longer applicable.
            </p>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/terms-and-conditions"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
          >
            Terms &amp; Conditions
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
