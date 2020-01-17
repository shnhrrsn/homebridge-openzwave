import { ValueId, Value } from 'openzwave-shared'
import { IValueStreams, IValueParams } from './IValueStreams'
import { ValueType } from '../Values/ValueType'
import { filter } from 'rxjs/operators'
import { Subject, Observable } from 'rxjs'

export class BoundValueStream {
	private valueSubject = new Subject<ValueType>()
	private valueStreams: IValueStreams
	readonly valueId: ValueId
	private valueChangedSubscriber: any
	private valueRefreshedSubscriber: any

	constructor(valueId: ValueId, valueStreams: IValueStreams) {
		this.valueId = valueId
		this.valueStreams = valueStreams

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

	set(newValue: ValueType) {
		// TODO: Throttle
		this.valueStreams.zwave.setValue(this.valueId, newValue)
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
