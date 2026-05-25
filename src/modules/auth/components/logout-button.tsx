"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);

        await fetch("/api/auth/logout", {
        method: "POST",
        });

        router.replace("/login");
        router.refresh();
    };

    return (
        <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="text-sm font-extrabold text-red-400 hover:text-red-300 disabled:opacity-60"
        >
        {loading ? "Saliendo..." : "← Salir"}
        </button>
    );
}