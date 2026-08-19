import { useEffect, useState } from "react";
import { Eye, Pencil, Plus, Search, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  deactivateStudent,
  getStudents,
  Student,
} from "@/services/studentService";

const StudentList = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getStudents();

      setStudents(data);
    } catch (err: any) {
      console.error(err);

      setError(err?.response?.data?.detail || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleDeactivate = async (student: Student) => {
    const name = `${student.firstName} ${student.lastName ?? ""}`.trim();

    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deactivateStudent(student.studentID);

      await loadStudents();
    } catch (err: any) {
      console.error(err);

      setError(err?.response?.data?.detail || "Failed to deactivate student.");
    }
  };

  const filteredStudents = students.filter((student) => {
    const searchText = search.toLowerCase();

    const fullName = `${student.firstName} ${student.middleName ?? ""} ${
      student.lastName ?? ""
    }`.toLowerCase();

    return (
      fullName.includes(searchText) ||
      student.studentCode.toLowerCase().includes(searchText) ||
      student.admissionNo.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Students</h1>

          <p className="text-gray-500">Manage student information</p>
        </div>

        <button
          onClick={() => navigate("/school/students/add")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Student
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600">
          {error}
        </div>
      )}

      <div className="mb-4 relative">
        <Search size={18} className="absolute left-3 top-3 text-gray-400" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search student..."
          className="w-full md:w-96 pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Code</th>

              <th className="px-4 py-3 text-left">Admission No</th>

              <th className="px-4 py-3 text-left">Student Name</th>

              <th className="px-4 py-3 text-left">Gender</th>

              <th className="px-4 py-3 text-left">Phone</th>

              <th className="px-4 py-3 text-left">Status</th>

              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  Loading...
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No students found.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.studentID} className="border-t">
                  <td className="px-4 py-3">{student.studentCode}</td>

                  <td className="px-4 py-3">{student.admissionNo}</td>

                  <td className="px-4 py-3 font-medium">
                    {student.firstName} {student.middleName} {student.lastName}
                  </td>

                  <td className="px-4 py-3">{student.gender}</td>

                  <td className="px-4 py-3">{student.phone}</td>

                  <td className="px-4 py-3">
                    <span
                      className={
                        student.status === "Active"
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      {student.status}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          navigate(`/school/students/${student.studentID}/edit`)
                        }
                        className="p-2 rounded hover:bg-gray-100"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>

                      {student.status === "Active" && (
                        <button
                          onClick={() => handleDeactivate(student)}
                          className="p-2 rounded hover:bg-red-50 text-red-600"
                          title="Deactivate"
                        >
                          <UserX size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentList;
