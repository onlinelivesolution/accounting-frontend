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
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-500 rounded shadow-lg z-50">

            <div className="p-3 text-[12px] text-gray-800">
                {message}
            </div>

            <div className="flex justify-center gap-2 px-3 pb-3 pt-3">
                <button
                    className="w-15 px-2 py-1 text-[11px] bg-blue-300 cursor-pointer rounded hover:bg-blue-600 text-white"
                    onClick={onCancel}
                >
                    No
                </button>

                <button
                    className="w-15 px-2 py-1 text-[11px] bg-blue-600 cursor-pointer text-white rounded hover:bg-blue-700"
                    onClick={onConfirm}
                >
                    Yes
                </button>
            </div>

        </div>
    );
};

export default ConfirmPopover;