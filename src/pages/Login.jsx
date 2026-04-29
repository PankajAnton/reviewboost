import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";
import PasswordField from "../components/PasswordField.jsx";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message || "Could not log in. Check your credentials.");
      return;
    }
    navigate(from, { replace: true });
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
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Log in to manage your review links and QR codes.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error ? (
              <div
                className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100"
                role="alert"
              >
                {error}
              </div>
            ) : null}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full min-h-12 rounded-2xl border border-stone-200 bg-stone-50/50 px-4 text-stone-900 shadow-sm outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/25"
              />
            </div>
            <PasswordField
              id="login-password"
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="flex w-full min-h-12 items-center justify-center rounded-2xl bg-[#f97316] px-4 font-semibold text-white shadow-md transition hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in…" : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-600">
            New here?{" "}
            <Link to="/signup" className="font-semibold text-[#f97316] hover:text-[#ea580c]">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
