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
		// TODO: Throttle
		this.valueStreams.zwave.refreshValue(this.valueId)
	}

	set(newValue: ValueType): Promise<void> {
		try {
			this.valueStreams.zwave.setValue(this.valueId, newValue)
		} catch (error) {
			return Promise.reject(error)
		}

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
			}, 2000)

			subscriber = this.valueStreams.valueChanged.source
				.pipe(skipWhile(() => shouldSkip))
				.pipe(first())
				.subscribe(() => {
					resolve()
					clearTimeout(timeout)
					subscriber?.unsubscribe()
					subscriber = undefined
				})

			shouldSkip = false
		})
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
}

function matchesValueId(value: Value, valueId: ValueId): boolean {
	return (
		valueId.node_id === value.node_id &&
		valueId.class_id === value.class_id &&
		valueId.instance === value.instance &&
		valueId.index === value.index
	)
}
