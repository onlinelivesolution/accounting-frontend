import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Select from "react-select";

/* =======================
   Interfaces
======================= */

export interface JournalRow {
    rowId: number;
    debitItemCode?: string | null;
    creditItemCode?: string | null;
    amount: number;
    vatRate: number;
    vatAmount: number;
    totalAmount: number;
    referenceNo?: string;
    description?: string;
}

export interface DetailItemOption {
    detailItemCode: string;
    detailItemName: string;
    reportingItemName: string;
}

/* =======================
   Empty Row Factory
======================= */

const emptyRow = (id: number): JournalRow => ({
    rowId: id,
    debitItemCode: null,
    creditItemCode: null,
    amount: 0,
    vatRate: 0,
    vatAmount: 0,
    totalAmount: 0,
    referenceNo: "",
    description: ""
});

/* =======================
   DetailItemDropdown
======================= */

interface DropdownProps {
    value?: string | null;
    options: DetailItemOption[];
    onChange: (value: string | null) => void;
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
                acc[item.reportingItemName] = { label: item.reportingItemName, options: [] };
            }
            acc[item.reportingItemName].options.push({
                value: item.detailItemCode,
                label: `${item.detailItemCode} - ${item.detailItemName}`
            });
            return acc;
        }, {})
    );

    const selectedOption =
        groupedOptions.flatMap(g => g.options).find(o => o.value === value) || null;

    return (
        <Select
            options={groupedOptions}
            value={selectedOption}
            onChange={(opt) => onChange(opt?.value ?? null)}
            placeholder={placeholder}
            isSearchable
            isClearable
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
                menuPortal: base => ({ ...base, zIndex: 9999 }),
                container: base => ({ ...base, width: "100%" })
            }}
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
    const [rows, setRows] = useState<JournalRow[]>([emptyRow(1)]);

    /* =======================
       Load Accounts
    ======================== */

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            const res = await axios.get(
                "http://127.0.0.1:8000/api/common/loadDetailItems"
            );
            setDebitAccounts(res.data);
            setCreditAccounts(res.data);
        } catch (error) {
            console.error("Error loading accounts:", error);
        }
    };

    /* =======================
       VAT Calculations
    ======================== */

    const calculateVat = (amount: number, rate: number) => {
        const vatAmount = (amount * rate) / 100;
        return {
            vatAmount: Number(vatAmount.toFixed(2)),
            totalAmount: Number((amount + vatAmount).toFixed(2))
        };
    };

    const onAmountChange = (rowId: number, amount: number) => {
        setRows(prev =>
            prev.map(r => {
                if (r.rowId !== rowId) return r;
                const { vatAmount, totalAmount } = calculateVat(amount, r.vatRate);
                return { ...r, amount, vatAmount, totalAmount };
            })
        );
    };

    const onVatRateChange = (rowId: number, vatRate: number) => {
        setRows(prev =>
            prev.map(r => {
                if (r.rowId !== rowId) return r;
                const { vatAmount, totalAmount } = calculateVat(r.amount, vatRate);
                return { ...r, vatRate, vatAmount, totalAmount };
            })
        );
    };

    /* =======================
       Row Helpers
    ======================== */

    const addRowBelow = (rowId: number) => {
        setRows(prev => {
            const index = prev.findIndex(r => r.rowId === rowId);
            const newRow = emptyRow(Date.now());
            const updated = [...prev];
            updated.splice(index + 1, 0, newRow);
            return updated;
        });
    };

    const removeRow = (rowId: number) => {
        if (rows.length === 1) return;
        setRows(prev => prev.filter(r => r.rowId !== rowId));
    };

    const isDuplicateCombination = (rowId: number, debit?: string | null, credit?: string | null) =>
        rows.some(r => r.rowId !== rowId && r.debitItemCode === debit && r.creditItemCode === credit);

    const updateRow = (id: number, field: keyof JournalRow, value: any) => {
        setRows(prev =>
            prev.map(r => {
                if (r.rowId !== id) return r;

                const newDebit = field === "debitItemCode" ? value : r.debitItemCode;
                const newCredit = field === "creditItemCode" ? value : r.creditItemCode;

                if ((field === "debitItemCode" || field === "creditItemCode") && newDebit && newCredit) {
                    if (newDebit === newCredit) {
                        toast.error("Debit and Credit account cannot be same");
                        return r;
                    }
                    if (isDuplicateCombination(id, newDebit, newCredit)) {
                        toast.error("This Debit & Credit combination already exists");
                        return r;
                    }
                }

                let updatedRow = { ...r, [field]: value };

                if (field === "amount" || field === "vatRate") {
                    const amount = field === "amount" ? Number(value) : r.amount;
                    const vatRate = field === "vatRate" ? Number(value) : r.vatRate;
                    const { vatAmount, totalAmount } = calculateVat(amount, vatRate);
                    updatedRow = { ...updatedRow, amount, vatRate, vatAmount, totalAmount };
                }

                return updatedRow;
            })
        );
    };

    /* =======================
       Validation
    ======================== */

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
    ======================== */

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
                vatRate: r.vatRate,
                vatAmount: r.vatAmount,
                totalAmount: r.totalAmount,
                narration: r.description
            }))
        };

        try {
            await axios.post(
                "http://127.0.0.1:8000/api/commonjournal/createGeneralJournalEntry",
                payload
            );
            toast.success("Journal Entry saved successfully");
            // reset
            setRows([emptyRow(1)]);
            setReferenceNo("");
            setDescription("");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save journal entry");
        }
    };

    /* =======================
       JSX
    ======================== */

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
            <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 text-left">Debit Account *</th>
                        <th className="p-2 text-left">Credit Account *</th>
                        <th className="p-2 text-center">VAT Rate</th>
                        <th className="p-2 text-center">Amount *</th>
                        <th className="p-2 text-center">VAT Amount</th>
                        <th className="p-2 text-center">Total Amount</th>
                        <th className="p-2 w-20 text-center">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {rows.map(row => (
                        <tr key={row.rowId}>
                            <td className="p-1 w-60">
                                <DetailItemDropdown
                                    options={debitAccounts}
                                    value={row.debitItemCode}
                                    placeholder="Debit account"
                                    onChange={v => updateRow(row.rowId, "debitItemCode", v)}
                                />
                            </td>
                            <td className="p-1 w-60">
                                <DetailItemDropdown
                                    options={creditAccounts}
                                    value={row.creditItemCode}
                                    placeholder="Credit account"
                                    onChange={v => updateRow(row.rowId, "creditItemCode", v)}
                                />
                            </td>
                            <td className="p-1 w-32">
                                <select
                                    className="w-full h-8 border rounded px-2 text-sm"
                                    value={row.vatRate ?? 0}
                                    onChange={e => onVatRateChange(row.rowId, Number(e.target.value))}
                                >
                                    <option value={0}>None</option>
                                    <option value={15}>VAT 15%</option>
                                    <option value={10}>VAT 10%</option>
                                    <option value={5}>VAT 5%</option>
                                </select>
                            </td>
                            <td className="p-1 w-40">
                                <input
                                    type="number"
                                    className="w-full h-8 text-right border rounded px-2"
                                    value={row.amount}
                                    onChange={e => onAmountChange(row.rowId, Number(e.target.value))}
                                />
                            </td>
                            <td className="p-1 w-32 text-right">
                                <input
                                    type="text"
                                    readOnly
                                    value={row.vatAmount.toFixed(2)}
                                    className="w-full h-8 border rounded px-2 bg-gray-100 text-right"
                                />
                            </td>
                            <td className="p-1 w-40 text-right">
                                <input
                                    type="text"
                                    readOnly
                                    value={row.totalAmount.toFixed(2)}
                                    className="w-full h-8 border rounded px-2 bg-gray-100 text-right"
                                />
                            </td>
                            <td className="p-1 text-center">
                                <div className="flex justify-center gap-2">
                                    <button
                                        onClick={() => addRowBelow(row.rowId)}
                                        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-700"
                                        title="Add row below"
                                    >
                                        A
                                    </button>
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
            <div className="flex justify-end mt-4">
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
