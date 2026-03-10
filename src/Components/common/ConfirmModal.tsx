import React from "react";

interface ConfirmModalProps {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title = "Confirmation",
    message,
    confirmText = "Yes",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

            <div className="bg-white rounded-md shadow-lg w-[350px]">

                {/* Header */}
                <div className="px-4 py-2 border-b font-semibold text-gray-700">
                    {title}
                </div>

                {/* Body */}
                <div className="p-4 text-sm text-gray-700">
                    {message}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-4 py-3 border-t">
                    <button
                        className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>

                    <button
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ConfirmModal;