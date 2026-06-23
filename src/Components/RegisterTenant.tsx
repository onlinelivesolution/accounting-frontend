import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";

export default function RegisterTenant() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    adminName: "",
    databaseName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Password does not match");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        companyName: formData.companyName,
        adminName: formData.adminName,
        databaseName: formData.databaseName,
        email: formData.email,
        password: formData.password,
      };

      console.log("Tenant Register Payload:", payload);

      const res = await api.post("/managetenants/registerTenant", payload);

      console.log("Register Response:", res.data);

      alert("Registration successful. Waiting for approval.");

      navigate("/login");
    } catch (error: any) {
      console.log(error);

      alert(error?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Tenant Registration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="companyName"
            placeholder="Company Name"
            value={formData.companyName}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />

          <input
            type="text"
            name="adminName"
            placeholder="Admin Name"
            value={formData.adminName}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />

          <input
            type="text"
            name="databaseName"
            placeholder="Database Name"
            value={formData.databaseName}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="mt-4 text-center">
          Already registered?
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 ml-2"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
