import { IValueStreams, IValueParams, IValueRemovedParams } from '../Streams/IValueStreams'
import { Subject, Subscription, of, Observable } from 'rxjs'
import { merge, filter, map } from 'rxjs/operators'
import { Value, ValueId } from 'openzwave-shared'
import { IValueObservables } from './IValueObservables'
import { IZwave } from '../Zwave/IZwave'
import stringifyValueId from '../Support/stringifyValueId'

/**
 * Retains all available subjects and updates them with current values
 * Subscriptions will receive all existing values and newly added values
 * Subscriptions will NOT receive changes to values
 */
export default class ValueSubjects implements IValueObservables {
	private registry = new Map<string, Value>()
	private subject = new Subject<Value>()

	readonly refreshes: Observable<Value>
	readonly changes: Observable<Value>
	readonly removals: Observable<ValueId>
	readonly zwave: IZwave

	get additions(): Observable<Value> {
		const initialValues = Array.from(this.registry.values())
		return of(...initialValues).pipe(merge(this.subject))
	}

	constructor(valueStreams: IValueStreams) {
		valueStreams.valueAdded.subscribe(this.onValue.bind(this))
		valueStreams.valueChanged.subscribe(this.onValue.bind(this))
		valueStreams.valueRemoved.subscribe(this.onValueRemoved.bind(this))

		this.zwave = valueStreams.zwave
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

	private onValue(params: IValueParams) {
		const valueId = stringifyValueId(params.value)
		if (!this.registry.has(valueId)) {
			this.subject.next(params.value)
		}

		this.registry.set(valueId, params.value)
	}

	private onValueRemoved(params: IValueRemovedParams) {
		this.registry.delete(
			stringifyValueId({
				node_id: params.nodeId,
				class_id: params.classId,
				instance: params.instance,
				index: params.index,
			}),
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
