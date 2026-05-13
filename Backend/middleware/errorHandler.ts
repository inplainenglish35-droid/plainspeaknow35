import type { Request, Response, NextFunction } from "express";
import { ApiError } from "./ApiError";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  console.error("SERVER_ERROR:", err);

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
    });
  }

  return res.status(500).json({
    code: "INTERNAL_ERROR",
    message: "Something went wrong.",
  });
}