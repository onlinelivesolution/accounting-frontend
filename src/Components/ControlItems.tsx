import React, { useEffect, useState } from 'react';
import { ChevronDown } from "lucide-react";
import axios from 'axios';


interface ControlItem {
  controlItemCode?: string;
  controlItemName?: string;
  isActive?: boolean;
  accountTypeID?: number;
  isDeleted?: boolean;
  createdBy?: string;
  createdDate?: string | null;
  updatedBy?: string;
  updatedDate?: string | null;
  fATypeID?: number;
  companyCode?: string;
  companyName?: string;
  accountTypeName?: string;
}

const ControlItems: React.FC = () => {
  const [controlItems, setControlItems] = useState<ControlItem[]>([]);
  const [selectedControlItems, setSelectedControlItems] = useState<string[]>([]);
  const [isOpenAddControlItem, setIsOpenAddControlItem] = useState(false);
  const [newControlItemAccountTypeID, setNewControlItemAccountTypeID] = useState<number | null>(null);
  const [newControlItemFATypeID, setNewControlItemFATypeID] = useState<number | null>(null);
  const [accountTypes, setAccountTypes] = useState<{ accountTypeID: number; accountTypeName: string }[]>([]);
  const [fatypes, setFATypes] = useState<{ fATypeID: number; fATypeName: string }[]>([]);
  const [controlItemName, setControlItemName] = useState<string>("");
  const [nextCode, setNextCode] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [selectedControlItem, setSelectedControlItem] = useState<ControlItem | null>(null);
  const [isOpenEditControlItem, setIsOpenEditControlItem] = useState(false);

  //Save the new control item information in the database.
  const submitControlItemButton = async () => {
    // ✅ Required field validation
    if (!nextCode) {
      alert("Control Item Code is required.");
      return;
    }
    if (!newControlItemAccountTypeID) {
      alert("Account Category is required.");
      return;
    }
    if (!newControlItemFATypeID) {
      alert("Account Type is required.");
      return;
    }
    if (!controlItemName.trim()) {
      alert("Control Item Name is required.");
      return;
    }

    try {
      const controlItemData = {
        controlItemCode: nextCode,
        controlItemName: controlItemName,
        isActive: 1,
        accountTypeID: newControlItemAccountTypeID,
        isDeleted: 0,
        createdBy: "admin",
        createdDate: new Date().toISOString(),
        updatedBy: "",
        updatedDate: new Date().toISOString(),
        fATypeID: newControlItemFATypeID,
        companyCode: "01",
      };

      const response = await fetch(
        "http://127.0.0.1:8000/api/controlitems/addNewControlItem",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(controlItemData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from server:", errorData);
        alert(`Error: ${JSON.stringify(errorData)}`);
      } else {
        const responseData = await response.json();
        console.log("Success:", responseData);
        alert("✅ Control item added successfully!");
        setIsOpenAddControlItem(false);
        loadControlItemTable();
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("❌ An error occurred while submitting the control item.");
    }
  };

  //Update the existing control item information in the database.
  const submitUpdateControlItemButton = async (item: ControlItem) => {
    // ✅ Required field validation
    if (!item.controlItemCode) {
      alert("Control Item Code is required.");
      return;
    }
    if (!item.accountTypeID) {
      alert("Account Category is required.");
      return;
    }
    if (!item.fATypeID) {
      alert("Account Type is required.");
      return;
    }
    if (!item.controlItemName?.trim()) {
      alert("Control Item Name is required.");
      return;
    }

    try {
      const updatedData = {
        ...item,
        updatedBy: "admin",
        updatedDate: new Date().toISOString(),
      };

      const response = await axios.put(
        `http://127.0.0.1:8000/api/controlitems/updateControlItem/${item.controlItemCode}`,
        updatedData
      );

      if (response.status === 200) {
        alert("✅ Control item updated successfully!");

        loadControlItemTable();

        setIsOpenEditControlItem(false);

      } else {
        alert("❌ Failed to update control item. Please try again.");
      }
    } catch (error) {
            if (axios.isAxiosError(error)) {
                alert(error.response?.data?.detail || "Error creating user");
            } else {
                alert("Unexpected error occurred");
            }
        }
  };

  // Handle check single single check box
  const handleCheckboxChange = (controlItemCode: string) => {
    setSelectedControlItems((prevSelected) => {
      if (prevSelected.includes(controlItemCode)) {
        return prevSelected.filter((id) => id !== controlItemCode);
      } else {
        return [...prevSelected, controlItemCode];
      }
    });
  };

  // Handle Check all check boxes
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedControlItems([]);
    } else {
      setSelectedControlItems(
        controlItems
          .map((item) => item.controlItemCode || '')
          .filter((code) => code !== '')
      );
    }
    setSelectAll(!selectAll);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage("");
    const selected = e.target.files?.[0] || null;
    setFile(selected);
  };

  const handleSelectUploadFile = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await fetch("http://127.0.0.1:8000/api/employees/uploadEmployeeCSV", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ " + data.message);
      } else {
        setMessage("❌ " + (data.detail || "Upload failed."));
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("❌ Upload failed. Please check the server.");
    } finally {
      setUploading(false);
    }
  };

  //Open the drawer loading the next control item code.
  const handleOpenAddControlItem = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/controlitems/nextControlItemCode");
      const data = await res.json();
      setNextCode(data);
    } catch (err) {
      console.error("Failed to fetch next control item code", err);
      setNextCode("01");
    }

    // Reset form fields
    setControlItemName("");
    setNewControlItemAccountTypeID(null);
    setNewControlItemFATypeID(null);
    setIsOpenAddControlItem(true);
  };

  //Load the next control item code in the input field.
  const loadControlItemTable = async (pageNumber = 0) => {
    const skip = pageNumber * limit;
    const res = await fetch(`http://127.0.0.1:8000/api/controlitems/controlItemTable?skip=${skip}&limit=${limit}`);
    const result = await res.json();
    setControlItems(result);
    setTotal(result.total);
  };

  useEffect(() => {
    loadControlItemTable(page);
  }, [page]);

  //Load the AccountType information in dropdown list.
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/controlitems/accountTypeDropdown")
      .then(response => setAccountTypes(response.data))
      .catch(error => console.error("Failed to load Account Type", error));
  }, []);

  //Load the FAType information in dropdown list.
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/controlitems/faTypeDropdown")
      .then(response => setFATypes(response.data))
      .catch(error => console.error("Failed to load FA Type", error));
  }, []);

  //Get the next ControlItemCode information.
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/controlitems/nextControlItemCode")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setNextCode(data);
      })
      .catch((err) => {
        console.error("Failed to fetch next control item code", err);
        setNextCode("01");
      });
  }, []);

  //User interface design for control item information.
  return (
    <div className="grid grid-cols-6 gap-4 pt-1">
      <div className="grid grid-cols-6 col-span-6 bg-white p-4 border border-blue-300 rounded-lg gap-2">
        
        <div className="mb-2 grid grid-cols-6 col-span-5 gap-1 h-[30px]">
          <label className='text-gray-700 p-1 text-lg text-bold'>Control Item</label>
        </div>
        <div></div>
        <div className="mb-2 grid grid-cols-6 col-span-1">
          <button className="w-[100px] h-[30px] mb-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50" onClick={() => handleOpenAddControlItem()} > Add New</button>
        </div>
        <div className="mb-2 grid grid-cols-6 col-span-5 gap-1 h-[30px]">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-[100px] mb-2"
          />
          {file && <p className="w-[100px] text-sm text-gray-600">{file.name}</p>}

          <button
            onClick={handleSelectUploadFile}
            disabled={!file || uploading}
            className="w-[100px] h-[30px] mb-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload CSV"}
          </button>
          {message && <p className="w-[300px] mt-2 text-sm">{message}</p>}

        </div>

        <div className="col-span-6 w-full h-[450px] overflow-x-auto overflow-y-auto border border-blue-300 rounded-lg">
          <table className="min-w-full table-fixed border-l border-blue-300 border-r border-blue-300 rounded-lg">
            <thead className="bg-blue-300 sticky top-0 z-10">
              <tr key={0}>
                <th className="w-[50px] h-[10px] py-1 px-1 pl-[12px] pt-[8px] text-center text-sm border-b border-blue-300 border-l border-blue-300 text-left">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-500"
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                  />
                </th>
                <th className="w-[250px] p-2 border-b border-blue-300 text-left">Control Item Code</th>
                <th className="w-[250px] p-2 border-b border-blue-300 text-left">Control Item Name</th>
                <th className="w-[250px] p-2 border-b border-blue-300 text-left">Account Type</th>
                <th className="w-[250px] p-2 border-b border-blue-300 text-left">Company Name</th>
                <th className="w-[100px] p-2 border-b border-blue-300 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {controlItems?.map((controlItem) => (
                <tr key={controlItem.controlItemCode} className="hover:bg-blue-50">
                  <td className="w-[50px] h-[10px] py-1 px-1 pl-[12px] text-center text-sm border-b border-blue-300 border-l border-blue-300 text-left">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-blue-500"
                      checked={selectedControlItems.includes(controlItem.controlItemCode || '')}
                      onChange={() => handleCheckboxChange(controlItem.controlItemCode || '')}
                    />
                  </td>
                  <td className="w-[250px] p-2 border-b border-blue-300">{controlItem.controlItemCode}</td>
                  <td className="w-[250px] p-2 border-b border-blue-300">{controlItem.controlItemName}</td>
                  <td className="w-[250px] p-2 border-b border-blue-300">{controlItem.accountTypeName}</td>
                  <td className="w-[250px] p-2 border-b border-blue-300">{controlItem.companyName}</td>
                  <td className="w-[100px] p-2 border-b border-blue-300 relative">
                    <button
                      onClick={() => {
                        setSelectedControlItem(controlItem);
                        setIsOpenEditControlItem(true);
                      }}
                      className="text-2xl font-bold text-blue-700 hover:text-black w-5 h-5 flex justify-center items-center pb-[10px]"
                    >
                      ...
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-span-6 flex gap-2 mt-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            className="w-[70px] h-[28px] bg-blue-200 hover:bg-blue-300 text-sm rounded-sm"
          >
            Previous
          </button>

          <button
            disabled={(page + 1) * limit >= total}
            onClick={() => setPage((prev) => prev + 1)}
            className="w-[70px] h-[28px] bg-blue-200 hover:bg-blue-300 text-sm rounded-sm"
          >
            Next
          </button>

          <div className="text-sm text-gray-600">
            Page {page + 1} of {Math.ceil(total / limit)} | Total: {total} records
          </div>
        </div>
      </div>
      {/* Start Right-Side Add New control item Drawer */}
      {isOpenAddControlItem && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 backdrop-blur-sm z-40"></div>
      )}

      <div className={`fixed right-0 top-0 w-full sm:w-3/4 md:w-1/3 lg:w-1/4 h-screen border border-blue-500 pl-5 p-3 bg-white transform transition-transform duration-300 ${isOpenAddControlItem ? "translate-x-0" : "translate-x-full"} z-50 overflow-y-auto`} >
        <div className='pb-[20px]'>
          <div className='border-b border-blue-300 w-full pb-1'>
            <label className='text-gray-500 p-1 text-lg'>Add Control Item</label>
          </div>
        </div>
        <div className="flex flex-col items-start pt-[20px] pb-[5px]">
          <label className="text-left text-sm text-gray-700">Control Item Code</label>
        </div>
        <div className="flex flex-col items-start mb-2 pb-[10px]">
          <input type="text" placeholder="control item name" value={nextCode ?? ""} readOnly onChange={(e) => setNextCode(e.target.value)}
            className="w-[100px] h-[32px] px-1 py-2 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-blue-100" />
        </div>
        <div className="flex flex-col items-start pb-[5px]">
          <label className="text-left text-sm text-gray-700">Account Category</label>
        </div>
        <div className="col-span-2 relative">
          <select
            value={newControlItemAccountTypeID ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              setNewControlItemAccountTypeID(value ? Number(value) : null);
            }}
            className="w-full px-2 py-1 h-8 rounded border border-blue-300 text-gray-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Select Account Category</option>
            {accountTypes.map((accountType) => (
              <option key={accountType.accountTypeID} value={accountType.accountTypeID}>
                {accountType.accountTypeName}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute inset-y-1.5 right-2 w-5.5 h-5.5 text-gray-500 pointer-events-none" />
        </div>
        <div className="flex flex-col items-start pt-[20px] pb-[5px]">
          <label className="text-left text-sm text-gray-700">Account Type</label>
        </div>
        <div className="col-span-2 relative">
          <select
            value={newControlItemFATypeID ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              setNewControlItemFATypeID(value ? Number(value) : null);
            }}
            className="w-full px-2 py-1 h-8 rounded border border-blue-300 text-gray-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Select Account Type</option>
            {fatypes.map((faType) => (
              <option key={faType.fATypeID} value={faType.fATypeID}>
                {faType.fATypeName}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute inset-y-1.5 right-2 w-5.5 h-5.5 text-gray-500 pointer-events-none" />
        </div>
        <div className="flex flex-col items-start pt-[20px] pb-[5px]">
          <label className="text-left text-sm text-gray-700">Control Item Name</label>
        </div>
        <div className="flex flex-col items-start mb-2 pb-[10px]">
          <input type="text" placeholder="control item name" value={controlItemName ?? ""} onChange={(e) => setControlItemName(e.target.value)}
            className="w-full h-[32px] px-1 py-2 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>

        <div className="flex pt-[200px] gap-4">
          <button className="flex-1 bg-pink-600 px-4 py-1.3 rounded text-white h-[30px]" onClick={() => setIsOpenAddControlItem(false)} >Cancel</button>
          <button className="flex-1 bg-green-500 px-4 py-1.3 rounded text-white h-[30px]" onClick={submitControlItemButton} > Submit</button>
        </div>
      </div>
      {/* End Right-Side Add New control item Drawer */}

      {/* Start Right-Side Edit control item Drawer */}
      {isOpenEditControlItem && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 backdrop-blur-sm z-40"></div>
      )}

      <div
        className={`fixed right-0 top-0 w-full sm:w-3/4 md:w-1/3 lg:w-1/4 h-screen border border-blue-500 pl-5 p-3 bg-white transform transition-transform duration-300 ${isOpenEditControlItem ? "translate-x-0" : "translate-x-full"
          } z-50 overflow-y-auto`}
      >
        {selectedControlItem && (
          <>
            <div className="pb-[20px]">
              <div className="border-b border-blue-300 w-full pb-1">
                <label className="text-gray-500 p-1 text-lg">Edit Control Item</label>
              </div>
            </div>

            <div className="flex flex-col items-start pt-[20px] pb-[5px]">
              <label className="text-left text-sm text-gray-700">Control Item Code</label>
            </div>
            <div className="flex flex-col items-start mb-2 pb-[10px]">
              <input
                type="text"
                value={selectedControlItem?.controlItemCode ?? ""}
                readOnly
                className="w-[100px] h-[32px] px-1 py-2 rounded border border-blue-300 text-gray-700 focus:outline-none bg-blue-100"
              />
            </div>

            <div className="flex flex-col items-start pb-[5px]">
              <label className="text-left text-sm text-gray-700">Account Category</label>
            </div>
            <div className="col-span-2 relative">
              <select
                value={selectedControlItem?.accountTypeID ?? ""}
                onChange={(e) =>
                  setSelectedControlItem({
                    ...selectedControlItem,
                    accountTypeID: Number(e.target.value),
                  })
                }
                className="w-full px-2 py-1 h-8 rounded border border-blue-300 text-gray-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select Account Category</option>
                {accountTypes.map((accountType) => (
                  <option key={accountType.accountTypeID} value={accountType.accountTypeID}>
                    {accountType.accountTypeName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute inset-y-1.5 right-2 w-5.5 h-5.5 text-gray-500" />
            </div>

            <div className="flex flex-col items-start pt-[20px] pb-[5px]">
              <label className="text-left text-sm text-gray-700">Account Type</label>
            </div>
            <div className="col-span-2 relative">
              <select
                value={selectedControlItem?.fATypeID ?? ""}
                onChange={(e) =>
                  setSelectedControlItem({
                    ...selectedControlItem,
                    fATypeID: Number(e.target.value),
                  })
                }
                className="w-full px-2 py-1 h-8 rounded border border-blue-300 text-gray-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select Account Type</option>
                {fatypes.map((faType) => (
                  <option key={faType.fATypeID} value={faType.fATypeID}>
                    {faType.fATypeName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute inset-y-1.5 right-2 w-5.5 h-5.5 text-gray-500" />
            </div>

            {/* Control Item Name */}
            <div className="flex flex-col items-start pt-[20px] pb-[5px]">
              <label className="text-left text-sm text-gray-700">Control Item Name</label>
            </div>
            <div className="flex flex-col items-start mb-2 pb-[10px]">
              <input
                type="text"
                value={selectedControlItem?.controlItemName ?? ""}
                onChange={(e) =>
                  setSelectedControlItem({
                    ...selectedControlItem,
                    controlItemName: e.target.value,
                  })
                }
                className="w-full h-[32px] px-1 py-2 rounded border border-blue-300 text-gray-700"
              />
            </div>

            <div className="flex pt-[200px] gap-4">
              <button
                className="flex-1 bg-pink-600 px-4 py-1.3 rounded text-white h-[30px]"
                onClick={() => setIsOpenEditControlItem(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-green-500 px-4 py-1.3 rounded text-white h-[30px]"
                onClick={() => submitUpdateControlItemButton(selectedControlItem)}
              >
                Update
              </button>
            </div>
          </>
        )}
      </div>
      {/* End Right-Side Edit control item Drawer */}
    </div>

  );
};

export default ControlItems;