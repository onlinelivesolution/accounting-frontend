import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./securityContext";

interface Props {
    onClose: () => void;
}

interface ChangePasswordRequest {
    userID: number;
    oldPassword: string;
    newPassword: string;
}

interface ErrorResponse {
    detail?: string;
}

const ChangePasswordModal = ({ onClose }: Props) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSave = async () => {
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("New password and confirm password do not match.");
            return;
        }

        if (!user?.userID) {
            setError("User information is missing.");
            return;
        }

        const payload: ChangePasswordRequest = {
            userID: user.userID,
            oldPassword,
            newPassword
        };

        try {
            await axios.put("http://127.0.0.1:8000/api/users/change-password", payload);
            setSuccess("Password changed successfully! Redirecting...");
            setTimeout(() => {
                logout();
                navigate("/loginUser");
            }, 1500);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const axiosError = err as AxiosError<ErrorResponse>;
                setError(axiosError.response?.data?.detail || "Failed to change password.");
            } else {
                setError("Unexpected error occurred.");
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96">
                <h2 className="text-lg font-semibold mb-4">Change Password</h2>

                {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
                {success && <p className="text-green-600 text-sm mb-2">{success}</p>}

                <div className="space-y-3">
                    <input
                        type="password"
                        placeholder="Old Password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                    />
                </div>

                <div className="flex justify-end mt-5 space-x-3">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
