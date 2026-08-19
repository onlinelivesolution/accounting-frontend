import { useEffect, useState } from "react";
import api from "@/utils/axios";
import {
    Pencil,
    Plus,
    Trash2,
    CheckCircle,
    XCircle,
    RefreshCw,
} from "lucide-react";

interface AcademicYear {
    academicYearID: number;
    year: number;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    status: string;
    createdDate?: string;
    updatedDate?: string | null;
}

interface AcademicYearForm {
    year: string;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    status: string;
}

const initialForm: AcademicYearForm = {
    year: "",
    name: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    status: "Active",
};

const AcademicYears = () => {
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingID, setEditingID] = useState<number | null>(null);

    const [form, setForm] =
        useState<AcademicYearForm>(initialForm);

    const API_URL = "/academicYears";

    useEffect(() => {
        loadAcademicYears();
    }, []);

    const loadAcademicYears = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get<AcademicYear[]>(
                API_URL
            );

            setAcademicYears(response.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load academic years.");
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingID(null);

        setForm({
            ...initialForm,
            year: new Date().getFullYear().toString(),
        });

        setShowModal(true);
    };

    const openEditModal = (academicYear: AcademicYear) => {
        setEditingID(academicYear.academicYearID);

        setForm({
            year: academicYear.year.toString(),
            name: academicYear.name,
            startDate: academicYear.startDate.substring(0, 10),
            endDate: academicYear.endDate.substring(0, 10),
            isCurrent: academicYear.isCurrent,
            status: academicYear.status,
        });

        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingID(null);
        setForm(initialForm);
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >
    ) => {
        const { name, value, type } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? (e.target as HTMLInputElement).checked
                    : value,
        }));
    };

    const validateForm = (): boolean => {
        if (!form.year) {
            setError("Year is required.");
            return false;
        }

        if (!form.name.trim()) {
            setError("Academic year name is required.");
            return false;
        }

        if (!form.startDate) {
            setError("Start date is required.");
            return false;
        }

        if (!form.endDate) {
            setError("End date is required.");
            return false;
        }

        if (form.startDate >= form.endDate) {
            setError("Start date must be before end date.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setError("");

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);

            const payload = {
                year: Number(form.year),
                name: form.name.trim(),
                startDate: form.startDate,
                endDate: form.endDate,
                isCurrent: form.isCurrent,
                status: form.status,
            };

            if (editingID === null) {
                await api.post(API_URL, payload);
            } else {
                await api.put(
                    `${API_URL}/${editingID}`,
                    payload
                );
            }

            closeModal();
            await loadAcademicYears();
        } catch (err: any) {
            console.error(err);

            const message =
                err?.response?.data?.detail ||
                "Failed to save academic year.";

            setError(message);
        } finally {
            setSaving(false);
        }
    };

    const handleSetCurrent = async (
        academicYearID: number
    ) => {
        try {
            setError("");

            await api.put(
                `${API_URL}/${academicYearID}/setCurrent`
            );

            await loadAcademicYears();
        } catch (err: any) {
            console.error(err);

            setError(
                err?.response?.data?.detail ||
                    "Failed to set current academic year."
            );
        }
    };

    const handleDelete = async (
        academicYear: AcademicYear
    ) => {
        if (academicYear.isCurrent) {
            setError(
                "The current academic year cannot be deactivated."
            );
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to deactivate "${academicYear.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await api.put(
                `${API_URL}/${academicYear.academicYearID}/deactivate`
            );

            await loadAcademicYears();

        } catch (err: any) {
            console.error(err);

            setError(
                err?.response?.data?.detail ||
                "Failed to deactivate academic year."
            );
        }
    };

   

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">
                        Academic Years
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Manage school academic years
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={loadAcademicYears}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Add Academic Year
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 flex items-center justify-between bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => setError("")}
                        className="text-red-700"
                    >
                        <XCircle size={20} />
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-gray-500">
                        Loading academic years...
                    </div>
                ) : academicYears.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No academic years found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                        Year
                                    </th>

                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                        Name
                                    </th>

                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                        Start Date
                                    </th>

                                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">
                                        End Date
                                    </th>

                                    <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600">
                                        Status
                                    </th>

                                    <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600">
                                        Current
                                    </th>

                                    <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {academicYears.map(
                                    (academicYear) => (
                                        <tr
                                            key={
                                                academicYear.academicYearID
                                            }
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 font-medium text-gray-800">
                                                {
                                                    academicYear.year
                                                }
                                            </td>

                                            <td className="px-6 py-4 text-gray-700">
                                                {
                                                    academicYear.name
                                                }
                                            </td>

                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(
                                                    academicYear.startDate
                                                ).toLocaleDateString()}
                                            </td>

                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(
                                                    academicYear.endDate
                                                ).toLocaleDateString()}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        academicYear.status ===
                                                        "Active"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-gray-100 text-gray-600"
                                                    }`}
                                                >
                                                    {
                                                        academicYear.status
                                                    }
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                {academicYear.isCurrent ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                                        <CheckCircle
                                                            size={
                                                                14
                                                            }
                                                        />
                                                        Current
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleSetCurrent(
                                                                academicYear.academicYearID
                                                            )
                                                        }
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        Set Current
                                                    </button>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditModal(
                                                                academicYear
                                                            )
                                                        }
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                        title="Edit"
                                                    >
                                                        <Pencil
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                academicYear
                                                            )
                                                        }
                                                        disabled={
                                                            academicYear.isCurrent
                                                        }
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title="Delete"
                                                    >
                                                        <Trash2
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h2 className="text-lg font-semibold text-gray-800">
                                {editingID === null
                                    ? "Add Academic Year"
                                    : "Edit Academic Year"}
                            </h2>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XCircle size={22} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="p-6 space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Year
                                </label>

                                <input
                                    type="number"
                                    name="year"
                                    value={form.year}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Academic Year 2026"
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date
                                    </label>

                                    <input
                                        type="date"
                                        name="startDate"
                                        value={
                                            form.startDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date
                                    </label>

                                    <input
                                        type="date"
                                        name="endDate"
                                        value={
                                            form.endDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="Active">
                                        Active
                                    </option>
                                    <option value="Inactive">
                                        Inactive
                                    </option>
                                </select>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isCurrent"
                                    checked={
                                        form.isCurrent
                                    }
                                    onChange={handleChange}
                                    className="w-4 h-4"
                                />

                                <span className="text-sm text-gray-700">
                                    Set as current academic year
                                </span>
                            </label>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingID ===
                                            null
                                          ? "Save"
                                          : "Update"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademicYears;