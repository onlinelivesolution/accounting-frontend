import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ChevronDown, Download, Trash2, MoreVertical, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import ConfirmModal from "@/Components/common/ConfirmModal";
import ConfirmPopover from "@/Components/common/ConfirmPopover";
import toast from "react-hot-toast";
import api from "@/utils/axios";

interface SalesInvoiceDetail {
  salesInvoiceDetailID: number;
  itemID: number;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

interface SalesInvoice {
  salesInvoiceID: number;
  salesOrderID: number;
  salesInvoiceNo: string;
  salesInvoiceDate: string;
  customerName: string;
  totalAmount: number;
  status: string;
  details: SalesInvoiceDetail[];
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

const SalesInvoiceView: React.FC = () => {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [selectedSalesInvoices, setSelectedSalesInvoices] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [details, setDetails] = useState<Record<number, any[]>>({});
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>([]);
  const [salesInvoiceNo, setSalesInvoiceNo] = useState("");
  const totalPages = Math.ceil(total / pageSize);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [status, setStatus] = useState("");

  const [confirmId, setConfirmId] = useState<number | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copySalesInvoiceId, setCopySalesInvoiceId] = useState<number | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);

  const location = useLocation();
  const highlightId = location.state?.highlightId ?? null;
  const rowRefs = useRef<{ [key: number]: HTMLTableRowElement | null }>({});

  const handleConfirmCopy = async () => {

    if (!copySalesInvoiceId) return;

    try {

      const res = await api.post(`/api/salesinvoices/${copySalesInvoiceId}/copy`);

      const newId = res.data.salesInvoiceID;

      setConfirmOpen(false);
      setCopySalesInvoiceId(null);
      setOpenDropdown(null);

      navigate("/sales-invoices", { state: { highlightId: newId } });
      fetchSalesInvoices();

    } catch (error) {

      console.error("Copy sales invoice failed", error);
      alert("Failed to copy sales invoice");

    }
  };


  const handleCancelCopy = () => {
    setConfirmOpen(false);
    setCopySalesInvoiceId(null);
  };

  const handleCopyInvoice = async (salesInvoiceID: number) => {
    try {

      const res = await api.post(`/api/salesinvoices/${salesInvoiceID}/copy`);

      const newId = res.data.salesInvoiceID;

      setConfirmId(null);
      setOpenDropdown(null);
      toast.success("Sales Invoice copied successfully");
      // go to list screen and highlight new invoice
      navigate("/sales-invoices", { state: { highlightId: newId } });
      fetchSalesInvoices();
    } catch (error) {
      console.error("Copy invoice failed", error);
      alert("Failed to copy invoice");
      setConfirmId(null);
    }
  };

  // Load sales orders in grid
  // const fetchSalesInvoices = async () => {
  //   const res = await fetch(
  //     `http://127.0.0.1:8000/api/salesinvoices/getSalesInvoiceFilters?filterType=${filterType}&salesInvoiceNo=${salesInvoiceNo}&page=${page}&pageSize=${pageSize}`
  //   );

  //   const data = await res.json();
  //   setSalesInvoices(data.items);
  //   setTotal(data.total);
  // };

  // useEffect(() => {
  //   fetchSalesInvoices();
  // }, [filterType, page]);

      const fetchSalesInvoices = async () => {

        try {

            const response = await api.get(
                "/api/salesinvoices/getSalesInvoiceFilters",
                {
                    params: {
                        filterType,
                        salesInvoiceNo,
                        page,
                        pageSize,
                    },
                }
            );

            setSalesInvoices(response.data.items);
            setTotal(response.data.total);

        } catch (error) {

            console.error("Sales Order Load Error:", error);
        }
    };

    useEffect(() => {
        fetchSalesInvoices();
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

      // Ctrl + N → Create New Sales Invoice
      if (e.altKey && e.key.toLowerCase() === "n") {

        e.preventDefault();
        navigate("/sales-invoices/new");

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
  const openStatusModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setStatus(invoice.status || "");
    setIsStatusModalOpen(true);
  };

  // Close update status modal
  const closeStatusModal = () => {
    setIsStatusModalOpen(false);
    setSelectedInvoice(null);
  };

  // Handle individual child check boxes
  const handleSelectIndividualCheckBox = (salesInvoiceID: number) => {
    setSelectedSalesInvoices((prev) =>
      prev.includes(salesInvoiceID)
        ? prev.filter((id) => id !== salesInvoiceID)
        : [...prev, salesInvoiceID]
    );
  };

  // Handle parent check box
  const handleSelectAllCheckBox = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedSalesInvoices(salesInvoices.map((si) => si.salesInvoiceID));
    } else {
      setSelectedSalesInvoices([]);
    }
  };

  // Expand sales order details
  const toggleSalesInvoiceExpand = async (
    salesInvoiceID: number
  ) => {

    setExpandedRows(prev =>
      prev.includes(salesInvoiceID)
        ? prev.filter(id => id !== salesInvoiceID)
        : [...prev, salesInvoiceID]
    );

    if (!details[salesInvoiceID]) {

      try {

        const res = await api.get(
          `/api/salesinvoices/${salesInvoiceID}`
        );

        setDetails(prev => ({
          ...prev,
          [salesInvoiceID]: res.data.items
        }));

      } catch (error) {

        console.error(
          "Failed to load Sales Invoice details",
          error
        );
      }
    }
  };

  // Update sales order status
  const updateStatus = async () => {
    if (!selectedInvoice) return;

    try {

      await api.put(`/api/salesinvoices/updateSalesInvoiceStatus/${selectedInvoice.salesInvoiceID}`, {
        status: status
      });

      toast.success("Status updated successfully");

      closeStatusModal();

      fetchSalesInvoices(); // reload list

    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };


  const isAlreadyApproved = selectedInvoiceId
    ? salesInvoices.find(si => si.salesInvoiceID === selectedInvoiceId)?.status === "Approved"
    : false;

  const approveSalesInvoice = async (invoiceId: number) => {
    try {
      const response = await api.put(`/api/salesinvoices/approveSalesInvoice/${invoiceId}`);

      // ✅ Use the response if needed
      if (response.status === 200) {
        toast.success(response.data?.message || "Invoice approved successfully!");
        fetchSalesInvoices();
      } else {
        toast.error(response.data?.message || "Failed to approve invoice");
      }
    } catch (error: any) {
      // Use the error response from FastAPI
      const msg =
        error.response?.data?.detail || // FastAPI default error detail
        error.response?.data?.message || // custom message from backend
        "Failed to approve invoice";

      toast.error(msg);
    }
  };

  const handleSendMail = (invoice: any) => {
    console.log("Send mail for:", invoice);

    // Example:
    // open mail modal OR call API
  };

  return (
    <div className="grid grid-cols-6 gap-4 pt-1">
      <div className="grid grid-cols-6 col-span-6 bg-white p-4 border border-blue-300 rounded-lg gap-2">
        <div className="col-span-6 flex flex-wrap items-center justify-between mb-2 gap-2">
          <label className="text-gray-700 p-1 text-lg font-bold whitespace-nowrap">
            Sales Invoice
          </label>
        </div>
        <div className="col-span-6 flex flex-wrap items-center justify-end mb-2">
          <div className="flex items-center gap-2 pr-[20px]">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search by Sales Invoice No"
                value={salesInvoiceNo}
                onChange={(e) => {
                  setSalesInvoiceNo(e.target.value);
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
                onClick={fetchSalesInvoices}
                className="min-w-[60px] h-[28px] bg-[#1c3c61] text-white text-[12px] rounded border border-blue-800 hover:bg-blue-800 hover:text-white cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate("/sales-invoices/new")}
            className="min-w-[100px] h-[28px] bg-[#1c3c61] text-white text-[12px] rounded border border-blue-800 hover:bg-blue-800 hover:text-white cursor-pointer"

          >
            New Sales Invoice
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
              {salesInvoices.map((si) => {
                const isApproved = si.status?.toLowerCase() === "approved";

                return (
                  <React.Fragment key={si.salesInvoiceID}>
                    <tr
                      ref={(el) => (rowRefs.current[si.salesInvoiceID] = el)}
                      className={`group relative border-b border-gray-300 hover:bg-gray-200 ${highlightId === si.salesInvoiceID ? "bg-green-200 animate-pulse" : ""
                        }`}
                    >
                      <td className="w-[50px] py-2 px-2 text-center border-b border-gray-400 border-l border-[#1c3c61]">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-[#1c3c61] cursor-pointer"
                            checked={selectedSalesInvoices.includes(si.salesInvoiceID)}
                            onChange={() => handleSelectIndividualCheckBox(si.salesInvoiceID)}
                          />

                          <button
                            className="w-4 h-4 flex items-center justify-center text-white text-lg pb-[5px] bg-[#1c3c61] rounded hover:bg-[#161f4d] cursor-pointer"
                            onClick={() => toggleSalesInvoiceExpand(si.salesInvoiceID)}
                          >
                            {expandedRows.includes(si.salesInvoiceID) ? "−" : "+"}
                          </button>
                        </div>
                      </td>

                      <td className="w-[220px] p-2 border-b border-gray-400">
                        <div className="flex items-center gap-3">
                          {/* Circle Avatar */}
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-semibold ring-2 ring-green shadow ${getColorFromName(
                              si.customerName
                            )}`}
                          >
                            {getInitial(si.customerName)}
                          </div>
                          {si.customerName}
                        </div>
                      </td>
                      <td className="w-[220px] p-2 border-b border-gray-400">
                        {si.salesInvoiceNo}
                      </td>
                      <td className="w-[220px] p-2 border-b border-gray-400">
                        {si.salesInvoiceDate}
                      </td>
                      <td className="w-[220px] p-2 border-b border-gray-400">
                        {si.totalAmount.toFixed(2)}
                      </td>
                      <td className="w-[220px] p-2 border-b border-gray-400">
                        {si.status?.toLowerCase() === "approved" ? (
                          <span className="px-2 py-[2px] text-[11px] font-semibold bg-green-100 text-green-700 rounded">
                            Approved
                          </span>
                        ) : (
                          si.status
                        )}
                      </td>

                      <td className="w-[120px] p-2 border-b border-gray-400 relative">
                        <div className="flex justify-end items-center gap-2">

                          {/* ✅ FLOATING ICONS (NO ANIMATION) */}
                          {openDropdown !== si.salesInvoiceID && (
                            <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-gray/80 backdrop-blur-sm px-1 py-1 rounded shadow-sm">

                              {/* Download */}
                              <button
                                onClick={() => handleDownload(si)}
                                title="Download"
                                className="p-2 rounded-full text-gray-800 hover:bg-blue-200 cursor-pointer"
                              >
                                <Download className="w-5 h-5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(si.salesInvoiceID)}
                                title="Delete"
                                disabled={isApproved}
                                className={`p-2 rounded-full ${isApproved
                                  ? "text-gray-800 cursor-not-allowed"
                                  : "text-gray-800 hover:bg-blue-200 cursor-pointer"
                                  }`}
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                              {/* Mail */}
                              <button
                                onClick={() => handleOpenEmailModal(si)}
                                title={si.customerEmail ? "Send Mail" : "No Email Found"}
                                disabled={!si.customerEmail}
                                className={`p-2 rounded-full ${!si.customerEmail
                                    ? "text-gray-800 cursor-not-allowed"
                                    : "text-gray-600 hover:bg-blue-200 cursor-pointer"
                                  }`}
                              >
                                <Mail className="w-5 h-5" />
                              </button>
                            </div>
                          )}

                          {/* ✅ Existing Dropdown (UNCHANGED LOGIC) */}
                          <div
                            ref={openDropdown === si.salesInvoiceID ? dropdownRef : null}
                            onClick={(e) => e.stopPropagation()}
                            className="relative flex justify-end"
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown(si.salesInvoiceID);
                              }}
                              className="relative group/more p-1 rounded hover:bg-blue-200 flex items-center cursor-pointer"
                            >
                              <span className="absolute top-full mt-1 right-0 opacity-0 group-hover/more:opacity-100 text-[12px] text-gray-600 whitespace-nowrap pointer-events-none bg-gray-100 shadow px-2 py-[2px] border rounded">
                                More Actions
                              </span>
                              <MoreVertical className="w-6 h-6 text-gray-600" />
                            </button>

                            {openDropdown === si.salesInvoiceID && (
                              <div className="absolute right-0 top-7 w-40 bg-white border border-blue-400 shadow-md rounded z-50">

                                {/* KEEP YOUR EXISTING BUTTONS EXACTLY SAME */}
                                {/* (no changes inside this block) */}

                                <button
                                  onClick={() => {
                                    if (isApproved) return;
                                    setOpenDropdown(null);
                                    navigate(`/sales-invoices/${si.salesInvoiceID}/edit`);
                                  }}
                                  className={`block w-full px-4 py-2 text-left text-[12px] ${isApproved
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "hover:bg-blue-200 text-blue-700"
                                    }`}
                                  disabled={isApproved}
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() => openStatusModal(si)}
                                  className="block w-full px-4 py-2 text-left text-[12px] hover:bg-blue-200"
                                >
                                  Edit Status
                                </button>

                                <button
                                  onClick={() => {
                                    if (isApproved) return;
                                    setSelectedInvoiceId(si.salesInvoiceID);
                                    setApproveModalOpen(true);
                                    setOpenDropdown(null);
                                  }}
                                  className={`block w-full px-4 py-2 text-left text-[12px] ${isApproved
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "hover:bg-blue-200 text-blue-700"
                                    }`}
                                  disabled={isApproved}
                                >
                                  Approve Invoice
                                </button>

                                <button className="block w-full px-4 py-2 text-left text-[12px] hover:bg-blue-200">
                                  Print
                                </button>

                                <button
                                  className="block w-full px-4 py-2 text-left text-[12px] hover:bg-blue-200"
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    navigate(`/sales-orders/${si.salesInvoiceID}/view`);
                                  }}
                                >
                                  View History
                                </button>

                                <button className="block w-full px-4 py-2 text-left text-[12px] hover:bg-blue-200">
                                  Create Invoice
                                </button>

                                <button
                                  className="block w-full px-4 py-2 text-left text-[12px] hover:bg-blue-200"
                                  onClick={() => setConfirmId(si.salesInvoiceID)}
                                >
                                  Copy Invoice
                                </button>

                                <ConfirmPopover
                                  isOpen={confirmId === si.salesInvoiceID}
                                  message="Create the same another sales invoice?"
                                  onConfirm={() => handleCopyInvoice(si.salesInvoiceID)}
                                  onCancel={() => {
                                    setConfirmId(null);
                                    setOpenDropdown(null);
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                    </tr>

                    {/* ================= EXPANDED DETAIL ROW ================= */}
                    {expandedRows.includes(si.salesInvoiceID) && (
                      <tr>
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
                              {(details[si.salesInvoiceID] || []).map((d, i) => (
                                <tr key={i}>
                                  <td className="p-2 border-b border-gray-400">{d.itemDescription}</td>
                                  <td className="p-2 border-b border-gray-400 text-right">{d.quantity}</td>
                                  <td className="p-2 border-b border-gray-400 text-right">{d.unitPrice}</td>
                                  <td className="p-2 border-b border-gray-400 text-right">{d.discountAmount}</td>
                                  <td className="p-2 border-b border-gray-400 text-right">{d.vatAmount}</td>
                                  <td className="p-2 border-b border-gray-400 text-right">{d.totalAmount}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          {/* Confirm Modal */}
          <ConfirmModal
            isOpen={confirmOpen}
            title="Copy Sales Invoice"
            message="Do you want to create the same sales invoice?"
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
      {approveModalOpen && selectedInvoiceId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-md w-80">
            <h3 className="text-lg font-bold mb-4">Invoice Approval</h3>
            <p className="mb-4">
              {isAlreadyApproved
                ? "This invoice has already been approved."
                : "Are you sure you want to approve this invoice?"}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setApproveModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  if (!isAlreadyApproved) {
                    await approveSalesInvoice(selectedInvoiceId);
                  }
                  setApproveModalOpen(false);
                  setSelectedInvoiceId(null);
                }}
                className={`px-4 py-2 rounded text-white ${isAlreadyApproved ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                disabled={isAlreadyApproved}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">

          <div className="bg-white p-4 rounded shadow w-[320px]">

            <h3 className="text-sm font-semibold mb-3">
              Update Sales Invoice Status
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

export default SalesInvoiceView;