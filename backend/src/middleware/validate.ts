import { AnyZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';


export const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
try {
schema.parse({ body: req.body, query: req.query, params: req.params });
next();
} catch (e: any) {
res.status(400).json({ message: 'Validation error', issues: e.issues });
}
};