import React, { useState, useEffect } from "react";
import api from "@/utils/axios";

interface RuleDetail {
    accountCode: string;
    entryType: string;
    amountSource: string;
}

const AccountingRuleSettings = () => {

    const [ruleCode, setRuleCode] = useState("");
    const [moduleName, setModuleName] = useState("");
    const [description, setDescription] = useState("");

    const [details, setDetails] = useState<RuleDetail[]>([
        { accountCode: "", entryType: "DEBIT", amountSource: "" }
    ]);

    const [accounts, setAccounts] = useState<any[]>([]);

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        const res = await api.get("/api/chartofaccounts");
        setAccounts(res.data);
    };

    const addRow = () => {
        setDetails([
            ...details,
            { accountCode: "", entryType: "DEBIT", amountSource: "" }
        ]);
    };

    const removeRow = (index: number) => {
        const rows = [...details];
        rows.splice(index, 1);
        setDetails(rows);
    };

    const handleChange = (
        index: number,
        field: keyof RuleDetail,
        value: string
    ) => {

        const rows = [...details];
        rows[index][field] = value;
        setDetails(rows);
    };

    const saveRule = async () => {

        const payload = {
            ruleCode,
            moduleName,
            description,
            details
        };

        await api.post("/api/accounting-rules", payload);

        alert("Accounting rule saved successfully");
    };

    return (
        <div className="p-6">

            <h2 className="text-xl font-semibold mb-4">
                Accounting Rule Setup
            </h2>

            {/* Header Section */}

            <div className="grid grid-cols-3 gap-4 mb-6">

                <input
                    placeholder="Rule Code"
                    value={ruleCode}
                    onChange={(e) => setRuleCode(e.target.value)}
                    className="border p-2 rounded"
                />

                <input
                    placeholder="Module Name"
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    className="border p-2 rounded"
                />

                <input
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border p-2 rounded"
                />

            </div>

            {/* Rule Detail Table */}

            <table className="w-full border">

                <thead className="bg-gray-100">

                    <tr>
                        <th className="border p-2">Account</th>
                        <th className="border p-2">Entry Type</th>
                        <th className="border p-2">Amount Source</th>
                        <th className="border p-2">Action</th>
                    </tr>

                </thead>

                <tbody>

                    {details.map((row, index) => (

                        <tr key={index}>

                            <td className="border p-2">

                                <select
                                    value={row.accountCode}
                                    onChange={(e) =>
                                        handleChange(index, "accountCode", e.target.value)
                                    }
                                    className="w-full border p-1"
                                >

                                    <option value="">Select Account</option>

                                    {accounts.map((acc) => (
                                        <option
                                            key={acc.accountCode}
                                            value={acc.accountCode}
                                        >
                                            {acc.accountCode} - {acc.accountName}
                                        </option>
                                    ))}

                                </select>

                            </td>

                            <td className="border p-2">

                                <select
                                    value={row.entryType}
                                    onChange={(e) =>
                                        handleChange(index, "entryType", e.target.value)
                                    }
                                    className="w-full border p-1"
                                >

                                    <option value="DEBIT">DEBIT</option>
                                    <option value="CREDIT">CREDIT</option>

                                </select>

                            </td>

                            <td className="border p-2">

                                <select
                                    value={row.amountSource}
                                    onChange={(e) =>
                                        handleChange(index, "amountSource", e.target.value)
                                    }
                                    className="w-full border p-1"
                                >

                                    <option value="">Select Field</option>
                                    <option value="exclusiveAmount">Exclusive Amount</option>
                                    <option value="vatAmount">VAT Amount</option>
                                    <option value="discountAmount">Discount</option>
                                    <option value="totalAmount">Total Amount</option>

                                </select>

                            </td>

                            <td className="border p-2 text-center">

                                <button
                                    onClick={() => removeRow(index)}
                                    className="bg-red-500 text-white px-2 py-1 rounded"
                                >
                                    Delete
                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

            <div className="mt-4 flex gap-3">

                <button
                    onClick={addRow}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Add Row
                </button>

                <button
                    onClick={saveRule}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    Save Rule
                </button>

            </div>

        </div>
    );
};

export default AccountingRuleSettings;