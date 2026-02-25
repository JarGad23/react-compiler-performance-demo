"use client";

import React, { useState, createContext, useContext } from "react";

// --- 1. STRUKTURA DANYCH ---
export interface Transaction {
  id: string;
  user: string;
  amount: number;
  date: string;
  status: "Completed" | "Pending" | "Failed";
  description: string;
}

const generateData = (): Transaction[] => {
  const data: Transaction[] = [];
  const statuses: Transaction["status"][] = ["Completed", "Pending", "Failed"];
  const baseDate = new Date("2024-01-01").getTime();

  for (let i = 0; i < 2000; i++) {
    data.push({
      id: `TXN-${i.toString().padStart(5, "0")}`,
      user: `User ${(i * 137) % 1000}`,
      amount: parseFloat(((i * 47.3) % 1000).toFixed(2)),
      date: new Date(baseDate - ((i * 1234567) % 10000000000))
        .toISOString()
        .split("T")[0],
      status: statuses[i % statuses.length],
      description: `Payment for order #${i}`,
    });
  }
  return data;
};

const INITIAL_DATA = generateData();

// --- 2. GLOBALNY STAN (Problem) ---
type GlobalContextType = {
  theme: "light" | "dark";
  hoveredRowId: string | null;
  setHoveredRowId: (id: string | null) => void;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

const useGlobalContext = () => {
  const ctx = useContext(GlobalContext);
  if (!ctx)
    throw new Error("Brak GlobalContext - komponent musi być w Providerze");
  return ctx;
};

// --- 3. WSPÓLNA LOGIKA (Dla obu typów wierszy) ---
const simulateHeavyWork = (id: string) => {
  let hash = 0;
  // Bardzo ciężka, ale "czysta" pętla, aby Compiler jej nie ignorował
  for (let i = 0; i < 300000; i++) {
    hash += id.charCodeAt(i % id.length);
  }
  return hash;
};

const getStatusColor = (status: Transaction["status"]) => {
  switch (status) {
    case "Completed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Pending":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Failed":
      return "bg-rose-100 text-rose-800 border-rose-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
};

// --- 4. ZŁY WIERSZ (Wodospad przez Context) ---
// Pobiera STAN HOVERA z KONTEKSTU. Ponieważ każdy wiersz uderza do kontekstu,
// zmiana `hoveredRowId` zmusza wszystkie 2000 wierszy do aktualizacji (WODOSPAD!),
// omijając skuteczność React Compilera dla akcji "Hover".
const BadSlowRow = ({ transaction }: { transaction: Transaction }) => {
  const { hoveredRowId, setHoveredRowId, theme } = useGlobalContext();
  const hash = simulateHeavyWork(transaction.id);

  const isHovered = hoveredRowId === transaction.id;

  return (
    <tr
      data-hash={hash}
      onMouseEnter={() => setHoveredRowId(transaction.id)}
      onMouseLeave={() => setHoveredRowId(null)}
      className={`border-b border-slate-100/70 transition-colors cursor-pointer ${
        isHovered ? "bg-rose-50 border-rose-200" : "bg-white"
      } ${theme === "dark" ? "opacity-90" : ""}`}
    >
      <td className="py-4 px-6 text-sm whitespace-nowrap text-slate-900 font-medium">
        {transaction.id}
      </td>
      <td className="py-4 px-6 text-sm text-slate-600 font-medium">
        {transaction.user}
      </td>
      <td className="py-4 px-6 text-sm font-bold text-slate-700">
        ${transaction.amount.toFixed(2)}
      </td>
      <td className="py-4 px-6 text-sm text-slate-500 tabular-nums">
        {transaction.date}
      </td>
      <td className="py-4 px-6 text-sm">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
            transaction.status,
          )}`}
        >
          {transaction.status}
        </span>
      </td>
      <td className="py-4 px-6 text-sm text-slate-500 truncate max-w-[200px]">
        {transaction.description}
      </td>
    </tr>
  );
};

// --- 5. DOBRY WIERSZ (Colocation) ---
// Stan Hovera lokalnie! Temat nadal uderza w Kontekst, ale temat się nie zmienia.
// Dzięki nowo ułożonej architekturze React Compiler ma perfekcyjne środowisko pracy.
const GoodSlowRow = ({ transaction }: { transaction: Transaction }) => {
  const { theme } = useGlobalContext();
  const [isHovered, setIsHovered] = useState(false);

  const hash = simulateHeavyWork(transaction.id);

  return (
    <tr
      data-hash={hash}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`border-b border-slate-100/70 transition-colors cursor-pointer ${
        isHovered ? "bg-emerald-50 border-emerald-200" : "bg-white"
      } ${theme === "dark" ? "opacity-90" : ""}`}
    >
      <td className="py-4 px-6 text-sm whitespace-nowrap text-slate-900 font-medium">
        {transaction.id}
      </td>
      <td className="py-4 px-6 text-sm text-slate-600 font-medium">
        {transaction.user}
      </td>
      <td className="py-4 px-6 text-sm font-bold text-slate-700">
        ${transaction.amount.toFixed(2)}
      </td>
      <td className="py-4 px-6 text-sm text-slate-500 tabular-nums">
        {transaction.date}
      </td>
      <td className="py-4 px-6 text-sm">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
            transaction.status,
          )}`}
        >
          {transaction.status}
        </span>
      </td>
      <td className="py-4 px-6 text-sm text-slate-500 truncate max-w-[200px]">
        {transaction.description}
      </td>
    </tr>
  );
};

// --- 6. GŁÓWNY DASHBOARD ---
export default function PerformanceDemo() {
  const [searchQuery, setSearchQuery] = useState("");
  const [architecture, setArchitecture] = useState<"bad" | "good">("bad");

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  const filteredData = INITIAL_DATA.filter(
    (txn) =>
      txn.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <GlobalContext.Provider value={{ theme, hoveredRowId, setHoveredRowId }}>
      <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden flex flex-col gap-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  Performance Dashboard
                </h1>
                <p className="text-sm text-slate-500 mt-2 font-medium">
                  Dataset:{" "}
                  <span className="font-bold text-slate-700">2000 wierszy</span>{" "}
                  | Typ Architektury:
                  <span
                    className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${architecture === "bad" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}
                  >
                    {architecture === "bad"
                      ? "Globalny Stan (Context)"
                      : "Stan Lokalny (Colocation)"}
                  </span>
                </p>
              </div>

              {/* Przełącznik Fazy z Artykułu */}
              <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200/60 w-full md:w-auto overflow-x-auto">
                <button
                  onClick={() => setArchitecture("bad")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                    architecture === "bad"
                      ? "bg-white text-rose-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  🔴 Zła Architektura (Context)
                </button>
                <button
                  onClick={() => setArchitecture("good")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                    architecture === "good"
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  🟢 Dobra Architektura (Colocation)
                </button>
              </div>
            </div>

            <div className="w-full relative z-10">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <svg
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Szukaj użytkownika (test Wyszukiwarki)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm font-medium"
              />
            </div>
          </header>

          <main className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Symulacja: Przejedź kursorem po wierszach poniżej (test Hovera)
              </span>
            </div>
            <div className="overflow-x-auto h-[65vh] relative min-w-full">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/95 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-200 shadow-sm">
                  <tr>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((transaction) =>
                    architecture === "bad" ? (
                      <BadSlowRow
                        key={transaction.id}
                        transaction={transaction}
                      />
                    ) : (
                      <GoodSlowRow
                        key={transaction.id}
                        transaction={transaction}
                      />
                    ),
                  )}

                  {filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-16 text-center text-slate-500 font-medium bg-slate-50/30"
                      >
                        Brak wyników dla hasła{" "}
                        <span className="text-slate-900">
                          &quot;{searchQuery}&quot;
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </GlobalContext.Provider>
  );
}
