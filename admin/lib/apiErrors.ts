import axios from "axios";

type ApiErrorData = {
  error?: string;
  message?: string;
};

export function getApiErrorMessage(
  error: unknown,
  fallback = "Não foi possível concluir a operação.",
) {
  if (!axios.isAxiosError<ApiErrorData>(error)) {
    return fallback;
  }

  return error.response?.data?.error ?? error.response?.data?.message ?? fallback;
}

export function getApiErrorStatus(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}
