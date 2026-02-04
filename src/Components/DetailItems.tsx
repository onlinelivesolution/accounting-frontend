import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronDown } from "lucide-react";

interface DetailItem {
  reportingItemCode?: string;
  detailItemName?: string;
  detailItemCode?: string;
  reportingItemName?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdBy?: string;
  createdDate?: string | null;
  updatedBy?: string;
  updatedDate?: string | null;
  companyCode?: string;
  companyName?: string;
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

interface ReportingItem {
  reportingItemCode: string;
  reportingItemName: string;
}

interface DefaultAccountsOption {
  id: number;
  name: string;
}

interface AdvanceOrDueAccountsOption {
  id: number;
  name: string;
}

const DetailItems: React.FC = () => {
  const [detailItems, setDetailItems] = useState<DetailItem[]>([]);
  const [selectedDetailItems, setSelectedDetailItems] = useState<string[]>([]);
  const [isOpenAddDetailItem, setIsOpenAddDetailItem] = useState(false);
  const [nextCode, setNextCode] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [defaultAccounts, setDefaultAccounts] = useState<DefaultAccountsOption[]>([]);
  const [selectedDefaultAccounts, setSelectedDefaultAccounts] = useState<number>(1);

  const [advanceOrDueAccounts, setAdvanceOrDueAccounts] = useState<AdvanceOrDueAccountsOption[]>([]);
  const [selectedAdvanceOrDueAccounts, setSelectedAdvanceOrDueAccounts] = useState<number>(1);

  const [selectedDetailItem, setSelectedDetailItem] = useState<DetailItem | null>(null);
  const [isOpenEditDetailItem, setIsOpenEditDetailItem] = useState(false);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [controlItems, setControlItems] = useState<ControlItem[]>([]);
  const [selectedReportingItemCode, setSelectedReportingItemCode] = useState<string>("");
  const [reportingItems, setReportingItems] = useState<ReportingItem[]>([]);

  const [errors, setErrors] = useState<{
    accountTypeID?: string;
    controlItemCode?: string;
    reportingItemCode?: string;
    detailItemName?: string;
  }>({});

  const validateInsertDetailItem = (item: typeof detailItem) => {
    const newErrors: typeof errors = {};

    if (!item.reportingItemCode) {
      newErrors.reportingItemCode = "Reporting Item is required";
    }

    if (!nextCode) {
      alert("Detail Item Code is required.");
      return;
    }

    if (!item.detailItemName || !item.detailItemName.trim()) {
      newErrors.detailItemName = "Detail Item Name is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

    const validateUpdateDetailItem = (item: typeof detailItem) => {
    const newErrors: typeof errors = {};

    if (!nextCode) {
      alert("Detail Item Code is required.");
      return;
    }

    if (!item.detailItemName || !item.detailItemName.trim()) {
      newErrors.detailItemName = "Detail Item Name is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const [reportingItem, setReportingItem] = useState({
    accountTypeID: "",
    controlItemCode: "",
    reportingItemCode: ""
  });

  const [detailItem, setDetailItem] = useState({
    accountTypeID: "",
    controlItemCode: "",
    reportingItemCode: "",
    detailItemCode: "",
    detailItemName: "",
  });

  // INSERT NEW DETAIL ITEM
  const submitInsertDetailItemButton = async () => {
    if (!validateInsertDetailItem(detailItem)) return;

    try {
      const detailItemData = {
        detailItemCode: detailItem.detailItemCode,
        companyCode: "01",
        accountID: selectedDefaultAccounts,
        reportingItemCode: detailItem.reportingItemCode,
        detailItemName: detailItem.detailItemName.trim(),
        isActive: 1,
        isDeleted: 0,
        createdBy: "admin",
        createdDate: new Date().toISOString(),
        accountStateID: selectedAdvanceOrDueAccounts,
      };

      console.log("Submitting:", detailItemData);

      const response = await fetch(
        "http://127.0.0.1:8000/api/detailitems/addNewDetailItem",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(detailItemData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${JSON.stringify(errorData)}`);
      } else {
        alert("✅ Detail item added successfully!");
        setIsOpenAddDetailItem(false);
        loadDetailItemTable();
      }
    } catch (error) {
      console.error("Insert error:", error);
      alert("❌ An error occurred while adding detail item.");
    }
  };


  // UPDATE DETAIL ITEM
  const submitUpdateDetailItemButton = async (item: DetailItem) => {
    const isValid = validateUpdateDetailItem({
      ...detailItem,
      detailItemName: item.detailItemName ?? "",
    });

    if (!isValid) return;
    try {
      const updatedData = {
        ...item,
        updatedBy: "admin",
        updatedDate: new Date().toISOString(),
      };

      const response = await axios.put(
        `http://127.0.0.1:8000/api/detailitems/updateDetailItem/${item.detailItemCode}`,
        updatedData
      );

      if (response.status === 200) {
        alert("✅ Detail item updated successfully!");
        loadDetailItemTable();
        setIsOpenEditDetailItem(false);
      } else {
        alert("❌ Failed to update detail item.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.detail || "Error updating detail item");
      } else {
        alert("Unexpected error occurred");
      }
    }
  };

  // 🔹 Load default accounts Options
  useEffect(() => {
    axios
      .get<DefaultAccountsOption[]>(
        "http://127.0.0.1:8000/api/common/loadDefaultAccounts"
      )
      .then((res) => setDefaultAccounts(res.data))
      .catch((err) => console.error("Failed to load default accounts:", err));
  }, []);

  // 🔹 Load account states Options
  useEffect(() => {
    axios
      .get<AdvanceOrDueAccountsOption[]>(
        "http://127.0.0.1:8000/api/common/loadAdvanceOrDueAccounts"
      )
      .then((res) => setAdvanceOrDueAccounts(res.data))
      .catch((err) => console.error("Failed to load advance or due accounts:", err));
  }, []);


  //Load the AccountType information in dropdown list.
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/common/loadAccountTypeDropdown")
      .then(response => setAccountTypes(response.data))
      .catch(error => console.error("Failed to load Account Type", error));
  }, []);

  //Handle control item data after selecting the account type dropdown.
  const handleAccountTypeChange = async (accountTypeID: string) => {
    setReportingItem({ accountTypeID, controlItemCode: "", reportingItemCode: "" });

    if (!accountTypeID) {
      setControlItems([]);
      setReportingItems([]);
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/common/getControlItemsByAccountType/${accountTypeID}`
      );
      const data = await res.json();
      setControlItems(data);
      setReportingItems([]); // reset reporting items
    } catch (err) {
      console.error("Error loading control items", err);
      setControlItems([]);
    }
  };

  // Load reporting items based on controlItemCode =====
  const handleControlItemChange = async (controlItemCode: string) => {
    setReportingItem(prev => ({ ...prev, controlItemCode, reportingItemCode: "" }));

    if (!controlItemCode) {
      setReportingItems([]);
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/common/getReportingItemsByControlItem/${controlItemCode}`
      );
      const data = await res.json();
      setReportingItems(data);
    } catch (err) {
      console.error("Error loading reporting items", err);
      setReportingItems([]);
    }
  };

  //Handle detail item code after selecting the reporting item dropdown.
  const handleReportingItemChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedReportingItemCode(code);

    setDetailItem((prev) => ({
      ...prev,
      reportingItemCode: code,
    }));

    if (code) {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/detailitems/getNextDetailItemCode/${code}`
        );
        const data = await response.json();

        setDetailItem((prev) => ({
          ...prev,
          detailItemCode: data.nextCode,   // ✅ FIXED
        }));
      } catch (error) {
        console.error("Error fetching next detail item code:", error);
      }
    }
  };

  // Load the detail item information in table grid.
  const loadDetailItemTable = async (pageNumber = 0) => {
    const skip = pageNumber * limit;
    const res = await fetch(`http://127.0.0.1:8000/api/detailitems/loadDetailItemTable?skip=${skip}&limit=${limit}`);
    const result = await res.json();
    setDetailItems(result);
    setTotal(result.total);
  };

  useEffect(() => {
    const load = async () => {
      await loadDetailItemTable(page);
    };

    load();
  }, [page]);

  // Handle check single single check box
  const handleCheckboxChange = (detailItemCode: string) => {
    setSelectedDetailItems((prevSelected) => {
      if (prevSelected.includes(detailItemCode)) {
        return prevSelected.filter((id) => id !== detailItemCode);
      } else {
        return [...prevSelected, detailItemCode];
      }
    });
  };

  // Handle Check all check boxes
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedDetailItems([]);
    } else {
      setSelectedDetailItems(
        detailItems
          .map((item) => item.detailItemCode || '')
          .filter((code) => code !== '')
      );
    }
    setSelectAll(!selectAll);
  };

  //Open the drawer loading the next detail item code.
  const handleOpenAddDetailItem = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/detailitems/getNextDetailItemCode");
      const data = await res.json();
      setNextCode(data);
    } catch (err) {
      console.error("Failed to fetch next detail item code", err);
      setNextCode("01");
    }
    setIsOpenAddDetailItem(true);
  };

  //Get the detail item code after selecting the reporting item code
  useEffect(() => {
    if (!selectedReportingItemCode) return;

    const loadNextCode = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/detailitems/getNextDetailItemCode/${selectedReportingItemCode}`
        );

        setDetailItem((prev) => ({
          ...prev,
          detailItemCode: res.data.nextCode,   // ✅ FIXED
        }));
      } catch (err) {
        console.error("Failed to load next detail item code", err);
      }
    };

    loadNextCode();
  }, [selectedReportingItemCode]);


  return (
    <div className="grid grid-cols-6 gap-4 pt-1">
      <div className="grid grid-cols-6 col-span-6 bg-white p-4 border border-blue-300 rounded-lg gap-2">
        {/* Header Section */}
        <div className="col-span-6 flex flex-wrap items-center justify-between mb-2 gap-2">

          <label className="text-gray-700 p-1 text-lg font-bold whitespace-nowrap">
            Manage Detail Item
          </label>
          <button
            className="min-w-[100px] h-[32px] bg-white text-blue-800 rounded border border-blue-800 hover:bg-blue-400 hover:text-white"
            onClick={() => handleOpenAddDetailItem()}
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
                <th className="w-[250px] p-2 border-b border-blue-300 text-left">Detail Item Code</th>
                <th className="w-[250px] p-2 border-b border-blue-300 text-left">Detail Item Name</th>
                <th className="w-[250px] p-2 border-b border-blue-300 text-left">Reporting Item Name</th>
                <th className="w-[250px] p-2 border-b border-blue-300 text-left">Company Name</th>
                <th className="w-[100px] p-2 border-b border-blue-300 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {detailItems?.map((detailItem) => (
                <tr key={detailItem.detailItemCode} className="hover:bg-blue-50">
                  <td className="w-[50px] h-[10px] py-1 px-1 pl-[12px] text-center text-sm border-b border-blue-300 border-l border-blue-300 text-left">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-blue-500"
                      checked={selectedDetailItems.includes(detailItem.detailItemCode || '')}
                      onChange={() => handleCheckboxChange(detailItem.detailItemCode || '')}
                    />
                  </td>
                  <td className="w-[250px] p-2 border-b border-blue-300">{detailItem.detailItemCode}</td>
                  <td className="w-[250px] p-2 border-b border-blue-300">{detailItem.detailItemName}</td>
                  <td className="w-[250px] p-2 border-b border-blue-300">{detailItem.reportingItemName}</td>
                  <td className="w-[250px] p-2 border-b border-blue-300">{detailItem.companyName}</td>
                  <td className="w-[100px] p-2 border-b border-blue-300 relative">
                    <button
                      onClick={() => {
                        setSelectedDetailItem(detailItem);
                        setIsOpenEditDetailItem(true);
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
      {/* Start Right-Side Add New detail item Drawer */}
      {isOpenAddDetailItem && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 backdrop-blur-sm z-40"></div>
      )}

      <div className={`fixed right-0 top-0 w-full sm:w-3/4 md:w-1/3 lg:w-1/3 h-screen border border-blue-500 pl-5 p-3 bg-white transform transition-transform duration-300 ${isOpenAddDetailItem ? "translate-x-0" : "translate-x-full"} z-50 overflow-y-auto`} >
        <div className='pb-[20px]'>
          <div className='border-b border-blue-300 w-full pb-1'>
            <label className='text-gray-500 p-1 text-lg'>Add Detail Item</label>
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
            <ChevronDown className="absolute inset-y-1.5 right-2 w-5.5 h-5.5 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Control Item (Add) */}
        <div className="flex items-center gap-3 mb-3 mt-[15px]">
          <label className="text-sm text-gray-700 w-50">Control Item</label>
          <div className="relative w-full">
            <select
              value={reportingItem.controlItemCode}
              onChange={(e) => handleControlItemChange(e.target.value)}
              disabled={controlItems.length === 0}
              className="w-full px-2 py-1 h-8 rounded border border-blue-300 text-gray-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200"
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
          <label className="text-sm text-gray-700 w-50">Reporting Item</label>
          <div className="relative w-full">
            <select
              value={selectedReportingItemCode}
              onChange={handleReportingItemChange}
              className="w-full px-2 py-1 h-8 rounded border border-blue-300 text-gray-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Select Reporting Item</option>
              {reportingItems.map((ri) => (
                <option key={ri.reportingItemCode} value={ri.reportingItemCode}>
                  {ri.reportingItemName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute inset-y-1.5 right-2 w-5.5 h-5.5 text-gray-500 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-3 mb-3 mt-[15px]">
          <label className="text-sm text-gray-700 w-50">Default Account</label>
          <div className="relative w-full">

            <select
              value={selectedDefaultAccounts}
              onChange={(e) => setSelectedDefaultAccounts(Number(e.target.value))}
              className="w-full px-2 py-1 h-8 rounded border border-blue-300 text-gray-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {defaultAccounts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute inset-y-1.5 right-2 w-5.5 h-5.5 text-gray-500 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-3 mb-3 mt-[15px]">
          <label className="text-sm text-gray-700 w-50">Account State</label>
          <div className="relative w-full">

            <select
              value={selectedAdvanceOrDueAccounts}
              onChange={(e) => setSelectedAdvanceOrDueAccounts(Number(e.target.value))}
              className="w-full px-2 py-1 h-8 rounded border border-blue-300 text-gray-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {advanceOrDueAccounts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute inset-y-1.5 right-2 w-5.5 h-5.5 text-gray-500 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-3 mb-3 mt-[15px]">
          <label className="text-sm text-gray-700 w-50">Detail Item Code</label>
          <div className="relative w-full">
            <input
              type="text"
              value={detailItem.detailItemCode ?? ""}
              readOnly
              className="w-full h-[32px] px-2 py-2 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

          </div>
        </div>


        <div className="flex items-center gap-3 mb-3 mt-[15px]">
          <label className="text-sm text-gray-700 w-50">Detail Item Name</label>
          <div className="relative w-full">
            <input type="text" placeholder="detail item name" value={detailItem.detailItemName || ""} onChange={(e) =>
              setDetailItem((prev) => ({
                ...prev,
                detailItemName: e.target.value,
              }))
            }
              className="w-full h-[32px] px-2 py-2 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
        </div>


        <div className="flex pt-[200px] gap-4">
          <button className="flex-1 bg-pink-600 px-4 py-1.3 rounded text-white h-[30px]" onClick={() => setIsOpenAddDetailItem(false)} >Cancel</button>
          <button className="flex-1 bg-green-500 px-4 py-1.3 rounded text-white h-[30px]" onClick={submitInsertDetailItemButton} > Submit</button>
        </div>
      </div>
      {/* End Right-Side Add New control item Drawer */}

      {/* Start Right-Side Edit control item Drawer */}
      {isOpenEditDetailItem && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 backdrop-blur-sm z-40"></div>
      )}

      <div
        className={`fixed right-0 top-0 w-full sm:w-3/4 md:w-1/3 lg:w-1/3 h-screen border border-blue-500 pl-5 p-3 bg-white transform transition-transform duration-300 ${isOpenEditDetailItem ? "translate-x-0" : "translate-x-full"
          } z-50 overflow-y-auto`}
      >
        {selectedDetailItem && (
          <>
            <div className="pb-[20px]">
              <div className="border-b border-blue-300 w-full pb-1">
                <label className="text-gray-500 p-1 text-lg">Edit Detail Item</label>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-50">Detail Item Code</label>
              <div className="relative w-full">
                <input
                  type="text"
                  value={selectedDetailItem?.detailItemCode ?? ""}
                  readOnly
                  className="w-full h-[32px] px-2 py-2 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />

              </div>
            </div>

            <div className="flex items-center gap-3 mb-3 mt-[15px]">
              <label className="text-sm text-gray-700 w-50">Detail Item Name</label>
              <div className="relative w-full">
                <input
                  type="text"
                  value={selectedDetailItem?.detailItemName ?? ""}
                  onChange={(e) =>
                    setSelectedDetailItem({
                      ...selectedDetailItem,
                      detailItemName: e.target.value,
                    })
                  }
                  className="w-full h-[32px] px-2 py-2 rounded border border-blue-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
            </div>

            {errors.detailItemName && (
              <p className="text-red-500 text-xs mt-1">{errors.detailItemName}</p>
            )}

            <div className="flex pt-[200px] gap-4">
              <button
                className="flex-1 bg-pink-600 px-4 py-1.3 rounded text-white h-[30px]"
                onClick={() => setIsOpenEditDetailItem(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-green-500 px-4 py-1.3 rounded text-white h-[30px]"
                onClick={() => submitUpdateDetailItemButton(selectedDetailItem)}
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

export default DetailItems;