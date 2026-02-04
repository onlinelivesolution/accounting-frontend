import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

/* ---------- Types ---------- */
interface PaymentMethod {
    id: number;
    name: string;
}

interface BankAccountPayload {
    bankAccountName: string;
    category: string;
    defaultPaymentMethod: number | null;
    bankName: string;
    accountNumber: string;
    branchName: string;
    branchCode: string;
    description: string;
    openingBalance: number;
    openingBalanceDate: string | null;
    isActive: boolean;
    isDefault: boolean;
}

/* ---------- Component ---------- */
const BankAccounts: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [bankAccountName, setBankAccountName] = useState("");
    const [category, setCategory] = useState("");
    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [branchName, setBranchName] = useState("");
    const [branchCode, setBranchCode] = useState("");
    const [description, setDescription] = useState("");
    const [openingBalance, setOpeningBalance] = useState<number>(0);
    const [openingBalanceDate, setOpeningBalanceDate] = useState<Date | null>(new Date());
    const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<number | null>(null);

    /* Auto-checked */
    const [isActive, setIsActive] = useState(true);

    /* ---------- Load Payment Methods ---------- */
    useEffect(() => {
        const loadPaymentMethods = async () => {
            const res = await axios.get<PaymentMethod[]>(
                "http://127.0.0.1:8000/api/banktransactions/loadDefaultPaymentMethods"
            );
            setPaymentMethods(res.data ?? []);
        };
        loadPaymentMethods();
    }, []);

    /* ---------- Submit ---------- */
    const submitBankAccountButton = async () => {
        const payload: BankAccountPayload = {
            bankAccountName,
            category,
            defaultPaymentMethod,
            bankName,
            accountNumber,
            branchName,
            branchCode,
            description,
            openingBalance: openingBalance || 0,
            openingBalanceDate: openingBalanceDate
                ? openingBalanceDate.toISOString().split("T")[0]
                : null,
            isActive,
            isDefault: false,
        };

        console.log("Sending Payload:", payload);

        try {
            await axios.post(
                "http://127.0.0.1:8000/api/bankaccounts/createBankAccount",
                payload
            );
            alert("Bank account created successfully");
            setIsOpen(false);
        } catch (err: any) {
            if (err.response) {
                console.error("422 Error Details:", err.response.data);
                alert(JSON.stringify(err.response.data, null, 2));
            } else {
                console.error(err);
                alert("Failed to save bank account");
            }
        } alert("Failed to save bank account");

    };

    return (
        <div className="p-4">
            <div className="flex justify-between mb-3">
                <h2 className="text-lg font-bold">Manage Bank Account</h2>
                <button
                    className="border border-blue-600 px-4 py-1 rounded hover:bg-blue-600 hover:text-white"
                    onClick={() => setIsOpen(true)}
                >
                    Add New
                </button>
            </div>

            {/* ================= MODAL ================= */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-[800px] p-6 rounded-lg border border-blue-300">

                        {/* Header */}
                        <div className="flex justify-between border-b pb-2 mb-4">
                            <h3 className="font-semibold">Bank Account Information</h3>
                            <button onClick={() => setIsOpen(false)}>✕</button>
                        </div>

                        {/* Form */}
                        <div className="grid grid-cols-2 gap-4">

                            {/* Bank Account Name */}

                            <div className="flex items-center gap-2">
                                <label className="w-40 text-sm">Bank Account Name</label>
                                <input
                                    type="text"
                                    value={bankAccountName}
                                    onChange={(e) => setBankAccountName(e.target.value)}
                                    className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                            {/* Branch Name */}
                            <div className="flex items-center gap-2">
                                <label className="w-40 text-sm">Branch Name</label>
                                <input
                                    type="text"
                                    value={branchName}
                                    onChange={(e) => setBranchName(e.target.value)}
                                    className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                            {/* Category */}
                            <div className="flex items-center gap-2">
                                <label className="w-40 text-sm">Account Category</label>
                                <input
                                    type="text"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                            {/* Branch Code */}
                            <div className="flex items-center gap-2">
                                <label className="w-40 text-sm">Branch Code</label>
                                <input
                                    type="text"
                                    value={branchCode}
                                    onChange={(e) => setBranchCode(e.target.value)}
                                    className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                            {/* Payment Method */}
                            <div className="flex items-center gap-2">
                                <label className="w-40 text-sm">Payment Method</label>
                                <div className="relative flex-1">
                                    <select
                                        value={defaultPaymentMethod ?? ""}
                                        onChange={(e) =>
                                            setDefaultPaymentMethod(
                                                e.target.value ? Number(e.target.value) : null
                                            )
                                        }
                                        className="w-full flex-1 h-[32px] px-2 py-1 appearance-none rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    >
                                        <option value="">Select</option>
                                        {paymentMethods.map((pm) => (
                                            <option key={pm.id} value={pm.id}>
                                                {pm.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* Opening Balance */}

                            <div className="flex items-center gap-2">
                                <label className="w-40 text-sm">Opening Balance</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={openingBalance}
                                    onChange={(e) => setOpeningBalance(Number(e.target.value))}
                                    placeholder="Enter opening balance"
                                    className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                            {/* Bank Name */}
                            <div className="flex items-center gap-2">
                                <label className="w-40 text-sm">Bank Name</label>
                                <input
                                    type="text"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                            {/* Opening Date */}
                            <div className="flex items-center gap-2">
                                <label className="w-40 text-sm">Opening Date</label>
                                <DatePicker
                                    selected={openingBalanceDate}
                                    onChange={setOpeningBalanceDate}
                                    className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                            {/* Account Number */}
                            <div className="flex items-center gap-2">
                                <label className="w-40 text-sm">Account Number</label>
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                            {/* Active */}
                            <div className="flex items-center gap-4">
                                <label className="w-40 text-sm">Active Account</label>
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="w-5 h-5 accent-blue-600"
                                />
                            </div>

                            {/* Description */}
                            <div className="col-span-2 flex items-center gap-2">
                                <label className="w-40 text-sm">Description</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                            <button className="border px-4 py-1 rounded" onClick={() => setIsOpen(false)}>
                                Cancel
                            </button>
                            <button className="bg-blue-600 text-white px-4 py-1 rounded" onClick={submitBankAccountButton}>
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default BankAccounts;
