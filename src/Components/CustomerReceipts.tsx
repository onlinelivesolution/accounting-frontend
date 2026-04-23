import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown } from "lucide-react";
import DatePicker from "react-datepicker";
import { Calendar } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "@/utils/axios";



interface Customer {
    customerID: number;
    customerName: string;
    vatReference: string;
    creditLimit: number;
}

interface SalesInvoice {
    salesInvoiceID: number;
    salesInvoiceNo: string;
    SalesInvoiceDate: string;
    totalAmount: number;
    dueAmount: number;
    receiveAmount: number;
    discountAmount: number;
    receiveInput: string;
    discountInput: string;
}

// Get first letter
const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?";
};

// Generate consistent color from string
const getColorFromName = (name: string) => {
    const colors = [
        "bg-red-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-indigo-500",
        "bg-teal-500",
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash % colors.length);
    return colors[index];
};

const CustomerReceipts: React.FC = () => {
    const today = new Date();
    const [receiptDate, setReceiptDate] = useState<Date>(today);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<number | "">("");
    const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [customerBalance, setCustomerBalance] = useState<string>("0.00");
    const [receiveAmount, setReceiveAmount] = useState<string>("0.00");
    const [unallocatedAmount, setUnallocatedAmount] = useState<string>("0.00");
    const [customerReceiptNo, setCustomerReceiptNo] = useState<string>("");
    const [paymentType, setPaymentType] = useState<"CASH" | "BANK">("CASH");
    const [selectedAccount, setSelectedAccount] = useState<string>("");
    const [accounts, setAccounts] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const parseAmount = (val: string | number) => {
        if (val === null || val === undefined) return 0;
        const num = typeof val === "number" ? val : parseFloat(val.replace(/,/g, ""));
        return isNaN(num) ? 0 : num;
    };

    const formatAmount = (num: number) => {
        return new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num || 0);
    };

    const handleTopReceiveChange = (value: string) => {
        // allow only numbers + dot + comma
        if (!/^[\d,]*\.?\d*$/.test(value)) return;

        setReceiveAmount(value);

        const numericValue = parseAmount(value);

        // reset allocation
        const resetInvoices = invoices.map((inv) => ({
            ...inv,
            receiveAmount: 0,
            discountAmount: 0,
            receiveInput: "0.00",
            discountInput: "0.00",
        }));

        setInvoices(resetInvoices);

        setUnallocatedAmount(formatAmount(numericValue));
    };

    const handleTopReceiveBlur = () => {
        const num = parseAmount(receiveAmount);
        setReceiveAmount(formatAmount(num));
        setUnallocatedAmount(formatAmount(num));
    };

    const handleInvoiceReceiveChange = (index: number, value: string) => {
        if (!/^[\d,]*\.?\d*$/.test(value)) return;

        const updated = [...invoices];
        updated[index].receiveInput = value;

        const receive = parseAmount(value);
        const discount = updated[index].discountAmount || 0;
        const due = updated[index].dueAmount;

        // ❌ Validation 1: receive alone > due
        if (receive > due) {
            alert("Receive amount cannot exceed due amount");
            updated[index].receiveInput = formatAmount(due);
            updated[index].receiveAmount = due;
            setInvoices(updated);
            return;
        }

        // ❌ Validation 2: receive + discount > due
        if (receive + discount > due) {
            alert("Receive + Discount cannot exceed due amount");

            const allowedReceive = due - discount;

            updated[index].receiveAmount = allowedReceive;
            updated[index].receiveInput = formatAmount(allowedReceive);

            setInvoices(updated);
            return;
        }

        updated[index].receiveAmount = receive;

        updateTotals(updated);
    };

    const handleInvoiceDiscountChange = (index: number, value: string) => {
        if (!/^[\d,]*\.?\d*$/.test(value)) return;

        const updated = [...invoices];
        updated[index].discountInput = value;

        const discount = parseAmount(value);
        const receive = updated[index].receiveAmount || 0;
        const due = updated[index].dueAmount;

        // ❌ Validation: receive + discount > due
        if (receive + discount > due) {
            alert("Receive + Discount cannot exceed due amount");

            const allowedDiscount = due - receive;

            updated[index].discountAmount = allowedDiscount;
            updated[index].discountInput = formatAmount(allowedDiscount);

            setInvoices(updated);
            return;
        }

        updated[index].discountAmount = discount;

        updateTotals(updated);
    };

    const updateTotals = (updatedInvoices: any[]) => {
        const totalAllocated = updatedInvoices.reduce(
            (sum, inv) => sum + inv.receiveAmount + inv.discountAmount,
            0
        );

        setReceiveAmount(formatAmount(totalAllocated));
        setUnallocatedAmount(formatAmount(0));

        setInvoices(updatedInvoices);
    };

    const handleInvoiceBlur = (index: number) => {
        const updated = [...invoices];

        updated[index].receiveInput = formatAmount(
            updated[index].receiveAmount
        );

        updated[index].discountInput = formatAmount(
            updated[index].discountAmount
        );

        setInvoices(updated);
    };


    const handleClearAllocation = () => {
        const reset = invoices.map((inv) => ({
            ...inv,

            // numeric values
            receiveAmount: 0,
            discountAmount: 0,

            // UI input values (IMPORTANT)
            receiveInput: "0.00",
            discountInput: "0.00",
        }));

        setInvoices(reset);

        const num = parseAmount(receiveAmount);
        setUnallocatedAmount(formatAmount(num));
    };

    useEffect(() => {
        const loadAccounts = async () => {
            try {
                const res = await api.get("/api/common/loadBankOrCashAccount");
                setAccounts(res.data);
            } catch (err) {
                console.error(err);
            }
        };

        loadAccounts();
    }, []);

    // Load customer dropdown list
    useEffect(() => {
        const loadCustomerDropdown = async () => {
            try {
                const response = await axios.get(
                    "http://127.0.0.1:8000/api/commondropdown/loadCustomerDropdown"
                );

                setCustomers(response.data);
            } catch (error) {
                console.error("Failed to load customer", error);
            }
        };

        loadCustomerDropdown();
    }, []);

    // Load next sales order number
    useEffect(() => {
        axios
            .get("http://127.0.0.1:8000/api/common/getNextReceiptNo")
            .then(res => setCustomerReceiptNo(res.data.receiptNo))
            .catch(err => console.error(err));
    }, []);


    const handleCustomerChange = async (customerId: number) => {
        setSelectedCustomer(customerId);
        setInvoices([]);
        setCustomerBalance("0.00");

        if (!customerId) return;

        try {
            setLoading(true);

            const start = Date.now(); // ⏱ start timer

            const [invoiceRes, balanceRes] = await Promise.all([
                api.get(`/api/customerreceipts/getCustomerInvoices/${customerId}`),
                api.get(`/api/customerreceipts/getCustomerBalance/${customerId}`)
            ]);

            // ⏱ ensure minimum 400ms loading
            const elapsed = Date.now() - start;
            const delay = Math.max(0, 400 - elapsed);
            await new Promise((res) => setTimeout(res, delay));

            // ✅ Map API → UI state (IMPORTANT)
            const formattedInvoices = invoiceRes.data.map((inv: any) => ({
                ...inv,

                // numeric values (for calculation)
                receiveAmount: 0,
                discountAmount: 0,

                // string values (for input fields)
                receiveInput: "0.00",
                discountInput: "0.00",
            }));

            setInvoices(formattedInvoices);

            // ✅ Format balance
            const balance = parseAmount(balanceRes.data.totalDue);
            setCustomerBalance(formatAmount(balance));

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedCustomer) {
            alert("Please select a customer");
            return;
        }

        if (!customerReceiptNo) {
            alert("Receipt No is required");
            return;
        }

        const total = parseAmount(receiveAmount);

        if (!total || total <= 0) {
            alert("Please enter receive amount");
            return;
        }

        if (!selectedAccount) {
            alert("Please select account");
            return;
        }

        const selectedInvoices = invoices.filter(
            (inv) => inv.receiveAmount > 0 || inv.discountAmount > 0
        );

        // ✅ Validate only if invoices used
        if (selectedInvoices.length > 0) {
            for (const inv of selectedInvoices) {
                if (inv.receiveAmount < 0 || inv.discountAmount < 0) {
                    alert("Amount cannot be negative");
                    return;
                }

                if (inv.receiveAmount + inv.discountAmount > inv.dueAmount) {
                    alert(
                        `Receive + Discount exceeds due for invoice ${inv.salesInvoiceNo}`
                    );
                    return;
                }
            }
        }

        const payload = {
            receiptNo: customerReceiptNo,
            receiptDate: new Date(receiptDate).toISOString().split("T")[0],
            customerID: Number(selectedCustomer),
            totalAmount: total,
            status: "APPROVED",
            companyCode: "01",

            accountID: selectedAccount,
            paymentType: paymentType,

            // ✅ KEY CHANGE
            details:
                selectedInvoices.length > 0
                    ? selectedInvoices.map((inv) => ({
                        salesInvoiceID: inv.salesInvoiceID,
                        paidAmount: inv.receiveAmount,
                        discountAmount: inv.discountAmount || 0,
                        narration: "",
                    }))
                    : [], // ✅ allow empty for unallocated
        };

        try {
            setSubmitting(true);

            await api.post("/api/customerreceipts/createCustomerReceipt", payload);

            alert("Customer Receipt saved successfully");

            navigate("/customer-receipts");
            // setInvoices([]);
            // setSelectedCustomer("");
            // setCustomerBalance("0.00");
            // setCustomerReceiptNo("");

        } catch (err: any) {
            console.error(err);
            alert(err?.response?.data?.detail || "Error saving receipt");
        } finally {
            setSubmitting(false);
        }
    };

    const Spinner = () => (
        <div className="flex justify-center items-center h-full py-6">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    );



    return (
        <div className="p-3 sm:p-4 md:p-6 bg-white rounded shadow max-w-7xl mx-auto">

            <h2 className="text-sm sm:text-base font-semibold mb-4 sm:mb-6">
                Add New Customer Receipt
            </h2>

            {/* ✅ Form Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">

                {/* Receipt No */}
                <div className="flex flex-col">
                    <label className="text-[11px] mb-1">Receipt No</label>
                    <input
                        type="text"
                        value={customerReceiptNo}
                        readOnly
                        className="w-full h-8 px-2 border border-gray-400 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                </div>

                {/* Customer */}
                <div className="flex flex-col">
                    <label className="text-[11px] mb-1">Customer Name</label>
                    <div className="relative">
                        <select
                            className="w-full text-[11px] h-8 px-2 pr-8 rounded border border-gray-400 appearance-none focus:outline-none focus:ring-1 focus:ring-gray-300"
                            value={selectedCustomer}
                            onChange={(e) => handleCustomerChange(Number(e.target.value))}
                        >
                            <option value="">Select Customer</option>
                            {customers.map((c) => (
                                <option key={c.customerID} value={c.customerID}>
                                    {c.customerName}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                </div>

                {/* Balance */}
                <div className="flex flex-col">
                    <label className="text-[11px] mb-1">Customer Balance</label>
                    <input
                        type="text"
                        value={customerBalance}
                        readOnly
                        className="w-full h-8 px-2 border border-gray-400 rounded text-right text-[11px] focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                </div>

                {/* Receive Amount */}
                <div className="flex flex-col">
                    <label className="text-[11px] mb-1">Receive Amount</label>
                    <input
                        type="text"
                        inputMode="decimal"
                        value={receiveAmount}
                        onChange={(e) => handleTopReceiveChange(e.target.value)}
                        onBlur={handleTopReceiveBlur}
                        className="w-full h-8 px-2 border border-gray-400 rounded text-right text-[11px] focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                </div>


                <div className="flex flex-col">
                    <label className="text-[11px] mb-1">Account Type</label>
                    <div className="relative">
                        <select
                            value={paymentType}
                            onChange={(e) => {
                                setPaymentType(e.target.value as "CASH" | "BANK");
                                setSelectedAccount("");
                            }}
                            className="w-full text-[11px] h-8 px-2 pr-8 rounded border border-gray-400 appearance-none focus:outline-none focus:ring-1 focus:ring-gray-300"

                        >
                            <option value="CASH">Cash</option>
                            <option value="BANK">Bank</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                </div>
                <div className="flex flex-col">
                    <label className="text-[11px] mb-1">Bank Account</label>
                    <div className="relative">
                        <select
                            value={selectedAccount}
                            onChange={(e) => setSelectedAccount(e.target.value)}
                            className="w-full text-[11px] h-8 px-2 pr-8 rounded border border-gray-400 appearance-none focus:outline-none focus:ring-1 focus:ring-gray-300"
                        >
                            <option value="">Select Account</option>

                            {accounts
                                .filter(acc =>
                                    paymentType === "CASH"
                                        ? acc.loadType === "CASH"
                                        : acc.loadType === "BANK"
                                )
                                .map(acc => (
                                    <option key={acc.detailItemCode} value={acc.detailItemCode}>
                                        {acc.detailItemName}
                                    </option>
                                ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                </div>
                {/* Unallocated */}
                <div className="flex flex-col">
                    <label className="text-[11px] mb-1">Unallocated Amount</label>
                    <input
                        type="text"
                        value={unallocatedAmount}
                        readOnly
                        className="w-full h-8 px-2 border border-gray-300 rounded text-right text-[11px] focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-[11px] mb-1">Short Notes</label>
                    <input
                        type="text"
                        value={customerReceiptNo}
                        className="w-full h-8 px-2 border border-gray-400 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                </div>

                {/* Date */}
                <div className="flex flex-col">
                    <label className="text-[11px] mb-1">Receipt Date</label>

                    <div className="relative w-full">
                        <DatePicker
                            selected={receiptDate}
                            onChange={(date: Date | null) => {
                                if (!date) return;
                                setReceiptDate(date);
                            }}
                            dateFormat="yyyy-MM-dd"
                            className="
        w-full h-[34px]
        px-3 pr-10
        border border-gray-400
        rounded
        text-[11px]
        focus:outline-none
        focus:ring-1 focus:ring-gray-500
      "
                        />

                        <Calendar
                            size={16}
                            className="
        absolute right-3 top-1/2 -translate-y-1/2
        text-gray-500
        pointer-events-none
      "
                        />
                    </div>
                </div>
            </div>

            {/* ✅ Table Section */}
            <div className="w-full max-h-[400px] overflow-auto border rounded-lg relative">

                <table className="min-w-[700px] w-full text-[11px]">

                    <thead className="bg-[#1c3c61] sticky top-0 z-10 border border-gray-700">
                        <tr>
                            <th className="p-2 text-left text-white">Invoice No</th>
                            <th className="p-2 text-left text-white">Invoice Date</th>
                            <th className="p-2 text-right text-white">Total Amount</th>
                            <th className="p-2 text-right text-white">Due Amount</th>
                            <th className="p-2 text-right text-white">Receive Amount</th>
                            <th className="p-2 text-right text-white">Discount Amount</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6}>
                                    <Spinner />
                                </td>
                            </tr>
                        ) : invoices.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center p-4 text-gray-500">
                                    Please select a customer to load invoices
                                </td>
                            </tr>
                        ) : (
                            invoices.map((inv, index) => (
                                <tr key={inv.salesInvoiceID} className="border-b">
                                    <td className="p-2 border border-gray-300">{inv.salesInvoiceNo}</td>
                                    <td className="p-2 border border-gray-300">
                                        {new Date(inv.SalesInvoiceDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-2 text-right border border-gray-300">
                                        {formatAmount(inv.totalAmount)}
                                    </td>
                                    <td className="p-2 text-right border border-gray-300">
                                        {formatAmount(inv.dueAmount)}
                                    </td>

                                    <td className="p-1 border border-gray-300">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={inv.receiveInput}
                                            onChange={(e) =>
                                                handleInvoiceReceiveChange(index, e.target.value)
                                            }
                                            onBlur={() => handleInvoiceBlur(index)}
                                            className="w-full text-right border border-gray-100 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-500"
                                        />
                                    </td>

                                    <td className="p-1 border border-gray-300">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={inv.discountInput}
                                            onChange={(e) =>
                                                handleInvoiceDiscountChange(index, e.target.value)
                                            }
                                            onBlur={() => handleInvoiceBlur(index)}
                                            className="w-full text-right px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-300"
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Loading overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {/* ✅ Button */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full sm:w-auto bg-blue-500 text-white text-sm px-4 h-9 rounded hover:bg-blue-700 transition"
                >
                    {submitting ? "Saving..." : "Submit"}
                </button>
            </div>
        </div>
    );
};

export default CustomerReceipts;