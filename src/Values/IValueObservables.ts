import { Observable } from 'rxjs'
import { Value, ValueId } from 'openzwave-shared'
import { IZwave } from '../Zwave/IZwave'

export interface IValueObservables {
	zwave: IZwave
	additions: Observable<Value>
	changes: Observable<Value>
	refreshes: Observable<Value>
	removals: Observable<ValueId>
	filter(predicate: (valueId: ValueId) => boolean): IValueObservables
}
