// src/Components/LoginUser.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginUser: React.FC = () => {
  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage("");

    setLoading(true);

    try {
      const payload = {
        userName: username.trim(),
        password: password,
      };

      console.log("LOGIN PAYLOAD:", payload);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/login",
        payload,
      );

      console.log("LOGIN RESPONSE:", response.data);

      console.log("NAVIGATING WITH STATE:", {
        userID: response.data.userID,
        tenant: response.data.tenant,
        otp: response.data.otp,
      });

      navigate("/verify-otp", {
        state: {
          userID: response.data.userID,
          tenant: response.data.tenant,
          otp: response.data.otp,
        },
      });
    } catch (error: any) {
      console.error("LOGIN ERROR:", error);

      console.log("SERVER RESPONSE:", error.response?.data);

      if (error.response?.data?.detail) {
        setErrorMessage(
          typeof error.response.data.detail === "string"
            ? error.response.data.detail
            : "Login failed",
        );
      } else {
        setErrorMessage("Invalid username or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-lg w-96"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">
          Online Accounting
        </h2>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded text-sm">
            {errorMessage}
          </div>
        )}

        {/* Username */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Username
          </label>

          <input
            type="text"
            placeholder="Enter username"
            className="
              w-full
              p-3
              border
              border-gray-300
              rounded-lg
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter password"
            className="
              w-full
              p-3
              border
              border-gray-300
              rounded-lg
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
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
          {loading ? "Please wait..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginUser;
