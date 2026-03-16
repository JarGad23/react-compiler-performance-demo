import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900 flex items-center justify-center">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            React Performance Demo
          </h1>
          <p className="text-lg text-slate-600">
            Porównanie dwóch architektur zarządzania stanem
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/context-global"
            className="group block p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-rose-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-bold">
                🔴 Zła
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
              Context Global State
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Hover w Context → re-render 250 wierszy + ciężki chart
            </p>
          </Link>

          <Link
            href="/state-colocation"
            className="group block p-6 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                🟢 Dobra
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              State Colocation
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Hover lokalnie → re-render tylko 1 wiersza (chart bez zmian)
            </p>
          </Link>
        </div>

        <div className="text-center text-sm text-slate-400">
          <p>250 wierszy + ciężki chart (5M iteracji)</p>
        </div>
      </div>
    </div>
  );
}
