import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "../ui/Card";
import axios from "axios";
import { Users, DollarSign, Building2, Receipt } from "lucide-react";

interface DashboardData {
  employeeCount: number;
  totalDeductions: number;
  totalSalary: number;
  totalCompanies: number;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    employeeCount: 0,
    totalDeductions: 0,
    totalSalary: 0,
    totalCompanies: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 👇 Replace these endpoints with your actual FastAPI routes
        const [employees, deductions, salary, companies] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/employees/count"),
          axios.get("http://127.0.0.1:8000/api/deductions/total"),
          axios.get("http://127.0.0.1:8000/api/salary/summary"),
          axios.get("http://127.0.0.1:8000/api/companies/count"),
        ]);

        setData({
          employeeCount: employees.data.count || 0,
          totalDeductions: deductions.data.total || 0,
          totalSalary: salary.data.total || 0,
          totalCompanies: companies.data.count || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-[80vh]">Loading...</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Employee Count */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700">Employees</h2>
            <Users className="text-blue-500 w-6 h-6" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{data.employeeCount}</p>
            <p className="text-sm text-gray-500 mt-1">Total Employees</p>
          </CardContent>
        </Card>

        {/* Deductions */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700">Deductions</h2>
            <Receipt className="text-red-500 w-6 h-6" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{data.totalDeductions}</p>
            <p className="text-sm text-gray-500 mt-1">Total Deductions</p>
          </CardContent>
        </Card>

        {/* Salary Summary */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700">Salary</h2>
            <DollarSign className="text-green-500 w-6 h-6" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {data.totalSalary.toLocaleString()}৳
            </p>
            <p className="text-sm text-gray-500 mt-1">Total Salary Paid</p>
          </CardContent>
        </Card>

        {/* Company Summary */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700">Companies</h2>
            <Building2 className="text-purple-500 w-6 h-6" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{data.totalCompanies}</p>
            <p className="text-sm text-gray-500 mt-1">Total Companies</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
