import { Observable, Subscription } from 'rxjs'
import { skipWhile, first } from 'rxjs/operators'

/**
 * Takes a “fresh” value from an observable by ignoring immediately
 * published values via replay/behavior subjects, with an optional
 * timeout.
 *
 * @param observable Observerable stream to take value from
 * @param timeoutInterval Optional interval to timeout after
 */
export default function takeFreshValue<T>(
	observable: Observable<T>,
	timeoutInterval?: number,
): Promise<T> {
	return new Promise((resolve, reject) => {
		let shouldSkip = true

		// Skip initial value since if it’s a replay/behavior subject
		let subscriber: Subscription | undefined = undefined
		const timeout = timeoutInterval
			? setTimeout(() => {
					if (!subscriber) {
						return
					}

					subscriber?.unsubscribe()
					reject(new Error('Timeout'))
			  }, timeoutInterval)
			: undefined

		subscriber = observable
			.pipe(
				skipWhile(() => shouldSkip),
				first(),
			)
			.subscribe(value => {
				resolve(value)
				if (timeout) {
					clearTimeout(timeout)
				}
				subscriber?.unsubscribe()
				subscriber = undefined
			})

		shouldSkip = false
	})
}
