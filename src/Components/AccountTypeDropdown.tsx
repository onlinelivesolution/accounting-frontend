import React from "react";

interface Props {
    value: string;
    onChange: (value: string) => void;
    accountTypes: any[];
    label?: string;
}

const AccountTypeDropdown: React.FC<Props> = ({
    value,
    onChange,
    accountTypes,
    label = "Select Account Type",
}) => {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="
                w-full 
                px-2 
                py-1 
                h-8 
                rounded 
                border 
                border-blue-300 
                text-gray-700 
                bg-white 
                appearance-none 
                focus:outline-none 
                focus:ring-2 
                focus:ring-blue-200
            "
        >
            <option value="">{label}</option>

            {accountTypes.map((item: any) => (
                <option key={item.fAHeadID} value={item.fAHeadID}>
                    {item.fAHeadName}
                </option>
            ))}
        </select>
    );
};

export default AccountTypeDropdown;
