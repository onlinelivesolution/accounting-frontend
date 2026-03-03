import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ChevronDown } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";


interface SalesOrderDetail {
    salesOrderDetailID: number;
    itemID: number;
    itemDescription: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

interface SalesOrder {
    salesOrderID: number;
    salesOrderNo: string;
    salesOrderDate: string;
    customerName: string;
    totalAmount: number;
    status: string;
    details: SalesOrderDetail[];
}

const ViewSalesOrders: React.FC = () => {
    const navigate = useNavigate();
    const [selectedDetails, setSelectedDetails] = useState<number[]>([]);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [selectedSalesOrders, setSelectedSalesOrders] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [expandedRows, setExpandedRows] = useState<number[]>([]);
    const [details, setDetails] = useState<Record<number, any[]>>({});
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [filterType, setFilterType] = useState<string>("ALL");
    const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
    const [salesOrderNo, setSalesOrderNo] = useState("");
    const totalPages = Math.ceil(total / pageSize);
    const [searchParams] = useSearchParams();
    const salesOrderID = searchParams.get("id");
    const isEditMode = !!salesOrderID;

    const fetchSalesOrders = async () => {
        const res = await fetch(
            `http://127.0.0.1:8000/api/salesorders/getSalesOrderFilters?filterType=${filterType}&salesOrderNo=${salesOrderNo}&page=${page}&pageSize=${pageSize}`
        );

        const data = await res.json();
        setSalesOrders(data.items);
        setTotal(data.total);
    };

    useEffect(() => {
        fetchSalesOrders();
    }, [filterType, page]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleDropdown = (id: number) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    

    const handleSelect = (salesOrderID: number) => {
        setSelectedSalesOrders((prev) =>
            prev.includes(salesOrderID)
                ? prev.filter((id) => id !== salesOrderID)
                : [...prev, salesOrderID]
        );
    };
    const handleSelectAll = () => {
        setSelectAll(!selectAll);
        if (!selectAll) {
            setSelectedSalesOrders(salesOrders.map((qt) => qt.salesOrderID));
        } else {
            setSelectedSalesOrders([]);
        }
    };


    const handleParentCheckbox = (salesOrder: SalesOrder) => {
        const allSelected = salesOrder.details.every(d =>
            selectedDetails.includes(d.salesOrderDetailID)
        );

        if (allSelected) {
            // Deselect all
            setSelectedDetails(prev =>
                prev.filter(id => !salesOrder.details.some(d => d.salesOrderDetailID === id))
            );
        } else {
            // Select all
            setSelectedDetails(prev => [
                ...prev,
                ...salesOrder.details
                    .map(d => d.salesOrderDetailID)
                    .filter(id => !prev.includes(id))
            ]);
        }
    };

    const handleChildCheckbox = (detailID: number, salesorder: SalesOrder) => {
        setSelectedDetails((prev) =>
            prev.includes(detailID)
                ? prev.filter((id) => id !== detailID)
                : [...prev, detailID]
        );
    };
    const toggleSalesOrderExpand = async (salesOrderID: number) => {
        setExpandedRows(prev =>
            prev.includes(salesOrderID)
                ? prev.filter(id => id !== salesOrderID)
                : [...prev, salesOrderID]
        );

        if (!details[salesOrderID]) {
            const res = await axios.get(
                `http://127.0.0.1:8000/api/salesorders/${salesOrderID}`
            );
            setDetails(prev => ({
                ...prev,
                [salesOrderID]: res.data.items
            }));
        }
    };

    return (
        <div className="grid grid-cols-6 gap-4 pt-1">
            <div className="grid grid-cols-6 col-span-6 bg-white p-4 border border-blue-300 rounded-lg gap-2">
                <div className="col-span-6 flex flex-wrap items-center justify-between mb-2 gap-2">
                    <label className="text-gray-700 p-1 text-lg font-bold whitespace-nowrap">
                        Sales Order
                    </label>
                </div>
                <div className="col-span-6 flex flex-wrap items-center justify-end mb-2">
                    <div className="flex items-center gap-2 pr-[20px]">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search by Quotation No"
                                value={salesOrderNo}
                                onChange={(e) => {
                                    setSalesOrderNo(e.target.value);
                                    setPage(1);
                                }}
                                className="border border-gray-400 px-2 py-1 rounded h-[28px] text-[12px]"
                            />
                        </div>
                    </div>
                    <div className="flex items-center  pr-[20px]">
                        <div className="relative w-full">
                            <select
                                value={filterType}
                                onChange={(e) => {
                                    setFilterType(e.target.value);
                                    setPage(1);
                                }}
                                className="border border-gray-400 px-2 py-1 rounded appearance-none h-[28px] text-[12px] cursor-pointer"
                            >
                                <option value="ALL">All (No Filter)</option>
                                <option value="TODAY">Date Today</option>
                                <option value="THIS_MONTH">Date This Month</option>
                                <option value="EXPIRING_TODAY">Expiring Today</option>
                                <option value="EXPIRED">Expired</option>
                                <option value="PENDING">Pending</option>
                                <option value="INVOICED">Invoiced</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative w-full mr-[10px]">
                            <button
                                onClick={fetchSalesOrders}
                                className="min-w-[60px] h-[28px] bg-[#1c3c61] text-white text-[12px] rounded border border-blue-800 hover:bg-blue-800 hover:text-white cursor-pointer"
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate("/SalesOrders")}
                        className="min-w-[100px] h-[28px] bg-[#1c3c61] text-white text-[12px] rounded border border-blue-800 hover:bg-blue-800 hover:text-white cursor-pointer"

                    >
                        New Sales Order
                    </button>


                </div>

                {/* Quotation List */}
                <div className="col-span-6 w-full h-[450px] overflow-x-auto overflow-y-auto border-[#1c3c61] rounded-lg">
                    <table className="min-w-full table-fixed text-[11px] border-[#1c3c61] rounded-lg">
                        <thead className="bg-[#1c3c61]">
                            <tr>
                                <th className="w-[50px] py-2 px-2 text-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 accent-[#1a4e8a] ml-[-20px] cursor-pointer p-2"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                    />
                                </th>

                                <th className="w-[220px] p-2 text-left text-white">Customer Name</th>
                                <th className="w-[220px] p-2 text-left text-white">Sales Order No</th>
                                <th className="w-[220px] p-2 text-left text-white">Date Creation</th>
                                <th className="w-[220px] p-2 text-left text-white">Total Amount</th>
                                <th className="w-[220px] p-2 text-left text-white">Status</th>
                                <th className="w-[100px] p-2 text-left text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesOrders.map(q => (
                                <React.Fragment key={q.salesOrderID}>
                                    {/* ================= SUMMARY ROW ================= */}
                                    <tr>
                                        <td className="w-[50px] py-2 px-2 text-center border-b border-gray-400 border-l border-[#1c3c61]">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-[#1c3c61] cursor-pointer"
                                                    checked={selectedSalesOrders.includes(q.salesOrderID)}
                                                    onChange={() => handleSelect(q.salesOrderID)}
                                                />

                                                <button
                                                    className="w-4 h-4 flex items-center justify-center text-white text-lg pb-[5px] bg-[#1c3c61] rounded hover:bg-[#161f4d] cursor-pointer"
                                                    onClick={() => toggleSalesOrderExpand(q.salesOrderID)}
                                                >
                                                    {expandedRows.includes(q.salesOrderID) ? "−" : "+"}
                                                </button>
                                            </div>
                                        </td>

                                        <td className="w-[220px] p-2 border-b border-gray-400">
                                            {q.customerName}
                                        </td>
                                        <td className="w-[220px] p-2 border-b border-gray-400">
                                            {q.salesOrderNo}
                                        </td>
                                        <td className="w-[220px] p-2 border-b border-gray-400">
                                            {q.salesOrderDate}
                                        </td>
                                        <td className="w-[220px] p-2 border-b border-gray-400">
                                            {q.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="w-[220px] p-2 border-b border-gray-400">
                                            {q.status}
                                        </td>
                                        <td className="w-[50px] p-2 border-b border-gray-400 relative">
                                            <div ref={dropdownRef} className="relative inline-block">
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2 text-[12px] text-blue-700 pr-2"
                                                    onClick={() => toggleDropdown(q.salesOrderID)}
                                                >
                                                    Actions
                                                    <ChevronDown
                                                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${openDropdown === q.salesOrderID ? "" : ""
                                                            }`}
                                                    />
                                                </button>

                                                {openDropdown === q.salesOrderID && (
                                                    <div className="absolute right-0 top-7 w-40 bg-white border border-blue-400 shadow-md rounded z-50">
                                                        <button className="block w-full px-4 py-2 text-left text-[12px] hover:bg-blue-200"
                                                            onClick={() => navigate(`/salesorders/create?id=${q.salesOrderID}`)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button className="block w-full px-4 py-2 text-left text-[12px] hover:bg-blue-200">
                                                            Edit Status
                                                        </button>
                                                        <button className="block w-full px-4 py-2 text-left text-[12px] hover:bg-blue-200">
                                                            Print
                                                        </button>
                                                        <button className="block w-full px-4 py-2 text-left text-[12px] hover:bg-blue-200">
                                                            View History
                                                        </button>
                                                        <button className="block w-full px-4 py-2 text-left text-[12px] hover:bg-blue-200">
                                                            Create Invoice
                                                        </button>
                                                        <button className="block w-full px-4 py-2 text-left text-[12px] hover:bg-blue-200">
                                                            Copy Order
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* <td className="w-[100px] p-2 border-b border-gray-400 relative cursor-pointer">
                                            <div ref={dropdownRef}>
                                                <button
                                                    className="relative flex items-center gap-1 text-[12px] text-blue-700 pr-6"
                                                    onClick={() => toggleDropdown(q.salesOrderID)}
                                                >
                                                    Actions
                                                    <ChevronDown
                                                        className={`w-4 h-4 text-gray-500 transition-transform ${openDropdown === q.salesOrderID ? "rotate-180" : ""
                                                            }`}
                                                    />
                                                </button>


                                                {openDropdown === q.salesOrderID && (
                                                    <div className="absolute right-0 top-8 w-30 bg-white border border-blue-400 shadow rounded z-50">
                                                        <button className="block w-full px-4 py-2 hover:bg-blue-200 text-left cursor-pointer">
                                                            Edit
                                                        </button>
                                                        <button className="block w-full px-4 py-2 hover:bg-blue-200 text-left cursor-pointer">
                                                            Edit Status
                                                        </button>
                                                        <button className="block w-full px-4 py-2 hover:bg-blue-200 text-left cursor-pointer">
                                                            Print
                                                        </button>
                                                        <button className="block w-full px-4 py-2 hover:bg-blue-200 text-left cursor-pointer">
                                                            View History
                                                        </button>
                                                        <button className="block w-full px-4 py-2 hover:bg-blue-200 text-left cursor-pointer">
                                                            Create Invoice
                                                        </button>
                                                        <button className="block w-full px-4 py-2 hover:bg-blue-200 text-left cursor-pointer">
                                                            Copy Order
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td> */}
                                    </tr>

                                    {/* ================= EXPANDED DETAIL ROW ================= */}
                                    {expandedRows.includes(q.salesOrderID) && (
                                        <tr className="">
                                            <td colSpan={7} className="bg-gray-50 p-3">
                                                <table className="w-full text-xs border border-gray-400">
                                                    <thead className="bg-[#29588f] text-white">
                                                        <tr>
                                                            <th className="w-[220px] p-2 text-left">Item Description</th>
                                                            <th className="w-[220px] p-2 text-right">Quantity</th>
                                                            <th className="w-[220px] p-2 text-right">Unit Price</th>
                                                            <th className="w-[220px] p-2 text-right">Discount Amount</th>
                                                            <th className="w-[220px] p-2 text-right">VAT Amount</th>
                                                            <th className="w-[220px] p-2 text-right">Line Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(details[q.salesOrderID] || []).map((d, i) => (
                                                            <tr key={i}>
                                                                <td className="w-[220px] p-2 border-b border-gray-400">
                                                                    {d.itemDescription}
                                                                </td>
                                                                <td className="w-[220px] p-2 border-b border-gray-400 text-right">
                                                                    {d.quantity}
                                                                </td>
                                                                <td className="w-[220px] p-2 border-b border-gray-400 text-right">
                                                                    {d.unitPrice}
                                                                </td>
                                                                <td className="w-[220px] p-2 border-b border-gray-400 text-right">
                                                                    {d.discountAmount}
                                                                </td>
                                                                <td className="w-[220px] p-2 border-b border-gray-400 text-right">
                                                                    {d.vatAmount}
                                                                </td>
                                                                <td className="w-[220px] p-2 border-b border-gray-400 text-right">
                                                                    {d.lineTotal}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="col-span-6 flex gap-2 mt-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="w-[70px] h-[28px] bg-blue-200 hover:bg-blue-300 text-sm rounded-sm cursor-pointer"
                    >
                        Previous
                    </button>
                    <span className="mx-2">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="w-[70px] h-[28px] bg-blue-200 hover:bg-blue-300 text-sm rounded-sm cursor-pointer"
                    >
                        Next
                    </button>

                    <div className="text-sm text-gray-600">
                        Page {page + 1} of {Math.ceil(total / pageSize)} | Total: {total} records
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewSalesOrders;
