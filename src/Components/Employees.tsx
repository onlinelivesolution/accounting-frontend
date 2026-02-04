import React, { useEffect, useState, useRef } from "react";
import axiosClient from "../api/axiosClient";

interface Employee {
  employeeID: number;
  employeeCode?: string;
  applicantID?: number;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  employeeName?: string;
  fatherName?: string;
  motherName?: string;
  gender?: number;
  dateOfBirth?: string | null;
  nationalID?: string;
  address?: string;
  postalAddress?: string;
  accountHolder?: string;
  bankID?: number;
  bankBranchID?: number;
  accountNumber?: string;
  designation?: string;
  joinDate?: string | null;
  email?: string;
  phone?: string;
  companyCode?: string;
  activityCenterCode?: string;
  respCenterCode?: string;
  emergencyContact?: string;
  status?: number;
  deviceID?: number;
  gradedTaxNo?: string;
  terminationDate?: string | null;
  employeeSetID?: number;
}

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeCode, setEmployeeCode] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isOpenAddEmployee, setIsOpenAddEmployee] = useState(false);
  const [isOpenEditEmployee, setIsOpenEditEmployee] = useState(false);
  const token = localStorage.getItem("token");
  const [editEmployeeID, setEditEmployeeID] = useState<number | null>(null);
  const [nextCode, setNextCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [nationalID, setNationalID] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [address, setAddress] = useState("");
  const [postalAddress, setPostalAddress] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [deviceID, setDeviceID] = useState<number | null>(null);
  const [gradedTaxNo, setGradedTaxNo] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Add new employee button function
  const submitEmployeeButton = async (e: React.FormEvent) => {
    e.preventDefault();

    const employeeData = {
      employeeCode: nextCode,
      applicantID: 1,
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      employeeName: `${firstName} ${middleName} ${lastName}`,
      fatherName: fatherName,
      motherName: motherName,
      gender: 1,
      dateOfBirth: dateOfBirth || null,
      nationalID: nationalID,
      address: address,
      postalAddress: postalAddress,
      accountHolder: accountHolder,
      bankID: 1,
      bankBranchID: 5,
      accountNumber: accountNumber,
      designation: designation,
      joinDate: joinDate || null,
      email: email,
      phone: phone,
      companyCode: "01",
      activityCenterCode: "0101",
      respCenterCode: "010101",
      emergencyContact: emergencyContact,
      status: 1,
      deviceID: 1,
      gradedTaxNo: gradedTaxNo,
      employeeSetID: 1,
      createdBy: "admin"
    };

    console.log("Sending Payload:", employeeData);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/employees/addEmployee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.log("API Validation Error:", errorData);
        alert("Failed to add employee. Check console.");
        return;
      }

      const result = await res.json();
      console.log("Employee Inserted:", result);

      alert("Employee inserted successfully!");
      loadEmployeeTable();
      setIsOpenAddEmployee(false);
    } catch (error) {
      console.error("Network error:", error);
      alert("Failed to connect to server.");
    }
  };

  // Load the selected employee in the edit employee screen
  const handleSelectedEditEmployee = (emp: Employee) => {

    setOpenDropdown(null);  // Close the dropdown menu

    // Store the employeeID for updating
    setEditEmployeeID(emp.employeeID);

    setEmployeeCode(emp.employeeCode ?? "");
    setFirstName(emp.firstName ?? "");
    setMiddleName(emp.middleName ?? "");
    setLastName(emp.lastName ?? "");
    setEmployeeName(emp.employeeName ?? "");
    setFatherName(emp.fatherName ?? "");
    setMotherName(emp.motherName ?? "");

    setDateOfBirth(
      emp.dateOfBirth ? emp.dateOfBirth.substring(0, 10) : ""
    );

    setNationalID(emp.nationalID ?? "");
    setAddress(emp.address ?? "");
    setPostalAddress(emp.postalAddress ?? "");
    setAccountHolder(emp.accountHolder ?? "");
    setAccountNumber(emp.accountNumber ?? "");
    setDesignation(emp.designation ?? "");

    setJoinDate(
      emp.joinDate ? emp.joinDate.substring(0, 10) : ""
    );

    setEmail(emp.email ?? "");
    setPhone(emp.phone ?? "");
    setEmergencyContact(emp.emergencyContact ?? "");
    setDeviceID(emp.deviceID ? Number(emp.deviceID) : 0);
    setGradedTaxNo(emp.gradedTaxNo ?? "");

    // Open the Edit Employee modal
    setIsOpenEditEmployee(true);
  };

  // Update employee button function
  const submitEditEmployeeButton = async (e: React.FormEvent) => {
    e.preventDefault();

    const employeeData = {
      employeeID: editEmployeeID,
      employeeCode: nextCode,
      applicantID: 1,
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      employeeName: `${firstName} ${middleName} ${lastName}`,
      fatherName: fatherName,
      motherName: motherName,
      gender: 1,
      dateOfBirth: dateOfBirth || null,
      nationalID: nationalID,
      address: address,
      postalAddress: postalAddress,
      accountHolder: accountHolder,
      bankID: 1,
      bankBranchID: 5,
      accountNumber: accountNumber,
      designation: designation,
      joinDate: joinDate || null,
      email: email,
      phone: phone,
      companyCode: "01",
      activityCenterCode: "0101",
      respCenterCode: "010101",
      emergencyContact: emergencyContact,
      status: 1,
      deviceID: 1,
      gradedTaxNo: gradedTaxNo,
      employeeSetID: 1,
      updatedBy: "admin",
      updatedDate: new Date().toISOString(),
    };

    console.log("Sending Payload:", employeeData);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/employees/updateEmployee/${employeeCode}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(employeeData),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.log("API Validation Error:", errorData);
        alert("Failed to update employee. Check console.");
        return;
      }

      const result = await res.json();
      console.log("Employee Updated:", result);

      alert("Employee updated successfully!");
      loadEmployeeTable();
      setIsOpenEditEmployee(false);

    } catch (error) {
      console.error("Network error:", error);
      alert("Failed to connect to server.");
    }
  };

  // Close the dropdown of the grid when click outside of dropdown area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load employee information in view list
  const loadEmployeeTable = async () => {
    try {
      const res = await axiosClient.get("http://127.0.0.1:8000/api/employees/loadAllInformationFromEmployeeTable");
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadEmployeeTable();
  }, []);

  // Load the next employee code
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/employees/lastEmployeeCode")
      .then((res) => res.json())
      .then((data) => {
        console.log("API:", data);

        if (data?.lastEmployeeCode) {
          setNextCode(data.lastEmployeeCode);
        } else {
          setNextCode("01");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch next employee code", err);
        setNextCode("01");
      });
  }, []);

  const handleOpenAddEmployee = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/employees/lastEmployeeCode");
      const data = await res.json();
      console.log("Next employee from modal:", data);

      if (data?.lastEmployeeCode) {
        setNextCode(data.lastEmployeeCode);
      } else {
        setNextCode("01");
      }

    } catch (err) {
      console.error("Failed to fetch next employee code:", err);
      setNextCode("01");
    }

    setIsOpenAddEmployee(true);
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  // Toggle select-all
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedEmployees(employees.map((e) => e.employeeID));
    } else {
      setSelectedEmployees([]);
    }
  };

  // Select single row
  const handleSelect = (employeeID: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeID)
        ? prev.filter((id) => id !== employeeID)
        : [...prev, employeeID]
    );
  };

  // Dropdown toggle per-row
  const toggleDropdown = (id: number) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  // File upload submit
  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile); // key name can match backend

    setUploading(true);
    try {
      await axiosClient.post("/employees/upload", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("File uploaded successfully.");
      loadEmployeeTable();
    } catch (error) {
      console.error(error);
      setMessage("Upload failed.");
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="grid grid-cols-6 gap-4 pt-1">
      <div className="grid grid-cols-6 col-span-6 bg-white p-4 border border-blue-300 rounded-lg gap-2">

        {/* Header Section */}
        <div className="col-span-6 flex flex-wrap items-center justify-between mb-2 gap-2">

          <label className="text-gray-700 p-1 text-lg font-bold whitespace-nowrap">
            Manage Employee
          </label>

          {/* ==== Fixed Container for Choose File + File Name + Upload ==== */}
          <div className="flex items-center gap-2 min-w-[350px]">

            {/* Hidden file input */}
            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Choose File Button */}
            <label
              htmlFor="fileInput"
              className="min-w-[110px] h-[32px] flex items-center justify-center text-blue-800 bg-white rounded cursor-pointer hover:bg-blue-400 border border-blue-800 hover:text-white whitespace-nowrap"
            >
              Choose File
            </label>

            {/* File Name (fixed space) */}
            <span className="text-gray-700 truncate max-w-[120px] text-sm">
              {selectedFile ? selectedFile.name : "No file chosen"}
            </span>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="min-w-[100px] h-[32px] bg-white text-blue-800 rounded border border-blue-800 hover:bg-blue-400 hover:text-white whitespace-nowrap"
            >
              {uploading ? "Uploading..." : "Upload CSV"}
            </button>

          </div>
          {/* ========================================================= */}

          {/* Optional error/message */}
          {message && <span className="text-red-600 text-sm">{message}</span>}

          {/* Add New Button */}
          <button
            className="min-w-[100px] h-[32px] bg-white text-blue-800 rounded border border-blue-800 hover:bg-blue-400 hover:text-white"
            onClick={() => handleOpenAddEmployee()}
          >
            Add New
          </button>
        </div>


        {/* Employee Table */}
        <div className="col-span-6 w-full h-[450px] overflow-x-auto overflow-y-auto border border-blue-300 rounded-lg">
          <table className="min-w-full table-fixed border-l border-blue-300 border-r border-blue-300 rounded-lg">
            <thead className="bg-blue-300 border-b border-blue-300">
              <tr>
                <th className="w-[50px] py-2 px-2 text-center border-b border-blue-300 border-l border-blue-300">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-500"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>

                <th className="w-[220px] p-2 border-b border-blue-300 text-left">Employee Code</th>
                <th className="w-[220px] p-2 border-b border-blue-300 text-left">Employee Name</th>
                <th className="w-[220px] p-2 border-b border-blue-300 text-left">Designation</th>
                <th className="w-[220px] p-2 border-b border-blue-300 text-left">Phone</th>
                <th className="w-[100px] p-2 border-b border-blue-300 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((emp) => (
                <tr key={emp.employeeID}>
                  <td className="w-[50px] py-2 px-2 text-center border-b border-blue-300 border-l border-blue-300">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-blue-500"
                      checked={selectedEmployees.includes(emp.employeeID)}
                      onChange={() => handleSelect(emp.employeeID)}
                    />
                  </td>

                  <td className="w-[220px] p-2 border-b border-blue-300">{emp.employeeCode}</td>
                  <td className="w-[220px] p-2 border-b border-blue-300">{emp.employeeName}</td>
                  <td className="w-[220px] p-2 border-b border-blue-300">{emp.designation}</td>
                  <td className="w-[220px] p-2 border-b border-blue-300">{emp.phone}</td>

                  {/* Row Action Dropdown */}
                  <td className="w-[100px] p-2 border-b border-blue-300 relative">
                    <button
                      className="text-2xl font-bold text-blue-700 hover:text-black"
                      onClick={() => toggleDropdown(emp.employeeID)}
                    >
                      ...
                    </button>

                    {openDropdown === emp.employeeID && (
                      <div
                        ref={dropdownRef}
                        className="absolute right-0 top-8 w-40 bg-white border border-blue-400 shadow rounded z-50"
                      >
                        <button className="block w-full px-4 py-2 text-left hover:bg-blue-200 rounded">
                          View Details
                        </button>

                        <button
                          className="block w-full px-4 py-2 text-left hover:bg-blue-200 rounded"
                          onClick={() => {
                            handleSelectedEditEmployee(emp); // open edit modal
                            setOpenDropdown(null);   // CLOSE DROPDOWN when Edit clicked
                          }}
                        >
                          Edit
                        </button>

                        <button className="block w-full px-4 py-2 text-left hover:bg-blue-200 rounded">
                          Delete
                        </button>
                      </div>
                    )}

                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>
      </div>
      {/* ======================== Add Employee Modal ======================== */}
      {isOpenAddEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-[600px] max-h-[90vh] overflow-y-auto rounded-lg shadow-xl p-6 border border-blue-300">

            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Add New Employee
            </h2>


            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 w-32">Employee Code</label>
              <input type="text" value={nextCode ?? ""} readOnly onChange={(e) => setNextCode(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">First Name</label>
              <input
                type="text"
                placeholder="Enter first name"
                value={firstName ?? ""}
                onChange={(e) => setFirstName(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Middle Name</label>
              <input
                type="text"
                placeholder="Enter middle name"
                value={middleName ?? ""}
                onChange={(e) => setMiddleName(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Last Name</label>
              <input
                type="text"
                placeholder="Enter last name"
                value={lastName ?? ""}
                onChange={(e) => setLastName(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Employee Name</label>
              <input
                type="text"
                placeholder="Enter employee name"
                value={employeeName ?? ""}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Father Name</label>
              <input
                type="text"
                placeholder="Enter father name"
                value={fatherName ?? ""}
                onChange={(e) => setFatherName(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Mother Name</label>
              <input
                type="text"
                placeholder="Enter mother name"
                value={motherName ?? ""}
                onChange={(e) => setMotherName(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Date of Birth</label>

              <input
                type="date"
                value={dateOfBirth ?? ""}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 
               focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">National ID</label>
              <input
                type="text"
                placeholder="Enter national Id"
                value={nationalID ?? ""}
                onChange={(e) => setNationalID(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Address</label>
              <input
                type="text"
                placeholder="Enter address"
                value={address ?? ""}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Postal Address</label>
              <input
                type="text"
                placeholder="Enter postal address"
                value={postalAddress ?? ""}
                onChange={(e) => setPostalAddress(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>


            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Account Holder</label>
              <input
                type="text"
                placeholder="Enter account holder"
                value={accountHolder ?? ""}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Account Number</label>
              <input
                type="text"
                placeholder="Enter account number"
                value={accountNumber ?? ""}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Designation</label>
              <input
                type="text"
                placeholder="Enter designation"
                value={designation ?? ""}
                onChange={(e) => setDesignation(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Date of Join</label>

              <input
                type="date"
                value={joinDate ?? ""}
                onChange={(e) => setJoinDate(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 
               focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Email</label>
              <input
                type="text"
                placeholder="Enter email address"
                value={email ?? ""}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Phone</label>
              <input
                type="text"
                placeholder="Enter phone number"
                value={phone ?? ""}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Emergency Contact</label>
              <input
                type="text"
                placeholder="Enter emergency contact"
                value={emergencyContact ?? ""}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Graded Tax No</label>
              <input
                type="text"
                placeholder="Enter device ID"
                value={gradedTaxNo ?? ""}
                onChange={(e) => setGradedTaxNo(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Add more fields similarly... */}


            {/* ========== ACTION BUTTONS (Cancel + Submit) ========== */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsOpenAddEmployee(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={submitEmployeeButton}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================== Edit Employee Modal ======================== */}
      {isOpenEditEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-[600px] max-h-[90vh] overflow-y-auto rounded-lg shadow-xl p-6 border border-blue-300">

            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Edit Employee
            </h2>


            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 w-32">Employee Code</label>
              <input type="text" value={nextCode ?? ""} readOnly onChange={(e) => setNextCode(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">First Name</label>
              <input
                type="text"
                placeholder="Enter first name"
                value={firstName ?? ""}
                onChange={(e) => setFirstName(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Middle Name</label>
              <input
                type="text"
                placeholder="Enter middle name"
                value={middleName ?? ""}
                onChange={(e) => setMiddleName(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Last Name</label>
              <input
                type="text"
                placeholder="Enter last name"
                value={lastName ?? ""}
                onChange={(e) => setLastName(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Employee Name</label>
              <input
                type="text"
                placeholder="Enter employee name"
                value={employeeName ?? ""}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Father Name</label>
              <input
                type="text"
                placeholder="Enter father name"
                value={fatherName ?? ""}
                onChange={(e) => setFatherName(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Mother Name</label>
              <input
                type="text"
                placeholder="Enter mother name"
                value={motherName ?? ""}
                onChange={(e) => setMotherName(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Date of Birth</label>

              <input
                type="date"
                value={dateOfBirth ?? ""}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 
               focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">National ID</label>
              <input
                type="text"
                placeholder="Enter national Id"
                value={nationalID ?? ""}
                onChange={(e) => setNationalID(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Address</label>
              <input
                type="text"
                placeholder="Enter address"
                value={address ?? ""}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Postal Address</label>
              <input
                type="text"
                placeholder="Enter postal address"
                value={postalAddress ?? ""}
                onChange={(e) => setPostalAddress(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>


            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Account Holder</label>
              <input
                type="text"
                placeholder="Enter account holder"
                value={accountHolder ?? ""}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Account Number</label>
              <input
                type="text"
                placeholder="Enter account number"
                value={accountNumber ?? ""}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Designation</label>
              <input
                type="text"
                placeholder="Enter designation"
                value={designation ?? ""}
                onChange={(e) => setDesignation(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Date of Join</label>

              <input
                type="date"
                value={joinDate ?? ""}
                onChange={(e) => setJoinDate(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 
               focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Email</label>
              <input
                type="text"
                placeholder="Enter email address"
                value={email ?? ""}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Phone</label>
              <input
                type="text"
                placeholder="Enter phone number"
                value={phone ?? ""}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Emergency Contact</label>
              <input
                type="text"
                placeholder="Enter emergency contact"
                value={emergencyContact ?? ""}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Device ID</label>
              <input
                type="text"
                placeholder="Enter device ID"
                value={deviceID ?? ""}
                onChange={(e) => setDeviceID(Number(e.target.value))}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-32">Graded Tax No</label>
              <input
                type="text"
                placeholder="Enter tax no"
                value={gradedTaxNo ?? ""}
                onChange={(e) => setGradedTaxNo(e.target.value)}
                className="flex-1 h-[32px] px-2 py-1 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* ========== ACTION BUTTONS (Cancel + Submit) ========== */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsOpenEditEmployee(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={submitEditEmployeeButton}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================================================================== */}

    </div>



  );
};

export default Employees;
