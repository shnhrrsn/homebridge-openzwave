import { ValueId } from 'openzwave-shared'
import { INodeStreams } from '../Streams/INodeStreams'
import { ValueType } from '../Values/ValueType'
import { Operation } from './Operation'
import ZwaveCache from './ZwaveCache'

// TODO: Rename to something less specific?

export interface IZwave extends INodeStreams {
	cache: ZwaveCache

	getControllerNodeId(): number
	isNodeListeningDevice(nodeId: number): boolean

	// Perform an operation
	perform(operation: Operation): void

	// Pass through to ozw refreshValue
	unsafeRefreshValue(valueId: ValueId): void

	// Pass through to ozw setValue
	unsafeSetValue(valueId: ValueId, value: ValueType): void

	addNode?(isSecure?: boolean): boolean
	removeNode?(): boolean
	cancelControllerCommand?(): void
}
