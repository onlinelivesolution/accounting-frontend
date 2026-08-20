import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createStudentEnrollment,
  StudentEnrollmentCreateRequest,
} from "@/services/studentEnrollmentService";

const StudentEnrollmentAdd = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<StudentEnrollmentCreateRequest>({
    studentID: 0,
    academicYearID: 0,
    classID: 0,
    sectionID: undefined,
    rollNo: undefined,
    enrollmentDate: new Date().toISOString().split("T")[0],
    status: "Active",
    remarks: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "studentID" ||
        name === "academicYearID" ||
        name === "classID" ||
        name === "sectionID" ||
        name === "rollNo"
          ? value
            ? Number(value)
            : undefined
          : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!form.studentID) {
        setError("Please select a student.");
        return;
      }

      if (!form.academicYearID) {
        setError("Please select an academic year.");
        return;
      }

      if (!form.classID) {
        setError("Please select a class.");
        return;
      }

      await createStudentEnrollment(form);

      navigate("/school/student-enrollments");
    } catch (err: any) {
      console.error("Create enrollment error:", err);

      setError(
        err?.response?.data?.detail || "Failed to create student enrollment.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Student Enrollment</h1>

      {error && (
        <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Student */}
          <div>
            <label className="mb-1 block text-sm font-medium">Student</label>

            <select
              name="studentID"
              value={form.studentID || ""}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-3 py-2.5"
            >
              <option value="">Select Student</option>

              {/* Load students from API */}
            </select>
          </div>

          {/* Academic Year */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Academic Year
            </label>

            <select
              name="academicYearID"
              value={form.academicYearID || ""}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-3 py-2.5"
            >
              <option value="">Select Academic Year</option>

              {/* Load academic years */}
            </select>
          </div>

          {/* Class */}
          <div>
            <label className="mb-1 block text-sm font-medium">Class</label>

            <select
              name="classID"
              value={form.classID || ""}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-3 py-2.5"
            >
              <option value="">Select Class</option>

              {/* Load classes */}
            </select>
          </div>

          {/* Section */}
          <div>
            <label className="mb-1 block text-sm font-medium">Section</label>

            <select
              name="sectionID"
              value={form.sectionID || ""}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2.5"
            >
              <option value="">Select Section</option>

              {/* Load sections */}
            </select>
          </div>

          {/* Roll */}
          <div>
            <label className="mb-1 block text-sm font-medium">Roll No</label>

            <input
              type="number"
              name="rollNo"
              value={form.rollNo ?? ""}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2.5"
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Enrollment Date
            </label>

            <input
              type="date"
              name="enrollmentDate"
              value={form.enrollmentDate}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-3 py-2.5"
            />
          </div>

          {/* Remarks */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Remarks</label>

            <textarea
              name="remarks"
              value={form.remarks || ""}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border px-3 py-2.5"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/school/student-enrollments")}
            className="rounded-lg border px-5 py-2.5"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Enrollment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentEnrollmentAdd;
