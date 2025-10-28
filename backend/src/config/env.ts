import dotenv from 'dotenv';
dotenv.config();


const required = (name: string, fallback?: string) => {
const val = process.env[name] ?? fallback;
if (!val) throw new Error(`Missing env: ${name}`);
return val;
};


export const env = {
nodeEnv: process.env.NODE_ENV ?? 'development',
port: parseInt(process.env.PORT ?? '8080', 10),
mongoUri: required('MONGO_URI'),
corsOrigin: required('CORS_ORIGIN'),
jwtAccessSecret: required('JWT_ACCESS_SECRET'),
jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
uploadDir: process.env.UPLOAD_DIR ?? 'uploads'
};