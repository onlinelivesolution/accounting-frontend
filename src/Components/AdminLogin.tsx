import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage("");

    setLoading(true);

    try {
      const res = await api.post("/admin/login", form);

      console.log("ADMIN LOGIN RESPONSE:", res.data);

      navigate("/admin/verify-otp", {
        state: {
          username: form.username,
          otp: res.data.otp,
        },
      });
    } catch (error: any) {
      console.log("ADMIN LOGIN ERROR:", error);

      setErrorMessage(
        error.response?.data?.detail || "Invalid username or password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-96"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">
          System Admin Login
        </h2>

        {errorMessage && (
          <div
            className="
              mb-4
              bg-red-100
              border
              border-red-300
              text-red-700
              px-3
              py-2
              rounded
              text-sm
            "
          >
            {errorMessage}
          </div>
        )}

        <div className="mb-4">
          <label
            className="
              block
              mb-1
              text-sm
              font-medium
              text-gray-600
            "
          >
            Username
          </label>

          <input
            type="text"
            name="username"
            placeholder="Enter username"
            value={form.username}
            onChange={handleChange}
            required
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
          />
        </div>

        <div className="mb-6">
          <label
            className="
              block
              mb-1
              text-sm
              font-medium
              text-gray-600
            "
          >
            Password
          </label>

          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            required
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
          />
        </div>

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

export default AdminLogin;
