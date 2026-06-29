import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axiosClient";
import { useAuth } from "./securityContext";

export default function AdminVerifyOTP() {
  const location = useLocation();

  const navigate = useNavigate();

  const { login } = useAuth();

  const username = location.state?.username;

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    try {
      setLoading(true);

      const res = await api.post("/admin/verify-otp", {
        username,
        otp,
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
      alert(error.response?.data?.detail || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <input
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
        className="border p-2"
      />

      <button
        onClick={handleVerify}
        disabled={loading}
        className="bg-green-500 text-white p-2 ml-2"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>
    </div>
  );
}
