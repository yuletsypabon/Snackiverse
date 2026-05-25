"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "vendor">("admin"); // Default role, can be changed to "vendor" as needed
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
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "Login failed");
        return;
      }

      router.replace(data.user.role === "admin" ? "/dashboard" : "/sales");
      // window.location.href = "/dashboard";
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <section className="grid w-full max-w-[1030px] overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-black/30 lg:min-h-[558px] lg:grid-cols-[1.08fr_0.92fr]">
    <aside className="bg-gradient-to-br from-[#073818] via-[#17632f] to-[#25a957] px-8 py-10 text-white">
      <div className="flex min-h-full flex-col items-center justify-center gap-8">
        <div className="grid h-48 w-64 place-items-center bg-white p-4 shadow-xl">
          <div className="text-center font-black leading-[0.82]">
            
          </div>
        </div>

        <p className="max-w-72 text-center text-lg font-medium">
          Sistema de gestión de cafetería escolar
        </p>

        <div className="grid w-full gap-3">
          <button type="button" onClick={() => setRole("admin")} className="flex items-center gap-4 rounded-xl border border-white/40 bg-white/15 px-5 py-4 text-left">
            <span className="text-2xl">👑</span>
            <span>
              <span className="block font-black">Administrador</span>
              <span className="text-sm font-semibold">Acceso completo al sistema</span>
            </span>
          </button>

          <button type="button" onClick={() => setRole("vendor")} className="flex items-center gap-4 rounded-xl border border-white/40 bg-white/15 px-5 py-4 text-left">
            <span className="text-2xl">🛒</span>
            <span>
              <span className="block font-black">Vendedor</span>
              <span className="text-sm font-semibold">Solo registro de ventas</span>
            </span>
          </button>
        </div>
      </div>
    </aside>

    <div className="flex items-center justify-center px-7 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-[360px]">
        <div className="mb-9 text-center">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">Bienvenido</p>
          <h1 className="mt-3 text-3xl font-black text-[#0a2540] [text-shadow:2px_2px_0_#9fc8ed]">
            Iniciar sesión
          </h1>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button type="button" onClick={() => setRole("admin")} className={`h-11 rounded-[10px] font-black ${role === "admin" ? "bg-white shadow text-[#0a2540]" : "text-slate-500"}`}>
            Admin
          </button>
          <button type="button" onClick={() => setRole("vendor")} className={`h-11 rounded-[10px] font-black ${role === "vendor" ? "bg-white shadow text-[#0a2540]" : "text-slate-500"}`}>
            Vendedor
          </button>
        </div>

        <input type="email" placeholder="Usuario" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-4 h-[54px] w-full rounded-xl border-2 border-slate-200 px-5 outline-none focus:border-emerald-400 text-slate-900 placeholder:text-slate-400" required />

        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-4 h-[54px] w-full rounded-xl border-2 border-slate-200 px-5 outline-none focus:border-emerald-400 text-slate-900 placeholder:text-slate-400" required />

        {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="h-14 w-full rounded-xl bg-gradient-to-r from-[#27ae60] to-[#2ecc71] text-lg font-black text-white shadow-xl shadow-emerald-200 disabled:opacity-60">
          {loading ? "Ingresando..." : "Ingresar →"}
        </button>

        <div className="mt-6 text-center text-sm text-slate-500">
          <p>SnackieVerse · Cafetería Escolar</p>
          <p className="mt-2 text-xs text-slate-400">Contacta al administrador si olvidaste tu contraseña</p>
        </div>
      </form>
    </div>
  </section>
);  

}
