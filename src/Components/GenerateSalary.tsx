import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import api from "@/utils/axios";


// --- Custom type guard for Axios errors ---
function isAxiosError<T = unknown>(err: unknown): err is { response?: { data: T }; message: string; isAxiosError?: boolean } {
  return (err as { isAxiosError?: boolean }).isAxiosError === true;
}

interface Company {
  companyCode: string;
  companyName: string;
}

interface ActivityCenter {
  activityCenterCode: string;
  activityCenterName: string;
}

interface ResponsibilityCenter {
  respCenterCode: string;
  respCenterName: string;
}

interface FiscalYear {
  finYearID: string;
  finYear: string;
}

interface MonthName {
  id: number;
  name: string;
}

interface Salary {
  month: number | null;
  workingDay: number;
  companyCode: string | null;
  departmentCode: string | null;
  sectionCode: string | null;
  createdBy: string;
  approvedBy: string;
  hRComments: string;
  status: number;
  fiscalYear: string;
  year: string;
}

interface SalaryDetail {
  sl: number;
  employeeID: number;
  payscaleID: number;
  absenceDay: number;
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
  companyCode: string;
  departmentCode: string;
  sectionCode: string;
  status: number;
  isUnPaid: boolean;
  createdBy: string;
  settingTaxAmount: number;
  employeeCode: string;
  employeeName: string;
  totalDeduction: number;
  netEarnings: number;
}

interface Employee {
  employeeID: number;
  employeeCode: string;
  employeeName: string;
  payscaleID: number;
  payscaleName: string;
  status: number;
}


export default function GenerateSalar() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaryDetails, setSalaryDetails] = useState<SalaryDetail[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<ActivityCenter[]>([]);
  const [sections, setSections] = useState<ResponsibilityCenter[]>([]);
  const [fiscalyears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [monthNames, setMonthNames] = useState<MonthName[]>([]);;
  const [unpaidLeave, setUnpaidLeave] = useState(false);
  const [advanceSalary, setAdvanceSalary] = useState(false);
  const [loanAdjust, setLoanAdjust] = useState(false);
  // const [salaryNumber, setSalaryNumber] = useState<string>("");

  const [salary, setSalary] = useState<Salary>({
    month: 8,
    workingDay: 2,
    companyCode: "01",
    departmentCode: "",
    sectionCode: "",
    createdBy: "admin",
    approvedBy: "admin",
    hRComments: "comments",
    // salaryNumber: salaryNumber,
    status: 1,
    fiscalYear: "2025",
    year: "2025",
  });

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(
        employees
          .map((item) => item.employeeID || '')
          .filter((id) => id !== '')
      );
    }
    setSelectAll(!selectAll);
  };

  const handleCheckboxChange = (employeeID: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeID)
        ? prev.filter((id) => id !== employeeID)
        : [...prev, employeeID]
    );
  };

  const loadEmployees = async () => {
    const res = await api.get<Employee[]>("/api/payscales/getAllEmployeeForPayScaleMapping");
    setEmployees(res.data);
  };

  const recalcSalary = (row: SalaryDetail): SalaryDetail => {
    const gross =
      row.basicSalary +
      row.houseRentAllowance +
      row.medicalAllowance +
      row.conveyance +
      row.overtime +
      row.otherAllowance;

    const totalDeduction =
      row.taxAmount +
      row.loanAdjust +
      row.adjustAdvanceSalary +
      row.adjustUnpaidLeave +
      row.houseRentDeduction +
      row.excessMobileBill +
      row.otherDeduction;

    const net = gross - totalDeduction;

    return {
      ...row,
      grossEarnings: parseFloat(gross.toFixed(2)),
      totalDeduction: parseFloat(totalDeduction.toFixed(2)),
      netEarnings: parseFloat(net.toFixed(2)),
    };
  };

  const generateIndividualEmployeeSalary = async () => {
    try {
      const rows = employees
        .filter((e) => selectedEmployees.includes(e.employeeID))
        .map((e) => ({
          employeeID: e.employeeID,
          employeeCode: e.employeeCode,
          employeeName: e.employeeName,
          payscaleID: e.payscaleID,
          payscaleName: e.payscaleName,

          adjustUnpaidLeave: unpaidLeave,
          adjustAdvanceSalary: advanceSalary,
          loanAdjust: loanAdjust,
        }));

      const res = await api.post<{ salaryDetails: SalaryDetail[] }>(
        "/api/generatesalary/generateActiveEmployeeSalary",
        rows // 👈 send raw array (no wrapper)
      );

      setSalaryDetails(res.data.salaryDetails);
    } catch (error) {
      console.error("Error processing salary:", error);
    }
  };

  const submitSalaryAndSalaryDetailInformation = async () => {
    try {
      const payload = {
        salary,
        salaryDetails,
        message: "Salary submission",
      };

      const response = await api.post<{ message?: string }>(
        "/api/generatesalary/insertSalaryInformation",
        payload
      );

      alert(response.data.message ?? "Salary saved successfully!");
      setSalaryDetails([]);
      setSelectedEmployees([]);
      setUnpaidLeave(false);
      setAdvanceSalary(false);
      setLoanAdjust(false);
      setSelectAll(false);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        console.error("Axios error:", err.response?.data ?? err.message);
      } else {
        console.error("Unexpected error:", err);
      }
      alert("Failed to submit salary data.");
    }
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.get<Company[]>(
          "/api/generatesalary/loadCompanyDropdown"
        );
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get<ActivityCenter[]>(
          "/api/generatesalary/loadDepartmentDropdown"
        );
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, []);


  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await api.get<ResponsibilityCenter[]>(
          "/api/generatesalary/loadSectionDropdown"
        );
        setSections(response.data);
      } catch (error) {
        console.error("Error fetching sections:", error);
      }
    };

    fetchSections();
  }, []);


  useEffect(() => {
    const fetchFiscalYear = async () => {
      try {
        const response = await api.get<FiscalYear[]>(
          "/api/generatesalary/loadFiscalYearDropdown"
        );
        setFiscalYears(response.data);
      } catch (error) {
        console.error("Error fetching fiscal year:", error);
      }
    };

    fetchFiscalYear();
  }, []);


  useEffect(() => {
    const fetchMonthNames = async () => {
      try {
        const response = await api.get<MonthName[]>(
          "/api/generatesalary/loadMonthNames"
        );
        setMonthNames(response.data ?? []);
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          console.error("Failed to fetch month:", err.response?.data ?? err.message);
        } else {
          console.error("Unexpected error:", err);
        }
      }
    };
    fetchMonthNames();
  }, []);


  return (
    <div className="grid grid-cols-6 gap-4 pt-1">
      <div className="grid grid-cols-6 col-span-6 bg-white p-2 border border-blue-300 rounded-lg gap-2">
        <div className="grid grid-cols-4 col-span-6 pt-1">
          <label className="text-gray-700 p-1 text-lg font-bold">
            Generate Monthly Salary
          </label>
        </div>
        <div className="grid grid-cols-6 col-span-6 pt-1">
          <div className="relative w-2/3">
            <select
              value={salary.companyCode ?? ""}
              onChange={(e) =>
                setSalary((prev) => ({
                  ...prev,
                  companyCode: e.target.value || "",
                }))
              }
              className="w-full px-2 py-1 h-8 rounded border border-blue-300 text-gray-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Company</option>
              {companies.map((company) => (
                <option key={company.companyCode} value={company.companyCode}>
                  {company.companyName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute top-1/2 right-2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          <div className="relative w-2/3">
            <select
              value={salary.departmentCode ?? ""}
              onChange={(e) =>
                setSalary((prev) => ({
                  ...prev,
                  departmentCode: e.target.value || "",
                }))
              }
              className="w-full px-2 py-1 h-8 rounded border border-blue-300 text-gray-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Department</option>
              {departments.map((department) => (
                <option key={department.activityCenterCode} value={department.activityCenterCode}>
                  {department.activityCenterName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute top-1/2 right-2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          <div className="relative w-2/3">
            <select
              value={salary.sectionCode ?? ""}
              onChange={(e) =>
                setSalary((prev) => ({
                  ...prev,
                  sectionCode: e.target.value || "",
                }))
              }
              className="w-full px-2 py-1 h-8 rounded border border-blue-300 text-gray-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Section</option>
              {sections.map((section) => (
                <option key={section.respCenterCode} value={section.respCenterCode}>
                  {section.respCenterName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute top-1/2 right-2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          <div className="relative w-2/3">
            <select
              value={salary.fiscalYear ?? ""}
              onChange={(e) =>
                setSalary((prev) => ({
                  ...prev,
                  fiscalYear: e.target.value || "",
                }))
              }
              className="w-full px-2 py-1 h-8 rounded border border-blue-300 text-gray-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Fiscal Year</option>
              {fiscalyears.map((fiscalyear) => (
                <option key={fiscalyear.finYearID} value={fiscalyear.finYear}>
                  {fiscalyear.finYear}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute top-1/2 right-2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          <div className="relative w-2/3">
            <select
              value={salary.month ?? ""}
              onChange={(e) =>
                setSalary((prev) => ({
                  ...prev,
                  month: Number(e.target.value) || 0,
                }))
              }
              className="w-full px-2 py-1 h-8 rounded border border-blue-300 text-gray-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Month</option>
              {monthNames.map((month) => (
                <option key={month.id} value={month.id}>
                  {month.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute top-1/2 right-2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          <div className="relative w-2/3">
            <button
              onClick={loadEmployees}
              className="bg-white text-blue-800 text-lg w-[140px] h-[35px] border-1 hover:bg-blue-500 hover:text-gray-100 transition-colors duration-200 cursor-pointer rounded"
            >
              Load Employee
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 col-span-6 pt-1"></div>

        {/* First table */}
        <div className="grid grid-cols-6 col-span-6 bg-white rounded-lg gap-2 h-[250px] overflow-x-auto overflow-y-auto">
          <table className="table-fixed w-full border-l border-blue-300 border-r border-blue-300 rounded-lg">
            <thead className="bg-blue-300 border-b border-blue-300 py-2 px-2 rounded-lg">
              <tr className="bg-gray-200">
                <th className="w-[50px] h-[10px] sticky top-0 z-10 bg-blue-300 pl-[16px] pt-[8px] text-center text-sm border-b border-blue-300 border-l border-blue-300 text-left">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-500"
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                  />
                </th>
                <th className="w-[450px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left">Select All</th>
                <th className="w-[450px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left">Employee Code</th>
                <th className="w-[450px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left">Employee Name</th>
                <th className="w-[450px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left">Payscale ID</th>
                <th className="w-[450px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left">Payscale Name</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.employeeID} className="border-b">
                  <td className="w-[50px] h-[10px] py-1 px-2 text-sm text-center border-b border-blue-300">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-blue-500"
                      checked={selectedEmployees.includes(employee.employeeID)}
                      onChange={() => handleCheckboxChange(employee.employeeID)}
                    />
                  </td>
                  <td className="w-[50px] h-[10px] py-2 px-2 text-sm text-left border-b border-blue-300"></td>
                  <td className="w-[50px] h-[10px] py-1 px-2 text-sm text-left border-b border-blue-300">{employee.employeeCode}</td>
                  <td className="w-[50px] h-[10px] py-1 px-2 text-sm text-left border-b border-blue-300">{employee.employeeName}</td>
                  <td className="w-[50px] h-[10px] py-1 px-2 text-sm text-left border-b border-blue-300">{employee.payscaleID}</td>
                  <td className="w-[50px] h-[10px] py-1 px-2 text-sm text-left border-b border-blue-300">{employee.payscaleName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="row-span-1 w-[900px] pt-1 pb-[10px] flex items-left gap-4">
          <button
            onClick={generateIndividualEmployeeSalary}
            className="bg-white text-blue-800 text-lg w-[140px] h-[35px] border-1 hover:bg-blue-500 hover:text-gray-100 transition-colors duration-200 cursor-pointer rounded"
          >
            Generate Salary
          </button>
          <div className="col-span-6 pt-1 flex items-right gap-4">
            <label className="flex items-center space-x-1 pb-[10px] text-gray-900 text-lg">
              <input
                type="checkbox"
                className="w-4 h-4 accent-blue-500"
                checked={unpaidLeave}
                onChange={() => setUnpaidLeave(!unpaidLeave)}
              />
              <span>Adjust Unpaid Leave</span>
            </label>

            <label className="flex items-center space-x-1 pb-[10px] text-gray-900 text-lg">
              <input
                type="checkbox"
                className="w-4 h-4 accent-blue-500"
                checked={advanceSalary}
                onChange={() => setAdvanceSalary(!advanceSalary)}
              />
              <span>Adjust Advance Salary</span>
            </label>

            <label className="flex items-center space-x-1 pb-[10px] text-gray-900 text-lg">
              <input
                type="checkbox"
                className="w-4 h-4 accent-blue-500"
                checked={loanAdjust}
                onChange={() => setLoanAdjust(!loanAdjust)}
              />
              <span>Adjust Loan</span>
            </label>

          </div>
        </div>


        {/* Second table */}
        <div className="grid grid-cols-6 col-span-6 bg-white rounded-lg gap-2 h-[250px] overflow-x-auto overflow-y-auto">
          <table className="table-fixed w-full border-l border-blue-300 border-r border-blue-300 rounded-lg">
            <thead className="bg-blue-300 border-b border-blue-300 py-2 px-2 rounded-lg">
              <tr className="bg-gray-200">
                <th className="w-[50px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left pl-[15px]">SL</th>
                <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left">Employee Code</th>
                <th className="w-[250px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left">Employee Name</th>
                <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-right">Basic Salary</th>
                <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-right">House Rent</th>
                <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-right">Medical Allowance</th>
                <th className="w-[100px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-right">Conveyance</th>
                <th className="w-[100px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-right">Overtime</th>
                <th className="w-[130px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-right">Other Allowance</th>
                <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-right">Gross Earning</th>
                <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-right">Adjust Loan</th>
                <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-right">Advance Salary</th>
                <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-right">Tax Amount</th>
                <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-right">Unpaid Leave</th>
                <th className="w-[200px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-right">House Rent Deduction</th>
                <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-right">Excess Mobile Bill</th>
                <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-right">Other Deduction</th>
                <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-right">Total Deduction</th>
                <th className="w-[150px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 pr-[20px] text-right">Net Payment</th>
              </tr>
            </thead>

            <tbody>
              {salaryDetails.length > 0 ? (
                salaryDetails.map((salaryDetail) => (
                  <tr key={salaryDetail.sl} className="border-b">
                    <td className="pl-[15px] border-b border-blue-300">{salaryDetail.sl}</td>
                    <td className="pl-[10px] border-b border-blue-300">{salaryDetail.employeeCode}</td>
                    <td className="pl-[10px] border-b border-blue-300">{salaryDetail.employeeName}</td>
                    <td className="text-right pr-[10px] border-b border-blue-300">{salaryDetail.basicSalary}</td>
                    <td className="text-right pr-[10px] border-b border-blue-300">{salaryDetail.houseRentAllowance}</td>
                    <td className="text-right pr-[10px] border-b border-blue-300">{salaryDetail.medicalAllowance}</td>
                    <td className="text-right pr-[10px] border-b border-blue-300">{salaryDetail.conveyance}</td>
                    <td className="text-right pr-[10px] border-b border-blue-300">{salaryDetail.overtime}</td>
                    <td className="pl-[20px] pr-[20px] border-b border-blue-300">
                      <input
                        className="border border-gray-200 w-[100px] text-right items-right"
                        type="number"
                        step="0.01"
                        value={salaryDetail.otherAllowance}
                        onChange={(e) =>
                          setSalaryDetails((prev) =>
                            prev.map((item) =>
                              item.sl === salaryDetail.sl
                                ? recalcSalary({
                                  ...item,
                                  otherAllowance: parseFloat(e.target.value) || 0,
                                })
                                : item
                            )
                          )
                        }
                      />
                    </td>
                    <td className="text-right text-lg pr-[10px] border-b border-blue-300">{salaryDetail.grossEarnings}</td>
                    <td className="text-right pr-[10px] border-b border-blue-300">{salaryDetail.loanAdjust}</td>
                    <td className="text-right pr-[10px] border-b border-blue-300">{salaryDetail.adjustAdvanceSalary}</td>
                    <td className="text-right pr-[10px] border-b border-blue-300">{salaryDetail.taxAmount}</td>
                    <td className="text-right pr-[10px] border-b border-blue-300">{salaryDetail.adjustUnpaidLeave}</td>
                    <td className="border w-[120px] text-right items-right border-b border-blue-200">
                      <input
                        className="border w-[120px] text-right items-right border-b border-blue-200"
                        type="number"
                        step="0.01"
                        value={salaryDetail.houseRentDeduction}
                        onChange={(e) =>
                          setSalaryDetails((prev) =>
                            prev.map((item) =>
                              item.sl === salaryDetail.sl
                                ? recalcSalary({
                                  ...item,
                                  houseRentDeduction: parseFloat(e.target.value) || 0,
                                })
                                : item
                            )
                          )
                        }
                      />
                    </td>
                    <td className="border w-[120px] text-right items-right border-b border-blue-200">
                      <input
                        className="border w-[120px] text-right items-right border-b border-blue-200"
                        type="number"
                        step="0.01"
                        value={salaryDetail.excessMobileBill}
                        onChange={(e) =>
                          setSalaryDetails((prev) =>
                            prev.map((item) =>
                              item.sl === salaryDetail.sl
                                ? recalcSalary({
                                  ...item,
                                  excessMobileBill: parseFloat(e.target.value) || 0,
                                })
                                : item
                            )
                          )
                        }
                      />
                    </td>
                    <td className="border w-[120px] text-right items-right border-b border-blue-200">
                      <input
                        className="border w-[120px] text-right items-right border-b border-blue-200 focus:border-blue-500"
                        type="number"
                        step="0.01"
                        value={salaryDetail.otherDeduction}
                        onChange={(e) =>
                          setSalaryDetails((prev) =>
                            prev.map((item) =>
                              item.sl === salaryDetail.sl
                                ? recalcSalary({
                                  ...item,
                                  otherDeduction: parseFloat(e.target.value) || 0,
                                })
                                : item
                            )
                          )
                        }
                      />
                    </td>
                    <td className="text-right border-b border-blue-300">{salaryDetail.totalDeduction}</td>
                    <td className="text-right text-lg pr-[20px] border-b border-blue-300">{salaryDetail.netEarnings}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={19} className="text-center py-4 text-gray-500">
                    No salary data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-4 col-span-6 pt-1">
          <button
            onClick={submitSalaryAndSalaryDetailInformation}
            className="bg-white text-blue-800 text-lg w-[140px] h-[35px] border-1 hover:bg-blue-500 hover:text-gray-100 transition-colors duration-200 cursor-pointer rounded"
          >
            Submit Salary
          </button>
        </div>


      </div>
    </div>
  );
};

