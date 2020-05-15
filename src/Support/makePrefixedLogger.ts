import { Logging } from 'homebridge'

export default function makePrefixedLogger(logger: Logging, prefix: string): Logging {
	prefix = `[${prefix}]`
	return {
		debug: logger.debug.bind(logger, prefix),
		info: logger.info.bind(logger, prefix),
		warn: logger.warn.bind(logger, prefix),
		error: logger.error.bind(logger, prefix),
	} as any
}
