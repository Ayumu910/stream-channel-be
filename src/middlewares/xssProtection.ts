import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'isomorphic-dompurify';

function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const result: any = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'string' && key !== 'password') {
        result[key] = DOMPurify.sanitize(obj[key], { ALLOWED_TAGS: [] });
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        result[key] = sanitizeObject(obj[key]);
      } else {
        result[key] = obj[key];
      }
    }
  }

  return result;
}

export const sanitizeInputs = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};

export const sanitizeParams = (req: Request, res: Response, next: NextFunction) => {
  if (req.params) {
    for (const key in req.params) {
      if (typeof req.params[key] === 'string') {
        req.params[key] = DOMPurify.sanitize(req.params[key], { ALLOWED_TAGS: [] });
      }
    }
  }
  next();
};