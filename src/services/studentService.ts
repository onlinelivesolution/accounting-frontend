import api from "@/utils/axios";

export interface Student {
  studentID: number;

  studentCode: string;
  admissionNo: string;

  firstName: string;
  middleName?: string | null;
  lastName?: string | null;

  dateOfBirth?: string | null;

  gender?: string | null;
  bloodGroup?: string | null;

  photoPath?: string | null;

  phone?: string | null;
  email?: string | null;

  address?: string | null;
  city?: string | null;
  postalCode?: string | null;

  admissionDate?: string | null;

  status: string;

  createdDate?: string;
  updatedDate?: string | null;
}

export interface StudentCreateRequest {
  studentCode: string;
  admissionNo: string;

  firstName: string;
  middleName?: string;
  lastName?: string;

  dateOfBirth?: string;

  gender?: string;
  bloodGroup?: string;

  photoPath?: string;

  phone?: string;
  email?: string;

  address?: string;
  city?: string;
  postalCode?: string;

  admissionDate?: string;
}

export interface StudentUpdateRequest {
  studentCode?: string;
  admissionNo: string;
  firstName: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  photoPath?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  admissionDate?: string;
}

export interface StudentUpdateRequest extends Partial<StudentCreateRequest> {
  status?: string;
}

const API_URL = "/api/students";

export const getStudents = async (): Promise<Student[]> => {
  const response = await api.get<Student[]>(`${API_URL}/getStudents`);

  return response.data;
};

export const getStudent = async (studentID: number): Promise<Student> => {
  const response = await api.get<Student>(`${API_URL}/${studentID}`);

  return response.data;
};

export const getStudentById = async (studentID: number): Promise<Student> => {
  const response = await api.get<Student>(`/api/students/${studentID}`);

  return response.data;
};

export const createStudent = async (
  payload: StudentCreateRequest,
): Promise<Student> => {
  const response = await api.post<Student>("/api/students", payload);

  console.log("Create student response:", response.data);

  return response.data;
};

export interface NextStudentCodeResponse {
  studentCode: string;
}

export const getNextStudentCode = async (): Promise<string> => {
  const response = await api.get<{ studentCode: string }>(
    "/api/students/next-student-code",
  );

  return response.data.studentCode;
};

export const updateStudent = async (
  studentID: number,
  data: StudentUpdateRequest,
): Promise<Student> => {
  const response = await api.put<Student>(`${API_URL}/${studentID}`, data);

  return response.data;
};

export const deactivateStudent = async (
  studentID: number,
): Promise<Student> => {
  const response = await api.put<Student>(`${API_URL}/${studentID}/deactivate`);

  return response.data;
};

export const uploadStudentPhoto = async (studentID: number, file: File) => {
  const formData = new FormData();

  formData.append("file", file, file.name);

  console.log("Uploading student photo...");

  console.log("Student ID:", studentID);

  console.log("Photo:", file);

  for (const [key, value] of formData.entries()) {
    console.log("FormData:", key, value);
  }

  const response = await api.post(`/api/students/${studentID}/photo`, formData);

  console.log("Photo upload response:", response.data);

  return response.data;
};

// export const uploadStudentPhoto = async (studentID: number, file: File) => {
//   const formData = new FormData();

//   formData.append("file", file);

//   console.log("Uploading student photo:", studentID, file.name);

//   const response = await api.post(`/api/students/${studentID}/photo`, formData);

//   console.log("Photo upload response:", response.data);

//   return response.data;
// };

// export const uploadStudentPhoto = async (studentID: number, file: File) => {
//   const formData = new FormData();

//   formData.append("file", file);

//   const response = await api.post(`${API_URL}/${studentID}/photo`, formData);

//   return response.data;
// };
