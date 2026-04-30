import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import PasswordField from "../components/PasswordField.jsx";
import { LogoDark } from "../components/Logo.jsx";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  /** After signUp, collect OTP from email (Supabase Confirm signup / email OTP). */
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please check and try again.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (err) {
      setError(err.message || "Sign up failed. Try a stronger password.");
      return;
    }

    if (data.session) {
      navigate("/dashboard", { replace: true });
      return;
    }

    // Confirm email / OTP flow: user must enter code from email
    setAwaitingOtp(true);
    setOtp("");
    setInfo(
      "We’ve triggered a confirmation email. Open it and use the 6-digit code below (or the link in the email)."
    );
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    const code = otp.replace(/\D/g, "").trim();
    if (code.length < 6) {
      setError("Please enter the 6-digit code from your email.");
      return;
    }
    setOtpLoading(true);
    // Docs: https://supabase.com/docs/guides/auth/auth-email-templates — use {{ .Token }} in "Confirm signup" template.
    // 6-digit OTP is verified with type "email" first; fallback "signup" for older setups.
    let { data, error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: "email",
    });
    if (!data?.session) {
      const second = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: "signup",
      });
      if (second.data?.session) {
        data = second.data;
        err = null;
      } else {
        err = second.error ?? err;
      }
    }
    setOtpLoading(false);

    if (err) {
      setError(
        err.message ||
          "Invalid or expired code. Try again or request a new code."
      );
      return;
    }

    if (data?.session) {
      navigate("/dashboard", { replace: true });
      return;
    }
    setError("Could not complete verification. Try logging in.");
  }

  async function handleResendOtp() {
    setError("");
    setInfo("");
    setResendLoading(true);
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
    });
    setResendLoading(false);
    if (err) {
      setError(err.message || "Could not resend code. Try again later.");
      return;
    }
    setInfo("A new code has been sent to your email.");
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-amber-50/80 to-stone-50 px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition hover:text-[#f97316]"
        >
          ← Back home
        </Link>
        <div className="mt-8 rounded-2xl bg-white p-8 shadow-md ring-1 ring-stone-200/80">
          <div className="mb-6 flex justify-center">
            <LogoDark size="auth" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            {awaitingOtp ? "Verify your email" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            {awaitingOtp
              ? `Enter the OTP we sent to ${email.trim() || "your inbox"}.`
              : "Start collecting feedback and guiding great reviews to Google."}
          </p>

          {!awaitingOtp ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {error ? (
                <div
                  className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}
              {info ? (
                <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100">
                  {info}
                </div>
              ) : null}
              <div>
                <label
                  htmlFor="su-email"
                  className="block text-sm font-medium text-stone-700"
                >
                  Email
                </label>
                <input
                  id="su-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full min-h-12 rounded-2xl border border-stone-200 bg-stone-50/50 px-4 text-stone-900 shadow-sm outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
                />
              </div>
              <PasswordField
                id="su-password"
                label="Password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
                minLength={6}
                hint="At least 6 characters"
                required
              />
              <PasswordField
                id="su-confirm-password"
                label="Confirm password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
                minLength={6}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="flex w-full min-h-12 items-center justify-center rounded-2xl bg-[#f97316] px-4 font-semibold text-white shadow-md transition hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Creating account…" : "Get Started Free"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="mt-8 space-y-4">
              {error ? (
                <div
                  className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}
              {info ? (
                <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-100">
                  {info}
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="su-otp"
                  className="block text-sm font-medium text-stone-700"
                >
                  Email OTP
                </label>
                <input
                  id="su-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))
                  }
                  className="mt-1.5 w-full min-h-12 rounded-2xl border border-stone-200 bg-stone-50/50 px-4 text-center font-mono text-lg tracking-[0.35em] text-stone-900 shadow-sm outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
                />
                <div className="mt-3 space-y-2 rounded-2xl bg-amber-50/80 p-4 text-xs leading-relaxed text-amber-950 ring-1 ring-amber-100">
                  <p className="font-semibold text-amber-900">OTP nahi aa raha?</p>
                  <ol className="list-decimal space-y-1 pl-4 text-amber-900/90">
                    <li>
                      Supabase Dashboard → <strong>Authentication</strong> →{" "}
                      <strong>Providers</strong> → Email →{" "}
                      <strong>Confirm email</strong> ON hona chahiye.
                    </li>
                    <li>
                      <strong>Authentication</strong> → <strong>Email Templates</strong> →{" "}
                      <strong>Confirm signup</strong>: body mein{" "}
                      <code className="rounded bg-white px-1 py-0.5 text-[11px]">
                        {`{{ .Token }}`}
                      </code>{" "}
                      zaroor rakho (warna sirf link aata hai, code nahi).{" "}
                      <span className="text-amber-800/90">
                        Ready HTML:{" "}
                        <code className="rounded bg-white px-1">supabase/email-templates/confirm-signup.html</code>
                      </span>
                    </li>
                    <li>Spam / Promotions folder check karo; thoda wait karo (1–2 min).</li>
                    <li>
                      Free tier pe deliverability ke liye{" "}
                      <strong>Project Settings → Auth → SMTP</strong> (custom provider) kabhi-kabhi zaroori hota hai.
                    </li>
                  </ol>
                  <p className="pt-1 text-[11px] text-amber-800/80">
                    Docs:{" "}
                    <a
                      href="https://supabase.com/docs/guides/auth/auth-email-templates"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium underline hover:text-[#f97316]"
                    >
                      Email templates
                    </a>
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={otpLoading}
                className="flex w-full min-h-12 items-center justify-center rounded-2xl bg-[#f97316] px-4 font-semibold text-white shadow-md transition hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {otpLoading ? "Verifying…" : "Verify & continue"}
              </button>

              <button
                type="button"
                disabled={resendLoading}
                onClick={handleResendOtp}
                className="w-full min-h-12 rounded-2xl bg-stone-100 text-sm font-semibold text-stone-800 transition hover:bg-stone-200 disabled:opacity-70"
              >
                {resendLoading ? "Sending…" : "Resend code"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAwaitingOtp(false);
                  setOtp("");
                  setError("");
                  setInfo("");
                }}
                className="w-full text-center text-sm font-medium text-stone-600 hover:text-[#f97316]"
              >
                ← Back to sign up
              </button>
            </form>
          )}

          {!awaitingOtp ? (
            <p className="mt-6 text-center text-sm text-stone-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#f97316] hover:text-[#ea580c]"
              >
                Log in
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
