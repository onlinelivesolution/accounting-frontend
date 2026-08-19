import { FormEvent, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { createStudent, StudentCreateRequest } from "@/services/studentService";

const StudentForm = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState<StudentCreateRequest>({
        studentCode: "",
        admissionNo: "",

        firstName: "",
        middleName: "",
        lastName: "",

        dateOfBirth: "",

        gender: "",
        bloodGroup: "",

        photoPath: "",

        phone: "",
        email: "",

        address: "",
        city: "",
        postalCode: "",

        admissionDate: "",
    });

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            const payload: StudentCreateRequest = {
                ...form,

                // Convert empty optional fields to undefined
                middleName: form.middleName || undefined,
                lastName: form.lastName || undefined,
                dateOfBirth: form.dateOfBirth || undefined,
                gender: form.gender || undefined,
                bloodGroup: form.bloodGroup || undefined,
                photoPath: form.photoPath || undefined,
                phone: form.phone || undefined,
                email: form.email || undefined,
                address: form.address || undefined,
                city: form.city || undefined,
                postalCode: form.postalCode || undefined,
                admissionDate: form.admissionDate || undefined,
            };

            await createStudent(payload);

            navigate("/school/students");
        } catch (err: any) {
            console.error("Create student error:", err);

            setError(err?.response?.data?.detail || "Failed to create student.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/school/students");
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="p-2 rounded-lg hover:bg-gray-100"
                        title="Back"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">
                            Add New Student
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Enter the student's personal and admission information.
                        </p>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                    {error}
                </div>
            )}

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
                {/* Student Information */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-5">
                        Student Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* Student Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Student Code
                                <span className="text-red-500 ml-1">*</span>
                            </label>

                            <input
                                type="text"
                                name="studentCode"
                                value={form.studentCode}
                                onChange={handleChange}
                                required
                                placeholder="e.g. STU-0001"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Admission No */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Admission No
                                <span className="text-red-500 ml-1">*</span>
                            </label>

                            <input
                                type="text"
                                name="admissionNo"
                                value={form.admissionNo}
                                onChange={handleChange}
                                required
                                placeholder="e.g. ADM-2026-001"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Admission Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Admission Date
                            </label>

                            <input
                                type="date"
                                name="admissionDate"
                                value={form.admissionDate}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name
                                <span className="text-red-500 ml-1">*</span>
                            </label>

                            <input
                                type="text"
                                name="firstName"
                                value={form.firstName}
                                onChange={handleChange}
                                required
                                placeholder="First name"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Middle Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Middle Name
                            </label>

                            <input
                                type="text"
                                name="middleName"
                                value={form.middleName}
                                onChange={handleChange}
                                placeholder="Middle name"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name
                            </label>

                            <input
                                type="text"
                                name="lastName"
                                value={form.lastName}
                                onChange={handleChange}
                                placeholder="Last name"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Birth
                            </label>

                            <input
                                type="date"
                                name="dateOfBirth"
                                value={form.dateOfBirth}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Gender
                            </label>

                            <select
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select Gender</option>

                                <option value="Male">Male</option>

                                <option value="Female">Female</option>

                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Blood Group */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Blood Group
                            </label>

                            <select
                                name="bloodGroup"
                                value={form.bloodGroup}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select Blood Group</option>

                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-5">
                        Contact Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone
                            </label>

                            <input
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="Phone number"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="student@example.com"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City
                            </label>

                            <input
                                type="text"
                                name="city"
                                value={form.city}
                                onChange={handleChange}
                                placeholder="City"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Postal Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Postal Code
                            </label>

                            <input
                                type="text"
                                name="postalCode"
                                value={form.postalCode}
                                onChange={handleChange}
                                placeholder="Postal code"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2 lg:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                            </label>

                            <textarea
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Student's address"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Photo */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-5">
                        Student Photo
                    </h2>

                    <div className="max-w-md">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Photo Path
                        </label>

                        <input
                            type="text"
                            name="photoPath"
                            value={form.photoPath}
                            onChange={handleChange}
                            placeholder="Optional photo path"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />

                        <p className="text-xs text-gray-500 mt-1">
                            We can add actual image upload later.
                        </p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 p-6">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Save size={18} />

                        {loading ? "Saving..." : "Save Student"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StudentForm;
