import React from "react";

interface Props {
    value: string;
    onChange: (value: string) => void;
    controlItems: any[];
    label?: string;
}

const ControlItemDropdown: React.FC<Props> = ({
    value,
    onChange,
    controlItems,
    label = "Select Control Item",
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

            {controlItems.map((item: any) => (
                <option key={item.controlItemCode} value={item.controlItemCode}>
                    {item.controlItemName}
                </option>
            ))}
        </select>
    );
};

export default ControlItemDropdown;
