import { IValueStreams } from '../Streams/IValueStreams'
import { Subscription, Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { Value, ValueId } from 'openzwave-shared'
import { IValueObservables } from './IValueObservables'
import { IZwave } from '../Zwave/IZwave'

export default class ValueSubjects implements IValueObservables {
	readonly additions: Observable<Value>
	readonly refreshes: Observable<Value>
	readonly changes: Observable<Value>
	readonly removals: Observable<ValueId>
	readonly zwave: IZwave

	constructor(valueStreams: IValueStreams) {
		this.zwave = valueStreams.zwave
		this.additions = valueStreams.valueAdded.pipe(map(({ value }) => value))
		this.changes = valueStreams.valueChanged.pipe(map(({ value }) => value))
		this.refreshes = valueStreams.valueRefreshed.pipe(map(({ value }) => value))
		this.removals = valueStreams.valueRemoved.pipe(
			map(value => ({
				node_id: value.nodeId,
				class_id: value.classId,
				instance: value.instance,
				index: value.index,
			})),
		)
	}

	subscribe(subscriber: (value: Value) => void): Subscription {
		return this.additions.subscribe(subscriber)
	}

	filter(predicate: (valueId: ValueId) => boolean): IValueObservables {
		return filteredValueObservables(this, predicate)
	}
}

function filteredValueObservables(
	observables: IValueObservables,
	predicate: (valueId: ValueId) => boolean,
): IValueObservables {
	return {
		zwave: observables.zwave,
		additions: observables.additions.pipe(filter(value => predicate(value))),
		changes: observables.changes.pipe(filter(value => predicate(value))),
		refreshes: observables.refreshes.pipe(filter(value => predicate(value))),
		removals: observables.removals.pipe(filter(value => predicate(value))),
		filter(func) {
			return filteredValueObservables(this, func)
		},
	}
}
