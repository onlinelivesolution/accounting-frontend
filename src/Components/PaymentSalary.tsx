import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api from "@/utils/axios";
import { CarTaxiFront, ChevronDown } from "lucide-react";
import { putForm } from "node_modules/axios/index.cjs";

interface SalaryDetail {
  salaryDetailID: number;
  salaryID: number;
  salaryNumber: string;
  employeeID: number;
  employeeName: string;
  basicSalary: number;
  houseRentAllowance: number;
  medicalAllowance: number;
  travelAllowance: number;
  conveyance: number;
  overtime: number;
  otherAllowance: number;
  grossEarnings: number;
  adjustUnpaidLeave: number;
  taxAmount: number;
  pFAmount: number;
  employerContribution: number;
  supplementaryPF: number;
  loanAdjust: number;
  houseRentDeduction: number;
  excessMobileBill: number;
  adjustAdvanceSalary: number;
  gradedTax: number;
  otherDeduction: number;
  totalDeduction: number;
  netEarnings: number;
  status: number;
}

interface Salary {
  salaryID: number;
  fiscalYear: string;
  month: number;
  monthName: string;
  statusName: string;
  workingDay: number;
  companyCode: string;
  departmentCode: string;
  sectionCode: string;
  createdDate: string;
  status: number;
  year: string;
  details: SalaryDetail[];
}

interface StatusOption {
  id: number;
  name: string;
}

interface SalaryPaymentResponse {
  salaryPaymentID: number;
  paymentNo: string;
  message: string;
}

interface BankOrCashAccount {
  detailItemCode: string;
  detailItemName: string;
  loadType: string;
}

const PaymentSalary: React.FC = () => {
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = new Date().getMonth() + 1;
  const [fiscalYear, setFiscalYear] = useState<string>(currentYear);
  const [month, setMonth] = useState<number>(currentMonth);
  const [statuses, setStatuses] = useState<StatusOption[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<number>(1);
  const [salaryData, setSalaryData] = useState<Salary[]>([]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [selectedDetails, setSelectedDetails] = useState<number[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankOrCashAccount[]>([]);
  const [selectedAccountCode, setSelectedAccountCode] = useState("");
  const [selectedAccountBalance, setSelectedAccountBalance] = useState("");
  const [nextSalaryPaymentNo, setNextSalaryPaymentNo] = useState<string>("");
  const [remarks, setRemarks] = useState("");

  const FISCAL_YEARS = ["2024", "2025", "2026"];
  const MONTHS = [
    { id: 1, name: "January" },
    { id: 2, name: "February" },
    { id: 3, name: "March" },
    { id: 4, name: "April" },
    { id: 5, name: "May" },
    { id: 6, name: "June" },
    { id: 7, name: "July" },
    { id: 8, name: "August" },
    { id: 9, name: "September" },
    { id: 10, name: "October" },
    { id: 11, name: "November" },
    { id: 12, name: "December" },
  ];

  const loadBankOrCashAccounts = async () => {
    try {
      const res = await api.get<BankOrCashAccount[]>(
        "/api/common/loadBankOrCashAccount",
      );

      setBankAccounts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadBankOrCashAccounts();
  }, []);

  const handleAccountChange = async (accountCode: string) => {
    setSelectedAccountCode(accountCode);

    try {
      const res = await api.get(
        `/api/banktransactions/getAccountBalance/${accountCode}`,
      );

      setSelectedAccountBalance(
        Number(res.data.balance).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      );
    } catch {
      setSelectedAccountBalance("0.00");
    }
  };

  // 🔹 Load Salary Data
  const handleLoadSalaryDetails = async () => {
    if (!fiscalYear || !month || !selectedStatus) {
      alert("Please select Year, Month, and Status!");
      return;
    }

    try {
      const response = await api.get<Salary[]>(
        "/api/salarypayments/getApproveSalaryByYearAndMonth",
        { params: { year: fiscalYear, month, status: selectedStatus } },
      );
      setSalaryData(response.data);
    } catch (err) {
      console.error("Failed to fetch salary:", err);
      setSalaryData([]);
    }
  };

  // 🔹 Parent checkbox
  // Parent checkbox: select/deselect all children
  const handleParentCheckbox = (salary: Salary) => {
    const allSelected = salary.details.every((d) =>
      selectedDetails.includes(d.salaryDetailID),
    );

    if (allSelected) {
      // Deselect all
      setSelectedDetails((prev) =>
        prev.filter(
          (id) => !salary.details.some((d) => d.salaryDetailID === id),
        ),
      );
    } else {
      // Select all
      setSelectedDetails((prev) => [
        ...prev,
        ...salary.details
          .map((d) => d.salaryDetailID)
          .filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleChildCheckbox = (detailID: number, salary: Salary) => {
    setSelectedDetails((prev) =>
      prev.includes(detailID)
        ? prev.filter((id) => id !== detailID)
        : [...prev, detailID],
    );
  };

  // 🔹 Expand / Collapse row
  const toggleExpand = (salaryID: number) => {
    setExpandedRows((prev) =>
      prev.includes(salaryID)
        ? prev.filter((id) => id !== salaryID)
        : [...prev, salaryID],
    );
  };

  // 🔹 Export
  const exportToExcel = () => {
    if (salaryData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(salaryData.flatMap((s) => s.details));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SalaryDetails");
    XLSX.writeFile(wb, `Salary_${fiscalYear}_${month}.xlsx`);
  };

  const exportToCSV = () => {
    if (salaryData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(salaryData.flatMap((s) => s.details));
    const csv = XLSX.utils.sheet_to_csv(ws);
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      `Salary_${fiscalYear}_${month}.csv`,
    );
  };

  // 🔹 Load Status Options
  useEffect(() => {
    api
      .get<StatusOption[]>("/api/salarydetails/loadDefaultItemStatus")
      .then((res) => setStatuses(res.data))
      .catch((err) => console.error("Failed to load statuses:", err));
  }, []);

  useEffect(() => {
    const fetchSalaryPaymentNo = async () => {
      try {
        const res = await api.get("/api/salarypayments/getNextSalaryPaymentNo");

        setNextSalaryPaymentNo(res.data.paymentNo);
      } catch (err) {
        console.error("Failed to load salary payment no:", err);
      }
    };

    fetchSalaryPaymentNo();
  }, []);

  const submitPaymentSalary = async () => {
    try {
      const selectedRows = salaryData.flatMap((salary) =>
        salary.details
          .filter((detail) => selectedDetails.includes(detail.salaryDetailID))
          .map((detail) => ({
            salaryID: salary.salaryID,
            employeeID: detail.employeeID,
            amount: detail.netEarnings,
            taxAmount: detail.taxAmount,
            pfAmount: detail.pFAmount,
            loanAdjust: detail.loanAdjust,
            adjustAdvanceSalary: detail.adjustAdvanceSalary,
            adjustUnpaidLeave: detail.adjustUnpaidLeave,
            paymentStatus: 1,
          })),
      );

      if (selectedRows.length === 0) {
        alert("Please select at least one employee.");
        return;
      }

      const totalAmount = selectedRows.reduce(
        (sum, row) => sum + row.amount,
        0,
      );

      console.log("Selected Account Code:", selectedAccountCode);
      console.log("Next Payment No:", nextSalaryPaymentNo);
      console.log("Remarks:", remarks);

      const payload = {
        paymentNo: nextSalaryPaymentNo,
        paymentDate: new Date().toISOString(),
        salaryMonth: month.toString(),
        salaryYear: salaryData[0].year,
        bankAccountCode: selectedAccountCode,
        totalAmount,
        remarks,
        status: 1,
        createdDate: new Date().toISOString(),
        companyCode: "01",
        salaryPaymentDetails: selectedRows,
      };

      console.log("Salary Payment Payload");
      console.log(JSON.stringify(payload, null, 2));

      const res = await api.post<SalaryPaymentResponse>(
        "/api/salarypayments/createSalaryPayment",
        payload,
      );

      alert(`${res.data.message}\n\nPayment No : ${res.data.paymentNo}`);

      // Clear selections
      setSelectedDetails([]);

      // Reload data
      await handleLoadSalaryDetails();
    } catch (err: any) {
      console.error(err);

      alert(err.response?.data?.detail ?? "Salary payment failed.");
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <label className="w-40 text-[10px]">Select Year</label>
          <div className="relative w-ful">
            <select
              value={fiscalYear}
              onChange={(e) => setFiscalYear(e.target.value)}
              className="w-full text-[10px] text-gray-800 h-[28px] px-2 pr-8 rounded border border-gray-400 appearance-none"
            >
              {FISCAL_YEARS.map((fy) => (
                <option key={fy}>{fy}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="w-40 text-[10px]">Select Month</label>
          <div className="relative w-full">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full text-[10px] text-gray-800 h-[28px] px-2 pr-8 rounded border border-gray-400 appearance-none"
            >
              {MONTHS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="w-40 text-[10px]">Select Month</label>
          <div className="relative w-full">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(Number(e.target.value))}
              className="w-full text-[10px] text-gray-800 h-[28px] px-2 pr-8 rounded border border-gray-400 appearance-none"
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
        <button
          onClick={handleLoadSalaryDetails}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          Load
        </button>
      </div>
      <div className="grid grid-cols-6 col-span-6 bg-white rounded-lg gap-2 h-[450px] overflow-x-auto overflow-y-auto">
        <table className="table-fixed w-full border-l border-r border-blue-300 rounded-lg">
          <thead className="bg-blue-300 border-b border-blue-300">
            <tr>
              <th className="w-[65px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left pl-[15px]">
                Select
              </th>
              <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left">
                SalaryID
              </th>
              <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left">
                Year
              </th>
              <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left">
                Month
              </th>
              <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left">
                Status
              </th>
              <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left"></th>
              <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left"></th>
              <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left"></th>
              <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left"></th>
              <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left"></th>
              <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left"></th>
              <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left"></th>
              <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left"></th>
              <th className="w-[250px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left"></th>
              <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left"></th>
              <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left"></th>
              <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left"></th>
              <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left"></th>
            </tr>
          </thead>

          <tbody>
            {salaryData.length > 0 ? (
              salaryData.map((salary) => {
                const allChildrenSelected = salary.details.every((d) =>
                  selectedDetails.includes(d.salaryDetailID),
                );
                const someChildrenSelected =
                  !allChildrenSelected &&
                  salary.details.some((d) =>
                    selectedDetails.includes(d.salaryDetailID),
                  );

                return (
                  <React.Fragment key={salary.salaryID}>
                    {/* Parent Row */}
                    <tr className="border-b">
                      <td className="pl-[15px] text-center py-2">
                        <div className="flex items-center gap-2">
                          {/* Parent Checkbox */}
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-blue-500 cursor-pointer"
                            checked={allChildrenSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = someChildrenSelected;
                            }}
                            onChange={() => handleParentCheckbox(salary)}
                          />

                          {/* Expand/Collapse Button */}
                          <button
                            className="w-4.5 h-4.5 flex items-center pb-[4px] text-lg justify-center border rounded text-white bg-blue-500 hover:bg-blue-600"
                            onClick={() => toggleExpand(salary.salaryID)}
                          >
                            {expandedRows.includes(salary.salaryID) ? "−" : "+"}
                          </button>
                        </div>
                      </td>
                      <td className="pl-[15px] border-b border-blue-300">
                        {salary.salaryID}
                      </td>
                      <td className="pl-[15px] border-b border-blue-300">
                        {salary.year}
                      </td>
                      <td className="pl-[15px] border-b border-blue-300">
                        {salary.monthName}
                      </td>
                      <td className="pl-[15px] border-b border-blue-300">
                        {salary.statusName}
                      </td>
                    </tr>

                    {/* Child Rows with Header */}
                    {expandedRows.includes(salary.salaryID) && (
                      <>
                        {/* Child Header */}
                        <tr className="bg-blue-100">
                          <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-left">
                            Select
                          </th>
                          <th className="w-[250px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-left">
                            Employee Name
                          </th>
                          <th className="w-[20px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-left">
                            Employee ID
                          </th>
                          <th className="w-[100px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">
                            Basic Salary
                          </th>
                          <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">
                            House Rent
                          </th>
                          <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">
                            Medical Allowance
                          </th>
                          <th className="w-[100px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">
                            Conveyance
                          </th>
                          <th className="w-[100px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">
                            Overtime
                          </th>
                          <th className="w-[130px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">
                            Other Allowance
                          </th>
                          <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">
                            Gross Earning
                          </th>
                          <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">
                            Adjust Loan
                          </th>
                          <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">
                            Advance Salary
                          </th>
                          <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">
                            Tax Amount
                          </th>
                          <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">
                            Unpaid Leave
                          </th>
                          <th className="w-[200px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">
                            House Rent Deduction
                          </th>
                          <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">
                            Excess Mobile Bill
                          </th>
                          <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">
                            Other Deduction
                          </th>
                          <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">
                            Total Deduction
                          </th>
                          <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 pr-[20px] text-right">
                            Net Payment
                          </th>
                        </tr>

                        {/* Child Data */}
                        {salary.details.map((detail) => (
                          <tr
                            key={detail.salaryDetailID}
                            className="border-b border-blue-300 hover:bg-gray-50"
                          >
                            <td className="pl-[15px] text-center py-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 accent-blue-500"
                                  checked={selectedDetails.includes(
                                    detail.salaryDetailID,
                                  )}
                                  onChange={() =>
                                    handleChildCheckbox(
                                      detail.salaryDetailID,
                                      salary,
                                    )
                                  }
                                />
                              </div>
                            </td>
                            <td className="px-2 py-2 text-left">
                              {detail.employeeName}
                            </td>
                            <td className="px-2 py-2 text-left">
                              {detail.employeeID}
                            </td>
                            <td className="px-2 py-2 text-right">
                              {detail.basicSalary}
                            </td>
                            <td className="px-2 py-2 text-right">
                              {detail.houseRentAllowance}
                            </td>
                            <td className="px-2 py-2 text-right">
                              {detail.medicalAllowance}
                            </td>
                            <td className="px-2 py-2 text-right">
                              {detail.conveyance}
                            </td>
                            <td className="px-2 py-2 text-right">
                              {detail.overtime}
                            </td>
                            <td className="px-2 py-2 text-right">
                              {detail.otherAllowance}
                            </td>
                            <td className="px-2 py-2 text-right">
                              {detail.grossEarnings}
                            </td>
                            <td className="px-2 py-2 text-right">
                              {detail.loanAdjust}
                            </td>
                            <td className="px-2 py-2 text-right">
                              {detail.adjustAdvanceSalary}
                            </td>
                            <td className="px-2 py-2 text-right">
                              {detail.taxAmount}
                            </td>
                            <td className="px-2 py-2 text-right">
                              {detail.adjustUnpaidLeave}
                            </td>
                            <td className="px-2 py-2 text-right">
                              {detail.houseRentDeduction}
                            </td>
                            <td className="px-2 py-2 text-right">
                              {detail.excessMobileBill}
                            </td>
                            <td className="px-2 py-2 text-right">
                              {detail.otherDeduction}
                            </td>
                            <td className="px-2 py-2 text-right">
                              {detail.totalDeduction}
                            </td>
                            <td className="px-2 py-2 text-right">
                              {detail.netEarnings}
                            </td>
                            <td className="px-2 py-2 text-left">—</td>
                          </tr>
                        ))}
                      </>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  Please load salary data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-12 gap-3 items-center">
          {/* Next Salary Payment No */}
          <label className="col-span-1 text-[10px] font-medium text-left">
            Document No
          </label>

          <input
            type="text"
            value={nextSalaryPaymentNo}
            readOnly
            className="col-span-1 h-7 px-2 border border-gray-500 rounded text-[12px] text-center"
          />
          {/* Account */}
          <label className="col-span-1 text-[10px] font-medium">
            Select Account
          </label>

          <div className="col-span-2 relative">
            <select
              className="w-full h-7 text-[11px] px-2 pr-8 border border-gray-400 rounded appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={selectedAccountCode}
              onChange={(e) => handleAccountChange(e.target.value)}
            >
              <option value="">Select Bank / Cash</option>

              {bankAccounts.map((item) => (
                <option key={item.detailItemCode} value={item.detailItemCode}>
                  {item.detailItemName} - {item.detailItemCode} [{item.loadType}
                  ]
                </option>
              ))}
            </select>

            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Balance */}
          <label className="col-span-1 text-[10px] font-medium text-right">
            Account Balance
          </label>

          <input
            type="text"
            value={selectedAccountBalance}
            readOnly
            className="col-span-1 h-7 px-2 border border-gray-400 rounded text-[14px] text-green-800 font-bold text-right"
          />

          {/* Remarks */}
          <label className="col-span-1 text-[10px] font-medium text-right">
            Write Notes
          </label>

          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter remarks..."
            className="col-span-4 h-7 px-2 border border-gray-400 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 mb-3"></div>

      {/* Actions */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={submitPaymentSalary}
          className="bg-purple-500 text-white px-4 py-1 rounded"
        >
          Payment
        </button>
        <button
          onClick={exportToExcel}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          Excel
        </button>
        <button
          onClick={exportToCSV}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          CSV
        </button>
      </div>
    </div>
  );
};

export default PaymentSalary;
