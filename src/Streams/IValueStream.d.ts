import { Observable } from 'rxjs'
import { Value } from 'openzwave-shared'

export interface IValueParams {
	nodeId: number
	comClass: number
	value: Value
}

export interface IValueRemovedParams {
	nodeId: number
	comClass: number
	instance: number
	index: number
}

export interface IValueStream {
	// A new node value has been added to OpenZWave's list. These notifications occur after a node has been discovered, and details of its command classes have been received. Each command class may generate one or more values depending on the complexity of the item being represented.
	readonly valueAdded: Observable<IValueParams>

	// A node value has been updated from the Z-Wave network and it is different from the previous value.
	readonly valueChanged: Observable<IValueParams>

	// A node value has been updated from the Z-Wave network.
	readonly valueRefreshed: Observable<IValueParams>

	// A node value has been removed from OpenZWave's list. This only occurs when a node is removed.
	readonly valueRemoved: Observable<IValueRemovedParams>
}
