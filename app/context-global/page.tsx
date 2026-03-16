"use client";

import { useState, createContext, useContext } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Transaction,
  INITIAL_DATA,
  getChartData,
  getStatusColor,
} from "../shared";

// --- GLOBALNY CONTEXT (Problem!) ---
type GlobalContextType = {
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

// --- CIĘŻKI CHART (używa Context - będzie się re-renderował!) ---
const HeavyChart = ({ data }: { data: Transaction[] }) => {
  // Subskrybuje Context - każda zmiana hoveredRowId = re-render tego charta!
  const { hoveredRowId } = useGlobalContext();

  const chartData = getChartData(data);
  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  // Symulacja ciężkiej pracy przy renderze charta
  let sum = 0;
  for (let i = 0; i < 5000000; i++) {
    sum += Math.sqrt(i) * Math.sin(i);
  }

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
      data-sum={sum}
    >
      <h3 className="text-lg font-bold text-slate-900 mb-4">
        Transakcje per Status
        {hoveredRowId && (
          <span className="ml-2 text-sm font-normal text-slate-400">
            (hover: {hoveredRowId})
          </span>
        )}
      </h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="count"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                name="Liczba"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`$${value}`, "Kwota"]}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- WIERSZ TABELI (używa Context) ---
const BadSlowRow = ({ transaction }: { transaction: Transaction }) => {
  const { hoveredRowId, setHoveredRowId } = useGlobalContext();
  const isHovered = hoveredRowId === transaction.id;

  return (
    <tr
      onMouseEnter={() => setHoveredRowId(transaction.id)}
      onMouseLeave={() => setHoveredRowId(null)}
      className={`border-b border-slate-100/70 transition-colors cursor-pointer ${
        isHovered ? "bg-rose-50 border-rose-200" : "bg-white"
      }`}
    >
      <td className="py-3 px-4 text-sm whitespace-nowrap text-slate-900 font-medium">
        {transaction.id}
      </td>
      <td className="py-3 px-4 text-sm text-slate-600 font-medium">
        {transaction.user}
      </td>
      <td className="py-3 px-4 text-sm font-bold text-slate-700">
        ${transaction.amount.toFixed(2)}
      </td>
      <td className="py-3 px-4 text-sm text-slate-500 tabular-nums">
        {transaction.date}
      </td>
      <td className="py-3 px-4 text-sm">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(
            transaction.status,
          )}`}
        >
          {transaction.status}
        </span>
      </td>
    </tr>
  );
};

// --- GŁÓWNY DASHBOARD ---
export default function ContextGlobalDemo() {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = INITIAL_DATA.filter(
    (txn) =>
      txn.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <GlobalContext.Provider value={{ hoveredRowId, setHoveredRowId }}>
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-bold">
                    🔴 Zła Architektura
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Context Global State
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Hover = re-render{" "}
                  <span className="font-bold text-rose-600">
                    {filteredData.length} wierszy + chart
                  </span>
                </p>
              </div>

              <div className="w-full md:w-80">
                <input
                  type="text"
                  placeholder="Szukaj użytkownika lub ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500 focus:bg-white outline-none transition-all text-sm"
                />
              </div>
            </div>
          </header>

          {/* Chart - re-renderuje się przy każdym hover! */}
          <HeavyChart data={filteredData} />

          {/* Tabela */}
          <main className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-rose-50/80 px-4 py-3 border-b border-rose-200">
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
                Przejedź kursorem po wierszach - zauważ lag (chart się
                re-renderuje!)
              </span>
            </div>
            <div className="overflow-auto max-h-[50vh]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/95 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((transaction) => (
                    <BadSlowRow
                      key={transaction.id}
                      transaction={transaction}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </GlobalContext.Provider>
  );
}
