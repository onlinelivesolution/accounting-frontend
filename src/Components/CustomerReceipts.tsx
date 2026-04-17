import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown } from "lucide-react";
import DatePicker from "react-datepicker";
import { Calendar } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
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
    const [submitting, setSubmitting] = useState(false);

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

            const [invoiceRes, balanceRes] = await Promise.all([
                api.get(`/api/customerreceipts/getCustomerInvoices/${customerId}`),
                api.get(`/api/customerreceipts/getCustomerBalance/${customerId}`)
            ]);

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

        // ✅ Filter only selected rows
        const selectedInvoices = invoices.filter(
            (inv) => inv.receiveAmount > 0 || inv.discountAmount > 0
        );

        if (selectedInvoices.length === 0) {
            alert("Please enter at least one receive amount");
            return;
        }

        // ✅ Validation per row
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

        // ✅ Build payload
        const payload = {
            receiptNo: customerReceiptNo,
            receiptDate: new Date(receiptDate).toISOString().split("T")[0],
            customerID: selectedCustomer,
            totalAmount: parseAmount(receiveAmount),
            status: "APPROVED",
            details: selectedInvoices.map((inv) => ({
                salesInvoiceID: inv.salesInvoiceID,
                paidAmount: inv.receiveAmount,
                discountAmount: inv.discountAmount,
                companyCode: "01",
                narration: "",
                // discountAmount: inv.discountAmount, // if backend supports
            })),
        };

        try {
            setSubmitting(true);

            await api.post("/api/customerreceipts/createCustomerReceipt", payload);

            alert("Customer Receipt saved successfully");

            // ✅ Reset form
            setInvoices([]);
            setSelectedCustomer("");
            setCustomerBalance("0.00");
            setCustomerReceiptNo("");

        } catch (err: any) {
            console.error(err);

            alert(err?.response?.data?.detail || "Error saving receipt");
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div className="p-6 bg-white rounded shadow">
            <h2 className="text-sm font-semibold mb-6">Add New Customer Receipt</h2>
            <div className="grid grid-cols-6 gap-2 mb-10">
                <div className="flex items-center gap-2">
                    <label className="w-40 text-[10px]">Receipt No</label>
                    <div className="relative w-full">
                        <input
                            type="text"
                            value={customerReceiptNo}
                            readOnly
                            className="w-full h-7 px-2 border border-gray-400 rounded text-[10px]"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="w-40 text-[12px]">Customer Name</label>
                    <div className="relative w-full">
                        <select
                            className="w-full text-[12px] text-gray-800 h-[28px] px-2 pr-8 rounded border border-gray-400 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-500"
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
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="w-40 text-[12px]">Customer Balance</label>
                    <div className="relative w-full">
                        <input
                            type="text"
                            className="w-full h-7 px-2 border border-gray-400 rounded text-right text-[12px] focus:outline-none focus:ring-1 focus:ring-gray-500"
                            value={customerBalance}
                            readOnly
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="w-40 text-[12px]">Receive Amount</label>
                    <div className="relative w-full">
                        <input
                            type="text"
                            inputMode="decimal"
                            value={receiveAmount}
                            onChange={(e) => handleTopReceiveChange(e.target.value)}
                            onBlur={handleTopReceiveBlur}
                            className="w-full h-7 px-2 border border-gray-400 rounded text-[12px] text-right focus:outline-none focus:ring-1 focus:ring-gray-500"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="w-40 text-[12px]">Uallocated Amt</label>
                    <div className="relative w-full">
                        <input
                            type="text"
                            value={unallocatedAmount}
                            readOnly
                            className="text-right bg-gray-100 h-7 rounded pr-3 focus:outline-none focus:ring-1 focus:ring-gray-500"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="w-100  text-[12px]">Receipt Date</label>
                    <div className="relative w-full">
                        <DatePicker
                            selected={receiptDate}
                            onChange={(date: Date | null) => {
                                if (!date) return;

                                setReceiptDate(date);
                            }}
                            dateFormat="yyyy-MM-dd"
                            popperPlacement="bottom-start"
                            popperClassName="z-50"
                            className="w-full h-[28px] px-2 rounded border border-gray-400 text-gray-700 text-[12px] focus:outline-none focus:ring-1 focus:ring-gray-500 cursor-pointer"
                        />
                        <Calendar
                            size={16}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                        />
                    </div>
                </div>


            </div>

            {/* ✅ Invoice Table */}
            {invoices.length > 0 && (
                <div className="col-span-6 w-full h-[450px] overflow-x-auto overflow-y-auto border-[#1c3c61] rounded-lg">
                    <table className="min-w-full table-fixed text-[11px] border-[#1c3c61] rounded-lg">
                        <thead className="bg-[#1c3c61] border border-gray-800">
                            <tr>
                                <th className="w-[220px] p-3 text-left text-white h-10">Invoice Number</th>
                                <th className="w-[220px] p-3 text-left text-white h-10">Invoice Date</th>
                                <th className="w-[220px] p-3 text-right text-white h-10">Total Amount</th>
                                <th className="w-[220px] p-3 text-right text-white h-10">Due Amount</th>
                                <th className="w-[220px] p-3 text-right text-white h-10">Receive Amount</th>
                                <th className="w-[220px] p-3 text-right text-white h-10">Discount Amount</th>
                            </tr>
                        </thead>

                        <tbody>
                            {invoices.map((inv, index) => (
                                <tr key={inv.salesInvoiceID}>
                                    <td className="border border-gray-400 p-3 text-[12px]">{inv.salesInvoiceNo}</td>
                                    <td className="border p-3 border-gray-400">
                                        {new Date(inv.SalesInvoiceDate).toLocaleDateString()}
                                    </td>
                                    <td className="border border-gray-400 p-3 text-right text-[12px]">{formatAmount(inv.totalAmount)}</td>
                                    <td className="border border-gray-400 p-3 text-right text-[12px]">{formatAmount(inv.dueAmount)}</td>

                                    {/* ✅ Receive Amount Input */}
                                    <td className="border p-1 border-gray-400 text-[12px]">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={inv.receiveInput}
                                            onChange={(e) =>
                                                handleInvoiceReceiveChange(index, e.target.value)
                                            }
                                            onBlur={() => handleInvoiceBlur(index)}
                                            className="border border-gray-200 w-full h-8 text-right rounded p-3 focus:outline-none focus:ring-1 focus:ring-gray-500"
                                        />
                                    </td>

                                    {/* ✅ Discount Input */}
                                    <td className="border p-1 border-gray-400 text-[12px]">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={inv.discountInput}
                                            onChange={(e) =>
                                                handleInvoiceDiscountChange(index, e.target.value)
                                            }
                                            onBlur={() => handleInvoiceBlur(index)}
                                            className="border border-gray-200 w-full h-8 text-right rounded p-3 focus:outline-none focus:ring-1 focus:ring-gray-500"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="flex justify-end mt-4">
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-blue-500 text-white text-sm w-[90px] h-[32px] border-1 hover:bg-blue-700 transition-colors duration-200 cursor-pointer rounded"
                >
                    {submitting ? "Saving..." : "Submit"}
                </button>
            </div>
        </div>
    );
};

export default CustomerReceipts;