import { ValueId } from 'openzwave-shared'
import { ValueType } from '../Values/ValueType'
import { INodeStreams } from '../Streams/INodeStreams'

// TODO: Rename to something less specific?

export interface IZwave extends INodeStreams {
	getControllerNodeId(): number
	refreshValue(valueId: ValueId): void

	// No guarantees are made re: value set, see ValueSetter for more
	setValue(valueId: ValueId, value: ValueType): Promise<ValueType>

	// Pass through to ozw setValue
	unsafeSetValue(valueId: ValueId, value: ValueType): void

	addNode?(isSecure?: boolean): boolean
	removeNode?(): boolean
	cancelControllerCommand?(): void
}
