import { ValueId } from 'openzwave-shared'
import { ValueType } from '../Values/ValueType'
import { INodeStreams } from '../Streams/INodeStreams'

// TODO: Rename to something less specific?

export interface IZwave extends INodeStreams {
	refreshValue(valueId: ValueId): void
	setValue(valueId: ValueId, value: ValueType): void
	getControllerNodeId(): number

	addNode?(isSecure?: boolean): boolean
	removeNode?(): boolean
	cancelControllerCommand?(): void
}
