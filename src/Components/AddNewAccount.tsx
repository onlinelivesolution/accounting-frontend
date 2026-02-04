import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import axios from "axios";
import { createDetailItem } from "../services/detailItemService";

interface AccountTypeOption {
    value: string;
    label: string;
}

const AddNewAccount: React.FC = () => {
    const [detailItemName, setDetailItemName] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [openingBalance, setOpeningBalance] = useState<string>("");
    const [accountType, setAccountType] = useState<string>("");
    const [accountTypes, setAccountTypes] = useState<AccountTypeOption[]>([]);
    const [selectedAccountType, setSelectedAccountType] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!accountType || !detailItemName.trim()) {
            setError("Account Type and Account Name are required");
            return;
        }

        const payload: any = {
            accountType,
            detailItemName: detailItemName.trim(),
            loadType: selectedAccountType,
        };

        if (openingBalance && Number(openingBalance) > 0) {
            payload.openingBalance = Number(openingBalance);
        }

        try {
            setLoading(true);
            await createDetailItem(payload);

            setMessage("Detail Item created successfully ✅");
            setAccountType("");
            setDetailItemName("");
            setOpeningBalance("");
            setSelectedAccountType("");
        } catch (err: any) {
            setError(err.message || "Failed to create Detail Item");
        } finally {
            setLoading(false);
        }
    };

    const ACCOUNT_MAPPING_RULES = [
        { value: "Current Asset", label: "Current Asset" },
        { value: "Non-current Asset", label: "Non-current Asset" },
        { value: "Short Term Liabilities", label: "Short Term Liabilities" },
        { value: "Long Term Liabilities", label: "Long Term Liabilities" },
        { value: "Owner's Equities", label: "Owner's Equities" },
        { value: "Operating Income", label: "Operating Income" },
        { value: "Non-Operating Income", label: "Non-Operating Income" },
        { value: "Operating Expense", label: "Operating Expense" },
        { value: "Non-Operating Expense", label: "Non-Operating Expense" },
        { value: "Cost of Goods Sold", label: "Cost of Goods Sold" },
    ];

    useEffect(() => {
        axios
            .get("http://127.0.0.1:8000/api/common/loadAccountType")
            .then(res => setAccountTypes(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="gap-4 pt-5 pl-60 pr-60">
            <label className="text-gray-600 p-1 text-lg font-bold">
                Add New Account
            </label>

            {/* 🔹 FORM START */}
            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-2 bg-white pt-20 pr-30 pl-30 pb-20 border border-gray-300 rounded-lg gap-4"
            >
                {/* Mapping Account */}
                <div className="flex items-center gap-3 col-span-2">
                    <label className="text-sm text-gray-500 w-48">
                        Mapping Account
                    </label>
                    <div className="relative w-full">
                        <select
                            value={accountType}
                            onChange={(e) => setAccountType(e.target.value)}
                            className="w-full px-2 py-1 h-8 rounded border border-gray-400 text-sm text-gray-600 bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-gray-700"
                        >
                            <option value="">Select Mapping Account</option>

                            {ACCOUNT_MAPPING_RULES.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>

                        <ChevronDown className="absolute inset-y-1.5 right-2 w-5 h-5 text-gray-500 pointer-events-none" />
                    </div>
                </div>

                {/* Account Name */}
                <div className="flex items-center gap-3 col-span-2">
                    <label className="text-sm text-gray-500 w-48">
                        Account Name
                    </label>
                    <input
                        type="text"
                        value={detailItemName}
                        onChange={(e) => setDetailItemName(e.target.value)}
                        placeholder="enter account name"
                        className="w-full h-8 px-2 rounded border border-gray-400 text-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-gray-700"
                    />
                </div>
                <div className="flex items-center gap-3 col-span-2">
                    <label className="text-sm text-gray-500 w-48">
                        Opening Balance
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={openingBalance}
                        onChange={(e) => setOpeningBalance(e.target.value)}
                        placeholder="Enter opening balance"
                        className="w-full h-8 px-2 rounded border border-gray-400 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-700"
                    />
                </div>
                <div className="flex items-center gap-3 col-span-2">
                    <label className="text-sm text-gray-500 w-48">
                        Type ( Optional )
                    </label>
                    <div className="relative w-full">
                        <select
                            value={selectedAccountType}
                            onChange={(e) => setSelectedAccountType(e.target.value)}
                            className="w-full px-2 py-1 h-8 rounded border border-gray-400 text-gray-600 bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-gray-700"
                        >
                            <option value="">Select Type</option>
                            {accountTypes.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>

                        <ChevronDown className="absolute inset-y-1.5 right-2 w-5 h-5 text-gray-500 pointer-events-none" />
                    </div>
                </div>

                {/* Buttons */}
                <div className="col-span-2 flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={() => {
                            setAccountType("");
                            setDetailItemName("");
                            setMessage("");
                            setError("");
                        }}
                        className="bg-gray-400 px-4 py-1.5 rounded text-white"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 px-4 py-1.5 rounded text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>

                {/* Messages */}
                {message && (
                    <div className="col-span-2 text-green-600 text-sm">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="col-span-2 text-red-600 text-sm">
                        {error}
                    </div>
                )}
            </form>
            {/* 🔹 FORM END */}
        </div>
    );
};

export default AddNewAccount;
