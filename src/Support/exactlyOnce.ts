import { Homebridge } from '../../types/homebridge'

/**
 * Wraps a callback and ensures it’s only called once.
 * Subsequent invocations are discarded.
 */

export function exactlyOnce<A, R>(
	callback: (a: A) => R | undefined,
	log?: Homebridge.Logger,
): (a: A) => R | undefined

export function exactlyOnce<A, B, R>(
	callback: (a: A, b: B) => R | undefined,
	log?: Homebridge.Logger,
): (a: A, b: B) => R | undefined

export function exactlyOnce<A, B, C, R>(
	callback: (a: A, b: B, c: C) => R | undefined,
	log?: Homebridge.Logger,
): (a: A, b: B, c: C) => R | undefined

export default function exactlyOnce<R>(
	callback: (...args: any) => R | undefined,
	log?: Homebridge.Logger,
): (...args: any) => R | undefined {
	let hasFired = false
	return function(...args: any): R | undefined {
		if (hasFired) {
			if (log) {
				log.warn('Attempted to call more than once', new Error().stack)
			}
			return undefined
		} else {
			hasFired = true
		}

		return callback(...args)
	}
}
