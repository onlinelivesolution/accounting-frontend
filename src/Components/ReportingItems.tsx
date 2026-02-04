import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronDown } from "lucide-react";

interface ReportingItem {
  reportingItemCode?: string;
  reportingItemName?: string;
  controlItemCode?: string;
  controlItemName?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdBy?: string;
  createdDate?: string | null;
  updatedBy?: string;
  updatedDate?: string | null;
  companyCode?: string;
  companyName?: string;
  accountTypeID?: number;
}

interface AccountType {
  accountTypeID: number;
  accountTypeName: string;
}

interface ControlItem {
  controlItemCode: string;
  controlItemName: string;
  accountTypeID: number;
}

const ReportingItems: React.FC = () => {
  const [reportingItems, setReportingItems] = useState<ReportingItem[]>([]);
  const [selectedReportingItems, setSelectedReportingItems] = useState<string[]>([]);
  const [isOpenAddReportingItem, setIsOpenAddReportingItem] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [selectedReportingItem, setSelectedReportingItem] = useState<ReportingItem | null>(null);
  const [isOpenEditReportingItem, setIsOpenEditReportingItem] = useState(false);
  const [nextCode, setNextCode] = useState("01");
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [controlItems, setControlItems] = useState<ControlItem[]>([]);

  const [reportingItem, setReportingItem] = useState({
    accountTypeID: "",
    controlItemCode: "",
    reportingItemCode: "",
    reportingItemName: "",
  });

  const handleAccountTypeChange = async (value: string) => {
    setReportingItem((prev) => ({
      ...prev,
      accountTypeID: value,
      controlItemCode: "" // clear controlItem when account type changes
    }));

    if (value) {
      const res = await fetch(
        `http://127.0.0.1:8000/api/reportingitems/getControlItemsByAccountType/${value}`
      );
      const data = await res.json();
      setControlItems(data);
    } else {
      setControlItems([]);
    }
  };

  const submitReportingItemButton = async () => {
    if (!nextCode) {
      alert("Reporting Item Code is required.");
      return;
    }

    if (!reportingItem.reportingItemName || !reportingItem.reportingItemName.trim()) {
      alert("Reporting Item Name is required.");
      return;
    }

    if (!reportingItem.controlItemCode) {
      alert("Control Item is required.");
      return;
    }

    try {
      const reportingItemData = {
        reportingItemCode: reportingItem.reportingItemCode,
        controlItemCode: reportingItem.controlItemCode,
        reportingItemName: reportingItem.reportingItemName,
        isActive: 1,
        isDeleted: 0,
        createdBy: "admin",
        createdDate: new Date().toISOString(),
        companyCode: "01",
      };

      const response = await fetch(
        "http://127.0.0.1:8000/api/reportingitems/addNewReportingItem",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reportingItemData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from server:", errorData);
        alert(`Error: ${JSON.stringify(errorData)}`);
      } else {
        const responseData = await response.json();
        console.log("Success:", responseData);
        alert("✅ Reporting item added successfully!");
        setIsOpenAddReportingItem(false);
        loadReportingItemTable();
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("❌ An error occurred while submitting the reporting item.");
    }
  };

  const loadReportingItemTable = async (pageNumber = 0) => {
    const skip = pageNumber * limit;
    const res = await fetch(`http://127.0.0.1:8000/api/reportingitems/loadReportingItemTable?skip=${skip}&limit=${limit}`);
    const result = await res.json();
    setReportingItems(result);
    setTotal(result.total);
  };

  useEffect(() => {
    loadReportingItemTable(page);
  }, [page]);


  const submitUpdateReportingItemButton = async (item: ReportingItem) => {
    if (!item.reportingItemCode) {
      alert("Reporting Item Code is required.");
      return;
    }
    if (!item.reportingItemName?.trim()) {
      alert("Reporting Item Name is required.");
      return;
    }

    try {
      const updatedData = {
        ...item,
        updatedBy: "admin",
        updatedDate: new Date().toISOString(),
      };

      const response = await axios.put(
        `http://127.0.0.1:8000/api/reportingitems/updateReportingItem/${item.reportingItemCode}`,
        updatedData
      );

      if (response.status === 200) {
        alert("✅ Reporting item updated successfully!");

        loadReportingItemTable();

        setIsOpenEditReportingItem(false);

      } else {
        alert("❌ Failed to update reporting item. Please try again.");
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
  const handleCheckboxChange = (reportingItemCode: string) => {
    setSelectedReportingItems((prevSelected) => {
      if (prevSelected.includes(reportingItemCode)) {
        return prevSelected.filter((id) => id !== reportingItemCode);
      } else {
        return [...prevSelected, reportingItemCode];
      }
    });
  };

  // Handle Check all check boxes
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedReportingItems([]);
    } else {
      setSelectedReportingItems(
        reportingItems
          .map((item) => item.reportingItemCode || '')
          .filter((code) => code !== '')
      );
    }
    setSelectAll(!selectAll);
  };

  //Open the drawer loading the next control item code.
  const handleOpenAddReportingItem = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/reportingitems/nextReportingItemCode");
      const data = await res.json();
      setNextCode(data);
    } catch (err) {
      console.error("Failed to fetch next reporting item code", err);
      setNextCode("01");
    }

    // Reset form fields
    // setReportingItemName("");
    setIsOpenAddReportingItem(true);
  };

  useEffect(() => {
    if (selectedReportingItem?.accountTypeID) {
      loadControlItemsByAccountType(selectedReportingItem.accountTypeID);
    }
  }, [selectedReportingItem?.accountTypeID]);

  const loadControlItemsByAccountType = async (accountTypeID: number) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/reportingitems/getControlItemsByAccountType/${accountTypeID}`
      );
      const data = await res.json();
      setControlItems(data); // array of filtered items
    } catch (err) {
      console.error("Failed to load control items", err);
    }
  };

  //Load the AccountType information in dropdown list.
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/reportingitems/loadAccountTypeDropdown")
      .then(response => setAccountTypes(response.data))
      .catch(error => console.error("Failed to load Account Type", error));
  }, []);

  //Get the next ControlItemCode information.
  useEffect(() => {
    const fetchNextCode = async () => {
      if (!reportingItem.controlItemCode) return; // prevent empty request

      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/reportingitems/getNextReportingItemCode/${reportingItem.controlItemCode}`
        );

        if (!res.ok) {
          console.error("API error:", res.status);
          return;
        }

        const data = await res.json();
        console.log("API response:", data);

        if (data?.nextCode) {
          setReportingItem((prev) => ({
            ...prev,
            reportingItemCode: data.nextCode, // 🔥 correct assignment
          }));
        } else {
          console.warn("FastAPI returned no nextCode");
        }
      } catch (error) {
        console.error("Failed to fetch next reporting item code", error);
      }
    };

    fetchNextCode();
  }, [reportingItem.controlItemCode]);

  //User interface design for reporting item information.
  return (
    <div className="grid grid-cols-6 gap-4 pt-1">
      <div className="grid grid-cols-6 col-span-6 bg-white p-4 border border-blue-300 rounded-lg gap-2">

        <div className="col-span-6 flex flex-wrap items-center justify-between mb-2 gap-2">

          <label className="text-gray-700 p-1 text-lg font-bold whitespace-nowrap">
            Manage Reporting Item
          </label>

          <button
            className="min-w-[100px] h-[32px] bg-white text-blue-800 rounded border border-blue-800 hover:bg-blue-400 hover:text-white"
            onClick={() => handleOpenAddReportingItem()}
          >
            Add New
          </button>
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
                <th className="w-[250px] p-2 border-b border-blue-300 text-left">Reporting Item Code</th>
                <th className="w-[250px] p-2 border-b border-blue-300 text-left">Reporting Item Name</th>
                <th className="w-[250px] p-2 border-b border-blue-300 text-left">Company Name</th>
                <th className="w-[100px] p-2 border-b border-blue-300 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {reportingItems?.map((reportingItem) => (
                <tr key={reportingItem.reportingItemCode} className="hover:bg-blue-50">
                  <td className="w-[50px] h-[10px] py-1 px-1 pl-[12px] text-center text-sm border-b border-blue-300 border-l border-blue-300 text-left">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-blue-500"
                      checked={selectedReportingItems.includes(reportingItem.reportingItemCode || '')}
                      onChange={() => handleCheckboxChange(reportingItem.reportingItemCode || '')}
                    />
                  </td>
                  <td className="w-[250px] p-2 border-b border-blue-300">{reportingItem.reportingItemCode}</td>
                  <td className="w-[250px] p-2 border-b border-blue-300">{reportingItem.reportingItemName}</td>
                  <td className="w-[250px] p-2 border-b border-blue-300">{reportingItem.companyName}</td>
                  <td className="w-[100px] p-2 border-b border-blue-300 relative">
                    <button
                      onClick={() => {
                        setSelectedReportingItem(reportingItem);
                        setIsOpenEditReportingItem(true);
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
      {/* Start Right-Side Add New reporting item Drawer */}
      {isOpenAddReportingItem && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 backdrop-blur-sm z-40"></div>
      )}

      <div className={`fixed right-0 top-0 w-full sm:w-3/4 md:w-1/3 lg:w-1/3 h-screen border border-blue-500 pl-5 p-3 bg-white transform transition-transform duration-300 ${isOpenAddReportingItem ? "translate-x-0" : "translate-x-full"} z-50 overflow-y-auto`} >
        <div className='pb-[20px]'>
          <div className='border-b border-blue-300 w-full pb-1'>
            <label className='text-gray-500 p-1 text-lg'>Add Reporting Item</label>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3 mt-[15px]">
          <label className="text-sm text-gray-700 w-50">Account Type</label>

          {/* Wrapper for dropdown + icon */}
          <div className="relative w-full">
            <select
              value={reportingItem.accountTypeID}
              onChange={(e) => handleAccountTypeChange(e.target.value)}
              className="w-full px-2 py-1 h-8 rounded border border-blue-300 text-gray-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Select Account Type</option>
              {accountTypes.map((t) => (
                <option key={t.accountTypeID} value={t.accountTypeID}>
                  {t.accountTypeName}
                </option>
              ))}
            </select>

            {/* Correct positioned dropdown icon */}
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
          </div>
        </div>


        <div className="flex items-center gap-3 mb-3 mt-[15px]">
          <label className="text-sm text-gray-700 w-50">Control Item</label>
          <div className="relative w-full">
            <select
              value={reportingItem.controlItemCode}
              onChange={(e) =>
                setReportingItem((prev) => ({
                  ...prev,
                  controlItemCode: e.target.value,
                }))
              }
              className="w-full px-2 py-1 h-8 rounded border border-blue-300 text-gray-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={controlItems.length === 0}
            >
              <option value="">Select Control Item</option>

              {controlItems.map((i) => (
                <option key={i.controlItemCode} value={i.controlItemCode}>
                  {i.controlItemName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute inset-y-1.5 right-2 w-5.5 h-5.5 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3 mt-[15px]">
          <label className="text-sm text-gray-700 w-50">Reporting Item Code</label>
          <div className="relative w-full">
            <input
              type="text"
              value={reportingItem.reportingItemCode ?? ""}
              readOnly
              className="w-full h-[32px] px-2 py-2 rounded border border-blue-300 text-gray-700
                 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>


        <div className="flex items-center gap-3 mb-3 mt-[15px]">
          <label className="text-sm text-gray-700 w-50">Reporting Item Name</label>
          <div className="relative w-full">
            <input type="text" placeholder="reporting item name" value={reportingItem.reportingItemName || ""} onChange={(e) =>
              setReportingItem((prev) => ({
                ...prev,
                reportingItemName: e.target.value,
              }))
            }
              className="w-full h-[32px] px-2 py-2 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
        </div>
        <div className="flex pt-[200px] gap-4">
          <button className="flex-1 bg-pink-600 px-4 py-1.3 rounded text-white h-[30px]" onClick={() => setIsOpenAddReportingItem(false)} >Cancel</button>
          <button className="flex-1 bg-green-500 px-4 py-1.3 rounded text-white h-[30px]" onClick={submitReportingItemButton} > Submit</button>
        </div>
      </div>
      {/* End Right-Side Add New reporting item Drawer */}

      {/* Start Right-Side Edit reporting item Drawer */}
      {isOpenEditReportingItem && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 backdrop-blur-sm z-40"></div>
      )}

      <div
        className={`fixed right-0 top-0 w-full sm:w-3/4 md:w-1/3 lg:w-1/3 h-screen border border-blue-500 pl-5 p-3 bg-white transform transition-transform duration-300 ${isOpenEditReportingItem ? "translate-x-0" : "translate-x-full"
          } z-50 overflow-y-auto`}
      >
        {selectedReportingItem && (
          <>
            <div className="pb-[20px]">
              <div className="border-b border-blue-300 w-full pb-1">
                <label className="text-gray-500 p-1 text-lg">Edit Reporting Item</label>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-40">Account Type</label>

              <div className="relative w-full">
                <select
                  value={selectedReportingItem?.accountTypeID ?? ""}
                  onChange={(e) => {
                    const newValue = Number(e.target.value);

                    setSelectedReportingItem((prev) => ({
                      ...prev,
                      accountTypeID: newValue,
                      controlItemCode: "", // reset control item because account type changed
                    }));

                    loadControlItemsByAccountType(newValue); // 🔥 reload filtered control items
                  }}
                  className="w-full px-2 py-1 h-8 rounded border border-blue-300 
                 text-gray-700 bg-white appearance-none 
                 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select Account Type</option>

                  {accountTypes.map((t) => (
                    <option key={t.accountTypeID} value={t.accountTypeID}>
                      {t.accountTypeName}
                    </option>
                  ))}
                </select>

                {/* Correct positioned icon */}
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>
            </div>



            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-40">Control Item</label>

              <div className="relative w-full">
                <select
                  value={selectedReportingItem?.controlItemCode ?? ""}
                  disabled={controlItems.length === 0}
                  onChange={(e) =>
                    setSelectedReportingItem((prev) => ({
                      ...prev,
                      controlItemCode: e.target.value,
                    }))
                  }
                  className="w-full px-2 py-1 h-8 rounded border border-blue-300 
                 text-gray-700 bg-white appearance-none 
                 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select Control Item</option>

                  {controlItems.map((c) => (
                    <option key={c.controlItemCode} value={c.controlItemCode}>
                      {c.controlItemName}
                    </option>
                  ))}
                </select>

                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 
                            w-5 h-5 text-gray-500 pointer-events-none" />
              </div>
            </div>



            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-50">Reporting Item Code</label>
              <div className="relative w-full">
                <input
                  type="text"
                  value={selectedReportingItem?.reportingItemCode ?? ""}
                  readOnly
                  className="w-full h-[32px] px-2 py-2 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-50">Reporting Item Name</label>
              <div className="relative w-full">
                <input
                  type="text"
                  value={selectedReportingItem?.reportingItemName ?? ""}
                  onChange={(e) =>
                    setSelectedReportingItem({
                      ...selectedReportingItem,
                      reportingItemName: e.target.value,
                    })
                  }
                  className="w-full h-[32px] px-2 py-2 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
            </div>





            <div className="flex pt-[200px] gap-4">
              <button
                className="flex-1 bg-pink-600 px-4 py-1.3 rounded text-white h-[30px]"
                onClick={() => setIsOpenEditReportingItem(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-green-500 px-4 py-1.3 rounded text-white h-[30px]"
                onClick={() => submitUpdateReportingItemButton(selectedReportingItem)}
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

export default ReportingItems;