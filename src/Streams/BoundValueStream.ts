import { ValueId, Value } from 'openzwave-shared'
import { IValueStreams, IValueParams } from './IValueStreams'
import { ValueType } from '../Values/ValueType'
import { filter, skipWhile, first } from 'rxjs/operators'
import { Subject, Observable, Subscription } from 'rxjs'
import { Homebridge } from '../../types/homebridge'

export class BoundValueStream {
	private valueSubject = new Subject<ValueType>()
	private valueStreams: IValueStreams
	private log: Homebridge.Logger
	private isRefreshing = false
	private valueChangedSubscriber: any
	private valueRefreshedSubscriber: any
	readonly valueId: ValueId

	constructor(valueId: ValueId, valueStreams: IValueStreams, log: Homebridge.Logger) {
		this.valueId = valueId
		this.valueStreams = valueStreams
		this.log = log

		this.valueChangedSubscriber = this.valueStreams.valueChanged
			.pipe(filter(params => matchesValueId(params.value, valueId)))
			.subscribe(this.onValueChanged.bind(this))

		this.valueRefreshedSubscriber = this.valueStreams.valueRefreshed
			.pipe(filter(params => matchesValueId(params.value, valueId)))
			.subscribe(this.onValueRefreshed.bind(this))
	}

	refresh() {
		if (this.isRefreshing) {
			this.log.debug('Throttled refresh')
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

		return this.takeFreshValue(this.valueStreams.valueChanged).then(() => undefined)
	}

	private onValueRefreshed(params: IValueParams) {
		this.valueSubject.next(params.value.value)
	}

	private onValueChanged(params: IValueParams) {
		this.valueSubject.next(params.value.value)
	}

	get valueObservable(): Observable<ValueType> {
		return this.valueSubject
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
				.pipe(skipWhile(() => shouldSkip))
				.pipe(first())
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
