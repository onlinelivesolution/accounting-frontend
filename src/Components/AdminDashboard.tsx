import { useEffect, useState } from "react";
import { getAllTenants } from "../services/managetenantService";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function AdminDashboard() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const res = await getAllTenants();

      setTenants(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const totalTenants = tenants.length;

  const approvedCount = tenants.filter((x) => x.status === "Approved").length;

  const pendingCount = tenants.filter((x) => x.status === "Pending").length;

  const rejectedCount = tenants.filter((x) => x.status === "Rejected").length;

  const suspendedCount = tenants.filter((x) => x.status === "Suspended").length;

  const statusData = [
    {
      name: "Approved",
      value: approvedCount,
    },

    {
      name: "Pending",
      value: pendingCount,
    },

    {
      name: "Rejected",
      value: rejectedCount,
    },

    {
      name: "Suspended",
      value: suspendedCount,
    },
  ];

  const COLORS = ["#22c55e", "#eab308", "#ef4444", "#6b7280"];

  // Monthly registrations

  const monthlyData = Object.values(
    tenants.reduce((acc: any, tenant: any) => {
      const date = new Date(tenant.createdDate);

      const month = date.toLocaleString("default", {
        month: "short",
      });

      if (!acc[month]) {
        acc[month] = {
          month,
          count: 0,
        };
      }

      acc[month].count++;

      return acc;
    }, {}),
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {loading && <div>Loading dashboard...</div>}

      {/* Dashboard Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-blue-500 text-white rounded p-6 shadow">
          <h2 className="text-lg">Total Tenants</h2>

          <p className="text-3xl font-bold mt-2">{totalTenants}</p>
        </div>

        <div className="bg-green-500 text-white rounded p-6 shadow">
          <h2 className="text-lg">Approved</h2>

          <p className="text-3xl font-bold mt-2">{approvedCount}</p>
        </div>

        <div className="bg-yellow-500 text-white rounded p-6 shadow">
          <h2 className="text-lg">Pending</h2>

          <p className="text-3xl font-bold mt-2">{pendingCount}</p>
        </div>

        <div className="bg-red-500 text-white rounded p-6 shadow">
          <h2 className="text-lg">Rejected</h2>

          <p className="text-3xl font-bold mt-2">{rejectedCount}</p>
        </div>

        <div className="bg-gray-500 text-white rounded p-6 shadow">
          <h2 className="text-lg">Suspended</h2>

          <p className="text-3xl font-bold mt-2">{suspendedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}

        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4">Tenant Status Distribution</h2>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {statusData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Registration */}

        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4">Monthly Registrations</h2>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Recent Tenant Table */}

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Tenants</h2>

        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Company</th>

              <th className="border p-2">Tenant Name</th>

              <th className="border p-2">Email</th>

              <th className="border p-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {tenants
              .slice(-5)
              .reverse()
              .map((t) => (
                <tr key={t.tenantID}>
                  <td className="border p-2">{t.companyName}</td>

                  <td className="border p-2">{t.tenantName}</td>

                  <td className="border p-2">{t.email}</td>

                  <td className="border p-2">
                    <span
                      className={`
px-3 py-1 rounded-full text-sm

${t.status === "Approved" ? "bg-green-100 text-green-700" : ""}

${t.status === "Pending" ? "bg-yellow-100 text-yellow-700" : ""}

${t.status === "Rejected" ? "bg-red-100 text-red-700" : ""}

${t.status === "Suspended" ? "bg-gray-200 text-gray-700" : ""}
`}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
