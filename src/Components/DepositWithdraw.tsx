import React, { useEffect, useState } from "react";
import axios from "axios";
import DepositWithdrawModal from "../Components/DepositWithdrawModal";

interface BankAccount {
    bankAccountID: number;
    bankAccountName: string;
}

interface DetailItem {
    detailItemCode: string;
    detailItemName: string;
}

const DepositWithdraw: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [detailItems, setDetailItems] = useState<DetailItem[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [banksRes, detailRes] = await Promise.all([
            axios.get("http://127.0.0.1:8000/api/bankaccounts"),
            axios.get("http://127.0.0.1:8000/api/detailitems"),
        ]);

        setBankAccounts(banksRes.data);
        setDetailItems(detailRes.data);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between mb-3">
                <h2 className="text-xl font-semibold mb-4">Manage Bank Transaction</h2>
                <button
                    className="border border-blue-600 px-4 py-1 rounded hover:bg-blue-600 hover:text-white"
                    onClick={() => setIsOpen(true)}
                >
                    New Transaction
                </button>
            </div>

            <DepositWithdrawModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </div>
    );
};

export default DepositWithdraw;
