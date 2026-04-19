import Link from "next/link";

export default function ContactUsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_42%,#f8fafc_100%)] px-4 py-14 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Contact Us</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Get in touch with Fap Corporation</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
          We are here to help with account access, payment verification, PDF download issues, and general product
          support for CVpilot.
        </p>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Business details</h2>
          <dl className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
              <dt className="font-semibold text-slate-900">Legal Name:</dt>
              <dd>Fap Corporation</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
              <dt className="font-semibold text-slate-900">GST Number:</dt>
              <dd>09KUTPS9606H2ZG</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
              <dt className="font-semibold text-slate-900">Customer Support:</dt>
              <dd>
                <a
                  className="font-medium text-sky-700 hover:text-sky-800"
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=support@cvpilot.info"
                  target="_blank"
                  rel="noreferrer"
                >
                  support@cvpilot.info
                </a>
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Support window</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Our team typically responds within 24 to 48 business hours. For faster resolution, include your registered
            email ID, resume title, and a brief summary of the issue in your message.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Need policy details?</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Please review our Terms &amp; Conditions and Refunds &amp; Cancellations pages before raising a billing-related
            request.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link
              href="/terms-and-conditions"
              className="rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-800 transition hover:bg-slate-100"
            >
              Terms &amp; Conditions
            </Link>
            <Link
              href="/refunds-cancellations"
              className="rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-800 transition hover:bg-slate-100"
            >
              Refunds &amp; Cancellations
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
