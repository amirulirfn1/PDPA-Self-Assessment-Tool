"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      if (!auth) {
        throw new Error(
          "Firebase client configuration missing. Set NEXT_PUBLIC_FIREBASE_* variables."
        );
      }
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to sign in with provided credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-main">
      <section className="hero-card">
        <h1>Sign In</h1>
        <p>Use your Firebase account to access the compliance workspace.</p>
      </section>
      <section className="panel" style={{ maxWidth: 520, marginTop: 16 }}>
        <form className="stack" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required />
          </div>
          {error ? (
            <p role="alert" style={{ color: "var(--risk-high)", margin: 0 }}>
              {error}
            </p>
          ) : null}
          <button className="btn btn-primary" disabled={loading} type="submit">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}
