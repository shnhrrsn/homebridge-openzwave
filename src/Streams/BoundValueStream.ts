import { ValueId, Value } from 'openzwave-shared'
import { IValueStreams, IValueParams } from './IValueStreams'
import { ValueType } from '../Values/ValueType'
import { filter, skipWhile, first, map, distinctUntilChanged } from 'rxjs/operators'
import { Observable, Subscription, BehaviorSubject } from 'rxjs'
import { Homebridge } from '../../types/homebridge'

interface PublishValue {
	value: ValueType
	publishedAt: number
}

export class BoundValueStream {
	private valueSubject: BehaviorSubject<PublishValue>
	private valueStreams: IValueStreams
	private log: Homebridge.Logger
	private isRefreshing = false
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
		if (this.isRefreshing) {
			this.log.debug('Already refreshing')
			return
		} else if (Date.now() - this.valueSubject.value.publishedAt < 5000) {
			this.log.debug('Throttling refresh')
			return
		}

		this.valueStreams.zwave.refreshValue(this.valueId)
		this.isRefreshing = true
		this.log.debug('Refreshing')

		this.takeFreshValue(this.valueStreams.valueRefreshed, 5000)
			.then(() => this.log.debug('Refreshed'))
			.catch(error => this.log.debug('Failed to refresh', error.message))
			.finally(() => {
				this.isRefreshing = false
			})
	}

	set(newValue: ValueType): Promise<void> {
		try {
			this.valueStreams.zwave.setValue(this.valueId, newValue)
		} catch (error) {
			return Promise.reject(error)
		}

		return this.takeFreshValue(this.valueStreams.valueChanged, 5000).then(() => undefined)
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

	private takeFreshValue<T>(observable: Observable<T>, timeoutInterval = 2000): Promise<T> {
		return new Promise((resolve, reject) => {
			let shouldSkip = true

			// Skip initial value since this is a replay subject
			let subscriber: Subscription | undefined = undefined
			const timeout = setTimeout(() => {
				if (!subscriber) {
					return
				}

				subscriber?.unsubscribe()
				reject(new Error('Timeout'))
			}, timeoutInterval)

			subscriber = observable
				.pipe(
					skipWhile(() => shouldSkip),
					first(),
				)
				.subscribe(value => {
					resolve(value)
					clearTimeout(timeout)
					subscriber?.unsubscribe()
					subscriber = undefined
				})

			shouldSkip = false
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
