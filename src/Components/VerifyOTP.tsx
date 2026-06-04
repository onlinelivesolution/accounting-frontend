import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./securityContext";


const VerifyOTP: React.FC = () => {

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const userID = location.state?.userID;
    const tenant = location.state?.tenant;
    const otpFromLogin = location.state?.otp;

    const handleVerifyOTP = async () => {

        if (!userID) {

            setErrorMessage(
                "Session expired. Please login again."
            );

            navigate("/");

            return;
        }

        try {

            setLoading(true);

            setErrorMessage("");

            // =========================
            // VERIFY OTP
            // =========================
            console.log("VERIFY PAYLOAD:", {
                userID,
                tenant,
                otpCode: otp.trim()
            });

            const response = await axios.post(
                "http://127.0.0.1:8000/api/auth/verify-otp",
                {
                    userID: userID,
                    tenant: tenant,
                    otpCode: otp.trim()
                }
            );

            console.log(
                "VERIFY OTP RESPONSE:",
                response.data
            );

            const {
                token,
                user,
                tenant
            } = response.data;

            // =========================
            // VALIDATE RESPONSE
            // =========================

            if (!token || !user) {

                setErrorMessage(
                    "Invalid server response"
                );

                return;
            }

            // =========================
            // FETCH PERMISSIONS
            // =========================

            let permissions: any[] = [];

            try {

                const permissionsResponse =
                    await axios.get(
                        `http://127.0.0.1:8000/api/auth/permissions/${user.roleID}`
                    );

                console.log(
                    "PERMISSIONS RESPONSE:",
                    permissionsResponse.data
                );

                permissions =
                    permissionsResponse.data || [];

            } catch (permissionError) {

                console.error(
                    "PERMISSION API ERROR:",
                    permissionError
                );

                // allow login even if permission api fails
                permissions = [];
            }

            // =========================
            // LOGIN
            // =========================

            login(token, response.data.tenant, user, permissions);

            // =========================
            // NAVIGATE
            // =========================

            navigate("/dashboard");

        } 
        catch (error: any) {

            console.error("VERIFY OTP ERROR:", error);

            console.log("SERVER RESPONSE:", error.response?.data);

            if (error.response?.data?.detail) {

                const detail = error.response.data.detail;

                if (Array.isArray(detail)) {
                    setErrorMessage(detail[0]?.msg || "Validation Error");
                } else {
                    setErrorMessage(String(detail));
                }

            } else {

                setErrorMessage("OTP verification failed");
            }

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">

            <div className="bg-white p-8 rounded-xl shadow-lg w-96">

                <h2 className="text-2xl font-bold mb-6 text-center">
                    Verify OTP
                </h2>

                {errorMessage && (
                    <div className="mb-4 text-red-600 text-sm">
                        {errorMessage}
                    </div>
                )}
                <div className="mb-4 text-center text-green-600 font-bold">
                   Development OTP: {otpFromLogin}
                </div>

                <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                />

                <button
                    onClick={handleVerifyOTP}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
                >
                    {loading ? "Verifying..." : "Verify OTP"}
                </button>

            </div>

        </div>
    );
};

export default VerifyOTP;