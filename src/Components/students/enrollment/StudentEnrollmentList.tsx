import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  Plus,
  Pencil,
  Eye,
  UserX,
  Search,
  RefreshCw,
  Loader2,
} from "lucide-react";

import {
  getStudentEnrollments,
  deactivateStudentEnrollment,
  StudentEnrollment,
} from "@/services/studentEnrollmentService";

import { getStudents, Student } from "@/services/studentService";

const StudentEnrollmentList = () => {
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);

  const [students, setStudents] = useState<Student[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [academicYearFilter, setAcademicYearFilter] = useState("");

  const [classFilter, setClassFilter] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  // =========================================================
  // Load Data
  // =========================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [enrollmentData, studentData] = await Promise.all([
        getStudentEnrollments(),
        getStudents(),
      ]);

      setEnrollments(enrollmentData);
      setStudents(studentData);
    } catch (err: any) {
      console.error("Load student enrollment error:", err);

      setError(
        err?.response?.data?.detail || "Failed to load student enrollments.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // Get Student
  // =========================================================

  const getStudent = (studentID: number): Student | undefined => {
    return students.find((student) => student.studentID === studentID);
  };

  // =========================================================
  // Filter
  // =========================================================

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment) => {
      const student = getStudent(enrollment.studentID);

      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        student?.studentCode?.toLowerCase().includes(searchText) ||
        student?.firstName?.toLowerCase().includes(searchText) ||
        student?.middleName?.toLowerCase().includes(searchText) ||
        student?.lastName?.toLowerCase().includes(searchText) ||
        student?.admissionNo?.toLowerCase().includes(searchText);

      const matchesYear =
        !academicYearFilter ||
        String(enrollment.academicYearID) === academicYearFilter;

      const matchesClass =
        !classFilter || String(enrollment.classID) === classFilter;

      const matchesStatus = !statusFilter || enrollment.status === statusFilter;

      return matchesSearch && matchesYear && matchesClass && matchesStatus;
    });
  }, [
    enrollments,
    students,
    search,
    academicYearFilter,
    classFilter,
    statusFilter,
  ]);

  // =========================================================
  // Deactivate
  // =========================================================

  const handleDeactivate = async (enrollment: StudentEnrollment) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this enrollment?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deactivateStudentEnrollment(enrollment.enrollmentID);

      await loadData();
    } catch (err: any) {
      console.error("Deactivate enrollment error:", err);

      setError(
        err?.response?.data?.detail || "Failed to deactivate enrollment.",
      );
    }
  };

  // =========================================================
  // Reset Filters
  // =========================================================

  const handleReset = () => {
    setSearch("");
    setAcademicYearFilter("");
    setClassFilter("");
    setStatusFilter("");
  };

  // =========================================================
  // Loading
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading student enrollments...
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="w-full p-4 md:p-6">
      {/* =====================================================
          Header
      ====================================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Student Enrollment
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage student enrollment by academic year, class and section.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/school/student-enrollments/add")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Enrollment
        </button>
      </div>

      {/* =====================================================
          Error
      ====================================================== */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          Filters
      ====================================================== */}

      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Academic Year */}

          <div className="relative w-full">
            <select
              value={academicYearFilter}
              onChange={(e) => setAcademicYearFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
            >
              <option value="">All Academic Years</option>

              {Array.from(
                new Set(enrollments.map((item) => item.academicYearID)),
              )
                .sort((a, b) => a - b)
                .map((yearID) => (
                  <option key={yearID} value={yearID}>
                    Academic Year {yearID}
                  </option>
                ))}
            </select>

            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-700 pointer-events-none" />
          </div>

          {/* Class */}

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Classes</option>

            {Array.from(new Set(enrollments.map((item) => item.classID)))
              .sort((a, b) => a - b)
              .map((classID) => (
                <option key={classID} value={classID}>
                  Class {classID}
                </option>
              ))}
          </select>

          {/* Status */}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Status</option>

            <option value="Active">Active</option>

            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Reset */}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {/* =====================================================
          Table
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  #
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Student Code
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Student Name
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Admission No
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Academic Year
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Class
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Section
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Roll
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Status
                </th>

                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    No student enrollment found.
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((enrollment, index) => {
                  const student = getStudent(enrollment.studentID);

                  const studentName = [
                    student?.firstName,
                    student?.middleName,
                    student?.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <tr
                      key={enrollment.enrollmentID}
                      className="hover:bg-gray-50"
                    >
                      {/* # */}

                      <td className="px-4 py-3 text-gray-500">{index + 1}</td>

                      {/* Student Code */}

                      <td className="px-4 py-3 font-medium text-blue-600">
                        {student?.studentCode || "-"}
                      </td>

                      {/* Name */}

                      <td className="px-4 py-3 font-medium text-gray-800">
                        {studentName || "-"}
                      </td>

                      {/* Admission */}

                      <td className="px-4 py-3 text-gray-600">
                        {student?.admissionNo || "-"}
                      </td>

                      {/* Academic Year */}

                      <td className="px-4 py-3 text-gray-600">
                        {enrollment.academicYearID}
                      </td>

                      {/* Class */}

                      <td className="px-4 py-3 text-gray-600">
                        {enrollment.classID}
                      </td>

                      {/* Section */}

                      <td className="px-4 py-3 text-gray-600">
                        {enrollment.sectionID ?? "-"}
                      </td>

                      {/* Roll */}

                      <td className="px-4 py-3 text-gray-600">
                        {enrollment.rollNo ?? "-"}
                      </td>

                      {/* Status */}

                      <td className="px-4 py-3">
                        <span
                          className={
                            enrollment.status === "Active"
                              ? "inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                              : "inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                          }
                        >
                          {enrollment.status}
                        </span>
                      </td>

                      {/* Actions */}

                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {/* View */}

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/school/student-enrollments/${enrollment.enrollmentID}`,
                              )
                            }
                            className="rounded p-2 text-gray-600 hover:bg-gray-100"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>

                          {/* Edit */}

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/school/student-enrollments/${enrollment.enrollmentID}/edit`,
                              )
                            }
                            className="rounded p-2 text-blue-600 hover:bg-blue-50"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>

                          {/* Deactivate */}

                          {enrollment.status === "Active" && (
                            <button
                              type="button"
                              onClick={() => handleDeactivate(enrollment)}
                              className="rounded p-2 text-red-600 hover:bg-red-50"
                              title="Deactivate"
                            >
                              <UserX size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          Footer
      ====================================================== */}

      <div className="mt-3 text-sm text-gray-500">
        Showing{" "}
        <span className="font-medium">{filteredEnrollments.length}</span> of{" "}
        <span className="font-medium">{enrollments.length}</span> enrollments
      </div>
    </div>
  );
};

export default StudentEnrollmentList;
