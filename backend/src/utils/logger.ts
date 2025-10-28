/* Simple console logger with timestamps */
export const logger = {
info: (...args: unknown[]) => console.log(new Date().toISOString(), 'INFO', ...args),
error: (...args: unknown[]) => console.error(new Date().toISOString(), 'ERROR', ...args)
};