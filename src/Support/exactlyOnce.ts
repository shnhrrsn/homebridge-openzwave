import { Logging } from 'homebridge'

/**
 * Wraps a callback and ensures it’s only called once.
 * Subsequent invocations are discarded.
 */
export default function exactlyOnce<ParamType, ReturnType>(
	callback: (param: ParamType, ...args: any) => ReturnType | undefined,
	log?: Logging,
): (param: ParamType) => ReturnType | undefined {
	let hasFired = false
	return function(param: ParamType, ...args: any): ReturnType | undefined {
		if (hasFired) {
			if (log) {
				log.warn('Attempted to call more than once', new Error().stack)
			}
			return undefined
		} else {
			hasFired = true
		}

		return callback(param, ...args)
	}
}
