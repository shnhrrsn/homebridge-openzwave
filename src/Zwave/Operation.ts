import { ValueId } from 'openzwave-shared'
import { ValueType } from '../Values/ValueType'

export type Operation = RefreshOperation | SetOperation | ChainOperation

export class RefreshOperation {
	readonly kind = 'refresh'
	constructor(readonly valueId: ValueId, readonly reason: String) {}
}

export class SetOperation {
	readonly kind = 'set'
	constructor(
		readonly valueId: ValueId,
		readonly value: ValueType,
		readonly completion?: (result: Error | ValueType) => void,
	) {}
}

export class ChainOperation {
	readonly kind = 'chain'
	constructor(
		readonly first: Exclude<Operation, ChainOperation>,
		readonly next: Operation,
		readonly delay?: number,
	) {}
}
