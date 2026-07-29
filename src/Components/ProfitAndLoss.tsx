import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { Calendar } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import api from "@/utils/axios";

interface ProfitLossItem {
  ControlItemName: string;
  ReportingItemName: string;
  DetailItemCode: string;
  DetailItemName: string;
  NormalBalance: string;
  TotalDebit: number;
  TotalCredit: number;
  Amount: number;
}

interface ProfitLossResponse {
  income: ProfitLossItem[];
  cogs: ProfitLossItem[];
  expense: ProfitLossItem[];

  totalIncome: number;
  totalCOGS: number;
  totalExpense: number;

  grossProfit: number;
  netProfit: number;
}

interface BalanceItem {
  name: string;
  amount: number;
}

const ProfitAndLoss: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());

  const [data, setData] = useState<{
    income: { name: string; amount: number }[];
    cogs: { name: string; amount: number }[];
    expense: { name: string; amount: number }[];
    totalIncome: number;
    totalCOGS: number;
    totalExpense: number;
    grossProfit: number;
    netProfit: number;
  } | null>(null);

  const loadProfitLoss = async () => {
    if (!fromDate || !toDate) {
      alert("Please select From Date and To Date.");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {

      const response = await api.get<ProfitLossResponse>(
        "/api/accountreports/profit-loss",
        {
          params: {
            from_date: fromDate.toISOString().split("T")[0],
            to_date: toDate.toISOString().split("T")[0],
          },
        },
      );

      const result = response.data;

      setData({
        income: result.income.map((item) => ({
          name: item.DetailItemName,
          amount: Number(item.Amount),
        })),

        cogs: result.cogs.map((item) => ({
          name: item.DetailItemName,
          amount: Number(item.Amount),
        })),

        expense: result.expense.map((item) => ({
          name: item.DetailItemName,
          amount: Number(item.Amount),
        })),

        totalIncome: Number(result.totalIncome),
        totalCOGS: Number(result.totalCOGS),
        totalExpense: Number(result.totalExpense),
        grossProfit: Number(result.grossProfit),
        netProfit: Number(result.netProfit),
      });
    } catch (err: any) {
      console.error(err);

      setError(
        err.response?.data?.detail ?? "Unable to load Profit & Loss report.",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (title: string, items: BalanceItem[]) => {
    const total = items.reduce((sum, i) => sum + i.amount, 0);

    return (
      <div className="border rounded p-4">
        <h2 className="font-semibold text-lg mb-2">{title}</h2>
        <table className="w-full text-sm">
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-1">{item.name}</td>
                <td className="py-1 text-right">
                  {item.amount.toLocaleString()}
                </td>
              </tr>
            ))}
            <tr className="font-bold">
              <td>Total {title}</td>
              <td className="text-right">{total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profit & Loss</h1>

      <div className="flex gap-3 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium w-20">From Date</label>

          <div className="relative">
            <DatePicker
              selected={fromDate}
              onChange={(date: Date | null) => setFromDate(date)}
              dateFormat="yyyy-MM-dd"
              popperPlacement="bottom-start"
              popperClassName="z-50"
              className="w-40 h-8 pl-2 pr-8 rounded border border-gray-400 text-sm"
            />

            <Calendar
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">To Date</label>
          <div className="relative">
            <DatePicker
              selected={toDate}
              onChange={(date: Date | null) => setToDate(date)}
              dateFormat="yyyy-MM-dd"
              popperPlacement="bottom-start"
              popperClassName="z-50"
              className="w-40 h-8 pl-2 pr-8 rounded border border-gray-400 text-sm"
            />
            <Calendar
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>
        </div>

        <button
          onClick={loadProfitLoss}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          Load
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {data && (
        <>
          <h3>Income</h3>
          {data.income.map((item) => (
            <div key={item.name} className="flex justify-between">
              <span>{item.name}</span>
              <span>{item.amount.toLocaleString()}</span>
            </div>
          ))}

          <h3>Cost of Goods Sold</h3>
          {data.cogs.map((item) => (
            <div key={item.name} className="flex justify-between">
              <span>{item.name}</span>
              <span>{item.amount.toLocaleString()}</span>
            </div>
          ))}

          <h3>Expenses</h3>
          {data.expense.map((item) => (
            <div key={item.name} className="flex justify-between">
              <span>{item.name}</span>
              <span>{item.amount.toLocaleString()}</span>
            </div>
          ))}

          <hr />

          <div className="flex justify-between font-bold">
            <span>Total Income</span>
            <span>{data.totalIncome.toLocaleString()}</span>
          </div>

          <div className="flex justify-between font-bold">
            <span>Total COGS</span>
            <span>{data.totalCOGS.toLocaleString()}</span>
          </div>

          <div className="flex justify-between font-bold">
            <span>Gross Profit</span>
            <span>{data.grossProfit.toLocaleString()}</span>
          </div>

          <div className="flex justify-between font-bold">
            <span>Total Expense</span>
            <span>{data.totalExpense.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-lg font-bold text-blue-700">
            <span>Net Profit / (Loss)</span>
            <span>{data.netProfit.toLocaleString()}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfitAndLoss;
