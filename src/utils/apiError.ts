import type { ApiResponse } from "@/types/common.type";

/**
 * Extracts a readable error message from API failure or general Error causes.
 * Handles Axios responses with standard backend ApiResponse envelope (thongDiep / message).
 */
export function getApiErrorMessage(
  cause: unknown,
  fallbackMessage: string = "Thao tác thất bại."
): string {
  if (!cause) return fallbackMessage;

  const axiosError = cause as {
    response?: {
      data?: ApiResponse<unknown> | { thongDiep?: string; message?: string };
    };
    message?: string;
  };

  const responseMessage =
    axiosError.response?.data?.thongDiep ||
    (axiosError.response?.data as { message?: string })?.message;

  if (responseMessage && typeof responseMessage === "string" && responseMessage.trim().length > 0) {
    return responseMessage;
  }

  if (cause instanceof Error && cause.message) {
    return cause.message;
  }

  if (axiosError.message && typeof axiosError.message === "string") {
    return axiosError.message;
  }

  return fallbackMessage;
}
