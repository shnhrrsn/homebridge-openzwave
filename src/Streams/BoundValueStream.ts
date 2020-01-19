import { ValueId, Value } from 'openzwave-shared'
import { IValueStreams, IValueParams } from './IValueStreams'
import { ValueType } from '../Values/ValueType'
import { filter, map, distinctUntilChanged } from 'rxjs/operators'
import { Observable, Subscription, BehaviorSubject } from 'rxjs'
import { Homebridge } from '../../types/homebridge'

interface PublishValue {
	value: ValueType
	publishedAt: number
}

export default class BoundValueStream {
	private valueSubject: BehaviorSubject<PublishValue>
	private valueStreams: IValueStreams
	private log: Homebridge.Logger
	private valueChangedSubscriber: Subscription
	private valueRefreshedSubscriber: Subscription
	readonly valueId: ValueId
	readonly valueObservable: Observable<ValueType>

	constructor(value: Value, valueStreams: IValueStreams, log: Homebridge.Logger) {
		this.valueId = value
		this.valueStreams = valueStreams
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

		this.valueChangedSubscriber = this.valueStreams.valueChanged
			.pipe(filter(params => matchesValueId(params.value, value)))
			.subscribe(this.onValueChanged.bind(this))

		this.valueRefreshedSubscriber = this.valueStreams.valueRefreshed
			.pipe(filter(params => matchesValueId(params.value, value)))
			.subscribe(this.onValueRefreshed.bind(this))
	}

	refresh() {
		return this.valueStreams.zwave.refreshValue(this.valueId)
	}

	set(newValue: ValueType): Promise<ValueType> {
		return this.valueStreams.zwave.setValue(this.valueId, newValue)
	}

	private onValueRefreshed(params: IValueParams) {
		this.next(params.value)
	}

	private onValueChanged(params: IValueParams) {
		this.next(params.value)
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
