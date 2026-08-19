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

export interface StudentUpdateRequest
    extends Partial<StudentCreateRequest> {
    status?: string;
}

const API_URL = "/api/students";


export const getStudents = async (): Promise<Student[]> => {

    const response = await api.get<Student[]>(
        `${API_URL}/getStudents`
    );

    return response.data;
};


export const getStudent = async (
    studentID: number
): Promise<Student> => {

    const response = await api.get<Student>(
        `${API_URL}/${studentID}`
    );

    return response.data;
};


export const createStudent = async (
    data: StudentCreateRequest
): Promise<Student> => {

    const response = await api.post<Student>(
        API_URL,
        data
    );

    return response.data;
};


export const updateStudent = async (
    studentID: number,
    data: StudentUpdateRequest
): Promise<Student> => {

    const response = await api.put<Student>(
        `${API_URL}/${studentID}`,
        data
    );

    return response.data;
};


export const deactivateStudent = async (
    studentID: number
): Promise<Student> => {

    const response = await api.put<Student>(
        `${API_URL}/${studentID}/deactivate`
    );

    return response.data;
};