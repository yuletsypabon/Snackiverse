const stats = [
    {
        label: "VENTAS HOY",
        value: "$0",
        detail: "Total del día",
        className: "from-emerald-500 to-green-500 border-emerald-600",
    },
    {
        label: "ESTUDIANTES",
        value: "6",
        detail: "Registrados",
        className: "from-sky-600 to-sky-500 border-sky-700",
    },
    {
        label: "MOROSOS",
        value: "0",
        detail: "Con deuda",
        className: "from-red-600 to-red-500 border-red-700",
    },
    {
        label: "PRODUCTOS",
        value: "12",
        detail: "Catálogo",
        className: "from-purple-700 to-purple-500 border-purple-800",
    },
    ];

    const navigation = [
    { icon: "🏠", label: "Inicio", active: true },
    { icon: "🛒", label: "Registrar Venta" },
    { icon: "🧑", label: "Estudiantes", section: "ADMINISTRACIÓN" },
    { icon: "🍽️", label: "Productos" },
    { icon: "💰", label: "Recargas" },
    { icon: "💳", label: "Pagos" },
    { icon: "📊", label: "Reportes" },
    { icon: "📋", label: "Centro de Informes" },
    { icon: "👥", label: "Vendedores" },
    { icon: "🛡️", label: "Permisos" },
    ];

    function formatDashboardDate() {
    return new Intl.DateTimeFormat("es-CO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date());
    }

    export default function DashboardPage() {
    return (
        <main className="min-h-screen bg-[#edf2f8] text-slate-950">
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[296px_1fr]">
            <aside className="border-r border-slate-950 bg-[#2d4254] text-white shadow-xl lg:min-h-screen">
            <div className="flex h-full flex-col">
                <div className="flex h-[102px] items-center gap-3 border-b border-slate-950 bg-[#17232d] px-4">
                <div className="grid h-12 w-9 place-items-center rounded border border-white/80 bg-white text-2xl shadow-sm">
                    🌶️
                </div>

                <div className="text-xl font-black tracking-tight [text-shadow:2px_2px_0_#001a2c]">
                    Snackie<span className="text-emerald-400">Verse</span>
                </div>
                </div>

                <div className="flex h-14 items-center justify-between border-b border-slate-950 bg-[#17232d] px-4 text-sm font-bold">
                <div className="flex items-center gap-2">
                    <span>👑</span>
                    <span>Administrador</span>
                    <span className="rounded-md bg-emerald-600 px-3 py-1 text-xs text-emerald-50">
                    admin
                    </span>
                </div>

                <button className="text-sm font-extrabold text-red-400 hover:text-red-300">
                    ← Salir
                </button>
                </div>

                <nav className="py-2 text-[15px] font-bold">
                {navigation.map((item) => (
                    <div key={item.label}>
                    {item.section && (
                        <div className="px-4 pb-2 pt-4 text-xs font-black tracking-[0.18em] text-slate-400">
                        {item.section}
                        </div>
                    )}

                    <a
                        href="#"
                        className={`flex h-[53px] items-center gap-4 px-5 transition ${
                        item.active
                            ? "bg-white/10 text-white"
                            : "text-slate-50 hover:bg-white/5"
                        }`}
                    >
                        <span className="w-5 text-lg leading-none">{item.icon}</span>
                        <span>{item.label}</span>
                    </a>
                    </div>
                ))}
                </nav>
            </div>
            </aside>

            <section className="px-5 py-9 sm:px-7">
            <header className="mb-6">
                <h1 className="text-3xl font-black tracking-wide text-[#0a2540] [text-shadow:2px_2px_0_#7eb7ed]">
                Panel Principal <span className="text-2xl">👋</span>
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                {formatDashboardDate()}
                </p>
            </header>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                <article
                    key={stat.label}
                    className={`min-h-[125px] rounded-[14px] border bg-gradient-to-br px-5 py-5 text-white shadow-sm ${stat.className}`}
                >
                    <p className="text-sm font-black">{stat.label}</p>
                    <div className="mt-2 text-4xl font-black leading-none [text-shadow:2px_2px_0_rgba(0,0,0,0.22)]">
                    {stat.value}
                    </div>
                    <p className="mt-3 text-sm font-medium text-white/95">
                    {stat.detail}
                    </p>
                </article>
                ))}
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-2">
                <article className="rounded-2xl bg-white px-6 py-7 shadow-lg shadow-slate-300/40">
                <h2 className="mb-7 flex items-center gap-2 text-lg font-black">
                    <span>⏱️</span>
                    Últimas ventas
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-300 text-xs font-black tracking-wider text-slate-500">
                        <th className="pb-3 pl-3">HORA</th>
                        <th className="pb-3">ESTUDIANTE</th>
                        <th className="pb-3">VENDEDOR</th>
                        <th className="pb-3">TOTAL</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                        <td className="py-6 text-center text-slate-600" colSpan={4}>
                            Sin ventas aún
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </div>
                </article>

                <article className="rounded-2xl bg-white px-6 py-7 shadow-lg shadow-slate-300/40">
                <h2 className="mb-7 flex items-center gap-2 text-lg font-black">
                    <span>⚠️</span>
                    Alertas
                </h2>

                <div className="flex items-center justify-between gap-4">
                    <div>
                    <p className="font-black">Samuel Díaz</p>
                    <p className="mt-1 text-sm text-slate-500">Saldo bajo · 5°</p>
                    </div>

                    <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-black text-orange-600">
                    $3.200
                    </span>
                </div>
                </article>
            </section>
            </section>
        </div>
        </main>
    );
}
