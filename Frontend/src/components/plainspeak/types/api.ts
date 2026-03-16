export type ApiErrorCode =
  | "RATE_LIMIT_MINUTE"
  | "RATE_LIMIT_HOUR"
  | "USAGE_EXCEEDED"
  | "PAYLOAD_TOO_LARGE"
  | "INVALID_PAYLOAD"
  | "UNAUTHORIZED"
  | "INTERNAL_ERROR"
  | "UNKNOWN_ERROR";

export interface ApiError {
  code: ApiErrorCode;
  message: string;
}