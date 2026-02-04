import React, { useEffect, useState } from 'react';
import { ChevronDown } from "lucide-react";
import axios from 'axios';
import { EllipsisVertical } from "lucide-react";

interface UserInfo {
    userID?: number;
    userName?: string;
    email?: string;
    fullName?: string;
    passwordHash?: string;
    isActive?: boolean;
    isSuperAdmin?: boolean;
    companyCode?: string;
    roleID?: number;
    companyName?: string;
    roleName?: string;
}

const UserInfo: React.FC = () => {
    const [userInfos, setUserInfos] = useState<UserInfo[]>([]);
    const [isOpenAddUser, setIsOpenAddUser] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
    const [isOpenEditUser, setIsOpenEditUser] = useState(false);

    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [passwordHash, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [userRoleID, setUserRoleID] = useState<number | null>(null);
    const [isActive, setIsActive] = useState(true);
    const [userRoles, setUserRoles] = useState<{ roleID: number; roleName: string }[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [passwordError, setPasswordError] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const limit = 10;

    // Load user table
    const loadUserTable = async (pageNumber = 0) => {
        try {
            const skip = pageNumber * limit;
            const res = await fetch(`http://127.0.0.1:8000/api/users/getUserTable?skip=${skip}&limit=${limit}`);
            const result = await res.json();
            setUserInfos(result.data || result);
            setTotal(result.total || result.length);
        } catch (error) {
            console.error("Error loading users:", error);
        }
    };

    useEffect(() => {
        loadUserTable(page);

        const fetchRoles = async () => {
            try {
                const res = await fetch("http://127.0.0.1:8000/api/roles/loadRoleDropdown");
                const data = await res.json();
                setUserRoles(data);
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        };
        fetchRoles();
    }, [page]);

    // Handle check single single check box
    const handleCheckboxChange = (id: number) => {
        if (selectedUsers.includes(id)) {
            setSelectedUsers(selectedUsers.filter((userId) => userId !== id));
        } else {
            setSelectedUsers([...selectedUsers, id]);
        }
    };

    // Handle Check all check boxes
    const handleSelectAllChange = () => {
        if (selectAll) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(
                userInfos
                    .map((item) => item.userID ?? 0)
                    .filter((id) => id !== 0)
            );
        }
        setSelectAll(!selectAll);
    };
    // Add new user
    const handleAddUserSubmit = async () => {
        setPasswordError("");
        if (!userName.trim()) return alert("User Name is required.");
        if (!email.trim()) return alert("Email is required.");

        // ✅ Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return alert("Please enter a valid email address.");
        }

        if (!passwordHash) return alert("Password is required.");
        if (!confirmPassword) return alert("Confirm password is required.");
        if (passwordHash !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }
        if (!userRoleID) return alert("User role is required.");

        try {
            const userInfoData = {
                userName,
                fullName,
                email,
                isActive: isActive ? 1 : 0,
                createdBy: "admin",
                createdDate: new Date().toISOString(),
                roleID: userRoleID,
                companyCode: "01",
                passwordHash,
            };

            const response = await fetch("http://127.0.0.1:8000/api/users/createUser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userInfoData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Error: ${JSON.stringify(errorData)}`);
            } else {
                alert("✅ User information added successfully!");
                setIsOpenAddUser(false);
                loadUserTable();
                resetAddUserForm();
            }
        } catch (error) {
            console.error(error);
            alert("❌ Error adding user.");
        }
    };

    const resetAddUserForm = () => {
        setUserName("");
        setFullName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setUserRoleID(null);
        setIsActive(true);
        setPasswordError("");
    };

    // Update existing user
    const handleUpdateUserSubmit = async (user: UserInfo) => {
        try {
            const updatedData = {
                ...user,
                updatedBy: "admin",
                updatedDate: new Date().toISOString(),
            };

            const response = await axios.put(
                `http://127.0.0.1:8000/api/users/updateUser/${user.userID}`,
                updatedData
            );

            if (response.status === 200) {
                alert("✅ User updated successfully!");
                loadUserTable();
                setIsOpenEditUser(false);
            } else {
                alert("❌ Failed to update user.");
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                alert(error.response?.data?.detail || "Error updating user");
            } else {
                alert("Unexpected error occurred");
            }
        }
    };

    return (
        <div className="grid grid-cols-6 gap-4 pt-1">
            {/* User Table */}
            <div className="grid grid-cols-6 col-span-6 bg-white p-4 border border-blue-300 rounded-lg gap-2">
                <div className="col-span-6 flex items-center justify-between mb-2">
                    <label className="text-gray-700 p-1 text-lg font-bold">
                        Manage User
                    </label>

                    <button
                        className="w-[100px] h-[34px] bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => {
                            resetAddUserForm();
                            setIsOpenAddUser(true);
                        }}
                    >
                        Add New
                    </button>
                </div>

                <div className="col-span-6 w-full h-[450px] overflow-x-auto overflow-y-auto border border-blue-300 rounded-lg">
                    <table className="min-w-full table-auto">
                        <thead className="bg-blue-300 sticky top-0 z-10">
                            <tr>
                                <th className="p-2 border-b border-blue-300 text-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 accent-blue-500"
                                        checked={selectAll}
                                        onChange={handleSelectAllChange}
                                    />
                                </th>
                                <th className="p-2 border-b border-blue-300 text-left">User Name</th>
                                <th className="p-2 border-b border-blue-300 text-left">Full Name</th>
                                <th className="p-2 border-b border-blue-300 text-left">Role Name</th>
                                <th className="p-2 border-b border-blue-300 text-left">Company Name</th>
                                <th className="p-2 border-b border-blue-300 text-left w-[80px]">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {userInfos?.map((userinfo) => (
                                <tr key={userinfo.userID} className="hover:bg-blue-50">
                                    <td className="p-2 border-b border-blue-300 text-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 accent-blue-500"
                                            checked={selectedUsers.includes(userinfo.userID ?? 0)}
                                            onChange={() => handleCheckboxChange(userinfo.userID ?? 0)}
                                        />
                                    </td>

                                    <td className="p-2 border-b border-blue-300">{userinfo.userName}</td>
                                    <td className="p-2 border-b border-blue-300">{userinfo.fullName}</td>
                                    <td className="p-2 border-b border-blue-300">{userinfo.roleName}</td>
                                    <td className="p-2 border-b border-blue-300">{userinfo.companyName}</td>

                                    <td className="border-b border-blue-300 flex items-center justify-center h-[50px]">
                                        <button
                                            onClick={() => {
                                                const matchedRole = userRoles.find(
                                                    (r) => r.roleName === userinfo.roleName
                                                );

                                                setSelectedUser({
                                                    ...userinfo,
                                                    roleID: matchedRole ? matchedRole.roleID : undefined,
                                                });

                                                setIsOpenEditUser(true);
                                            }}
                                            className="cursor-pointer text-blue-700 hover:text-black"
                                        >
                                            <EllipsisVertical size={24} strokeWidth={2} />
                                        </button>
                                    </td>


                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>


                {/* Pagination */}
                <div className="col-span-6 flex gap-2 mt-2 items-center">
                    <button
                        disabled={page === 0}
                        onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                        className="w-[70px] h-[28px] bg-blue-200 hover:bg-blue-300 text-sm rounded-sm"
                    >
                        Previous
                    </button>
                    <button
                        disabled={(page + 1) * limit >= total}
                        onClick={() => setPage(prev => prev + 1)}
                        className="w-[70px] h-[28px] bg-blue-200 hover:bg-blue-300 text-sm rounded-sm"
                    >
                        Next
                    </button>
                    <div className="text-sm text-gray-600">
                        Page {page + 1} of {Math.ceil(total / limit)} | Total: {total} records
                    </div>
                </div>
            </div>

            {/* Add User Drawer */}
            {isOpenAddUser && <div className="fixed inset-0 bg-gray-500 bg-opacity-50 backdrop-blur-sm z-40"></div>}
            <div className={`fixed right-0 top-0 w-full sm:w-3/4 md:w-1/3 lg:w-1/3 h-screen bg-white border border-blue-500 pl-5 p-3 overflow-y-auto transform transition-transform duration-300 z-50 ${isOpenAddUser ? "translate-x-0" : "translate-x-full"}`}>
                <h2 className="text-2xl font-bold border-b border-blue-300 pb-2">Add New User</h2>

                <div className="flex flex-col gap-3 mt-4">
                    <div className="flex items-center gap-3 mb-3 mt-[25px]">
                        <label className="text-sm text-gray-700 w-32">User Name</label>
                        <input
                            type="text"
                            placeholder="Enter user name"
                            value={userName ?? ""}
                            onChange={(e) => setUserName(e.target.value)}
                            className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                        <label className="text-sm text-gray-700 w-32">Full Name</label>
                        <input
                            type="text"
                            placeholder="Enter full name"
                            value={fullName ?? ""}
                            onChange={(e) => setFullName(e.target.value)}
                            className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        <label className="text-sm text-gray-700 w-32">Email Address</label>
                        <input
                            type="text"
                            placeholder="Enter email"
                            value={email ?? ""}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        <label className="text-sm text-gray-700 w-32">User Role</label>

                        <div className="relative flex-1">
                            <select
                                value={userRoleID ?? ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setUserRoleID(value ? Number(value) : null);
                                }}
                                className="w-full px-2 py-1 h-8 rounded border border-blue-300 text-gray-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200"
                            >
                                <option value="">Select User Role</option>
                                {userRoles.map((userrole) => (
                                    <option key={userrole.roleID} value={userrole.roleID}>
                                        {userrole.roleName}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute inset-y-1.5 right-2 w-5.5 h-5.5 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        <label className="text-sm text-gray-700 w-32">Password</label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={passwordHash ?? ""}
                            onChange={(e) => setPassword(e.target.value)}
                            className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        <label className="text-sm text-gray-700 w-32">Confirm Password</label>
                        <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={`border flex-1 h-[32px] ${passwordError ? "border-red-500" : "border-blue-300"} rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-200`} />

                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        {passwordError && <span className="text-red-500 text-sm">{passwordError}</span>}
                    </div>

                    <div className="flex items-center gap-3 mb-3 ml-[150px]">
                        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 text-blue-500" />
                        <label className="text-sm text-gray-700">Is Active User</label>
                    </div>

                    <div className="flex gap-4 mt-4">
                        <button onClick={() => setIsOpenAddUser(false)} className="flex-1 bg-pink-600 text-white rounded py-1">Cancel</button>
                        <button onClick={handleAddUserSubmit} className="flex-1 bg-green-500 text-white rounded py-1">Submit</button>
                    </div>
                </div>
            </div>

            {/* Edit User Drawer */}
            {isOpenEditUser && <div className="fixed inset-0 bg-gray-500 bg-opacity-50 backdrop-blur-sm z-40"></div>}
            <div className={`fixed right-0 top-0 w-full sm:w-3/4 md:w-1/3 lg:w-1/3 h-screen bg-white border border-blue-500 pl-5 p-3 overflow-y-auto transform transition-transform duration-300 z-50 ${isOpenEditUser ? "translate-x-0" : "translate-x-full"}`}>
                {selectedUser && (
                    <>
                        <h2 className="text-lg font-bold border-b border-blue-300 pb-2">Edit User</h2>
                        <div className="flex flex-col gap-3 mt-4">
                            <div className="flex items-center gap-3 mb-3 mt-[25px]">
                                <label className="text-sm text-gray-700 w-32">User Name</label>
                                <input
                                    value={selectedUser.userName}
                                    onChange={e => setSelectedUser({ ...selectedUser, userName: e.target.value })}
                                    className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <label className="text-sm text-gray-700 w-32">Full Name</label>
                                <input
                                    value={selectedUser.fullName}
                                    onChange={e => setSelectedUser({ ...selectedUser, fullName: e.target.value })}
                                    className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <label className="text-sm text-gray-700 w-32">Email Address</label>
                                <input
                                    value={selectedUser.email}
                                    onChange={e => setSelectedUser({ ...selectedUser, email: e.target.value })}
                                    className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <label className="text-sm text-gray-700 w-32">User Role</label>
                                <div className="relative flex-1">
                                    <select
                                        value={selectedUser?.roleID ? selectedUser.roleID.toString() : ""}
                                        onChange={(e) =>
                                            setSelectedUser({
                                                ...selectedUser,
                                                roleID: parseInt(e.target.value, 10),
                                            })
                                        }
                                        className="w-full px-2 py-1 h-8 rounded border border-blue-300 text-gray-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    >
                                        <option value="">Select User Role</option>
                                        {userRoles.map((role) => (
                                            <option key={role.roleID} value={role.roleID.toString()}>
                                                {role.roleName}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute inset-y-1.5 right-2 w-5.5 h-5.5 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <label className="text-sm text-gray-700 w-32">Is Active</label>
                                <input
                                    type="checkbox"
                                    checked={selectedUser?.isActive ?? false}
                                    onChange={(e) =>
                                        setSelectedUser({
                                            ...selectedUser!,
                                            isActive: e.target.checked,
                                        })
                                    }
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="text-sm text-gray-700">Is Active User</label>
                            </div>

                            <div className="flex gap-4 mt-4">
                                <button onClick={() => setIsOpenEditUser(false)} className="flex-1 bg-pink-600 text-white rounded py-1">Cancel</button>
                                <button onClick={() => handleUpdateUserSubmit(selectedUser)} className="flex-1 bg-green-500 text-white rounded py-1">Update</button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default UserInfo;
