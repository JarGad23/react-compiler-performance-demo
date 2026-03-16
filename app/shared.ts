// --- WSPÓLNE TYPY I DANE ---

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

  for (let i = 0; i < 250; i++) {
    data.push({
      id: `TXN-${i.toString().padStart(5, "0")}`,
      user: `User ${(i * 137) % 100}`,
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

export const INITIAL_DATA = generateData();

// Dane do wykresu - agregacja per status
export const getChartData = (data: Transaction[]) => {
  const statusCounts = data.reduce(
    (acc, txn) => {
      acc[txn.status] = (acc[txn.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const statusAmounts = data.reduce(
    (acc, txn) => {
      acc[txn.status] = (acc[txn.status] || 0) + txn.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  return [
    { name: "Completed", count: statusCounts["Completed"] || 0, amount: Math.round(statusAmounts["Completed"] || 0) },
    { name: "Pending", count: statusCounts["Pending"] || 0, amount: Math.round(statusAmounts["Pending"] || 0) },
    { name: "Failed", count: statusCounts["Failed"] || 0, amount: Math.round(statusAmounts["Failed"] || 0) },
  ];
};

export const getStatusColor = (status: Transaction["status"]) => {
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
