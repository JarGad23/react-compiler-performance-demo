"use client";

import React, { useState } from "react";
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

// --- CIĘŻKI CHART (stałe dane - nie zależy od filtra ani hovera!) ---
const HeavyChart = ({ data }: { data: Transaction[] }) => {
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
        Transakcje per Status (wszystkie dane)
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

// --- WIERSZ TABELI (lokalny state!) ---
const GoodSlowRow = ({ transaction }: { transaction: Transaction }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <tr
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`border-b border-slate-100/70 transition-colors cursor-pointer ${
        isHovered ? "bg-emerald-50 border-emerald-200" : "bg-white"
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
export default function StateColocationDemo() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = INITIAL_DATA.filter(
    (txn) =>
      txn.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                  🟢 Dobra Architektura
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                State Colocation
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Hover ={" "}
                <span className="font-bold text-emerald-600">1 wiersz</span> |
                Input ={" "}
                <span className="font-bold text-emerald-600">tylko tabela</span>{" "}
                | Chart ={" "}
                <span className="font-bold text-emerald-600">stałe dane</span>
              </p>
            </div>

            <div className="w-full md:w-80">
              <input
                type="text"
                placeholder="Szukaj użytkownika lub ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm"
              />
            </div>
          </div>
        </header>

        {/* Chart - używa INITIAL_DATA, nie zależy od filtra ani hovera */}
        <HeavyChart data={INITIAL_DATA} />

        {/* Tabela */}
        <main className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-emerald-50/80 px-4 py-3 border-b border-emerald-200">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Przejedź kursorem - płynna interakcja (chart się NIE re-renderuje)
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
                  <GoodSlowRow key={transaction.id} transaction={transaction} />
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
