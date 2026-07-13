import { Response } from 'express';

export function successResponse<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({
    success: true,
    data,
    error: null,
  });
}

export function errorResponse(res: Response, code: string, message: string, status = 400) {
  return res.status(status).json({
    success: false,
    data: null,
    error: { code, message },
  });
}
