import OpenZwave from 'openzwave-shared'
import { Observable, merge } from 'rxjs'
import { filter } from 'rxjs/operators'
import { IValueStreams, IValueParams, IValueRemovedParams } from './IValueStreams'
import { ValueId, Value } from 'openzwave-shared'

export class ScopedValueStreams implements IValueStreams {
	readonly valueAdded: Observable<IValueParams>
	readonly valueChanged: Observable<IValueParams>
	readonly valueRefreshed: Observable<IValueParams>
	readonly valueRemoved: Observable<IValueRemovedParams>
	private _valueUpdate?: Observable<IValueParams>
	private valueStreams: IValueStreams

	constructor(valueId: ValueId, valueStreams: IValueStreams) {
		this.valueStreams = valueStreams

		this.valueAdded = valueStreams.valueAdded.pipe(
			filter(params => matchesValueId(params.value, valueId)),
		)
		this.valueChanged = valueStreams.valueChanged.pipe(
			filter(params => matchesValueId(params.value, valueId)),
		)
		this.valueRefreshed = valueStreams.valueRefreshed.pipe(
			filter(params => matchesValueId(params.value, valueId)),
		)
		this.valueRemoved = valueStreams.valueRemoved.pipe(
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

	get zwave(): OpenZwave {
		return this.valueStreams.zwave
	}
}

function matchesValueId(value: Value, valueId: ValueId): boolean {
	return (
		valueId.class_id === value.class_id &&
		valueId.instance === value.instance &&
		valueId.index === value.index
	)
}
