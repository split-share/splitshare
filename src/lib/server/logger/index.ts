import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { PinoLoggerAdapter } from '$adapters/logger/pino/pino-logger.adapter';
import type { ILoggerService, LogLevel } from '$core/ports/logger/logger.port';

export { RequestContext, generateRequestId, createRequestLogger } from './request-context';
export { logAction, withActionLogging, type ActionType } from './action-logger';
export type {
	ILoggerService,
	LogContext,
	WideEvent,
	LogLevel
} from '$core/ports/logger/logger.port';

/**
 * Create the application logger instance
 */
function createLogger(): ILoggerService {
	const environment = dev ? 'development' : 'production';
	const level = (env.LOG_LEVEL as LogLevel) || (dev ? 'debug' : 'info');

	return new PinoLoggerAdapter({
		serviceName: 'splitshare',
		serviceVersion: env.npm_package_version || '1.0.0',
		environment,
		level,
		// Only use prettyPrint in dev - Cloudflare Workers don't support pino transports
		prettyPrint: dev
	});
}

/**
 * Application logger singleton
 */
export const logger = createLogger();
