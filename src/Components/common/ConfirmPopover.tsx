import React from "react";

interface ConfirmPopoverProps {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmPopover: React.FC<ConfirmPopoverProps> = ({
    isOpen,
    message,
    onConfirm,
    onCancel
}) => {

    if (!isOpen) return null;

    return (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded shadow-lg z-50">

            <div className="p-3 text-[12px] text-gray-700">
                {message}
            </div>

            <div className="flex justify-end gap-2 px-3 pb-3">
                <button
                    className="px-2 py-1 text-[11px] bg-gray-200 rounded hover:bg-gray-300"
                    onClick={onCancel}
                >
                    No
                </button>

                <button
                    className="px-2 py-1 text-[11px] bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={onConfirm}
                >
                    Yes
                </button>
            </div>

        </div>
    );
};

export default ConfirmPopover;