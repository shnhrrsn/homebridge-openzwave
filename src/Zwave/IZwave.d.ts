import { ValueId } from 'openzwave-shared'
import { ValueType } from '../Values/ValueType'
import { INodeStreams } from '../Streams/INodeStreams'

// TODO: Rename to something less specific?

export interface IZwave extends INodeStreams {
	getControllerNodeId(): number

	// Throttles refreshes, see ValueRefresher for more
	refreshValue(valueId: ValueId): void

	// Pass through to ozw refreshValue
	unsafeRefreshValue(valueId: ValueId): void

	// No guarantees are made re: value set, see ValueSetter for more
	setValue(valueId: ValueId, value: ValueType): Promise<ValueType>

	// Pass through to ozw setValue
	unsafeSetValue(valueId: ValueId, value: ValueType): void

	addNode?(isSecure?: boolean): boolean
	removeNode?(): boolean
	cancelControllerCommand?(): void
}
