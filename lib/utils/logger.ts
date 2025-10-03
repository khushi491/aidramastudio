export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelToConsole: Record<LogLevel, (...args: any[]) => void> = {
  debug: console.debug.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};

export function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const payload = { ts: new Date().toISOString(), level, message, ...meta };
  levelToConsole[level](JSON.stringify(payload));
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
};


