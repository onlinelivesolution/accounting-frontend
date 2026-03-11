import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import ConfirmModal from "@/Components/common/ConfirmModal";
import ConfirmPopover from "@/Components/common/ConfirmPopover";
import toast from "react-hot-toast";
import api from "@/utils/axios";


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
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [status, setStatus] = useState("");

    const [confirmId, setConfirmId] = useState<number | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [copySalesOrderId, setCopySalesOrderId] = useState<number | null>(null);

    const location = useLocation();
    const highlightId = location.state?.highlightId ?? null;
    const rowRefs = useRef<{ [key: number]: HTMLTableRowElement | null }>({});

    // For use confirmation modal
    // const handleCopyClick = (salesOrderID: number) => {
    //     setCopySalesOrderId(salesOrderID);
    //     setConfirmOpen(true);
    // };

    const handleConfirmCopy = async () => {

        if (!copySalesOrderId) return;

        try {

            const res = await api.post(`/api/salesorders/${copySalesOrderId}/copy`);

            const newId = res.data.salesOrderID;

            setConfirmOpen(false);
            setCopySalesOrderId(null);
            setOpenDropdown(null);

            navigate("/sales-orders", { state: { highlightId: newId } });
            fetchSalesOrders();

        } catch (error) {

            console.error("Copy order failed", error);
            alert("Failed to copy order");

        }
    };

    const handleCancelCopy = () => {
        setConfirmOpen(false);
        setCopySalesOrderId(null);
    };

    const handleCopyOrder = async (salesOrderID: number) => {
        try {

            const res = await api.post(`/api/salesorders/${salesOrderID}/copy`);

            const newId = res.data.salesOrderID;

            setConfirmId(null);
            setOpenDropdown(null);
            toast.success("Sales Order copied successfully");
            // go to list screen and highlight new order
            navigate("/sales-orders", { state: { highlightId: newId } });
            fetchSalesOrders();
        } catch (error) {
            console.error("Copy order failed", error);
            alert("Failed to copy order");
            setConfirmId(null);
        }
    };

    // Load sales orders in grid
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

    // Highlight animation
    useEffect(() => {

        if (!highlightId) return;

        const row = rowRefs.current[highlightId];

        if (row) {

            row.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }

    }, [highlightId]);

    // Keyboard shortcuts
    useEffect(() => {

        const handleKeyDown = (e: KeyboardEvent) => {

            // Ctrl + N → Create New Sales Order
            if (e.altKey && e.key.toLowerCase() === "n") {

                e.preventDefault();
                navigate("/sales-orders/new");

            }

            // ESC → close dropdown
            if (e.key === "Escape") {

                setOpenDropdown(null);
                setConfirmId(null);

            }

        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };

    }, []);

    // Handle click outside grid dropdown to close
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

        const handleClickOutside = () => {
            setOpenDropdown(null);
            setConfirmId(null);
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };

    }, []);

    const toggleDropdown = (id: number) => {
        setOpenDropdown(openDropdown === id ? null : id);
        setConfirmId(null);
    };

    // Open update status modal
    const openStatusModal = (order: any) => {
        setSelectedOrder(order);
        setStatus(order.status || "");
        setIsStatusModalOpen(true);
    };

    // Close update status modal
    const closeStatusModal = () => {
        setIsStatusModalOpen(false);
        setSelectedOrder(null);
    };

    // Handle individual child check boxes
    const handleSelectIndividualCheckBox = (salesOrderID: number) => {
        setSelectedSalesOrders((prev) =>
            prev.includes(salesOrderID)
                ? prev.filter((id) => id !== salesOrderID)
                : [...prev, salesOrderID]
        );
    };

    // Handle parent check box
    const handleSelectAllCheckBox = () => {
        setSelectAll(!selectAll);
        if (!selectAll) {
            setSelectedSalesOrders(salesOrders.map((qt) => qt.salesOrderID));
        } else {
            setSelectedSalesOrders([]);
        }
    };

    // Expand sales order details
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
    // Update sales order status
    const updateStatus = async () => {
        if (!selectedOrder) return;

        try {

            await api.put(`/api/salesorders/updateSalesOrderStatus/${selectedOrder.salesOrderID}`, {
                status: status
            });

            toast.success("Status updated successfully");

            closeStatusModal();

            fetchSalesOrders(); // reload list

        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
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
                        onClick={() => navigate("/sales-orders/new")}
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
                                        onChange={handleSelectAllCheckBox}
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
                            {salesOrders.map(so => (
                                <React.Fragment key={so.salesOrderID}>
                                    {/* ================= SUMMARY ROW ================= */}
                                    {/* <tr key={so.salesOrderID} className={so.salesOrderID === highlightId ? "bg-green-200 font-semibold" : ""}> */}
                                    <tr
                                        ref={(el) => (rowRefs.current[so.salesOrderID] = el)}
                                        key={so.salesOrderID}
                                        className={`border-b border-gray-300 transition-all duration-700 ${highlightId === so.salesOrderID ? "bg-green-200 animate-pulse" : ""}`}
                                    >
                                        <td className="w-[50px] py-2 px-2 text-center border-b border-gray-400 border-l border-[#1c3c61]">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-[#1c3c61] cursor-pointer"
                                                    checked={selectedSalesOrders.includes(so.salesOrderID)}
                                                    onChange={() => handleSelectIndividualCheckBox(so.salesOrderID)}
                                                />

                                                <button
                                                    className="w-4 h-4 flex items-center justify-center text-white text-lg pb-[5px] bg-[#1c3c61] rounded hover:bg-[#161f4d] cursor-pointer"
                                                    onClick={() => toggleSalesOrderExpand(so.salesOrderID)}
                                                >
                                                    {expandedRows.includes(so.salesOrderID) ? "−" : "+"}
                                                </button>
                                            </div>
                                        </td>

                                        <td className="w-[220px] p-2 border-b border-gray-400">
                                            {so.customerName}
                                        </td>
                                        <td className="w-[220px] p-2 border-b border-gray-400">
                                            {so.salesOrderNo}
                                        </td>
                                        <td className="w-[220px] p-2 border-b border-gray-400">
                                            {so.salesOrderDate}
                                        </td>
                                        <td className="w-[220px] p-2 border-b border-gray-400">
                                            {so.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="w-[220px] p-2 border-b border-gray-400">
                                            {so.status}
                                        </td>

                                        <td className="w-[50px] p-2 border-b border-gray-400 relative">
                                            <div
                                                ref={openDropdown === so.salesOrderID ? dropdownRef : null}
                                                onClick={(e) => e.stopPropagation()}
                                                className="relative inline-block"
                                            >
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2 text-[12px] text-blue-700 pr-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleDropdown(so.salesOrderID);
                                                    }}
                                                >
                                                    Actions
                                                    <ChevronDown
                                                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${openDropdown === so.salesOrderID ? "rotate-180" : ""
                                                            }`}
                                                    />
                                                </button>

                                                {openDropdown === so.salesOrderID && (
                                                    <div className="absolute right-0 top-7 w-40 bg-white border border-blue-400 shadow-md rounded z-50">

                                                        <button
                                                            className="block w-full px-4 py-2 text-left text-[12px] hover:bg-blue-200"
                                                            onClick={() => {
                                                                setOpenDropdown(null);
                                                                navigate(`/sales-orders/${so.salesOrderID}/edit`);
                                                            }}
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            onClick={() => openStatusModal(so)}
                                                            className="block w-full px-4 py-2 text-left text-[12px] hover:bg-blue-200">
                                                            Edit Status
                                                        </button>

                                                        <button className="block w-full px-4 py-2 text-left text-[12px] hover:bg-blue-200">
                                                            Print
                                                        </button>

                                                        <button className="block w-full px-4 py-2 text-left text-[12px] hover:bg-blue-200"
                                                            onClick={() => {
                                                                setOpenDropdown(null);
                                                                navigate(`/sales-orders/${so.salesOrderID}/view`);
                                                            }}
                                                        >
                                                            View History
                                                        </button>

                                                        <button className="block w-full px-4 py-2 text-left text-[12px] hover:bg-blue-200">
                                                            Create Invoice
                                                        </button>

                                                        <button className="block w-full px-4 py-2 text-left text-[12px] hover:bg-blue-200"
                                                            onClick={() => setConfirmId(so.salesOrderID)}
                                                        >
                                                            Copy Order
                                                        </button>
                                                        <ConfirmPopover
                                                            isOpen={confirmId === so.salesOrderID}
                                                            message="Create the same another sales order?"
                                                            onConfirm={() => handleCopyOrder(so.salesOrderID)}
                                                            onCancel={() => {
                                                                setConfirmId(null);
                                                                setOpenDropdown(null);
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>

                                    {/* ================= EXPANDED DETAIL ROW ================= */}
                                    {expandedRows.includes(so.salesOrderID) && (
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
                                                        {(details[so.salesOrderID] || []).map((d, i) => (
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
                    {/* Confirm Modal */}
                    <ConfirmModal
                        isOpen={confirmOpen}
                        title="Copy Sales Order"
                        message="Do you want to create the same sales order?"
                        confirmText="Yes"
                        cancelText="No"
                        onConfirm={handleConfirmCopy}
                        onCancel={handleCancelCopy}
                    />
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
            {isStatusModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">

                    <div className="bg-white p-4 rounded shadow w-[320px]">

                        <h3 className="text-sm font-semibold mb-3">
                            Update Sales Order Status
                        </h3>

                        <div className="mb-3">
                            <label className="text-xs">Status</label>
                            <div className="relative w-full">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full border border-gray-400 rounded h-8 text-xs px-2 appearance-none"
                                >
                                    <option value="">Select Status</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Closed">Closed</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">

                            <button
                                onClick={closeStatusModal}
                                className="px-3 py-1 bg-gray-400 text-white text-xs rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={updateStatus}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded"
                            >
                                Update
                            </button>

                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewSalesOrders;
