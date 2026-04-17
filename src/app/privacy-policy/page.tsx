import { SiteHeader } from "@/components/layout/SiteHeader";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SiteHeader theme="light" />
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="mb-4">Your privacy is important to us. This policy explains what information we collect, how we use it, and your rights regarding your data.</p>
        <h2 className="text-xl font-semibold mt-8 mb-2">Information We Collect</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Account information (name, email, etc.)</li>
          <li>Resume content you upload or create</li>
          <li>Usage analytics (anonymized)</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2">How We Use Your Information</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>To provide and improve our resume services</li>
          <li>To communicate with you about your account or support requests</li>
          <li>To analyze usage and improve product features</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2">Your Rights</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>You can request deletion of your account and data at any time</li>
          <li>Contact us for any privacy-related questions</li>
        </ul>
        <p className="mt-8 text-sm text-slate-500">This policy may be updated from time to time. Please review it periodically.</p>
      </main>
    </div>
  );
}
