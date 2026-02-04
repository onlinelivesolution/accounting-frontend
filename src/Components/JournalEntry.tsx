import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Select from "react-select";

/* =======================
   Interfaces
======================= */

export interface JournalRow {
    rowId: number;
    journalDate?: string;
    debitItemCode?: string;
    creditItemCode?: string;
    amount?: number;
    referenceNo?: string;
    description?: string;
}

export interface DetailItemOption {
    detailItemCode: string;
    detailItemName: string;
    reportingItemName: string;
}


/* =======================
   Searchable Dropdown
======================= */

interface DropdownProps {
    value?: string;
    options: DetailItemOption[];
    onChange: (value: string) => void;
    placeholder: string;
}

const DetailItemDropdown: React.FC<DropdownProps> = ({
    value,
    options,
    onChange,
    placeholder
}) => {

    const groupedOptions = Object.values(
        options.reduce((acc: any, item) => {
            if (!acc[item.reportingItemName]) {
                acc[item.reportingItemName] = {
                    label: item.reportingItemName,
                    options: []
                };
            }

            acc[item.reportingItemName].options.push({
                value: item.detailItemCode,
                label: `${item.detailItemCode} - ${item.detailItemName}`
            });

            return acc;
        }, {})
    );

    return (
        <Select
            options={groupedOptions}
            value={
                groupedOptions
                    .flatMap(g => g.options)
                    .find(o => o.value === value) || null
            }
            onChange={(e) => onChange(e?.value || "")}
            placeholder={placeholder}
            isSearchable
            className="text-sm"
        />
    );
};


/* =======================
   Main Component
======================= */

const JournalEntry: React.FC = () => {

    const [journalDate, setJournalDate] = useState("");
    const [referenceNo, setReferenceNo] = useState("");
    const [description, setDescription] = useState("");

    const [debitAccounts, setDebitAccounts] = useState<DetailItemOption[]>([]);
    const [creditAccounts, setCreditAccounts] = useState<DetailItemOption[]>([]);

    const [rows, setRows] = useState<JournalRow[]>([
        { rowId: 1 }
    ]);



    useEffect(() => {
        loadDebitAccounts();
        loadCreditAccounts();
    }, []);

    const loadDebitAccounts = async () => {
        const res = await axios.get(
            "http://127.0.0.1:8000/api/common/loadDetailItems"
        );
        setDebitAccounts(res.data);
    };

    const loadCreditAccounts = async () => {
        const res = await axios.get(
            "http://127.0.0.1:8000/api/common/loadDetailItems"
        );
        setCreditAccounts(res.data);
    };

    /* =======================
       Row Helpers
    ======================= */

    const addRowBelow = (rowId: number) => {
        setRows(prev => {
            const index = prev.findIndex(r => r.rowId === rowId);
            const newRow: JournalRow = {
                rowId: Date.now() // unique id
            };

            const updated = [...prev];
            updated.splice(index + 1, 0, newRow);

            return updated;
        });
    };


    const updateRow = (id: number, field: keyof JournalRow, value: any) => {
        setRows(prev =>
            prev.map(r => {
                if (r.rowId !== id) return r;

                const newDebit =
                    field === "debitItemCode" ? value : r.debitItemCode;
                const newCredit =
                    field === "creditItemCode" ? value : r.creditItemCode;

                // Same account check
                if (newDebit && newCredit && newDebit === newCredit) {
                    toast.error("Debit and Credit account cannot be same");
                    return r;
                }

                // Duplicate row check
                if (isDuplicateCombination(id, newDebit, newCredit)) {
                    toast.error("This Debit & Credit combination already exists");
                    return r;
                }

                return { ...r, [field]: value };
            })
        );
    };



    const removeRow = (rowId: number) => {
        if (rows.length === 1) return;

        setRows(prev => prev.filter(r => r.rowId !== rowId));
    };

    const isDuplicateCombination = (
        rowId: number,
        debit?: string,
        credit?: string
    ) => {
        return rows.some(r =>
            r.rowId !== rowId &&
            r.debitItemCode === debit &&
            r.creditItemCode === credit
        );
    };

    /* =======================
       Validation
    ======================= */

    const validateJournal = () => {
        if (!journalDate) {
            toast.error("Journal date is required");
            return false;
        }

        for (const row of rows) {
            if (!row.debitItemCode || !row.creditItemCode || !row.amount || row.amount <= 0) {
                toast.error("Debit, Credit and Amount are mandatory in all rows");
                return false;
            }
        }
        return true;
    };

    /* =======================
       Submit
    ======================= */

    const submitJournal = async () => {
        if (!validateJournal()) return;

        const payload = {
            journalDate,
            journalType: "MANUAL",
            referenceNo: referenceNo || null,
            description: description || null,
            details: rows.map(r => ({
                debitItemCode: r.debitItemCode,
                creditItemCode: r.creditItemCode,
                amount: r.amount,
                narration: r.description
            }))
        };

        await axios.post(
            "http://127.0.0.1:8000/api/commonjournal/createGeneralJournalEntry",
            payload
        );

        toast.success("Journal Entry saved successfully");

        // reset
        setRows([{ rowId: 1 }]);
        setReferenceNo("");
        setDescription("");
    };


    return (
        <div className="p-6 bg-white rounded shadow">

            <h2 className="text-lg font-semibold mb-4">Journal Entry</h2>

            {/* Header */}
            <div className="grid grid-cols-4 gap-4 mb-4">
                <input
                    type="date"
                    value={journalDate}
                    onChange={e => setJournalDate(e.target.value)}
                    className="border px-2 h-8 rounded text-sm"
                />

                <input
                    type="text"
                    placeholder="Reference No"
                    value={referenceNo}
                    onChange={e => setReferenceNo(e.target.value)}
                    className="border px-2 h-8 rounded text-sm"
                />

                <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="border px-2 h-8 rounded text-sm col-span-2"
                />
            </div>

            {/* Table */}
            <table className="w-full border border-gray-500 text-sm">
                <thead className="bg-blue-200">
                    <tr>
                        <th className="p-2 text-left">Debit Account *</th>
                        <th className="p-2 text-left">Credit Account *</th>
                        <th className="p-2 text-center">Amount *</th>
                        <th className="p-2 text-left">Reference No</th>
                        <th className="p-2 text-left">Description</th>
                        <th className="p-2 w-20 text-center">Action</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {rows.map(row => (
                        <tr key={row.rowId}>
                            <td className="p-1 w-60 text-gray-800 text-sm">
                                <DetailItemDropdown
                                    options={debitAccounts}
                                    value={row.debitItemCode}
                                    placeholder="Debit account"
                                    onChange={(v) =>
                                        updateRow(row.rowId, "debitItemCode", v)
                                    }
                                />
                            </td>

                            <td className="p-1 w-60 text-sm text-gray-800">
                                <DetailItemDropdown
                                    options={creditAccounts}
                                    value={row.creditItemCode}
                                    placeholder="Credit account"
                                    onChange={(v) =>
                                        updateRow(row.rowId, "creditItemCode", v)
                                    }

                                />
                            </td>

                            <td className="p-1 w-40">
                                <input
                                    type="number"
                                    className="w-full h-8 text-right border rounded px-2 border-gray-500"
                                    value={row.amount || ""}
                                    onChange={(e) =>
                                        updateRow(
                                            row.rowId,
                                            "amount",
                                            Number(e.target.value)
                                        )
                                    }
                                />
                            </td>

                            <td className="p-1 w-60">
                                <input
                                    type="text"
                                    className="w-full h-8 border rounded px-2"
                                    onChange={(e) =>
                                        updateRow(
                                            row.rowId,
                                            "referenceNo",
                                            e.target.value
                                        )
                                    }
                                />
                            </td>
                            <td className="p-1">
                                <input
                                    type="text"
                                    className="w-full h-8 border rounded px-2"
                                    onChange={(e) =>
                                        updateRow(
                                            row.rowId,
                                            "description",
                                            e.target.value
                                        )
                                    }
                                />
                            </td>

                            <td className="p-1 text-center">
                                <div className="flex justify-center gap-2">

                                    {/* Add Row */}
                                    <button
                                        onClick={() => addRowBelow(row.rowId)}
                                        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-700"
                                        title="Add row below"
                                    >
                                        A
                                    </button>

                                    {/* Delete Row */}
                                    <button
                                        onClick={() => removeRow(row.rowId)}
                                        className={`px-2 py-1 rounded text-white ${rows.length === 1
                                            ? "bg-gray-300 cursor-not-allowed"
                                            : "bg-red-500 hover:bg-red-600"
                                            }`}
                                        disabled={rows.length === 1}
                                        title="Delete row"
                                    >
                                        D
                                    </button>

                                </div>
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Footer */}
            <div className="flex items-right mt-4">
                <button
                    onClick={submitJournal}
                    className="px-6 py-1 bg-green-600 text-white rounded"
                >
                    Save Journal
                </button>
            </div>
        </div>
    );
};

export default JournalEntry;
