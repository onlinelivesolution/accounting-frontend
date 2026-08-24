import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

import {
  getStudentById,
  updateStudent,
  Student,
  StudentUpdateRequest,
  uploadStudentPhoto,
} from "@/services/studentService";

const StudentEdit = () => {
  const { studentID } = useParams<{ studentID: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [photoPreview, setPhotoPreview] = useState<string>("");

  const [form, setForm] = useState<StudentUpdateRequest>({
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

  // =========================================================
  // Load Student
  // =========================================================

  useEffect(() => {
    if (!studentID) {
      setError("Student ID is missing.");
      setLoading(false);
      return;
    }

    const loadStudent = async () => {
      try {
        setLoading(true);
        setError("");

        const student: Student = await getStudentById(Number(studentID));

        setForm({
          studentCode: student.studentCode || "",
          admissionNo: student.admissionNo || "",
          firstName: student.firstName || "",
          middleName: student.middleName || "",
          lastName: student.lastName || "",
          dateOfBirth: student.dateOfBirth || "",
          gender: student.gender || "",
          bloodGroup: student.bloodGroup || "",
          photoPath: student.photoPath || "",
          phone: student.phone || "",
          email: student.email || "",
          address: student.address || "",
          city: student.city || "",
          postalCode: student.postalCode || "",
          admissionDate: student.admissionDate || "",
        });
      } catch (err: any) {
        console.error("Load student error:", err);

        setError(
          err?.response?.data?.detail || "Failed to load student information.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [studentID]);

  // =========================================================
  // Handle Input Change
  // =========================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // Submit
  // =========================================================

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!studentID) {
      setError("Student ID is missing.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload: StudentUpdateRequest = {
        ...form,

        // Convert empty optional values to undefined
        middleName: form.middleName || undefined,
        lastName: form.lastName || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        bloodGroup: form.bloodGroup || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        postalCode: form.postalCode || undefined,
        admissionDate: form.admissionDate || undefined,

        // Don't send photoPath from React when uploading
        // the actual file separately.
        photoPath: form.photoPath || undefined,
      };

      // -----------------------------------------
      // 1. Update student information
      // -----------------------------------------
      await updateStudent(Number(studentID), payload);

      // -----------------------------------------
      // 2. Upload new photo if selected
      // -----------------------------------------
      if (photoFile) {
        await uploadStudentPhoto(Number(studentID), photoFile);
      }

      // -----------------------------------------
      // 3. Go back to student list
      // -----------------------------------------
      navigate("/school/students");
    } catch (err: any) {
      console.error("Update student error:", err);

      setError(err?.response?.data?.detail || "Failed to update student.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Invalid image format. Please select JPG, PNG or WEBP.");
      e.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Student photo must not exceed 5 MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setPhotoFile(file);

    setPhotoPreview((oldPreview) => {
      if (oldPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(oldPreview);
      }

      return URL.createObjectURL(file);
    });
  };
  // const handleSubmit = async (e: FormEvent) => {
  //   e.preventDefault();

  //   if (!studentID) {
  //     setError("Student ID is missing.");
  //     return;
  //   }

  //   try {
  //     setSaving(true);
  //     setError("");

  //     const payload: StudentUpdateRequest = {
  //       ...form,

  //       // Convert empty optional values to undefined
  //       middleName: form.middleName || undefined,
  //       lastName: form.lastName || undefined,
  //       dateOfBirth: form.dateOfBirth || undefined,
  //       gender: form.gender || undefined,
  //       bloodGroup: form.bloodGroup || undefined,
  //       photoPath: form.photoPath || undefined,
  //       phone: form.phone || undefined,
  //       email: form.email || undefined,
  //       address: form.address || undefined,
  //       city: form.city || undefined,
  //       postalCode: form.postalCode || undefined,
  //       admissionDate: form.admissionDate || undefined,
  //     };

  //     await updateStudent(Number(studentID), payload);

  //     navigate("/school/students");
  //   } catch (err: any) {
  //     console.error("Update student error:", err);

  //     setError(err?.response?.data?.detail || "Failed to update student.");
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  // =========================================================
  // Loading
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading student...
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Edit Student</h1>

          <p className="mt-1 text-sm text-gray-500">
            Update student information
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/school/students")}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"
      >
        {/* Student Information */}
        <div className="mb-6">
          <h2 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-800">
            Student Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Student Code */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Student Code
              </label>

              <input
                type="text"
                name="studentCode"
                value={form.studentCode}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-gray-600 outline-none"
              />

              <p className="mt-1 text-xs text-gray-500">
                Student code cannot be changed.
              </p>
            </div>

            {/* Admission Number */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Admission Number
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                type="text"
                name="admissionNo"
                value={form.admissionNo}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* First Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                First Name
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Middle Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Middle Name
              </label>

              <input
                type="text"
                name="middleName"
                value={form.middleName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Last Name
              </label>

              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Date of Birth
              </label>

              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Gender
              </label>

              <select
                name="gender"
                value={form.gender || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Blood Group */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Blood Group
              </label>

              <select
                name="bloodGroup"
                value={form.bloodGroup || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            {/* Admission Date */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Admission Date
              </label>

              <input
                type="date"
                name="admissionDate"
                value={form.admissionDate || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-6">
          <h2 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-800">
            Contact Information
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Phone */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone
              </label>

              <input
                type="text"
                name="phone"
                value={form.phone || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* City */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                City
              </label>

              <input
                type="text"
                name="city"
                value={form.city || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Postal Code */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Postal Code
              </label>

              <input
                type="text"
                name="postalCode"
                value={form.postalCode || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Address
              </label>

              <textarea
                name="address"
                value={form.address || ""}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (!file) {
                  return;
                }

                setPhotoFile(file);

                setPhotoPreview(URL.createObjectURL(file));
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-28 w-28 overflow-hidden rounded-lg border bg-gray-50">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Student"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-gray-400">
                No Photo
              </div>
            )}
          </div>

          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
            />

            <p className="mt-1 text-xs text-gray-500">
              JPG, PNG or WEBP. Maximum 5 MB.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/school/students")}
            disabled={saving}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Update Student
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentEdit;
