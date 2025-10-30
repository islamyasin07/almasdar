import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import { ensureDefaultAdmin } from './utils/seed.js';


async function bootstrap() {
await connectDB();
await ensureDefaultAdmin();
const server = http.createServer(app);
server.listen(env.port, () => {
logger.info(`🚀 Backend listening on http://0.0.0.0:${env.port}`);
});
}
bootstrap().catch((e) => {
// fail fast
// eslint-disable-next-line no-console
console.error(e);
process.exit(1);
});