const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const getStudentPhotoUrl = (
  photoPath?: string | null,
): string | null => {
  if (!photoPath) {
    return null;
  }

  return `${API_BASE_URL}/uploads/${photoPath}`;
};
