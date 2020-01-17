import { Homebridge } from '../../types/homebridge'

export default function makePrefixedLogger(
	logger: Homebridge.Logger,
	prefix: string,
): Homebridge.Logger {
	prefix = `[${prefix}]`
	return {
		debug: logger.debug.bind(logger, prefix),
		info: logger.info.bind(logger, prefix),
		warn: logger.warn.bind(logger, prefix),
		error: logger.error.bind(logger, prefix),
	}
}
