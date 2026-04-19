import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import api from "@/utils/axios";

export interface AccountingRow {
    rowId: number;
    accountCode: string;
    entryType: string;
    amountSource: string;
}

const emptyRow = (id: number): AccountingRow => ({
    rowId: id,
    accountCode: "",
    entryType: "",
    amountSource: ""
});

const AccountingRuleSettings = () => {

    const [ruleCode, setRuleCode] = useState("");
    const [moduleName, setModuleName] = useState("");
    const [description, setDescription] = useState("");
    const [rows, setRows] = useState<AccountingRow[]>([emptyRow(1)]);
    const [accounts, setAccounts] = useState<any[]>([]);

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            const res = await api.get("/api/common/loadDetailItems"
            );
            setAccounts(res.data);
        } catch (error) {
            console.error("Error loading accounts:", error);
        }
    };

    const addRowBelow = (rowId: number) => {
        setRows(prev => {
            const index = prev.findIndex(r => r.rowId === rowId);
            const newRow = emptyRow(Date.now());
            const updated = [...prev];
            updated.splice(index + 1, 0, newRow);
            return updated;
        });
    };

    const removeRows = (rowId: number) => {
        if (rows.length === 1) return;
        setRows(prev => prev.filter(r => r.rowId !== rowId));
    };

    const updateRow = (id: number, field: keyof AccountingRow, value: any) => {
        setRows(prev =>
            prev.map(r => {
                if (r.rowId !== id) return r;

                const updated = { ...r, [field]: value };

                return {
                    ...updated,

                };
            })
        );
    };




    const submitAccountingRule = async () => {

        const payload = {
            ruleCode,
            moduleName,
            description,
            details: rows
        };

        await api.post("/api/accounting-rules/createAccountingRule", payload);

        alert("Accounting rule saved successfully");
    };

    return (
        <div className="p-6">

            <h2 className="text-xl font-semibold mb-4">
                Accounting Rule Setup
            </h2>

            {/* Header Section */}

            <div className="grid grid-cols-6 gap-4 mb-4">

                <input
                    placeholder="Rule Code"
                    value={ruleCode}
                    onChange={(e) => setRuleCode(e.target.value)}
                    className="border border-gray-400 px-2 h-8 rounded text-sm col-span-2"
                />

                <input
                    placeholder="Module Name"
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    className="border border-gray-400 px-2 h-8 rounded text-sm col-span-2"
                />

                <input
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border border-gray-400 px-2 h-8 rounded text-sm col-span-2"
                />

            </div>

            {/* Rule Detail Table */}

            <table className="w-full border border-gray-400 rounded rounded-lg text-sm">
                <thead className="bg-[#1c3c61] rounded rounded-lg">
                    <tr>
                        <th className="p-2 text-left text-white">Account</th>
                        <th className="p-2 text-left text-white">Entry Type</th>
                        <th className="p-2 text-left text-white">Amount Source</th>
                        <th className="p-2 w-20 text-center text-white">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {rows.map(row => (
                        <tr key={row.rowId}>
                            <td className="p-1 w-60">
                                <div className="relative w-full">
                                    <select
                                        value={row.accountCode}
                                        onChange={(e) =>
                                            updateRow(row.rowId, "accountCode", e.target.value)
                                        }
                                        className="w-full h-[30px] px-2 pr-8 rounded border border-gray-400 text-sm appearance-none"
                                    >

                                        <option value="">Select Account</option>

                                        {accounts.map((acc) => (
                                            <option
                                                key={acc.detailItemCode}
                                                value={acc.detailItemCode}
                                            >
                                                {acc.detailItemCode} - {acc.detailItemName}
                                            </option>
                                        ))}

                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                                    />
                                </div>
                            </td>

                            <td className="p-1 w-60">
                                <div className="relative w-full">
                                    <select
                                        value={row.entryType}
                                        onChange={(e) =>
                                            updateRow(row.rowId, "entryType", e.target.value)
                                        }
                                        className="w-full h-[30px] px-2 pr-8 rounded border border-gray-400 text-sm appearance-none"
                                    >

                                        <option value="DEBIT">DEBIT</option>
                                        <option value="CREDIT">CREDIT</option>

                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                                    />
                                </div>
                            </td>

                            <td className="p-1 w-60">
                                <div className="relative w-full">
                                    <select
                                        value={row.amountSource}
                                        onChange={(e) =>
                                            updateRow(row.rowId, "amountSource", e.target.value)
                                        }
                                        className="w-full h-[30px] px-2 pr-8 rounded border border-gray-400 text-sm appearance-none"
                                    >
                                        <option value="">Select Field</option>
                                        <option value="totalAmount">Total Amount</option>                                        
                                        <option value="exclusiveAmount">Exclusive Amount</option>
                                        <option value="vatAmount">VAT Amount</option>
                                        <option value="discountAmount">Discount</option>
                                        <option value="totalPaid">Total Paid</option>
                                        <option value="totalApplied">Total Applied</option>
                                        <option value="totalDiscount">Total Discount</option>
                                        <option value="totalUnallocated">Total Unallocated</option>

                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                                    />
                                </div>
                            </td>

                            <td className="p-1 text-center">
                                <div className="flex justify-center gap-2">
                                    <button
                                        onClick={() => addRowBelow(row.rowId)}
                                        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-700"
                                        title="Add row below"
                                    >
                                        A
                                    </button>
                                    <button
                                        onClick={() => removeRows(row.rowId)}
                                        className={`px-2 py-1 rounded text-white ${rows.length === 1
                                            ? "bg-gray-300 cursor-not-allowed"
                                            : "bg-red-500 hover:bg-red-600"
                                            }`}
                                        disabled={rows.length === 1}
                                        title="Delete row"
                                    >
                                        D
                                    </button>
                                </div>
                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

            <div className="mt-5 flex gap-3 justify-end">
                <button
                    onClick={submitAccountingRule}
                    className="bg-green-600 h-8 text-white px-3 py-1 rounded"
                >
                    Submit
                </button>

            </div>

        </div>
    );
};

export default AccountingRuleSettings;