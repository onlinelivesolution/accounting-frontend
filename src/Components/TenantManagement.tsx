import { useEffect, useState } from "react";
import {
  getAllTenants,
  updateTenantStatus,
  getTenantById,
} from "../services/managetenantService";

export default function TenantManagement() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [tenantDetails, setTenantDetails] = useState<any>(null);

  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [status, setStatus] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const loadTenants = async () => {
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

  useEffect(() => {
    loadTenants();
  }, []);

  const handleViewDetails = async (tenantID: number) => {
    try {
      const res = await getTenantById(tenantID);

      setTenantDetails(res.data);

      setShowDetailsModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  // Open modal
  const handleEditClick = (tenant: any) => {
    setSelectedTenant(tenant);
    setStatus(tenant.status);
    setShowModal(true);
  };

  // Save status
  const handleSave = async () => {
    try {
      await updateTenantStatus(selectedTenant.tenantID, status);

      alert("Status updated successfully");

      setShowModal(false);
      setSelectedTenant(null);

      loadTenants();
    } catch (error: any) {
      console.log(error);
      alert("Failed to update status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return (
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            Approved
          </span>
        );

      case "pending":
        return (
          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
            Pending
          </span>
        );

      case "rejected":
        return (
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
            Rejected
          </span>
        );

      case "suspended":
        return (
          <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-sm font-medium">
            Suspended
          </span>
        );

      default:
        return (
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
            {status}
          </span>
        );
    }
  };

  const filteredTenants = tenants.filter((t) => {
    const searchMatch =
      t.companyName?.toLowerCase().includes(searchText.toLowerCase()) ||
      t.tenantName?.toLowerCase().includes(searchText.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchText.toLowerCase());

    const statusMatch = statusFilter === "All" || t.status === statusFilter;

    return searchMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedTenants = filteredTenants.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tenant Management</h1>

      {loading && <p>Loading...</p>}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search company, tenant or email..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);

            setCurrentPage(1);
          }}
          className="border p-2 rounded w-72"
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);

            setCurrentPage(1);
          }}
          className="border p-2 rounded"
        >
          <option value="All">All Status</option>

          <option value="Pending">Pending</option>

          <option value="Approved">Approved</option>

          <option value="Rejected">Rejected</option>

          <option value="Suspended">Suspended</option>
        </select>
      </div>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Company</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {paginatedTenants.map((t) => (
            <tr key={t.tenantID}>
              <td className="border p-2">{t.tenantID}</td>

              <td className="border p-2">{t.companyName}</td>

              <td className="border p-2">{t.email}</td>

              <td className="border p-2">{getStatusBadge(t.status)}</td>

              {/* ACTION DROPDOWN */}
              <td className="border p-2 relative">
                <div className="group inline-block">
                  <button className="bg-gray-500 text-white px-3 py-1 rounded">
                    Actions ▼
                  </button>

                  <div className="hidden group-hover:block absolute bg-white border shadow-lg mt-1 z-10">
                    <button
                      onClick={() => handleEditClick(t)}
                      className="block px-4 py-2 hover:bg-gray-200 w-full text-left"
                    >
                      Edit Status
                    </button>

                    <button
                      onClick={() => handleViewDetails(t.tenantID)}
                      className="block px-4 py-2 hover:bg-gray-200 w-full text-left"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
        <div>
          Showing {filteredTenants.length === 0 ? 0 : startIndex + 1}-
          {Math.min(startIndex + itemsPerPage, filteredTenants.length)}
          of {filteredTenants.length}
          tenants
        </div>

        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="px-3 py-1">
            {currentPage}/{totalPages || 1}
          </span>

          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      {/* MODAL */}
      {showModal && selectedTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">Update Tenant Status</h2>

            <p className="mb-2">Company: {selectedTenant.companyName}</p>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border p-2 w-full mb-4"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approve</option>
              <option value="Rejected">Reject</option>
              <option value="Suspended">Suspend</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {showDetailsModal && tenantDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded p-6 w-[500px]">
            <h2 className="text-xl font-bold mb-4">Tenant Details</h2>

            <div className="space-y-2">
              <p>
                <strong>Company:</strong> {tenantDetails.companyName}
              </p>

              <p>
                <strong>Tenant Name:</strong> {tenantDetails.tenantName}
              </p>

              <p>
                <strong>Admin Name:</strong> {tenantDetails.adminName}
              </p>

              <p>
                <strong>Email:</strong> {tenantDetails.email}
              </p>

              <p>
                <strong>Status:</strong> {tenantDetails.status}
              </p>

              <p>
                <strong>Database:</strong> {tenantDetails.databaseName}
              </p>

              <p>
                <strong>Created:</strong> {tenantDetails.createdDate}
              </p>
            </div>

            <div className="mt-4 text-right">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
