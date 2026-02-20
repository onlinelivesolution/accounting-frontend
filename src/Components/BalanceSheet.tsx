import { useEffect, useState } from "react";

interface BalanceItem {
    name: string;
    amount: number;
}

interface BalanceSheetResponse {
    asOfDate: string;
    assets: BalanceItem[];
    liabilities: BalanceItem[];
    equity: BalanceItem[];
}

export default function BalanceSheet() {
    const [data, setData] = useState<BalanceSheetResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [asOfDate, setAsOfDate] = useState("");

    useEffect(() => {
        loadBalanceSheet();
    }, []);

    const loadBalanceSheet = async () => {
        if (!asOfDate) {
            alert("Please select an As of Date");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:8000/accountreports/balance-sheet?as_of_date=${asOfDate}`
            );
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error("Failed to load balance sheet", error);
        } finally {
            setLoading(false);
        }
    };


    const sum = (items: BalanceItem[] = []) =>
        items.reduce((t, i) => t + i.amount, 0);

    if (loading) {
        return <div className="p-6 text-gray-600">Loading Balance Sheet...</div>;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">
                Balance Sheet
            </h1>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <label className="text-sm text-gray-600">As of Date</label>
                <input
                    type="date"
                    value={asOfDate}
                    onChange={(e) => setAsOfDate(e.target.value)}
                    className="border rounded px-3 py-1 text-sm"
                />
                <button
                    onClick={loadBalanceSheet}
                    className="bg-gray-800 text-white px-4 py-1 rounded text-sm hover:bg-gray-900"
                >
                    Load
                </button>
            </div>

            {data && (
                <div className="grid grid-cols-2 gap-8">
                    {/* ASSETS */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">
                            Assets
                        </h2>
                        <div className="border rounded">
                            {data.assets.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between px-4 py-2 border-b text-sm"
                                >
                                    <span>{item.name}</span>
                                    <span>{item.amount.toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="flex justify-between px-4 py-2 font-semibold bg-gray-100">
                                <span>Total Assets</span>
                                <span>{sum(data.assets).toLocaleString()}</span>
                            </div>
                        </div>
                    </section>

                    {/* LIABILITIES + EQUITY */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">
                            Liabilities
                        </h2>
                        <div className="border rounded mb-6">
                            {data.liabilities.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between px-4 py-2 border-b text-sm"
                                >
                                    <span>{item.name}</span>
                                    <span>{item.amount.toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="flex justify-between px-4 py-2 font-semibold bg-gray-100">
                                <span>Total Liabilities</span>
                                <span>{sum(data.liabilities).toLocaleString()}</span>
                            </div>
                        </div>

                        <h2 className="text-lg font-semibold text-gray-700 mb-2">
                            Equity
                        </h2>
                        <div className="border rounded">
                            {data.equity.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between px-4 py-2 border-b text-sm"
                                >
                                    <span>{item.name}</span>
                                    <span>{item.amount.toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="flex justify-between px-4 py-2 font-semibold bg-gray-100">
                                <span>Total Equity</span>
                                <span>{sum(data.equity).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* TOTAL */}
                        <div className="mt-6 border rounded bg-gray-50">
                            <div className="flex justify-between px-4 py-3 font-bold text-gray-800">
                                <span>Total Liabilities & Equity</span>
                                <span>
                                    {(sum(data.liabilities) + sum(data.equity)).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
