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
}

const CustomerReceipts: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<number | "">("");
    const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [customerBalance, setCustomerBalance] = useState<number>(0);
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

    // ✅ When customer changes → load invoices
    // const handleCustomerChange = async (customerId: number) => {
    //     setSelectedCustomer(customerId);

    //     if (!customerId) return;

    //     try {
    //         const res = await api.get(`/api/customerreceipts/getCustomerInvoices/${customerId}`);
    //         setInvoices(res.data);
    //     } catch (err) {
    //         console.error(err);
    //     }
    // };
    const handleCustomerChange = async (customerId: number) => {
        setSelectedCustomer(customerId);
        setInvoices([]);
        setCustomerBalance(0);

        if (!customerId) return;

        try {
            setLoading(true);

            // ✅ Call BOTH APIs
            const [invoiceRes, balanceRes] = await Promise.all([
                api.get(`/api/customerreceipts/getCustomerInvoices/${customerId}`),
                api.get(`/api/customerreceipts/getCustomerBalance/${customerId}`)
            ]);

            setInvoices(invoiceRes.data);
            setCustomerBalance(balanceRes.data.totalDue);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Handle input change (Receive / Discount)
    const handleInputChange = (
        index: number,
        field: "receiveAmount" | "discountAmount",
        value: number
    ) => {
        const updated = [...invoices];
        updated[index][field] = value;

        // Optional: Prevent over input
        if (field === "receiveAmount") {
            if (value > updated[index].dueAmount) {
                alert("Receive amount cannot exceed due amount");
                updated[index].receiveAmount = 0;
            }
        }

        setInvoices(updated);
    };


    return (
        <div className="p-6 bg-white rounded shadow">
            <h2 className="text-sm font-semibold mb-6">Add New Customer Receipt</h2>
            <div className="grid grid-cols-5 gap-2 mb-2">
                <div className="flex items-center gap-2">
                    <label className="w-40 text-[10px]">Customer Name</label>
                    <div className="relative w-full">
                        <select
                            className="w-full text-[10px] text-gray-800 h-[28px] px-2 pr-8 rounded border border-gray-400 appearance-none"
                            value={selectedCustomer}
                            onChange={(e) => handleCustomerChange(Number(e.target.value))}
                        >
                            <option value="">-- Select Customer --</option>
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
                    <label className="w-40 text-[10px]">Customer Balance</label>
                    <div className="relative w-full">
                        <input
                            type="text"
                            className="w-full h-7 px-2 border border-gray-400 rounded text-[12px]"
                            value={customerBalance}
                            readOnly
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="w-40 text-[10px]">Credit Limit</label>
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="credit limit"

                            readOnly
                            className="w-full h-7 px-2 border border-gray-400 rounded text-[10px] text-center"
                        />
                    </div>
                </div>
               
            </div>

            {/* ✅ Invoice Table */}
            {invoices.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">Invoice Number</th>
                                <th className="border p-2">Invoice Date</th>
                                <th className="border p-2">Total Amount</th>
                                <th className="border p-2">Due Amount</th>
                                <th className="border p-2">Receive Amount</th>
                                <th className="border p-2">Discount Amount</th>
                            </tr>
                        </thead>

                        <tbody>
                            {invoices.map((inv, index) => (
                                <tr key={inv.salesInvoiceID}>
                                    <td className="border p-2">{inv.salesInvoiceNo}</td>
                                    <td className="border p-2">
                                        {new Date(inv.SalesInvoiceDate).toLocaleDateString()}
                                    </td>
                                    <td className="border p-2">{inv.totalAmount}</td>
                                    <td className="border p-2">{inv.dueAmount}</td>

                                    {/* ✅ Receive Amount Input */}
                                    <td className="border p-2">
                                        <input
                                            type="number"
                                            className="border p-1 w-24"
                                            value={inv.receiveAmount}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    index,
                                                    "receiveAmount",
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </td>

                                    {/* ✅ Discount Input */}
                                    <td className="border p-2">
                                        <input
                                            type="number"
                                            className="border p-1 w-24"
                                            value={inv.discountAmount}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    index,
                                                    "discountAmount",
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CustomerReceipts;