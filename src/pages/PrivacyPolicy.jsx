import SiteLegalLayout from "../components/SiteLegalLayout.jsx";
import { LegalLink, LegalSection } from "../components/legal/MarketingLegalBlocks.jsx";

export default function PrivacyPolicy() {
  return (
    <SiteLegalLayout
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your information"
      documentTitle="Privacy Policy — ReviewBoost"
    >
      <LegalSection title="1. Information We Collect">
        <p>We collect the following information when you use ReviewBoost:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-orange-500">
          <li>
            Account information: name, email address, and password when you register
          </li>
          <li>
            Restaurant information: restaurant name and Google Maps review URLs you provide
          </li>
          <li>
            Customer feedback: ratings and comments submitted by your customers via QR codes
          </li>
          <li>Usage data: pages visited, features used, login timestamps</li>
          <li>
            Payment information: processed securely by Razorpay — we never store card details
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. How We Use Your Information">
        <ul className="list-disc space-y-2 pl-5 marker:text-orange-500">
          <li>To provide and operate the ReviewBoost service</li>
          <li>To send you email notifications about new customer feedback</li>
          <li>To process payments via Razorpay</li>
          <li>To improve our product based on usage patterns</li>
          <li>To send product updates and important account notices (no spam)</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Data Sharing">
        <p>We do not sell your data. We share data only with:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-orange-500">
          <li>Razorpay (payment processing)</li>
          <li>Supabase (secure database hosting)</li>
          <li>Vercel (hosting infrastructure)</li>
        </ul>
        <p>All third parties are bound by strict data protection agreements.</p>
      </LegalSection>

      <LegalSection title="4. Customer Feedback Data">
        <p>
          Feedback submitted by your customers belongs to you. We process it only to display it
          in your dashboard. Customers are informed their feedback may be shared with the
          restaurant owner.
        </p>
      </LegalSection>

      <LegalSection title="5. Data Retention">
        <ul className="list-disc space-y-2 pl-5 marker:text-orange-500">
          <li>Account data: retained while your account is active</li>
          <li>
            Feedback entries: retained until you delete them or close your account
          </li>
          <li>
            Payment records: retained for 7 years as required by Indian tax law
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Your Rights">
        <p>You can at any time:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-orange-500">
          <li>Export all your data from dashboard settings</li>
          <li>Delete individual feedback entries</li>
          <li>
            Request full account deletion by emailing{" "}
            <a href="mailto:support@reviewboost.in">support@reviewboost.in</a>
          </li>
          <li>We will process deletion requests within 30 days</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Cookies">
        <p>
          We use essential cookies for login sessions and basic analytics. See our{" "}
          <LegalLink to="/cookie-policy">Cookie Policy</LegalLink> for full details.
        </p>
      </LegalSection>

      <LegalSection title="8. Security">
        <p>
          All data is encrypted in transit (TLS) and at rest. Passwords are hashed and never
          stored in plain text.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>
          For privacy concerns:{" "}
          <a href="mailto:privacy@reviewboost.in">privacy@reviewboost.in</a>
        </p>
      </LegalSection>
    </SiteLegalLayout>
  );
}
