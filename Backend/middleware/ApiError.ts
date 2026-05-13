// Fallback local type for ApiErrorCode when project-level types are not available.
// Adjust or remove if a shared type file is added at ../types/api.
type ApiErrorCode = string | number;

export class ApiError extends Error {
  code: ApiErrorCode;
  status: number;

  constructor(code: ApiErrorCode, message: string, status = 400) {
    super(message);

    this.name = "ApiError";
    this.code = code;
    this.status = status;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}