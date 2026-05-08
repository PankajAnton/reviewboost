import type { Metadata } from "next";
import {
  LegalLayout,
  LegalSection,
  LegalHighlight,
} from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — ReviewBoost",
  description:
    "Refund and cancellation rules for ReviewBoost subscriptions.",
};

export default function RefundPolicyPage() {
  return (
    <LegalLayout
      title="Refund & Cancellation Policy"
      subtitle="Simple and fair — no hidden rules"
    >
      <LegalSection title="1. Free Trial">
        <ul className="list-disc space-y-2 pl-5 marker:text-orange-500">
          <li>No payment required during the 30-day free trial</li>
          <li>
            Trial ends automatically — you will not be charged unless you choose a
            plan
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Cancellation">
        <ul className="list-disc space-y-2 pl-5 marker:text-orange-500">
          <li>
            You can cancel your subscription at any time from Dashboard → Billing
          </li>
          <li>
            On cancellation, your account remains active until the end of the
            current billing period
          </li>
          <li>No partial refunds for unused days in the current month</li>
          <li>
            After the period ends, your account downgrades — data is retained for
            90 days
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Refund Policy">
        <LegalHighlight>
          <p>
            We offer a{" "}
            <span className="font-semibold text-orange-50">
              7-day refund window
            </span>{" "}
            from the date of first payment on any paid plan. If you are
            unsatisfied, email us at{" "}
            <a href="mailto:support@reviewboost.in">support@reviewboost.in</a>{" "}
            within 7 days and we will issue a full refund — no questions asked.
          </p>
        </LegalHighlight>
        <p className="font-medium text-zinc-300">After 7 days:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-orange-500">
          <li>Refunds are not issued for monthly subscription charges</li>
          <li>Refunds are not issued for partial months</li>
          <li>
            Refunds are not issued if your account has been suspended for ToS
            violations
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. How Refunds Are Processed">
        <ul className="list-disc space-y-2 pl-5 marker:text-orange-500">
          <li>
            Refunds are returned to the original payment method via Razorpay
          </li>
          <li>Processing time: 5–10 business days depending on your bank</li>
          <li>
            You will receive an email confirmation when the refund is initiated
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Plan Changes">
        <ul className="list-disc space-y-2 pl-5 marker:text-orange-500">
          <li>
            Upgrading from Starter to Growth: charged the difference immediately
          </li>
          <li>
            Downgrading: takes effect at the next billing cycle, no refund for the
            difference
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Contact for Refunds">
        <p>
          Email:{" "}
          <a href="mailto:support@reviewboost.in">support@reviewboost.in</a>
        </p>
        <p>
          Include your registered email and reason for refund request. We respond
          within 1 business day.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
