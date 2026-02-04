import React, { useEffect, useState, useCallback } from "react";
import axios, { AxiosError } from "axios";

interface ApiError {
  detail?: string;
  message?: string;
  error?: string;
  _?: string;
}

function isAxiosError<T = unknown>(err: unknown): err is AxiosError<T> {
  return (err as AxiosError<T>)?.isAxiosError === true;
}

interface RoleDropdown {
  roleID: number;
  roleName: string;
}

interface PermissionAction {
  permissionActionID: number;
  actionName: string;
  actionKey: string;
  isActive: boolean;
}

interface Permission {
  permissionID: number;
  permissionName: string;
  children: PermissionAction[];
}

export default function AddRole() {
  const [permissionTree, setPermissionTree] = useState<Permission[]>([]);
  const [checkedPermissions, setCheckedPermissions] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [roles, setRoles] = useState<RoleDropdown[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAxiosError = (err: unknown): string => {
    if (isAxiosError<ApiError>(err)) {
      const data = err.response?.data;
      return (
        data?.detail ||
        data?.message ||
        data?.error ||
        data?._ ||
        err.message ||
        "An unknown error occurred."
      );
    }
    return "An unexpected non-Axios error occurred.";
  };

  const fetchRoles = useCallback(async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/roles/loadRoleDropdown");
      setRoles(res.data);
    } catch (err) {
      setError(handleAxiosError(err));
    }
  }, []);

  const fetchAssignedPermissions = async (roleId: number) => {
    const res = await axios.get(`http://127.0.0.1:8000/api/rolepermissions/getAssignedPermissionIDs/${roleId}`);
    const assignedIDs: number[] = res.data;

    const newChecked = new Set<number>(assignedIDs);
    setCheckedPermissions(newChecked);
  };

  useEffect(() => {
    if (selectedRole) {
      fetchAssignedPermissions(selectedRole);
    } else {
      setCheckedPermissions(new Set<number>()); // clear if no role selected
    }
  }, [selectedRole]);


  const fetchPermissionTree = useCallback(async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/permissions/getPermissionTree");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
      setPermissionTree(data);
    } catch (err) {
      setError(handleAxiosError(err));
      setPermissionTree([]); // prevent undefined map crash
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchPermissionTree();
  }, [fetchRoles, fetchPermissionTree]);

  const handleSelectAll = () => {
    if (selectAll) {
      setCheckedPermissions(new Set());
      setSelectAll(false);
    } else {
      const allIds = permissionTree.flatMap(group =>
        group.children.map(child => child.permissionActionID)
      );
      setCheckedPermissions(new Set(allIds));
      setSelectAll(true);
    }
  };

  const handleGroupCheck = (group: Permission) => {
    const groupIds = group.children.map(c => c.permissionActionID);
    const allChecked = groupIds.every(id => checkedPermissions.has(id));

    const newChecked = new Set(checkedPermissions);
    if (allChecked) {
      groupIds.forEach(id => newChecked.delete(id));
    } else {
      groupIds.forEach(id => newChecked.add(id));
    }
    setCheckedPermissions(newChecked);
  };

  const handleChildCheck = (id: number) => {
    const newChecked = new Set(checkedPermissions);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedPermissions(newChecked);
  };

  const handleAssignPermissions = async () => {
    if (!selectedRole) {
      alert("Please select a role!");
      return;
    }

    const selectedIDs = Array.from(checkedPermissions);
    if (selectedIDs.length === 0) {
      alert("Please select at least one permission!");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://127.0.0.1:8000/api/rolepermissions/assignPermission", {
        roleID: selectedRole,
        permissionIDs: selectedIDs,
      });

      alert("Permissions assigned successfully!");
    } catch (err) {
      alert(handleAxiosError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Assign User Permission</h2>

      <div className="flex items-center gap-2 mb-4">
        <label className="font-medium">Role:</label>
        <select
          value={selectedRole ?? ""}
          onChange={(e) => {
            const value = e.target.value;

            if (!value) {
              // 🔹 If user chooses "Select Role" (empty value)
              setSelectedRole(null);
              setCheckedPermissions(new Set()); // ✅ Uncheck everything
              setSelectAll(false); // ✅ Uncheck select-all checkbox
              return;
            }

            const selectedId = Number(value);
            setSelectedRole(selectedId);

            // ✅ Fetch assigned permissions for this role
            fetchAssignedPermissions(selectedId);
          }}
          className="border rounded-md px-3 py-2 w-60"
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role.roleID} value={role.roleID}>
              {role.roleName}
            </option>
          ))}
        </select>

        {/* <select
          value={selectedRole ?? ""}
          onChange={(e) => {
            const selectedId = Number(e.target.value);
            setSelectedRole(selectedId);
            if (selectedId) {
              fetchAssignedPermissions(selectedId);
            }
          }}
          // onChange={(e) => setSelectedRole(Number(e.target.value))}
          className="border rounded-md px-3 py-2 w-60"
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role.roleID} value={role.roleID}>
              {role.roleName}
            </option>
          ))}
        </select> */}

        <button
          onClick={handleAssignPermissions}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Assign"}
        </button>
      </div>

      {error && <div className="text-red-600 mb-3">{error}</div>}

      <div className="border-t pt-3">
        <label className="flex items-center gap-2 mb-3">
          <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="w-4 h-4 accent-blue-500" />
          <span className="font-semibold">Select All</span>
        </label>

        {permissionTree.map((group) => {
          const groupIds = group.children.map((c) => c.permissionActionID);
          const allChecked = groupIds.every((id) => checkedPermissions.has(id));

          return (
            <div key={group.permissionID} className="mb-3 pl-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-blue-500"
                  checked={allChecked}
                  onChange={() => handleGroupCheck(group)}
                />
                <span className="font-semibold text-gray-700">{group.permissionName}</span>
              </label>

              <div className="pl-6 mt-1 space-y-1">
                {group.children.map((child) => (
                  <label key={child.permissionActionID} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-blue-500"
                      checked={checkedPermissions.has(child.permissionActionID)}
                      onChange={() => handleChildCheck(child.permissionActionID)}
                    />
                    <span>{child.actionName} ({child.actionKey})</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
