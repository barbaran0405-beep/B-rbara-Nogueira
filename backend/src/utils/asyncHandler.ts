import type { NextFunction, Request, RequestHandler, Response } from "express";

/** Express 4 não repassa rejeições de handlers async para o error middleware sozinho. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
