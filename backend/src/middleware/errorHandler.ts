import { Request, Response, NextFunction } from 'express';
export function notFound(req: Request, res: Response) {
res.status(404).json({ message: 'Not Found' });
}
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
const status = err.status || 500;
const message = err.message || 'Internal Server Error';
res.status(status).json({ message });
}