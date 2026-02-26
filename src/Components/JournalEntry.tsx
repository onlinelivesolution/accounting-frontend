import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown } from "lucide-react";
import DatePicker from "react-datepicker";
import { Calendar } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import Select from "react-select";


interface VatRates {
    id: number;
    name: string;
}

export interface JournalRow {
    rowId: number;
    debitItemCode: string;
    creditItemCode: string;
    amount: number;
    vATRateID: number;
    vatPercent: number;  // ✅ ID, not percent
    vatAmount: number;
    totalAmount: number;
    narration?: string;
    description?: string;
}


export interface DetailItemOption {
    detailItemCode: string;
    detailItemName: string;
    reportingItemName: string;
}


const emptyRow = (id: number): JournalRow => ({
    rowId: id,
    debitItemCode: "",
    creditItemCode: "",
    amount: 0,
    vATRateID: 0,
    vatPercent: 0,
    vatAmount: 0,
    totalAmount: 0,
    narration: "",
    description: ""
});



const customSelectStyles = {
    control: (base: any, state: any) => ({
        ...base,
        minHeight: "30px",
        borderColor: state.isFocused ? "#0a0f18ff" : "#9ca3af", // blue / gray
        boxShadow: state.isFocused ? "0 0 0 1px #1c1f24ff" : "none",
        "&:hover": {
            borderColor: "#0c1320ff"
        },
        fontSize: "0.875rem"
    }),

    option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isSelected
            ? "#2563eb"
            : state.isFocused
                ? "#dbeafe"
                : "white",
        color: state.isSelected ? "white" : "#111827",
        fontSize: "0.875rem",
        cursor: "pointer"
    }),

    singleValue: (base: any) => ({
        ...base,
        color: "#111827" // selected text color
    }),

    placeholder: (base: any) => ({
        ...base,
        color: "#6b7280" // placeholder color
    }),

    menu: (base: any) => ({
        ...base,
        zIndex: 9999
    })
};

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
            value={
                groupedOptions
                    .flatMap(g => g.options)
                    .find(o => o.value === value) || null
            }
            onChange={(e) => onChange(e?.value || "")}
            placeholder={placeholder}
            isSearchable
            styles={customSelectStyles}
            className="text-sm"
        />
    );
};

const JournalEntry: React.FC = () => {
    const [vaterateID, setVaterateID] = useState<number | null>(null);
    const [journalDate, setJournalDate] = useState<Date | null>(new Date());
    const [referenceNo, setReferenceNo] = useState("");
    const [description, setDescription] = useState("");
    const [debitAccounts, setDebitAccounts] = useState<DetailItemOption[]>([]);
    const [creditAccounts, setCreditAccounts] = useState<DetailItemOption[]>([]);
    const [rows, setRows] = useState<JournalRow[]>([emptyRow(1)]);
    const [vatRatess, setVatRates] = useState<VatRates[]>([]);

    useEffect(() => {
        const loadVatRates = async () => {
            try {
                const response = await axios.get(
                    "http://127.0.0.1:8000/api/commondropdown/loadVatRateDropdown"
                );

                setVatRates(response.data);
            } catch (error) {
                console.error("Failed to load VAT rates", error);
            }
        };

        loadVatRates();
    }, []);

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

    const getVatRatePercent = (vatRateID: number): number => {
        if (!vatRateID) return 0;

        const vat = vatRatess.find(v => v.id === vatRateID);
        if (!vat) return 0;

        // Extract number from "VAT 15%"
        const match = vat.name.match(/\d+/);
        return match ? Number(match[0]) : 0;
    };

    const calculateVat = (amount: number, vatPercent: number) => {
        const vatAmount = +(amount * vatPercent / 100).toFixed(2);
        const totalAmount = +(amount + vatAmount).toFixed(2);
        return { vatAmount, totalAmount };
    };




    const onAmountChange = (rowId: number, value: string) => {
        const amount = Number(value) || 0;

        setRows(prev =>
            prev.map(r => {
                if (r.rowId !== rowId) return r;

                const vatPercent = getVatRatePercent(r.vATRateID);
                const { vatAmount, totalAmount } = calculateVat(amount, vatPercent);

                return {
                    ...r,
                    amount,
                    vatAmount,
                    totalAmount
                };
            })
        );
    };




    const onVatRateChange = (rowId: number, vatRateID: number) => {
        setRows(prev =>
            prev.map(r => {
                if (r.rowId !== rowId) return r;

                const vatPercent = getVatRatePercent(vatRateID);
                const { vatAmount, totalAmount } = calculateVat(r.amount, vatPercent);

                return {
                    ...r,
                    vatRateID,
                    vatAmount,
                    totalAmount
                };
            })
        );
    };


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

                const updated = { ...r, [field]: value };

                const vatPercent = getVatRatePercent(updated.vATRateID);
                const { vatAmount, totalAmount } = calculateVat(
                    Number(updated.amount) || 0,
                    vatPercent
                );

                return {
                    ...updated,
                    vatAmount,
                    totalAmount
                };
            })
        );
    };

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
    const submitJournal = async () => {
        if (!validateJournal()) return;

        const payload = {
            journalDate: journalDate
                ? new Date(journalDate).toISOString().split("T")[0]
                : null,
            journalType: "MANUAL",
            referenceNo: referenceNo || null,
            description: description || null,
            details: rows.map(r => {
                const vatPercent = getVatRatePercent(r.vATRateID);

                return {
                    debitItemCode: r.debitItemCode,
                    creditItemCode: r.creditItemCode,
                    amount: Number(r.amount),
                    vATRateID: Number(r.vATRateID),   // ONLY THIS
                    narration: r.description || null
                };
            })
        };

        // ✅ IMPORTANT: log payload clearly
        console.log("🚀 Journal Payload Sent From Frontend:");
        console.table(payload.details);
        console.log(JSON.stringify(payload, null, 2));

        try {
            await axios.post(
                "http://127.0.0.1:8000/api/commonjournal/createGeneralJournalEntry",
                payload
            );
            toast.success("Journal Entry saved successfully");
        } catch (error) {
            console.error("❌ API Error:", error);
            toast.error("Failed to save journal entry");
        }
    };

    return (
        <div className="p-6 bg-white rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Journal Entry</h2>

            {/* Header */}
            <div className="grid grid-cols-4 gap-4 mb-4">

                <div className="flex items-center gap-2">
                    <label className="w-40 text-sm">Journal Date</label>

                    <div className="relative w-[180px]">
                        <DatePicker
                            selected={journalDate}
                            onChange={setJournalDate}
                            dateFormat="yyyy-MM-dd"
                            popperPlacement="bottom-start"
                            popperClassName="z-50"
                            className="w-full h-[32px] px-2 rounded border border-gray-400 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                        />
                        <Calendar
                            size={16}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                        />
                    </div>
                </div>

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
            <table className="w-full border border-gray-400 rounded rounded-lg text-sm">
                <thead className="bg-blue-200">
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
                                <div className="relative w-full">
                                    <select
                                        value={row.vATRateID}
                                        onChange={e =>
                                            updateRow(row.rowId, "vATRateID", Number(e.target.value))
                                        }
                                        className="w-full h-[36px] px-2 pr-8 rounded border border-gray-400 text-sm appearance-none"
                                    >
                                        {vatRatess.map(v => (
                                            <option key={v.id} value={v.id}>
                                                {v.name}
                                            </option>
                                        ))}
                                    </select>
                                    {/* Dropdown Arrow */}
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                                    />
                                </div>
                            </td>

                            <td className="p-1 w-40">
                                <input
                                    type="number"
                                    value={row.amount}
                                    onChange={e => onAmountChange(row.rowId, e.target.value)}
                                    className="w-full h-8 px-2 rounded border border-gray-400"
                                />
                            </td>
                            <td className="p-1 w-32 text-right">
                                <input
                                    type="text"
                                    readOnly
                                    value={row.vatAmount.toFixed(2)}
                                    className="w-full h-9 text-right border rounded px-2 border-gray-400"
                                />
                            </td>
                            <td className="p-1 w-40 text-right">
                                <input
                                    type="text"
                                    readOnly
                                    value={row.totalAmount.toFixed(2)}
                                    className="w-full h-9 text-right border rounded px-2 border-gray-400"
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
