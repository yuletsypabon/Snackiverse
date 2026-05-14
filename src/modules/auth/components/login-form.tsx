"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "Login failed");
        return;
      }

      router.replace("/dashboard");
      // window.location.href = "/dashboard";
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <form
    onSubmit={handleSubmit}
    className="flex w-full max-w-sm flex-col gap-4 rounded border p-6"
  >
    <h1 className="text-2xl font-bold">Login</h1>

    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="rounded border p-2"
      required
    />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="rounded border p-2"
      required
    />

    {error && <p className="text-red-500">{error}</p>}

    <button
      type="submit"
      disabled={loading}
      className="rounded bg-black p-2 text-white disabled:opacity-60"
    >
      {loading ? "Loading..." : "Login"}
    </button>
  </form>
);

}
