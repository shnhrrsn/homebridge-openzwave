import { ValueId, Value } from 'openzwave-shared'
import { ValueType } from '../Values/ValueType'
import { filter, map, distinctUntilChanged } from 'rxjs/operators'
import { Observable, Subscription, BehaviorSubject } from 'rxjs'
import { Homebridge } from '../../types/homebridge'
import { IValueObservables } from '../Values/IValueObservables'

interface PublishValue {
	value: ValueType
	publishedAt: number
}

export default class BoundValueStream {
	private valueSubject: BehaviorSubject<PublishValue>
	private valueObservables: IValueObservables
	private log: Homebridge.Logger
	private valueChangedSubscriber: Subscription
	private valueRefreshedSubscriber: Subscription
	readonly valueId: ValueId
	readonly valueObservable: Observable<ValueType>

	constructor(value: Value, valueObservables: IValueObservables, log: Homebridge.Logger) {
		this.valueId = value
		this.valueObservables = valueObservables
		this.log = log
		this.valueSubject = new BehaviorSubject<PublishValue>({
			value: value.value,
			publishedAt: Date.now(),
		})
		this.valueObservable = this.valueSubject.pipe(
			distinctUntilChanged((prev, curr) => {
				if (prev.value !== curr.value) {
					return false
				}

				// Throttle duplicate values to require at least 1s to
				// have elapsed before publishing again.
				return curr.publishedAt - prev.publishedAt < 1000
			}),
			map(({ value }) => value),
		)

		this.valueChangedSubscriber = this.valueObservables.changes
			.pipe(filter(valueId => matchesValueId(valueId, value)))
			.subscribe(this.next.bind(this))

		this.valueRefreshedSubscriber = this.valueObservables.refreshes
			.pipe(filter(valueId => matchesValueId(valueId, value)))
			.subscribe(this.next.bind(this))
	}

	refresh(reason: String) {
		return this.valueObservables.zwave.refreshValue(this.valueId, reason)
	}

	set(newValue: ValueType): Promise<ValueType> {
		return this.valueObservables.zwave.setValue(this.valueId, newValue)
	}

	private next(value: Value) {
		this.valueSubject.next({
			value: value.value,
			publishedAt: Date.now(),
		})
	}
}

function matchesValueId(value: Value, valueId: ValueId): boolean {
	return (
		valueId.node_id === value.node_id &&
		valueId.class_id === value.class_id &&
		valueId.instance === value.instance &&
		valueId.index === value.index
	)
}
