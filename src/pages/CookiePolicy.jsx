import SiteLegalLayout from "../components/SiteLegalLayout.jsx";
import { LegalSection } from "../components/legal/MarketingLegalBlocks.jsx";

export default function CookiePolicy() {
  return (
    <SiteLegalLayout
      title="Cookie Policy"
      subtitle="We keep it minimal — only what's necessary"
      documentTitle="Cookie Policy — ReviewBoost"
    >
      <LegalSection title="1. What Are Cookies">
        <p>
          Cookies are small files stored on your device that help websites remember information
          about your visit.
        </p>
      </LegalSection>

      <LegalSection title="2. Cookies We Use">
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm text-zinc-400">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-300">
                <th className="px-4 py-3 font-semibold">Cookie Name</th>
                <th className="px-4 py-3 font-semibold">Purpose</th>
                <th className="px-4 py-3 font-semibold">Duration</th>
                <th className="px-4 py-3 font-semibold">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              <tr>
                <td className="px-4 py-3 font-mono text-xs text-orange-400/90">session_token</td>
                <td className="px-4 py-3">Keeps you logged in</td>
                <td className="px-4 py-3">30 days</td>
                <td className="px-4 py-3">Essential</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs text-orange-400/90">rb_onboarded</td>
                <td className="px-4 py-3">Remembers onboarding state</td>
                <td className="px-4 py-3">1 year</td>
                <td className="px-4 py-3">Functional</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs text-orange-400/90">vercel_analytics</td>
                <td className="px-4 py-3">Anonymous page view tracking</td>
                <td className="px-4 py-3">90 days</td>
                <td className="px-4 py-3">Analytics</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="3. Essential Cookies">
        <p>
          These are required for the service to work. You cannot opt out of these while using
          ReviewBoost.
        </p>
      </LegalSection>

      <LegalSection title="4. Analytics Cookies">
        <p>
          We use Vercel Analytics for anonymous usage data — no personal information is collected.
          You can opt out by enabling &quot;Do Not Track&quot; in your browser.
        </p>
      </LegalSection>

      <LegalSection title="5. Third-Party Cookies">
        <p>
          Razorpay may set cookies during payment flows. These are governed by Razorpay&apos;s own
          cookie policy.
        </p>
      </LegalSection>

      <LegalSection title="6. Managing Cookies">
        <p>
          You can clear cookies in your browser settings at any time. Note: clearing session
          cookies will log you out.
        </p>
      </LegalSection>
    </SiteLegalLayout>
  );
}
