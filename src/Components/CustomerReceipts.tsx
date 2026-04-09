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

interface VatRate {
    id: number;
    name: string;
}

interface LineItem {
    itemID: number;
    itemCode: string;
    itemName: string;
    unitPrice: number;
}

interface Customer {
    customerID: number;
    customerName: string;
    vatReference: string;
    creditLimit: number;
}

export interface SalesInvoiceRow {
    rowId: number;
    itemID?: number;
    itemCode: string;
    itemName: string;
    unitPrice: number;
    quantity: string;
    vatRateID: number;
    vatPercent: number;
    vatAmount: number;
    discountPercent: string;
    discountAmount: number;
    totalAmount: number;
    exclusiveAmount: number;
    amount: number;
}

interface SalesOrderDropdown {
    salesOrderID: number;
    salesOrderNo: string;
}

export interface DetailItemOption {
    detailItemCode: string;
    detailItemName: string;
    reportingItemName: string;
}


const emptyRow = (id: number): SalesInvoiceRow => ({
    rowId: id,
    itemID: undefined,
    itemCode: "",
    itemName: "",
    unitPrice: 0,
    quantity: "1.00",
    vatRateID: 0,
    vatPercent: 0,
    vatAmount: 0,
    discountPercent: "0.00",
    discountAmount: 0,
    totalAmount: 0,
    exclusiveAmount: 0,
    amount: 0
});

const CustomerReceipts: React.FC = () => {
    const today = new Date();
    const [salesInvoiceDate, setSalesInvoiceDate] = useState<Date>(today);
    const [referenceNo, setReferenceNo] = useState("");
    const [salesInvoiceNo, setSalesInvoiceNo] = useState<string>("");
    const [rows, setRows] = useState<SalesInvoiceRow[]>([emptyRow(1)]);
    const [vatRates, setVatRates] = useState<VatRate[]>([]);
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [remarks, setRemarks] = useState("");
    const [quantity, setQuantity] = useState("1.00");
    const [discountPercent, setDiscountPercent] = useState("0.00");
    const [vatReference, setVatReference] = useState("");
    const [creditLimit, setCreditLimit] = useState<number | null>(null);

    const [salesOrderList, setSalesOrderList] = useState<SalesOrderDropdown[]>([]);
    const [salesOrderID, setSalesOrderID] = useState<number | null>(null);

    const [customerID, setCustomerID] = useState<number | null>(null);
    const [items, setItems] = useState<any[]>([]);
    const [subtotalAmount, setSubtotalAmount] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [exclusiveAmount, setExclusiveAmount] = useState(0);
    const [vATAmount, setVatAmount] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);

    const { id } = useParams();
    const location = useLocation();
    const highlightId = location.state?.highlightId ?? null;
    const isEditMode = location.pathname.includes("/edit");
    const isCopyMode = location.pathname.includes("/copy");
    const isCreateMode = location.pathname.includes("/new");
    const salesInvoiceID = Number(id);
    const [searchParams] = useSearchParams();
    const copyId = searchParams.get("copyId");
    const navigate = useNavigate();

    useEffect(() => {
        if (!id || customers.length === 0) return;

        loadSalesInvoice();

    }, [id, customers]);

    const loadSalesInvoice = async () => {
        try {
            const res = await api.get(`/api/salesinvoices/${id}`);

            console.log("SalesInvoice Data:", res.data);

            const data = res.data;

            // ✅ set customer
            const customer = customers.find(
                (c) => c.customerID === data.customerID
            );

            if (customer) {
                setSelectedCustomer(customer);
                setVatReference(customer.vatReference);
                setCreditLimit(customer.creditLimit);
            }

            // ✅ set header info
            setSalesInvoiceDate(new Date(data.salesOrderDate));

            setReferenceNo(data.referenceNo || "");
            setRemarks(data.remarks || "");

            // ✅ map items to rows
            const mappedRows = data.items.map((item: any, index: number) => ({
                rowId: index + 1,
                itemID: item.itemID,
                itemCode: item.itemCode ?? "",
                itemName: item.itemDescription ?? "",
                unitPrice: item.unitPrice ?? 0,
                quantity: item.quantity?.toString() ?? "1",
                vatRateID: 0,
                vatPercent: 0,
                vatAmount: item.vatAmount ?? 0,
                discountPercent: "0",
                discountAmount: item.discountAmount ?? 0,
                totalAmount: item.totalAmount ?? 0,
                exclusiveAmount: item.exclusiveAmount ?? 0,
                amount: item.totalAmount ?? 0
            }));

            if (mappedRows.length > 0) {
                setRows(mappedRows);
            }

        } catch (error) {
            console.error("Load error:", error);
        }
    };

    // Load vat rates dropdown list
    useEffect(() => {
        const loadVatRates = async () => {
            try {
                const response = await axios.get(
                    "http://127.0.0.1:8000/api/commondropdown/loadVatRateDropdown"
                );

                setVatRates(response.data);
            } catch (error) {
                console.error("Failed to load VAT rates", error);
            }
        };

        loadVatRates();
    }, []);

    // Load line item dropdown list
    useEffect(() => {
        const loadLineItemDropdown = async () => {
            try {
                const response = await axios.get(
                    "http://127.0.0.1:8000/api/commondropdown/loadLineItemDropdown"
                );

                setLineItems(response.data);
            } catch (error) {
                console.error("Failed to load Line Item", error);
            }
        };

        loadLineItemDropdown();
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
            .get("http://127.0.0.1:8000/api/salesinvoices/getNextSalesInvoiceNo")
            .then(res => setSalesInvoiceNo(res.data.salesInvoiceNo))
            .catch(err => console.error(err));
    }, []);

    // Load sales order number in dropdown list
    useEffect(() => {
        const loadSalesOrders = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/salesinvoices/salesOrderDropdown");
                const data: SalesOrderDropdown[] = await response.json();
                setSalesOrderList(data);
            } catch (error) {
                console.error("Failed to load quotation dropdown", error);
            }
        };

        loadSalesOrders();
    }, []);

    useEffect(() => {
        if (!salesOrderID) {
            // Optional: reset form when sales order is cleared
            setItems([]);
            setSubtotalAmount(0);
            setDiscountAmount(0);
            setVatAmount(0);
            setTotalAmount(0);
            return;
        }

        // Load sales order information using sales order no to create sales invoice 
        const loadSalesOrderData = async () => {
            try {
                const res = await fetch(
                    `/api/salesinvoices/${salesOrderID}/to-sales-invoice`
                );

                if (!res.ok) {
                    throw new Error("Failed to load sales order");
                }

                const data = await res.json();

                // 🔹 Map sales order → sales sales invoice form
                setCustomerID(data.customerID);
                setItems(data.items);
                setSubtotalAmount(data.exclusiveAmount);
                setDiscountAmount(data.discountAmount);
                setVatAmount(data.vatAmount);
                setTotalAmount(data.totalAmount);

            } catch (error) {
                console.error("Sales Order load error:", error);
            }
        };

        loadSalesOrderData();
    }, [salesOrderID]);



    useEffect(() => {
        if (!salesOrderID) return;

        fetch(`http://127.0.0.1:8000/api/salesinvoices/${salesOrderID}/to-sales-invoice`)
            .then(res => res.json())
            .then(data => {
                // Map quotation items to rows
                const mappedRows = data.items.map((item: any, index: number) => ({
                    rowId: index + 1,
                    itemID: item.itemID,
                    itemCode: item.itemID.toString().padStart(6, "0"), // optional formatting
                    itemName: item.itemDescription,
                    unitPrice: item.unitPrice,
                    quantity: item.quantity.toFixed(2),
                    vATRateID: 1, // default VAT, or from item.vatRateID if available
                    discountPercent: ((item.discountAmount / (item.unitPrice * item.quantity)) * 100).toFixed(2),
                    discountAmount: item.discountAmount,
                    exclusiveAmount: item.unitPrice * item.quantity - item.discountAmount,
                    vatAmount: 0, // calculate VAT if needed
                    totalAmount: item.lineTotal
                }));

                setRows(mappedRows); // ✅ Replace rows, do NOT push individually
            });
    }, [salesOrderID]);

    // Calculate row data and total information in the controls 
    const recalculateRow = (row: SalesInvoiceRow): SalesInvoiceRow => {
        const quantityNumber = parseFloat(row.quantity) || 0;
        const discountNumber = parseFloat(row.discountPercent) || 0;
        const subTotal = row.unitPrice * quantityNumber;
        const exclusiveAmount = subTotal;
        const discountAmount = +(subTotal * discountNumber / 100);
        const afterDiscount = subTotal - discountAmount;
        const vatAmount = +(afterDiscount * row.vatPercent / 100).toFixed(2);
        const totalAmount = +(afterDiscount + vatAmount).toFixed(2);

        return {
            ...row,
            discountAmount,
            vatAmount,
            totalAmount,
            exclusiveAmount
        };
    };

    // Populate customer data when select customer
    const onCustomerChange = (id: number) => {
        const customer = customers.find(c => c.customerID === id);
        if (!customer) {
            setSelectedCustomer(null);
            setVatReference("");
            setCreditLimit(null);
            return;
        }

        setSelectedCustomer(customer);
        setVatReference(customer.vatReference);
        setCreditLimit(customer.creditLimit);
    };

    // Get item id to prevent duplicate item id
    const isItemAlreadyAdded = (itemID: number, currentRowId: number) => {
        return rows.some(
            r => r.itemID === itemID && r.rowId !== currentRowId
        );
    };

    // Populate row data when change item from dropdown
    const onItemChange = (rowId: number, itemID: number) => {

        // ✅ Duplicate check
        if (isItemAlreadyAdded(itemID, rowId)) {
            alert("This item already added");
            return;
        }

        const selectedItem = lineItems.find(i => i.itemID === itemID);
        if (!selectedItem) return;

        setRows(prev =>
            prev.map(r =>
                r.rowId === rowId
                    ? {
                        ...r,
                        itemID: selectedItem.itemID,
                        itemCode: selectedItem.itemCode,
                        itemName: selectedItem.itemName,
                        unitPrice: selectedItem.unitPrice,
                        quantity: "1.00",
                        discountPercent: "0.00"
                    }
                    : r
            )
        );
    };

    // Change effect when change quantity
    const onQuantityChange = (rowId: number, value: string) => {
        setRows(prev =>
            prev.map(row =>
                row.rowId === rowId
                    ? recalculateRow({ ...row, quantity: value })
                    : row
            )
        );
    };

    // Change effect when change vat percentage 
    const onVatChange = (rowId: number, vatRateID: number) => {
        const vat = vatRates.find(v => v.id === vatRateID);
        const percent = vat ? Number(vat.name.match(/\d+/)?.[0]) : 0;

        setRows(prev =>
            prev.map(row =>
                row.rowId === rowId
                    ? recalculateRow({
                        ...row,
                        vatRateID,
                        vatPercent: percent
                    })
                    : row
            )
        );
    };

    // Change effect when change discount percent
    const onDiscountChange = (rowId: number, value: string) => {
        setRows(prev =>
            prev.map(row =>
                row.rowId === rowId
                    ? recalculateRow({ ...row, discountPercent: value })
                    : row
            )
        );
    };

    // Add new empty row below
    const addRowBelow = (rowId: number) => {
        setRows(prev => {
            const index = prev.findIndex(r => r.rowId === rowId);
            const newRow = emptyRow(Date.now());
            const updated = [...prev];
            updated.splice(index + 1, 0, newRow);
            return updated;
        });
    };

    // Remove row from the sales order grid
    const removeRow = (rowId: number) => {
        if (rows.length === 1) return;
        setRows(prev => prev.filter(r => r.rowId !== rowId));
    };

    // Submit sales order information
    const submitSalesInvoice = async () => {

        if (
            rows.some(r =>
                !r.itemID ||
                isNaN(parseFloat(r.quantity)) ||
                parseFloat(r.quantity) <= 0
            )
        ) {
            alert("Please check item rows");
            return;
        }

        if (!selectedCustomer) {
            alert("Please select a customer");
            return;
        }

        if (!salesInvoiceNo) {
            alert("Sales Invoice No not loaded");
            return;
        }

        const payload = {
            salesInvoiceNo: salesInvoiceNo,

            salesInvoiceDate: salesInvoiceDate
                ? salesInvoiceDate.toISOString().split("T")[0]
                : null,

            customerID: selectedCustomer.customerID,

            exclusiveAmount: Number(totalExclusive),

            discountAmount: Number(totalDiscount),
            vatAmount: Number(totalVat),
            totalAmount: Number(grandTotal),

            remarks: remarks || null,
            createdBy: "admin",
            companyCode: "01",

            items: rows.map(r => ({
                itemID: Number(r.itemID),
                itemDescription: r.itemName || "",
                quantity: Number(r.quantity ?? 1),
                unitPrice: Number(r.unitPrice ?? 0),
                exclusiveAmount: Number(r.exclusiveAmount ?? 0),
                discountAmount: Number(r.discountAmount ?? 0),
                vatAmount: Number(r.vatAmount ?? 0),
                totalAmount: Number(r.totalAmount ?? 0)
            }))
        };

        console.log("🚀 Sales Invoice Payload");
        console.log(JSON.stringify(payload, null, 2));

        try {

            let res;

            if (isEditMode) {

                res = await api.put(`/api/salesinvoices/updateSalesInvoice/${salesInvoiceID}`, payload);

                toast.success("Sales Invoice updated successfully");

            } else {

                res = await api.post("/api/salesinvoices/createSalesInvoice", payload);

                toast.success("Sales Invoice saved successfully");

            }

            // get SalesInvoiceID (works for create & update)
            const newSalesInvoiceID = res.data.salesInvoiceID ?? salesInvoiceID;

            navigate("/sales-invoices", {
                state: { highlightId: newSalesInvoiceID }
            });

        } catch (error) {

            console.error("❌ Failed to save sales invoice", error);

            toast.error("Failed to save sales invoice");

        }
    };


    const totalVat = rows.reduce(
        (sum, r) => sum + (r.vatAmount || 0),
        0
    );

    const totalDiscount = rows.reduce(
        (sum, r) => sum + (r.discountAmount || 0),
        0
    );

    const totalExclusive = rows.reduce(
        (sum, r) => sum + (r.exclusiveAmount || 0),
        0
    );

    const grandTotal = rows.reduce(
        (sum, r) => sum + (r.totalAmount || 0),
        0
    );

    return (
        <div className="p-6 bg-white rounded shadow">
            <h2 className="text-sm font-semibold mb-6">Add New Sales Invoice</h2>

            {/* Header */}
            <div className="grid grid-cols-5 gap-2 mb-2">
                <div className="flex items-center gap-2">
                    <label className="w-40 text-[10px]">Customer</label>
                    <div className="relative w-full">
                        <select
                            value={selectedCustomer?.customerID ?? ""}
                            onChange={(e) => onCustomerChange(Number(e.target.value))}
                            className="w-full text-[10px] text-gray-800 h-[28px] px-2 pr-8 rounded border border-gray-400 appearance-none"
                        >
                            <option value="">Customer</option>
                            {customers.map(cu => (
                                <option key={cu.customerID} value={cu.customerID}>
                                    {cu.customerName}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="w-40 text-[10px]">Balance</label>
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="balance"
                            value={referenceNo}
                            onChange={e => setReferenceNo(e.target.value)}
                            readOnly
                            className="w-full h-7 px-2 border border-gray-400 rounded text-[12px]"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="w-40 text-[10px]">Credit Limit</label>
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="credit limit"
                            value={selectedCustomer?.creditLimit.toFixed(2)}
                            readOnly
                            className="w-full h-7 px-2 border border-gray-400 rounded text-[10px] text-center"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="w-40 text-[10px]">VAT Reference</label>
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="vat reference"
                            value={selectedCustomer?.vatReference ?? ""}
                            readOnly
                            className="w-full h-7 px-2 border border-gray-400 rounded text-[10px]"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="w-40  text-[10px]">From Sales Order</label>
                    <div className="relative w-full">
                        <select
                            className="w-full text-[10px] text-gray-800 h-[28px] px-2 pr-8 rounded border border-gray-400 appearance-none"
                            value={salesOrderID ?? ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSalesOrderID(value ? Number(value) : null);
                            }}
                        >
                            <option value="">Create Without Sales Order</option>

                            {salesOrderList.map((so) => (
                                <option key={so.salesOrderID} value={so.salesOrderID}>
                                    {so.salesOrderNo}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <label className="w-40 text-[10px]">Invoice No</label>
                    <div className="relative w-full">
                        <input
                            type="text"
                            value={salesInvoiceNo}
                            readOnly
                            className="w-full h-7 px-2 border border-gray-400 rounded text-[10px]"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="w-40  text-[10px]">Customer Ref.</label>
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="reference"
                            value={referenceNo}
                            onChange={e => setReferenceNo(e.target.value)}
                            readOnly
                            className="w-full h-7 px-2 border border-gray-400 rounded text-[12px]"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="w-40  text-[10px]">Invoice Date</label>
                    <div className="relative w-[210px]">
                        <DatePicker
                            selected={salesInvoiceDate}
                            onChange={(date: Date | null) => {
                                if (!date) return;

                                setSalesInvoiceDate(date);
                            }}
                            dateFormat="yyyy-MM-dd"
                            popperPlacement="bottom-start"
                            popperClassName="z-50"
                            className="w-full h-[28px] px-2 rounded border border-gray-400 text-gray-700 text-[12px]"
                        />
                        <Calendar
                            size={16}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="w-40  text-[10px]">Discount %</label>
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="reference"
                            value={referenceNo}
                            onChange={e => setReferenceNo(e.target.value)}
                            readOnly
                            className="w-full h-7 px-2 border border-gray-400 rounded text-[12px]"
                        />
                    </div>
                </div>
            </div>



            {/* Table */}
            <table className="w-full text-[10px] border border-gray-400 rounded rounded-lg">
                <thead className="bg-[#1c3c61] text-[10px] leading-tight">
                    <tr>
                        <th className="p-2 text-left text-white">Line Item</th>
                        <th className="p-2 text-left text-white text-[10px]">Item Code</th>
                        <th className="p-2 text-left text-white text-[10px]">Item Name</th>
                        <th className="p-2 text-center text-white text-[10px]">Unit Price</th>
                        <th className="p-2 text-center text-white text-[10px]">Quantity</th>
                        <th className="p-2 text-center text-white text-[10px]">VAT Rate</th>
                        <th className="p-2 text-center text-white text-[10px]">Disc: %</th>
                        <th className="p-2 text-center text-white text-[10px]">Discount</th>
                        <th className="p-2 text-center text-white text-[10px]">Excl. Amount</th>
                        <th className="p-2 text-center text-white text-[10px]">VAT</th>
                        <th className="p-2 text-center text-white text-[10px]">Total Amount</th>
                        <th className="p-2 w-20 text-center text-white text-[10px]">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {rows.map(row => (
                        <tr key={row.rowId}>
                            <td className="p-1 w-40 text-xxs font-lato">
                                <div className="relative w-full">
                                    <select
                                        value={row.itemID ?? ""}
                                        onChange={e => onItemChange(row.rowId, Number(e.target.value))}
                                        className="w-full text-[10px] text-gray-800 h-[28px] px-2 pr-8 rounded border border-gray-400 appearance-none"
                                    >
                                        <option value="">Select Item</option>
                                        {lineItems.map(li => (
                                            <option key={li.itemID} value={li.itemID}>
                                                {li.itemName}
                                            </option>
                                        ))}
                                    </select>

                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                                    />
                                </div>
                            </td>
                            <td className="p-1 w-30">
                                <input
                                    type="text"
                                    value={row.itemCode ?? ""}
                                    readOnly
                                    className="w-full h-7 px-2 border border-gray-400 rounded"
                                />
                            </td>
                            <td className="p-1 w-30">
                                <input
                                    type="text"
                                    value={row.itemName ?? ""}
                                    readOnly
                                    className="w-full h-7 px-2 border border-gray-400 rounded"
                                />
                            </td>
                            <td className="p-1 w-30">
                                <input
                                    type="number"
                                    value={row.unitPrice.toFixed(2)}
                                    readOnly
                                    className="w-full h-7 px-2 text-right border border-gray-400 rounded"
                                />
                            </td>
                            <td className="p-1 w-30">
                                <input
                                    type="text"
                                    value={row.quantity}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        // Allow only numbers and decimal
                                        if (/^\d*\.?\d*$/.test(value)) {
                                            onQuantityChange(row.rowId, value);
                                        }
                                    }}
                                    onBlur={() => {
                                        const num = parseFloat(row.quantity);
                                        if (!isNaN(num)) {
                                            onQuantityChange(row.rowId, num.toFixed(2));
                                        }
                                    }}
                                    className="w-full h-7 px-2 text-right border border-gray-400 rounded"
                                />
                            </td>



                            <td className="p-1 w-32">
                                <div className="relative w-full">
                                    <select
                                        value={row.vatRateID}
                                        onChange={e => onVatChange(row.rowId, Number(e.target.value))}
                                        className="w-full h-[28px] px-2 pr-8 rounded border border-gray-400 appearance-none"
                                    >
                                        {vatRates.map(v => (
                                            <option key={v.id} value={v.id}>{v.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                                    />
                                </div>
                            </td>
                            <td className="p-1 w-30">
                                <input
                                    type="text"
                                    value={row.discountPercent}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        // Allow only numbers and decimal
                                        if (/^\d*\.?\d*$/.test(value)) {
                                            onDiscountChange(row.rowId, value);
                                        }
                                    }}
                                    onBlur={() => {
                                        const num = parseFloat(row.discountPercent);
                                        if (!isNaN(num)) {
                                            onDiscountChange(row.rowId, num.toFixed(2));
                                        }
                                    }}
                                    className="w-full h-7 px-2 text-right border border-gray-400 rounded"
                                />
                            </td>
                            <td className="p-1 w-30 text-right">
                                <input
                                    type="text"
                                    readOnly
                                    value={row.discountAmount.toFixed(2)}
                                    className="w-full h-7 text-right border rounded px-2 border-gray-400"
                                />
                            </td>
                            <td className="p-1 w-30">
                                <input
                                    type="number"
                                    value={row.exclusiveAmount.toFixed(2)}
                                    readOnly
                                    className="w-full h-7 px-2 text-right border border-gray-400 rounded"
                                />
                            </td>
                            <td className="p-1 w-30">
                                <input
                                    type="number"
                                    value={row.vatAmount.toFixed(2)}
                                    readOnly
                                    className="w-full h-7 px-2 text-right border border-gray-400 rounded"
                                />
                            </td>
                            <td className="p-1 w-40 text-right">
                                <input
                                    type="text"
                                    readOnly
                                    value={row.totalAmount.toFixed(2)}
                                    className="w-full h-7 text-right border rounded px-2 border-gray-400"
                                />
                            </td>
                            <td className="p-1 text-center">
                                <div className="flex justify-center gap-2">
                                    <button
                                        onClick={() => addRowBelow(row.rowId)}
                                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-800"
                                        title="Add row below"
                                    >
                                        A
                                    </button>
                                    <button
                                        onClick={() => removeRow(row.rowId)}
                                        className={`px-2 py-1 rounded text-white ${rows.length === 1
                                            ? "bg-gray-300 cursor-not-allowed"
                                            : "bg-red-500 hover:bg-red-800"
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


            {/* Footer Totals */}
            <div className="mt-4 grid grid-cols-6 gap-2">

                {/* Empty space on left */}
                <div className="col-span-2"></div>
                <div className="col-span-1 flex items-center gap-2">
                    <label className="w-30 text-right text-[10px]">
                        Total Discount
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={totalDiscount.toFixed(2)}
                        className="w-full h-7 px-2 border border-gray-400 rounded text-[12px] text-right bg-gray-100"
                    />
                </div>

                <div className="col-span-1 flex items-center gap-2">
                    <label className="w-30 text-right text-[10px]">
                        Excl. Amount
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={totalExclusive.toFixed(2)}
                        className="w-full h-7 px-2 border border-gray-400 rounded text-[12px] text-right bg-gray-100"
                    />
                </div>

                <div className="col-span-1 flex items-center gap-2">
                    <label className="w-20 text-right text-[10px]">
                        Total VAT
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={totalVat.toFixed(2)}
                        className="w-full h-7 px-2 border border-gray-400 rounded text-[12px] text-right bg-gray-100"
                    />
                </div>

                <div className="col-span-1 flex items-center gap-2">
                    <label className="w-24 text-right text-[10px] font-semibold">
                        Grand Total
                    </label>
                    <input
                        type="text"
                        readOnly
                        value={grandTotal.toFixed(2)}
                        className="w-full h-7 px-2 border border-gray-400 rounded text-[12px] text-right bg-green-100 text-green-800 font-semibold"
                    />
                </div>
            </div>
            {/* Footer */}
            <div className="flex justify-end mt-4">
                <button
                    onClick={submitSalesInvoice}
                    className="bg-blue-500 text-white text-sm w-[90px] h-[32px] border-1 hover:bg-blue-700 transition-colors duration-200 cursor-pointer rounded"
                >
                    {isEditMode ? "Update" : "Submit"}
                </button>
            </div>
        </div>
    );
};

export default CustomerReceipts;