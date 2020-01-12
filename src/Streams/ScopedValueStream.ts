import { Observable, merge } from 'rxjs'
import { filter } from 'rxjs/operators'
import { IValueStream, IValueParams, IValueRemovedParams } from './IValueStream'
import { ValueId, Value } from 'openzwave-shared'

export class ScopedValueStream implements IValueStream {
	readonly valueAdded: Observable<IValueParams>
	readonly valueChanged: Observable<IValueParams>
	readonly valueRefreshed: Observable<IValueParams>
	readonly valueRemoved: Observable<IValueRemovedParams>
	private _valueUpdate?: Observable<IValueParams>

	constructor(valueId: ValueId, valueStream: IValueStream) {
		this.valueAdded = valueStream.valueAdded.pipe(
			filter(params => matchesValueId(params.value, valueId)),
		)
		this.valueChanged = valueStream.valueChanged.pipe(
			filter(params => matchesValueId(params.value, valueId)),
		)
		this.valueRefreshed = valueStream.valueRefreshed.pipe(
			filter(params => matchesValueId(params.value, valueId)),
		)
		this.valueRemoved = valueStream.valueRemoved.pipe(
			filter(params => {
				return (
					valueId.class_id === params.comClass &&
					valueId.instance === params.instance &&
					valueId.index === params.index
				)
			}),
		)
	}

	get valueUpdate(): Observable<IValueParams> {
		if (!this._valueUpdate) {
			this._valueUpdate = merge(this.valueChanged, this.valueRefreshed)
		}

		return this._valueUpdate
	}

	dispose() {
		// TODO
	}
}

function matchesValueId(value: Value, valueId: ValueId): boolean {
	return (
		valueId.class_id === value.class_id &&
		valueId.instance === value.instance &&
		valueId.index === value.index
	)
}
