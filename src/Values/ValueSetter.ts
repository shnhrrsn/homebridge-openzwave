import { ValueId } from 'openzwave-shared'
import { IValueStreams } from '../Streams/IValueStreams'
import { ValueType } from './ValueType'
import takeFreshValue from '../Support/takeFreshValue'

interface PendingSetValue {
	value: ValueType
	resolve(value: ValueType): void
	reject(error: Error): void
}

/**
 * Throttles concurrent sets to Zwave by ensuring on a single set is happening
 * at any given time.  No guarantees are made with regards to whether or the
 * the requested value to be set is actually set.  The most recent requested
 * value will be set when it’s eligible.
 *
 * Consider the following example:
 * 	1. `set` is called with a value of 87
 *  2. `set` is called with a value of 63
 *  3. `set` is called with a value of 8
 *
 * The first step will set 87 and block any future setting until it’s done.
 * The second and third steps will both resolve to `8` since the third set is
 * the most recent and the second step is queued alongside the third step.
 */
export default class ValueSetter {
	valueId: ValueId
	valueStreams: IValueStreams
	private isSetting = false
	private pendingSets: PendingSetValue[] = []

	constructor(valueId: ValueId, valueStreams: IValueStreams) {
		this.valueId = valueId
		this.valueStreams = valueStreams
	}

	set(newValue: ValueType): Promise<ValueType> {
		return new Promise((resolve, reject) => {
			this.pendingSets.push({ resolve, reject, value: newValue })

			if (this.isSetting) {
				return
			}

			this.processNext()
		})
	}

	private processNext() {
		const sets = this.pendingSets
		this.pendingSets = []

		if (sets.length === 0) {
			return
		}

		const { value: lastValue } = sets[sets.length - 1]
		this.valueStreams.zwave.unsafeSetValue(this.valueId, lastValue)
		this.isSetting = true

		takeFreshValue(this.valueStreams.valueChanged)
			.then(() => {
				for (const { resolve } of sets) {
					resolve(lastValue)
				}
			})
			.catch(error => {
				for (const { reject } of sets) {
					reject(error)
				}
			})
			.finally(() => {
				this.isSetting = false
				this.processNext()
			})
	}
}
