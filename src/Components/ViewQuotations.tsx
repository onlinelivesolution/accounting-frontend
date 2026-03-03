import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";


interface QuotationDetail {
    quotationDetailID: number;
    itemID: number;
    itemDescription: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

interface Quotation {
    quotationID: number;
    quotationNo: string;
    quotationDate: string;
    customerName: string;
    totalAmount: number;
    status: string;
    details: QuotationDetail[];
}



const ViewQuotations: React.FC = () => {
    const navigate = useNavigate();
    const [selectedDetails, setSelectedDetails] = useState<number[]>([]);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [selectedQuotations, setSelectedQuotations] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [expandedRows, setExpandedRows] = useState<number[]>([]);
    const [details, setDetails] = useState<Record<number, any[]>>({});
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [filterType, setFilterType] = useState<string>("ALL");
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [quotationNo, setQuotationNo] = useState("");
    const totalPages = Math.ceil(total / pageSize);

    const fetchQuotations = async () => {
        const res = await fetch(
            `http://127.0.0.1:8000/api/quotations/getQuotationFilters?filterType=${filterType}&quotationNo=${quotationNo}&page=${page}&pageSize=${pageSize}`
        );

        const data = await res.json();
        setQuotations(data.items);
        setTotal(data.total);
    };

    useEffect(() => {
        fetchQuotations();
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

    const toggleDropdown = (id: number) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const handleSelect = (quotationID: number) => {
        setSelectedQuotations((prev) =>
            prev.includes(quotationID)
                ? prev.filter((id) => id !== quotationID)
                : [...prev, quotationID]
        );
    };
    const handleSelectAll = () => {
        setSelectAll(!selectAll);
        if (!selectAll) {
            setSelectedQuotations(quotations.map((qt) => qt.quotationID));
        } else {
            setSelectedQuotations([]);
        }
    };


    const handleParentCheckbox = (quotation: Quotation) => {
        const allSelected = quotation.details.every(d =>
            selectedDetails.includes(d.quotationDetailID)
        );

        if (allSelected) {
            // Deselect all
            setSelectedDetails(prev =>
                prev.filter(id => !quotation.details.some(d => d.quotationDetailID === id))
            );
        } else {
            // Select all
            setSelectedDetails(prev => [
                ...prev,
                ...quotation.details
                    .map(d => d.quotationDetailID)
                    .filter(id => !prev.includes(id))
            ]);
        }
    };

    const handleChildCheckbox = (detailID: number, quotation: Quotation) => {
        setSelectedDetails((prev) =>
            prev.includes(detailID)
                ? prev.filter((id) => id !== detailID)
                : [...prev, detailID]
        );
    };
    const toggleQuotationExpand = async (quotationID: number) => {
        setExpandedRows(prev =>
            prev.includes(quotationID)
                ? prev.filter(id => id !== quotationID)
                : [...prev, quotationID]
        );

        if (!details[quotationID]) {
            const res = await axios.get(
                `http://127.0.0.1:8000/api/quotations/${quotationID}`
            );
            setDetails(prev => ({
                ...prev,
                [quotationID]: res.data.items
            }));
        }
    };

    return (
        <div className="grid grid-cols-6 gap-4 pt-1">
            <div className="grid grid-cols-6 col-span-6 bg-white p-4 border border-blue-300 rounded-lg gap-2">
                <div className="col-span-6 flex flex-wrap items-center justify-between mb-2 gap-2">
                    <label className="text-gray-700 p-1 text-lg font-bold whitespace-nowrap">
                        Quotation
                    </label>
                </div>
                <div className="col-span-6 flex flex-wrap items-center justify-end mb-2">
                    <div className="flex items-center gap-2 pr-[20px]">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search by Quotation No"
                                value={quotationNo}
                                onChange={(e) => {
                                    setQuotationNo(e.target.value);
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
                                onClick={fetchQuotations}
                                className="min-w-[60px] h-[28px] bg-[#1c3c61] text-white text-[12px] rounded border border-blue-800 hover:bg-blue-800 hover:text-white cursor-pointer"
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate("/Quotations")}
                        className="min-w-[100px] h-[28px] bg-[#1c3c61] text-white text-[12px] rounded border border-blue-800 hover:bg-blue-800 hover:text-white cursor-pointer"

                    >
                        New Quotation
                    </button>


                </div>

                {/* Quotation List */}
                <div className="col-span-6 w-full h-[450px] overflow-x-auto overflow-y-auto border border-blue-300 rounded-lg">
                    <table className="min-w-full table-fixed text-[11px] border-l border-blue-300 border-r border-blue-300 rounded-lg">
                        <thead className="bg-[#1c3c61] border-b border-blue-300">
                            <tr>
                                <th className="w-[50px] py-2 px-2 text-center border-b border-blue-300 border-l border-blue-300">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 accent-[#1a4e8a] pl-[15px]"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                    />
                                </th>

                                <th className="w-[220px] p-2 border-b border-blue-300 text-left text-white">Customer Name</th>
                                <th className="w-[220px] p-2 border-b border-blue-300 text-left text-white">Quotation No</th>
                                <th className="w-[220px] p-2 border-b border-blue-300 text-left text-white">Date Creation</th>
                                <th className="w-[220px] p-2 border-b border-blue-300 text-left text-white">Total Amount</th>
                                <th className="w-[220px] p-2 border-b border-blue-300 text-left text-white">Status</th>
                                <th className="w-[100px] p-2 border-b border-blue-300 text-left text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotations.map(q => (
                                <React.Fragment key={q.quotationID}>
                                    {/* ================= SUMMARY ROW ================= */}
                                    <tr>
                                        <td className="w-[50px] py-2 px-2 text-center border-b border-blue-300 border-l border-blue-300">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-[#1c3c61]"
                                                    checked={selectedQuotations.includes(q.quotationID)}
                                                    onChange={() => handleSelect(q.quotationID)}
                                                />

                                                <button
                                                    className="w-4 h-4 flex items-center justify-center text-white text-lg pb-[5px] bg-[#1c3c61] rounded hover:bg-[#161f4d]"
                                                    onClick={() => toggleQuotationExpand(q.quotationID)}
                                                >
                                                    {expandedRows.includes(q.quotationID) ? "−" : "+"}
                                                </button>
                                            </div>
                                        </td>

                                        <td className="w-[220px] p-2 border-b border-blue-300">
                                            {q.customerName}
                                        </td>
                                        <td className="w-[220px] p-2 border-b border-blue-300">
                                            {q.quotationNo}
                                        </td>
                                        <td className="w-[220px] p-2 border-b border-blue-300">
                                            {q.quotationDate}
                                        </td>
                                        <td className="w-[220px] p-2 border-b border-blue-300">
                                            {q.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="w-[220px] p-2 border-b border-blue-300">
                                            {q.status}
                                        </td>
                                        <td className="w-[100px] p-2 border-b border-blue-300 relative">
                                            <button
                                                className="text-xl font-bold text-blue-700"
                                                onClick={() => toggleDropdown(q.quotationID)}
                                            >
                                                ...
                                            </button>

                                            {openDropdown === q.quotationID && (
                                                <div className="absolute right-0 top-8 w-40 bg-white border border-blue-400 shadow rounded z-50">
                                                    <button className="block w-full px-4 py-2 hover:bg-blue-200">
                                                        View Details
                                                    </button>
                                                    <button className="block w-full px-4 py-2 hover:bg-blue-200">
                                                        Edit
                                                    </button>
                                                    <button className="block w-full px-4 py-2 hover:bg-blue-200">
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>

                                    {/* ================= EXPANDED DETAIL ROW ================= */}
                                    {expandedRows.includes(q.quotationID) && (
                                        <tr>
                                            <td colSpan={7} className="bg-gray-50 p-3">
                                                <table className="w-full text-xs border border-blue-300">
                                                    <thead className="bg-[#243483] text-white">
                                                        <tr>
                                                            <th className="w-[220px] p-2 border-b border-blue-300 text-left">Item Description</th>
                                                            <th className="w-[220px] p-2 border-b border-blue-300 text-right">Quantity</th>
                                                            <th className="w-[220px] p-2 border-b border-blue-300 text-right">Unit Price</th>
                                                            <th className="w-[220px] p-2 border-b border-blue-300 text-right">Discount Amount</th>
                                                            <th className="w-[220px] p-2 border-b border-blue-300 text-right">VAT Amount</th>
                                                            <th className="w-[220px] p-2 border-b border-blue-300 text-right">Line Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(details[q.quotationID] || []).map((d, i) => (
                                                            <tr key={i}>
                                                                <td className="w-[220px] p-2 border-b border-blue-300">
                                                                    {d.itemDescription}
                                                                </td>
                                                                <td className="w-[220px] p-2 border-b border-blue-300 text-right">
                                                                    {d.quantity}
                                                                </td>
                                                                <td className="w-[220px] p-2 border-b border-blue-300 text-right">
                                                                    {d.unitPrice}
                                                                </td>
                                                                <td className="w-[220px] p-2 border-b border-blue-300 text-right">
                                                                    {d.discountAmount}
                                                                </td>
                                                                <td className="w-[220px] p-2 border-b border-blue-300 text-right">
                                                                    {d.vatAmount}
                                                                </td>
                                                                <td className="w-[220px] p-2 border-b border-blue-300 text-right">
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
                        className="w-[70px] h-[28px] bg-blue-200 hover:bg-blue-300 text-sm rounded-sm"
                    >
                        Previous
                    </button>
                    <span className="mx-2">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="w-[70px] h-[28px] bg-blue-200 hover:bg-blue-300 text-sm rounded-sm"
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

export default ViewQuotations;
