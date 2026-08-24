import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudent, Student } from "@/services/studentService";
import { getStudentPhotoUrl } from "@/utils/studentPhoto";

const StudentView = () => {
  const { studentID } = useParams<{
    studentID: string;
  }>();

  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadStudent = async () => {
      if (!studentID) {
        setError("Student ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getStudent(Number(studentID));

        setStudent(data);
      } catch (err: any) {
        console.error("Failed to load student:", err);

        setError(err?.response?.data?.detail || "Failed to load student.");
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [studentID]);

  // ------------------------------------------
  // Loading
  // ------------------------------------------

  if (loading) {
    return <div className="p-6">Loading student information...</div>;
  }

  // ------------------------------------------
  // Error
  // ------------------------------------------

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  // ------------------------------------------
  // Student not found
  // ------------------------------------------

  if (!student) {
    return <div className="p-6">Student not found.</div>;
  }

  // ------------------------------------------
  // Photo URL
  // ------------------------------------------

  const photoUrl = getStudentPhotoUrl(student.photoPath);

  // ------------------------------------------
  // UI
  // ------------------------------------------

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        {/* Student Photo */}

        <div className="flex justify-center mb-6">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`${student.firstName} ${student.lastName || ""}`}
              className="h-32 w-32 rounded-full object-cover border-4 border-gray-200"
            />
          ) : (
            <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              No Photo
            </div>
          )}
        </div>

        {/* Student Name */}

        <h1 className="text-2xl font-semibold text-center mb-6">
          {student.firstName} {student.middleName || ""}{" "}
          {student.lastName || ""}
        </h1>

        {/* Information */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Student Code</label>

            <p className="font-medium">{student.studentCode}</p>
          </div>

          <div>
            <label className="text-sm text-gray-500">Admission Number</label>

            <p className="font-medium">{student.admissionNo}</p>
          </div>

          <div>
            <label className="text-sm text-gray-500">Date of Birth</label>

            <p className="font-medium">{student.dateOfBirth || "-"}</p>
          </div>

          <div>
            <label className="text-sm text-gray-500">Gender</label>

            <p className="font-medium">{student.gender || "-"}</p>
          </div>

          <div>
            <label className="text-sm text-gray-500">Blood Group</label>

            <p className="font-medium">{student.bloodGroup || "-"}</p>
          </div>

          <div>
            <label className="text-sm text-gray-500">Phone</label>

            <p className="font-medium">{student.phone || "-"}</p>
          </div>

          <div>
            <label className="text-sm text-gray-500">Email</label>

            <p className="font-medium">{student.email || "-"}</p>
          </div>

          <div>
            <label className="text-sm text-gray-500">Status</label>

            <p className="font-medium">{student.status}</p>
          </div>
        </div>

        {/* Address */}

        <div className="mt-6">
          <label className="text-sm text-gray-500">Address</label>

          <p className="font-medium">{student.address || "-"}</p>
        </div>

        {/* Buttons */}

        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={() => navigate("/school/students")}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Back
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(`/school/students/${student.studentID}/edit`)
            }
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentView;
