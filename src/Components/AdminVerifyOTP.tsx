import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import { useAuth } from "./securityContext";

const AdminVerifyOTP: React.FC = () => {
  const location = useLocation();

  const navigate = useNavigate();

  const { login } = useAuth();

  const username = location.state?.username;

  const otpFromLogin = location.state?.otp;

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const handleVerify = async () => {
    if (!username) {
      setErrorMessage("Session expired. Please login again.");

      navigate("/admin/login");

      return;
    }

    try {
      setLoading(true);

      setErrorMessage("");

      const res = await api.post("/admin/verify-otp", {
        username,
        otp: otp.trim(),
      });

      console.log("LOGIN RESPONSE:", res.data);

      const { token, user, permissions } = res.data;

      console.log("USER:", user);

      login(
        token,
        "", // system admin has no tenant
        user,
        permissions || [],
      );

      console.log("SAVED USER:", localStorage.getItem("user"));

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (error: any) {
      console.log("VERIFY ERROR:", error);

      setErrorMessage(
        error.response?.data?.detail || "OTP verification failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Verify Admin OTP
        </h2>

        {errorMessage && (
          <div className="mb-4 text-red-600 text-sm">{errorMessage}</div>
        )}

        {otpFromLogin && (
          <div className="mb-4 text-center text-green-600 font-bold">
            Development OTP: {otpFromLogin}
          </div>
        )}

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="
            w-full
            p-3
            border
            border-gray-300
            rounded-lg
            mb-4
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className={`
            w-full
            p-3
            rounded-lg
            text-white
            font-semibold
            transition-all
            duration-200
            ${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }
          `}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
};

export default AdminVerifyOTP;
