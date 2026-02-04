import axios from "axios";
import type { AxiosError } from "axios";

export function isAxiosError<T = unknown>(
  err: unknown
): err is AxiosError<T> {
  return axios.isAxiosError(err);
}