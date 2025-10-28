import { Router } from 'express';


const router = Router();
router.get('/health', (_req, res) => {
res.json({ status: 'ok', service: 'almasdar-backend', timestamp: new Date().toISOString() });
});
export default router;