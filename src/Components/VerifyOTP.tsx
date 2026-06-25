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

  const username = location.state?.username;
  const otpFromLogin = location.state?.otp;

  const handleVerifyOTP = async () => {
    if (!username) {
      setErrorMessage("Session expired. Please login again.");

      navigate("/");

      return;
    }

    try {
      setLoading(true);

      setErrorMessage("");

      console.log("VERIFY PAYLOAD:", {
        username,
        otp,
      });

      const response = await axios.post(
        "http://127.0.0.1:8000/api/tenantauth/verifyOTP",
        {
          username: username,
          otp: otp.trim(),
        },
      );

      console.log("VERIFY RESPONSE:", response.data);

      const token = response.data.access_token;

      if (!token) {
        setErrorMessage("Token not found");

        return;
      }

      // Save token
      localStorage.setItem("token", token);

      localStorage.setItem("username", username);

      // optional if securityContext exists
      const permissionResponse = await axios.get(
        `http://127.0.0.1:8000/api/tenantauth/permissions/${username}`,
      );

      console.log("FULL PERMISSION RESPONSE:", permissionResponse);

      const permissions = permissionResponse.data;

      console.log("PERMISSIONS DATA:", permissions);

      const user = {
        userName: username,
      };

      login(token, null, user, permissions);

      console.log("LOCAL STORAGE:", localStorage.getItem("permissions"));
      
      navigate("/dashboard", {
        replace: true,
      });
    } catch (error: any) {
      console.log(error);

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
        <h2 className="text-2xl font-bold mb-6 text-center">Verify OTP</h2>

        {errorMessage && (
          <div className="mb-4 text-red-600 text-sm">{errorMessage}</div>
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
