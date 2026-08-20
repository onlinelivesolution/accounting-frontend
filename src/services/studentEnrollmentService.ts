import api from "@/utils/axios";

export interface StudentEnrollment {
  enrollmentID: number;

  studentID: number;
  academicYearID: number;
  classID: number;
  sectionID?: number;

  rollNo?: number;

  enrollmentDate: string;

  status: string;

  remarks?: string;

  createdDate: string;
  updatedDate?: string;
}

export interface StudentEnrollmentCreateRequest {
  studentID: number;
  academicYearID: number;
  classID: number;
  sectionID?: number;
  rollNo?: number;
  enrollmentDate: string;
  status?: string;
  remarks?: string;
}

export interface StudentEnrollmentUpdateRequest {
  academicYearID?: number;
  classID?: number;
  sectionID?: number;
  rollNo?: number;
  enrollmentDate?: string;
  status?: string;
  remarks?: string;
}

// Create
export const createStudentEnrollment = async (
  data: StudentEnrollmentCreateRequest,
): Promise<StudentEnrollment> => {
  const response = await api.post<StudentEnrollment>(
    "/api/student-enrollments",
    data,
  );

  return response.data;
};

// Get all
export const getStudentEnrollments = async (): Promise<StudentEnrollment[]> => {
  const response = await api.get<StudentEnrollment[]>(
    "/api/student-enrollments",
  );

  return response.data;
};

// Get by student
export const getStudentEnrollmentsByStudent = async (
  studentID: number,
): Promise<StudentEnrollment[]> => {
  const response = await api.get<StudentEnrollment[]>(
    `/api/student-enrollments/student/${studentID}`,
  );

  return response.data;
};

// Get by ID
export const getStudentEnrollmentById = async (
  enrollmentID: number,
): Promise<StudentEnrollment> => {
  const response = await api.get<StudentEnrollment>(
    `/api/student-enrollments/${enrollmentID}`,
  );

  return response.data;
};

// Update
export const updateStudentEnrollment = async (
  enrollmentID: number,
  data: StudentEnrollmentUpdateRequest,
): Promise<StudentEnrollment> => {
  const response = await api.put<StudentEnrollment>(
    `/api/student-enrollments/${enrollmentID}`,
    data,
  );

  return response.data;
};

// Deactivate
export const deactivateStudentEnrollment = async (
  enrollmentID: number,
): Promise<StudentEnrollment> => {
  const response = await api.patch<StudentEnrollment>(
    `/api/student-enrollments/${enrollmentID}/deactivate`,
  );

  return response.data;
};
