import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { Calendar } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import api from "@/utils/axios";

interface TrialBalanceItem {
  ControlItemName: string;
  ReportingItemName: string;
  DetailItemCode: string;
  DetailItemName: string;
  NormalBalance: string;
  TotalDebit: number;
  TotalCredit: number;
  DebitBalance: number;
  CreditBalance: number;
}

interface TrialBalanceResponse {
  rows: TrialBalanceItem[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

interface BalanceItem {
  name: string;
  amount: number;
}

const TrialBalance: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  //   const [asOfDate, setAsOfDate] = useState<Date | null>(new Date());
  //   const formatDate = (date: Date) => date.toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());

  const [data, setData] = useState<{
    rows: {
      controlItemName: string;
      reportingItemName: string;
      detailItemCode: string;
      detailItemName: string;
      normalBalance: string;
      debit: number;
      credit: number;
    }[];
    totalDebit: number;
    totalCredit: number;
    isBalanced: boolean;
  } | null>(null);

  const loadTrialBalance = async () => {
    if (!fromDate || !toDate) {
      alert("Please select From Date and To Date.");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const response = await api.get<TrialBalanceResponse>(
        "/api/accountreports/trial-balance",
        {
          params: {
            from_date: fromDate.toISOString().split("T")[0],
            to_date: toDate.toISOString().split("T")[0],
          },
        },
      );

      const result = response.data;

      setData({
        rows: result.rows.map((row) => ({
          controlItemName: row.ControlItemName,
          reportingItemName: row.ReportingItemName,
          detailItemCode: row.DetailItemCode,
          detailItemName: row.DetailItemName,
          normalBalance: row.NormalBalance,
          debit: Number(row.DebitBalance),
          credit: Number(row.CreditBalance),
        })),
        totalDebit: Number(result.totalDebit),
        totalCredit: Number(result.totalCredit),
        isBalanced: result.isBalanced,
      });
    } catch (err: any) {
      console.error(err);

      setError(err.response?.data?.detail ?? "Unable to load Trial Balance.");
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
      <h1 className="text-2xl font-bold mb-4">Trial Balance</h1>

      <div className="flex items-center gap-3 mb-4">
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
              size={16}
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
          onClick={loadTrialBalance}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          Load
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {data && (
        <>
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Code</th>
                <th className="border px-2 py-1">Account Name</th>
                <th className="border px-2 py-1">Category</th>
                <th className="border px-2 py-1">Type</th>
                <th className="border px-2 py-1 text-right">Debit</th>
                <th className="border px-2 py-1 text-right">Credit</th>
              </tr>
            </thead>

            <tbody>
              {data.rows.map((row) => (
                <tr key={row.detailItemCode}>
                  <td className="border px-2 py-1">{row.detailItemCode}</td>

                  <td className="border px-2 py-1">{row.detailItemName}</td>

                  <td className="border px-2 py-1">{row.controlItemName}</td>

                  <td className="border px-2 py-1">{row.reportingItemName}</td>

                  <td className="border px-2 py-1 text-right">
                    {row.debit.toLocaleString()}
                  </td>

                  <td className="border px-2 py-1 text-right">
                    {row.credit.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot className="bg-gray-100 font-bold">
              <tr>
                <td colSpan={4} className="border px-2 py-1 text-right">
                  Total
                </td>

                <td className="border px-2 py-1 text-right">
                  {data.totalDebit.toLocaleString()}
                </td>

                <td className="border px-2 py-1 text-right">
                  {data.totalCredit.toLocaleString()}
                </td>
              </tr>

              <tr>
                <td
                  colSpan={6}
                  className={`border px-2 py-2 text-center ${
                    data.isBalanced ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {data.isBalanced
                    ? "✓ Trial Balance is Balanced"
                    : "✗ Trial Balance is NOT Balanced"}
                </td>
              </tr>
            </tfoot>
          </table>
        </>
      )}
    </div>
  );
};

export default TrialBalance;
