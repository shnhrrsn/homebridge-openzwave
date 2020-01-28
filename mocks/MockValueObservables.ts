import { IValueObservables } from '../src/Values/IValueObservables'
import { Value, ValueId } from 'openzwave-shared'
import { IZwave } from '../src/Zwave/IZwave'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export class MockValueObservables implements IValueObservables {
	readonly additions: Observable<Value>
	readonly changes: Observable<Value>
	readonly refreshes: Observable<Value>
	readonly removals: Observable<ValueId>

	constructor(public zwave: IZwave) {
		this.additions = zwave.valueAdded.pipe(map(({ value }) => value))
		this.changes = zwave.valueChanged.pipe(map(({ value }) => value))
		this.refreshes = zwave.valueRefreshed.pipe(map(({ value }) => value))
		this.removals = zwave.valueRemoved.pipe(
			map(value => ({
				node_id: value.nodeId,
				class_id: value.classId,
				instance: value.instance,
				index: value.index,
			})),
		)
	}

	filter(predicate: (valueId: ValueId) => boolean): IValueObservables {
		return new MockValueObservables(this.zwave)
	}
}
