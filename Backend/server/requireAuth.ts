import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  uid?: string;
  file?: Express.Multer.File;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  // TEMP AUTH BYPASS FOR LOCAL TESTING
  req.uid = "test-user";

  return next();
}

