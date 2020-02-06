import OpenZwave from 'openzwave-shared'
import { ValueType } from '../Values/ValueType'
import { ChainOperation, Operation, RefreshOperation, SetOperation } from './Operation'

export interface IOperationPerformer {
	perform(operation: Operation): void
}

interface InternalSetOperation {
	operation: SetOperation
	completion?: (result: Error | ValueType) => void
}

export default class OperationPerformer implements IOperationPerformer {
	private setQueue = new Array<InternalSetOperation>()
	private refreshQueue = new Array<RefreshOperation>()
	private running = false

	constructor(private ozw: OpenZwave) {}

	perform(operation: Operation) {
		switch (operation.kind) {
			case 'refresh':
				this.refreshQueue.push(operation)
				break
			case 'set':
				this.setQueue.push({
					operation: operation,
					completion: operation.completion,
				})
				break
			case 'chain':
				this.performChain(operation)
				return
		}

		this.processNextIfNeeded()
	}

	private performChain(operation: ChainOperation) {
		switch (operation.first.kind) {
			case 'set':
				const set = operation.first
				this.setQueue.push({
					operation: set,
					completion: result => {
						set.completion?.(result)
						this.performNextInChain(operation)
					},
				})
				break
			case 'refresh':
				// Currently refresh has no completion, so `then` is fired immediately
				this.perform(operation.first)
				this.performNextInChain(operation)
				break
		}
		this.processNextIfNeeded()
	}

	private performNextInChain(operation: ChainOperation) {
		setTimeout(() => {
			this.perform(operation.next)
		}, operation.delay ?? 0)
	}

	private processNextIfNeeded() {
		if (this.running) {
			return
		}

		this.next()
	}

	private next() {
		const set = this.setQueue.shift()

		if (set) {
			this.running = true
			this.nextSet(set)
			return
		}

		const refresh = this.refreshQueue.shift()

		if (refresh) {
			this.running = true
			this.nextRefresh(refresh)
			return
		}

		this.running = false
	}

	private nextSet(set: InternalSetOperation) {
		console.log('nextSet', set)
		this.ozw.setValue(set.operation.valueId, set.operation.value)
		set.completion?.(set.operation.value)
		setTimeout(() => {
			this.next()
		}, 1000)
	}

	private nextRefresh(refresh: RefreshOperation) {
		console.log('nextRefresh', refresh)
		this.ozw.refreshValue(refresh.valueId)
		setTimeout(() => {
			this.next()
		}, 1000)
	}
}
