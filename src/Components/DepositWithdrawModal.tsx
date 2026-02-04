import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

interface DetailItem {
    detailItemCode: string;
    detailItemName: string;
    loadType: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const DepositWithdrawModal: React.FC<Props> = ({ isOpen, onClose }) => {

    const [transactionType, setTransactionType] =
        useState<"DEPOSIT" | "WITHDRAWAL">("DEPOSIT");

    const [bankAccounts, setBankAccounts] = useState<DetailItem[]>([]);
    const [sourceAccounts, setSourceAccounts] = useState<DetailItem[]>([]);
    const [bankDetailItemCode, setBankDetailItemCode] = useState<string>("");
    const [sourceDetailItemCode, setSourceDetailItemCode] = useState<string>("");
    const [accountBalance, setAccountBalance] = useState<number>(0);
    const [amount, setAmount] = useState<number>(0);
    const [referenceNo, setReferenceNo] = useState("");
    const [description, setDescription] = useState("");
    const [transactionDate, setTransactionDate] = useState<Date>(new Date());

    useEffect(() => {
        if (!bankDetailItemCode) {
            setAccountBalance(0);
            return;
        }

        const loadBalance = async () => {
            const res = await axios.get(
                `http://127.0.0.1:8000/api/banktransactions/getAccountBalance/${bankDetailItemCode}`
            );
            setAccountBalance(res.data.balance);
        };

        loadBalance();
    }, [bankDetailItemCode]);

    useEffect(() => {
        if (isOpen) {
            loadBankAccounts();
            loadSourceAccounts();
        }
    }, [isOpen]);

    /* ✅ Conditional return AFTER hooks */
    if (!isOpen) return null;


    /* 🔹 Load data from backend */


    const loadBankAccounts = async () => {
        const res = await axios.get(
            "http://127.0.0.1:8000/api/common/loadBankOrCashAccount",
            { params: { loadTypes: "BANK,CASH" } }
        );
        setBankAccounts(res.data);
    };

    const loadSourceAccounts = async () => {
        const res = await axios.get(
            "http://127.0.0.1:8000/api/common/loadBankOrCashAccount",
            { params: { loadTypes: "BANK,CASH" } }
        );
        setSourceAccounts(res.data);
    };


    const filteredBankAccounts = bankAccounts.filter(
        b => b.detailItemCode !== sourceDetailItemCode
    );

    const filteredSourceAccounts = sourceAccounts.filter(
        s => s.detailItemCode !== bankDetailItemCode
    );

    const submitTransaction = async () => {
        if (!bankDetailItemCode || !sourceDetailItemCode) {
            toast.error("Please select bank and source account");
            return;
        }
        if (transactionType === "WITHDRAWAL" && amount > accountBalance) {
            toast.error("Withdrawal amount is greater than available balance");
            return;
        }
        if (amount <= 0) {
            toast.error("Amount must be greater than zero");
            return;
        }
        const payload = {
            transactionType,
            bankDetailItemCode,
            contraDetailItemCode: sourceDetailItemCode, // ✅ STRING
            amount: Number(amount),
            transactionDate: transactionDate.toISOString().split("T")[0],
            referenceNo: referenceNo || null,
            description: description || null,
        };

        try {
            toast.loading("Saving transaction...");
            console.log("Submitting payload:", payload);
            await axios.post("http://127.0.0.1:8000/api/banktransactions/createBankTransaction", payload);
            toast.dismiss();
            toast.success("Transaction saved successfully");
            onClose();
        } catch (err: any) {
            toast.dismiss("txn");
            toast.error(
                err.response?.data?.detail || "Failed to save transaction"
            );
        }
    };




    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white w-[700px] rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Bank Deposit / Withdrawal</h2>

                <div className="grid grid-cols-4 gap-4">

                    {/* Transaction Type */}
                    <div className="flex items-center gap-3 col-span-2">
                        <label className="text-sm text-gray-500 w-48">
                            Transaction Type
                        </label>
                        <div className="relative w-full">
                            <select
                                value={transactionType}
                                onChange={(e) => setTransactionType(e.target.value as any)}
                                className="w-full px-2 py-1 h-8 rounded border border-gray-400 text-sm text-gray-600 bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-gray-700"
                            >
                                <option value="">Select Transaction Type</option>

                                <option value="DEPOSIT">Deposit</option>
                                <option value="WITHDRAWAL">Withdrawal</option>
                            </select>

                            <ChevronDown className="absolute inset-y-1.5 right-2 w-5 h-5 text-gray-500 pointer-events-none" />
                        </div>
                    </div>


                    {/* Bank Account */}
                    <div className="flex items-center gap-3 col-span-2">
                        <label className="text-sm text-gray-500 w-45">
                            Bank Account
                        </label>
                        <div className="relative w-full">
                            <select
                                value={bankDetailItemCode}
                                onChange={(e) => setBankDetailItemCode(e.target.value)}
                                className="w-full px-2 py-1 h-8 rounded border border-gray-400 text-sm text-gray-600 bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-gray-700"
                            >
                                <option value="">Select Bank</option>
                                {filteredBankAccounts.map(b => (
                                    <option
                                        key={b.detailItemCode}
                                        value={b.detailItemCode}
                                    >
                                        {b.detailItemName}
                                    </option>
                                ))}
                            </select>

                            <ChevronDown className="absolute inset-y-1.5 right-2 w-5 h-5 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                    {/* Contra Account */}
                    <div className="flex items-center gap-3 col-span-2">
                        <label className="text-sm text-gray-500 w-48">
                            Source Account
                        </label>
                        <div className="relative w-full">
                            <select
                                value={sourceDetailItemCode}
                                onChange={(e) => setSourceDetailItemCode(e.target.value)}
                                className="w-full px-2 py-1 h-8 rounded border border-gray-400 text-sm text-gray-600 bg-white appearance-none focus:outline-none focus:ring-1 focus:ring-gray-700"
                            >
                                <option value="">Select Source</option>
                                {filteredSourceAccounts.map(s => (
                                    <option key={s.detailItemCode} value={s.detailItemCode}>
                                        {s.detailItemName}
                                    </option>
                                ))}
                            </select>

                            <ChevronDown className="absolute inset-y-1.5 right-2 w-5 h-5 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 col-span-2">
                        <div className="flex items-center gap-3 col-span-2">
                            <label className="text-sm text-gray-500 w-45">
                                Current Balance
                            </label>
                            <input
                                type="number"
                                value={accountBalance.toFixed(2)}
                                readOnly
                                className="w-full h-8 px-2 pr-[0px] text-right rounded border border-gray-400 text-xl text-green-600 bg-white cursor-not-allowed"
                            />
                        </div>

                    </div>


                    {/* Amount */}
                    <div className="flex items-center gap-3 col-span-2">
                        <label className="text-sm text-gray-500 w-48">
                            Amount
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            placeholder="Enter amount"
                            className="w-full h-8 px-2 rounded border border-gray-400 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-700"
                        />
                    </div>


                    {/* Date */}
                    <div className="flex items-center gap-4 col-span-2">
                        <label className="text-sm text-gray-500 w-48">
                            Transac: Date
                        </label>
                        <input
                            type="date"
                            value={transactionDate?.toISOString().split("T")[0]}
                            onChange={(e) => setTransactionDate(new Date(e.target.value))}
                            className="w-full h-8 px-2 py-1 rounded border border-gray-400 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-700"
                        />
                    </div>

                    {/* Reference */}
                    <div className="flex items-center gap-3 col-span-2">
                        <label className="text-sm text-gray-500 w-48">
                            Reference No
                        </label>
                        <input
                            type="text"
                            value={referenceNo}
                            onChange={(e) => setReferenceNo(e.target.value)}
                            className="w-full h-8 px-2 rounded border border-gray-400 text-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-gray-700"
                        />
                    </div>

                    {/* Description */}
                    <div className="flex items-center gap-3 col-span-4">
                        <label className="text-sm text-gray-500 w-34">
                            Description
                        </label>
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full h-8 px-2 py-1 rounded border border-gray-400 text-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-gray-700"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-4">
                    <button onClick={onClose} className="px-4 py-1 border rounded border-gray-400 text-gray-700">
                        Cancel
                    </button>
                    <button
                        onClick={submitTransaction}
                        className="px-4 py-1 bg-blue-600 text-white rounded w-20"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DepositWithdrawModal;
