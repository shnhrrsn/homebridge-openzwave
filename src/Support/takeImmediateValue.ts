import { Observable, Subscription } from 'rxjs'
import { skipWhile, first } from 'rxjs/operators'

/**
 * Takes an immediate value from an observable by subscribing,
 * getting the value, and unsubscribing.  If a value is not
 * immediately available, undefined is returned.
 *
 * @param observable Observerable stream to take value from
 */
export default function takeImmediateValue<T>(observable: Observable<T>): T | undefined {
	let result: T | undefined
	observable
		.pipe(first())
		.subscribe(value => {
			result = value
		})
		.unsubscribe()
	return result
}
