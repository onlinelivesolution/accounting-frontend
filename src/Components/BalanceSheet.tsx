import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { Calendar } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

interface BalanceItem {
    name: string;
    amount: number;
}

interface BalanceSheetData {
    assets: BalanceItem[];
    liabilities: BalanceItem[];
    equity: BalanceItem[];
}

interface ApiItem {
    DetailItemName: string;
    ClosingBalance: number;
}

interface BalanceSheetResponse {
    assets: ApiItem[];
    liabilities: ApiItem[];
    equity: ApiItem[];
}

const BalanceSheet: React.FC = () => {
    const [data, setData] = useState<BalanceSheetData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [asOfDate, setAsOfDate] = useState<Date | null>(new Date());
    const formatDate = (date: Date) =>
        date.toISOString().split("T")[0];

    const loadBalanceSheet = async () => {
        if (!asOfDate) {
            alert("Please select an As of Date");
            return;
        }

        setLoading(true);
        setError("");
        setData(null);

        try {
            const dateStr = asOfDate.toISOString().split("T")[0];
            const response = await fetch(
                `http://127.0.0.1:8000/api/accountreports/balance-sheet?as_of_date=${dateStr}`
            );

            if (!response.ok) {
                throw new Error("Failed to load balance sheet");
            }

            const result: BalanceSheetResponse = await response.json();

            setData({
                assets: result.assets.map(a => ({
                    name: a.DetailItemName,
                    amount: Number(a.ClosingBalance),
                })),
                liabilities: result.liabilities.map(l => ({
                    name: l.DetailItemName,
                    amount: Number(l.ClosingBalance),
                })),
                equity: result.equity.map(e => ({
                    name: e.DetailItemName,
                    amount: Number(e.ClosingBalance),
                })),
            });
        } catch (err) {
            console.error(err);
            setError("Unable to load balance sheet data");
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
                            <td className="text-right">
                                {total.toLocaleString()}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Balance Sheet</h1>

            <div className="flex gap-3 mb-4">
                <div className="relative w-[180px]">
                    <DatePicker
                        selected={asOfDate}
                        onChange={(date: Date | null) => setAsOfDate(date)}
                        dateFormat="yyyy-MM-dd"
                        popperPlacement="bottom-start"
                        popperClassName="z-50"
                        className="w-full h-[28px] pl-2 pr-8 rounded border border-gray-400 text-gray-700 text-[12px] focus:outline-none focus:ring-2 focus:ring-gray-700"
                    />

                    <Calendar
                        size={14}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                    />
                </div>

                {/* <DatePicker
                    selected={asOfDate}
                    onChange={(date: Date | null) => setAsOfDate(date)}
                    dateFormat="yyyy-MM-dd"
                    popperPlacement="bottom-start"
                    popperClassName="z-50"
                    className="w-full h-[28px] px-2 rounded border border-gray-400 text-gray-700 text-[12px] focus:outline-none focus:ring-2 focus:ring-gray-700"
                />
                <Calendar
                    size={16}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                /> */}

                <button
                    onClick={loadBalanceSheet}
                    className="bg-blue-600 text-white px-4 py-1 rounded"
                >
                    Load
                </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {data && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderSection("Assets", data.assets)}
                    {renderSection("Liabilities", data.liabilities)}
                    {renderSection("Equity", data.equity)}
                </div>
            )}
        </div>
    );
};

export default BalanceSheet;