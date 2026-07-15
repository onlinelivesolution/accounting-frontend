import { useEffect, useState } from "react";
import api from "@/utils/axios";

// --- Custom type guard for Axios errors ---
function isAxiosError<T = unknown>(err: unknown): err is { response?: { data: T }; message: string; isAxiosError?: boolean } {
  return (err as { isAxiosError?: boolean }).isAxiosError === true;
}

// --- Types ---
interface Employee {
  payscaleID?: number;
  employeeID: number;
  employeeCode?: string;
  employeeName?: string;
  payScaleCode?: string;
  payrollItemID?: number;
  payGrade?: string;
  createdBy?: string;
  companyCode?: string;
  amount?: number;
  basicSalary?: string;
  houseRent?: string;
  medicalAllowance?: string;
  conveyance?: string;
  // ✅ Now matches backend: keys are payroll item names, values are numbers
  salaryBreakdown?: {
    [key: string]: number;
  };
}

interface PayrollItem {
  id: number;
  name: string;
}

interface PayScaleRow {
  employeeID: number;
  payScaleCode: string;
  payscaleName: string;
  payGrade: string;
  companyCode: string;
  payrollItemID: number;
  createdBy: string;
  amount: number;
  isBasic: boolean;
  isPF: boolean;
  basicSalary: number;
  houseRent: number;
  medicalAllowance: number;
  conveyance: number;
}

// --- Component ---
const PayscaleMappings: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeData, setEmployeeData] = useState<Employee[]>([]);
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([]);

  // --- Handle amount change ---
  const handleAmountChange = (index: number, value: string) => {
    const gross = parseFloat(value) || 0;
    const basic = (gross * 60) / 100;
    const houseRent = basic / 2;
    const medical = (basic * 10) / 100;
    const conveyance = gross - (basic + houseRent + medical);

    const updated = [...employeeData];
    updated[index].amount = gross;
    updated[index].salaryBreakdown = {
      Basicsalary: parseFloat(basic.toFixed(2)),
      Houserentallowance: parseFloat(houseRent.toFixed(2)),
      Medicalallowance: parseFloat(medical.toFixed(2)),
      Conveyance: parseFloat(conveyance.toFixed(2)),
    };

    setEmployeeData(updated);
  };

  // --- Handle pay grade change ---
  const handlePayGradeChange = (index: number, value: string) => {
    const updated = [...employeeData];
    updated[index].payGrade = value;
    setEmployeeData(updated);
  };

  // --- Submit pay scales ---
  const handleSubmitPayScales = async () => {
    try {
      const payScaleRows: PayScaleRow[] = employeeData.map((emp) => ({
        employeeID: emp.employeeID,
        payScaleCode: emp.payScaleCode ?? "",
        payscaleName: `${emp.employeeCode}-${emp.employeeName}`,
        payGrade: emp.payGrade ?? "",
        companyCode: emp.companyCode ?? "01",
        payrollItemID: emp.payrollItemID ?? 1,
        createdBy: emp.createdBy ?? "admin",
        amount: emp.amount ?? 0,
        isBasic: true,
        isPF: true,
        basicSalary: emp.salaryBreakdown?.["Basicsalary"] ?? 0,
        houseRent: emp.salaryBreakdown?.["Houserentallowance"] ?? 0,
        medicalAllowance: emp.salaryBreakdown?.["Medicalallowance"] ?? 0,
        conveyance: emp.salaryBreakdown?.["Conveyance"] ?? 0,
      }));

      const response = await api.post<{ message?: string }>(
        "/api/payscales/processInsertOrUpdatePayScale",
        payScaleRows
      ); 

      alert(response.data.message ?? "Pay scale data submitted successfully!");
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        console.error("Axios error:", err.response?.data ?? err.message);
      } else {
        console.error("Unexpected error:", err);
      }
      alert("Failed to submit pay scale data.");
    }
  };

  // --- Fetch employees ---
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get<Employee[]>(
          "/api/payscales/getAllEmployeeForPayScaleMapping"
        );
        setEmployees(response.data ?? []);
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          console.error("Failed to load employees:", err.response?.data ?? err.message);
        } else {
          console.error("Unexpected error:", err);
        }
      }
    };
    fetchEmployees();
  }, []);

  // --- Sync employeeData with employees ---
  useEffect(() => {
    setEmployeeData(employees);
  }, [employees]);

  // --- Fetch payroll items ---
  useEffect(() => {
    const fetchPayrollItems = async () => {
      try {
        const response = await api.get<PayrollItem[]>(
          "/api/payscales/loadDefaultPayrollItems"
        );
        setPayrollItems(response.data ?? []);
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          console.error("Failed to fetch payroll items:", err.response?.data ?? err.message);
        } else {
          console.error("Unexpected error:", err);
        }
      }
    };
    fetchPayrollItems();
  }, []);

  // --- JSX ---
  return (
    <div className="grid grid-cols-6 gap-4 pt-1">
      <div className="grid grid-cols-6 col-span-6 bg-white p-2 border border-blue-300 rounded-lg gap-2">
        <div className="grid grid-cols-6 col-span-6 pt-1">
          <label className="text-gray-700 p-1 text-lg font-bold">Mapping Pay Scale</label>
        </div>

        <div className="grid grid-cols-6 col-span-6 bg-white rounded-lg gap-2 h-[450px] overflow-x-auto overflow-y-auto">
          <table className="table-fixed w-full border-l border-blue-300 border-r border-blue-300 rounded-lg">
            <thead className="bg-blue-300 border-b border-blue-300 rounded-lg">
              <tr>
                <th className="w-[250px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left">Employee Name</th>
                <th className="w-[290px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left">Pay Scale Name</th>
                <th className="w-[100px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-left">Pay Grade</th>
                <th className="w-[110px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-right">Total Amount</th>
                {payrollItems.map((item) => (
                  <th key={item.id} className="w-[110px] sticky top-0 z-10 bg-blue-300 text-sm px-2 py-2 text-right">{item.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employeeData.map((employee, index) => (
                <tr key={employee.employeeID} className="hover:bg-blue-50">
                  <td className="w-[250px] py-0.5 p-2 border-b border-blue-300">{employee.employeeName}</td>
                  <td className="w-[290px] py-0.5 p-2 border-b border-blue-300">{employee.employeeCode}-{employee.employeeName}</td>
                  <td className="w-[110px] py-0.5 p-2 border-b border-blue-300 text-left">
                    <input
                      type="text"
                      value={employee.payGrade ?? ""}
                      onChange={(e) => handlePayGradeChange(index, e.target.value)}
                      className="w-full text-left border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
                    />
                  </td>
                  <td className="w-[110px] py-0.5 p-2 border-b border-blue-300 text-right">
                    <input
                      type="number"
                      value={employee.amount ?? ""}
                      onChange={(e) => handleAmountChange(index, e.target.value)}
                      className="w-full text-right border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
                    />
                  </td>
                  {payrollItems.map((item) => (
                    <td key={item.id} className="w-[110px] py-0.5 p-2 border-b border-blue-300 text-right">
                      {employee.salaryBreakdown?.[item.name] ?? "0.00"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-span-6 w-full">
          <div className="flex justify-end gap-2 pb-[25px] pt-[10px] pr-4">
            <button
              className="bg-sky-600 px-4 rounded text-white h-[30px] w-24"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
            <button
              className="bg-blue-600 px-4 rounded text-white h-[30px] w-24"
              onClick={handleSubmitPayScales}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayscaleMappings;
