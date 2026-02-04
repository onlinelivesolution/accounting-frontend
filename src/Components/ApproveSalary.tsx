import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";

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
    adjustUnPaidLeave: number;
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

const ApproveSalary: React.FC = () => {
    const currentYear = new Date().getFullYear().toString();
    const currentMonth = new Date().getMonth() + 1;
    const [fiscalYear, setFiscalYear] = useState<string>(currentYear);
    const [month, setMonth] = useState<number>(currentMonth);
    const [statuses, setStatuses] = useState<StatusOption[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<number>(1);
    const [salaryData, setSalaryData] = useState<Salary[]>([]);
    const [expandedRows, setExpandedRows] = useState<number[]>([]);
    const [selectedDetails, setSelectedDetails] = useState<number[]>([]);

    const FISCAL_YEARS = ["2023", "2024", "2025"];
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

    // 🔹 Load Salary Data
    const handleLoadSalaryDetails = async () => {
        if (!fiscalYear || !month || !selectedStatus) {
            alert("Please select Year, Month, and Status!");
            return;
        }

        try {
            const response = await axios.get<Salary[]>(
                "http://127.0.0.1:8000/api/salarydetails/getSalaryDetailByYearAndMonth",
                { params: { year: fiscalYear, month, status: selectedStatus } }
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
        const allSelected = salary.details.every(d =>
            selectedDetails.includes(d.salaryDetailID)
        );

        if (allSelected) {
            // Deselect all
            setSelectedDetails(prev =>
                prev.filter(id => !salary.details.some(d => d.salaryDetailID === id))
            );
        } else {
            // Select all
            setSelectedDetails(prev => [
                ...prev,
                ...salary.details
                    .map(d => d.salaryDetailID)
                    .filter(id => !prev.includes(id))
            ]);
        }
    };


    const handleChildCheckbox = (detailID: number, salary: Salary) => {
        setSelectedDetails((prev) =>
            prev.includes(detailID)
                ? prev.filter((id) => id !== detailID)
                : [...prev, detailID]
        );
    };


    // 🔹 Expand / Collapse row
    const toggleExpand = (salaryID: number) => {
        setExpandedRows((prev) =>
            prev.includes(salaryID)
                ? prev.filter((id) => id !== salaryID)
                : [...prev, salaryID]
        );
    };

    const handleApproveSalaryInformation = async () => {
        if (selectedDetails.length === 0) {
            alert("Please select at least one employee to approve.");
            return;
        }

        try {
            await axios.post("http://127.0.0.1:8000/api/salarydetails/approveSalaryDetails", selectedDetails, {
                headers: { "Content-Type": "application/json" }
            });

            alert("Selected salaries approved!");
            handleLoadSalaryDetails(); // refresh the table
            setSelectedDetails([]);    // clear selections
        } catch (err) {
            console.error("Approval failed:", err);
            alert("Failed to approve salaries.");
        }
    };


    // 🔹 Export
    const exportToExcel = () => {
        if (salaryData.length === 0) return;
        const ws = XLSX.utils.json_to_sheet(
            salaryData.flatMap((s) => s.details)
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SalaryDetails");
        XLSX.writeFile(wb, `Salary_${fiscalYear}_${month}.xlsx`);
    };

    const exportToCSV = () => {
        if (salaryData.length === 0) return;
        const ws = XLSX.utils.json_to_sheet(
            salaryData.flatMap((s) => s.details)
        );
        const csv = XLSX.utils.sheet_to_csv(ws);
        saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `Salary_${fiscalYear}_${month}.csv`);
    };

    // 🔹 Load Status Options
    useEffect(() => {
        axios
            .get<StatusOption[]>(
                "http://127.0.0.1:8000/api/salarydetails/loadDefaultItemStatus"
            )
            .then((res) => setStatuses(res.data))
            .catch((err) => console.error("Failed to load statuses:", err));
    }, []);

    return (
        <div className="p-6 space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
                <select
                    value={fiscalYear}
                    onChange={(e) => setFiscalYear(e.target.value)}
                    className="border rounded px-2 py-1"
                >
                    {FISCAL_YEARS.map((fy) => (
                        <option key={fy}>{fy}</option>
                    ))}
                </select>
                <select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="border rounded px-2 py-1"
                >
                    {MONTHS.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.name}
                        </option>
                    ))}
                </select>
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(Number(e.target.value))}
                    className="border rounded px-2 py-1"
                >
                    {statuses.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
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
                            <th className="w-[65px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left pl-[15px]">Select</th>
                            <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left">SalaryID</th>
                            <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left">Year</th>
                            <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left">Month</th>
                            <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left">Status</th>
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
                                    selectedDetails.includes(d.salaryDetailID)
                                );
                                const someChildrenSelected =
                                    !allChildrenSelected &&
                                    salary.details.some((d) => selectedDetails.includes(d.salaryDetailID));

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
                                            <td className="pl-[15px] border-b border-blue-300">{salary.salaryID}</td>
                                            <td className="pl-[15px] border-b border-blue-300">{salary.year}</td>
                                            <td className="pl-[15px] border-b border-blue-300">{salary.monthName}</td>
                                            <td className="pl-[15px] border-b border-blue-300">{salary.statusName}</td>
                                        </tr>

                                        {/* Child Rows with Header */}
                                        {expandedRows.includes(salary.salaryID) && (
                                            <>
                                                {/* Child Header */}
                                                <tr className="bg-blue-100">
                                                    <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-left">Select</th>
                                                    <th className="w-[250px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-left">Employee Name</th>
                                                    <th className="w-[20px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-left">Employee ID</th>
                                                    <th className="w-[100px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">Basic Salary</th>
                                                    <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">House Rent</th>
                                                    <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">Medical Allowance</th>
                                                    <th className="w-[100px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">Conveyance</th>
                                                    <th className="w-[100px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">Overtime</th>
                                                    <th className="w-[130px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">Other Allowance</th>
                                                    <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">Gross Earning</th>
                                                    <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">Adjust Loan</th>
                                                    <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">Advance Salary</th>
                                                    <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">Tax Amount</th>
                                                    <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">Unpaid Leave</th>
                                                    <th className="w-[200px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">House Rent Deduction</th>
                                                    <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">Excess Mobile Bill</th>
                                                    <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">Other Deduction</th>
                                                    <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 text-right">Total Deduction</th>
                                                    <th className="w-[150px] sticky top-0 z-10 bg-green-500 text-white text-sm px-2 py-2 pr-[20px] text-right">Net Payment</th>
                                                </tr>

                                                {/* Child Data */}
                                                {salary.details.map((detail) => (
                                                    <tr key={detail.salaryDetailID} className="border-b border-blue-300 hover:bg-gray-50">
                                                        <td className="pl-[15px] text-center py-2">
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    className="w-4 h-4 accent-blue-500"
                                                                    checked={selectedDetails.includes(detail.salaryDetailID)}
                                                                    onChange={() => handleChildCheckbox(detail.salaryDetailID, salary)}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="px-2 py-2 text-left">{detail.employeeName}</td>
                                                        <td className="px-2 py-2 text-left">{detail.employeeID}</td>
                                                        <td className="px-2 py-2 text-right">{detail.basicSalary}</td>
                                                        <td className="px-2 py-2 text-right">{detail.houseRentAllowance}</td>
                                                        <td className="px-2 py-2 text-right">{detail.medicalAllowance}</td>
                                                        <td className="px-2 py-2 text-right">{detail.conveyance}</td>
                                                        <td className="px-2 py-2 text-right">{detail.overtime}</td>
                                                        <td className="px-2 py-2 text-right">{detail.otherAllowance}</td>
                                                        <td className="px-2 py-2 text-right">{detail.grossEarnings}</td>
                                                        <td className="px-2 py-2 text-right">{detail.loanAdjust}</td>
                                                        <td className="px-2 py-2 text-right">{detail.adjustAdvanceSalary}</td>
                                                        <td className="px-2 py-2 text-right">{detail.taxAmount}</td>
                                                        <td className="px-2 py-2 text-right">{detail.adjustUnPaidLeave}</td>
                                                        <td className="px-2 py-2 text-right">{detail.houseRentDeduction}</td>
                                                        <td className="px-2 py-2 text-right">{detail.excessMobileBill}</td>
                                                        <td className="px-2 py-2 text-right">{detail.otherDeduction}</td>
                                                        <td className="px-2 py-2 text-right">{detail.totalDeduction}</td>
                                                        <td className="px-2 py-2 text-right">{detail.netEarnings}</td>
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


            {/* Actions */}
            <div className="flex gap-4 mt-4">
                <button
                    onClick={handleApproveSalaryInformation}
                    className="bg-green-500 text-white px-4 py-1 rounded"
                >
                    Approve
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
                <button className="bg-purple-500 text-white px-4 py-1 rounded">
                    Payment
                </button>
            </div>
        </div>
    );
};

export default ApproveSalary;
