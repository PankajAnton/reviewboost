import type { Metadata } from "next";
import {
  LegalLayout,
  LegalSection,
  LegalHighlight,
} from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service — ReviewBoost",
  description: "Please read these terms carefully before using ReviewBoost.",
};

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Please read these terms carefully before using ReviewBoost"
    >
      <LegalSection title="1. Acceptance of Terms">
        <p>
          By creating an account on ReviewBoost, you agree to these Terms of
          Service. If you do not agree, please do not use the service.
        </p>
      </LegalSection>

      <LegalSection title="2. Description of Service">
        <p>
          ReviewBoost is a review management platform that helps restaurant
          owners:
        </p>
        <ul className="list-disc space-y-2 pl-5 marker:text-orange-500">
          <li>Collect customer feedback via QR codes</li>
          <li>Filter and route positive reviews to Google Maps</li>
          <li>Capture and manage private negative feedback</li>
          <li>Track their online reputation via a dashboard</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Account Responsibilities">
        <ul className="list-disc space-y-2 pl-5 marker:text-orange-500">
          <li>You must provide accurate information when registering</li>
          <li>You are responsible for keeping your password secure</li>
          <li>You must not share your account with others</li>
          <li>You must be 18 years or older to use ReviewBoost</li>
          <li>
            One account per business owner — multiple restaurants can be managed
            under one account
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Acceptable Use">
        <p>You agree NOT to:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-orange-500">
          <li>Use ReviewBoost to post fake or misleading reviews on Google</li>
          <li>Attempt to reverse-engineer or copy the platform</li>
          <li>Use the service for any illegal purpose</li>
          <li>Abuse or harass our support team</li>
          <li>Circumvent any security or payment systems</li>
        </ul>
        <LegalHighlight>
          <p className="font-medium text-orange-100">Important:</p>
          <p className="mt-2">
            ReviewBoost is a feedback collection tool. Routing genuine positive
            experiences to Google is permitted. Fabricating reviews violates
            Google&apos;s policies and is strictly prohibited.
          </p>
        </LegalHighlight>
      </LegalSection>

      <LegalSection title="5. Subscription & Billing">
        <ul className="list-disc space-y-2 pl-5 marker:text-orange-500">
          <li>Free Trial: 30 days, 1 restaurant, no payment required</li>
          <li>Starter Plan: ₹499/month, up to 3 restaurants</li>
          <li>Growth Plan: ₹899/month, up to 10 restaurants</li>
          <li>Subscriptions renew automatically each month</li>
          <li>You can cancel anytime from your billing settings</li>
          <li>Payments are processed by Razorpay</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Intellectual Property">
        <p>
          ReviewBoost and all its content, branding, and code are owned by us.
          You retain ownership of all feedback data you collect through the
          platform.
        </p>
      </LegalSection>

      <LegalSection title="7. Termination">
        <p>We reserve the right to suspend or terminate accounts that:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-orange-500">
          <li>Violate these terms</li>
          <li>Are used fraudulently</li>
          <li>Have unpaid balances for more than 30 days</li>
        </ul>
        <p>You may delete your account at any time from settings.</p>
      </LegalSection>

      <LegalSection title="8. Limitation of Liability">
        <p>ReviewBoost is provided &quot;as is.&quot; We are not liable for:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-orange-500">
          <li>Loss of Google reviews or ranking changes</li>
          <li>Downtime or service interruptions</li>
          <li>Actions taken by third-party services (Google, Razorpay)</li>
        </ul>
        <p>
          Our maximum liability is limited to the amount you paid in the last 30
          days.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to Terms">
        <p>
          We may update these terms. We will notify you by email at least 7 days
          before significant changes take effect.
        </p>
      </LegalSection>

      <LegalSection title="10. Governing Law">
        <p>
          These terms are governed by the laws of India. Any disputes will be
          resolved in courts of Mumbai, Maharashtra.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>
          For questions about these terms:{" "}
          <a href="mailto:legal@reviewboost.in">legal@reviewboost.in</a>
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
