import { Value } from 'openzwave-shared'
import { IAccessoryCommandIndexesRewriteConfig } from '../IAccessoryConfig'

export default class MappedValues implements Map<number, Value> {
	private unmappedValues: Map<number, Value>
	private indexes: Map<number, number>

	constructor(indexes: IAccessoryCommandIndexesRewriteConfig, values: Map<number, Value>) {
		this.unmappedValues = values
		this.indexes = new Map(
			Object.entries(indexes).map((index, value) => [value, Number(index)]),
		)
	}

	entries(): IterableIterator<[number, Value]> {
		const entries = this.unmappedValues.entries()
		const mappedValues = this
		return {
			[Symbol.iterator]() {
				return this
			},
			next() {
				const { value } = entries.next()
				return {
					value: [mappedValues.resolveIndex(value[0]), value[1]],
				}
			},
		}
	}

	keys(): IterableIterator<number> {
		const indexes = Array.from(this.unmappedValues.keys())
		return indexes.map(index => this.resolveIndex(index))[Symbol.iterator]()
	}

	values(): IterableIterator<Value> {
		return this.unmappedValues.values()
	}

	clear() {
		this.unmappedValues.clear()
	}

	delete(index: number): boolean {
		return this.unmappedValues.delete(this.resolveIndex(index))
	}

	forEach(
		callbackfn: (value: Value, key: number, map: Map<number, Value>) => void,
		thisArg?: any,
	): void {
		this.unmappedValues.forEach((value: Value, key: number) => {
			callbackfn.call(thisArg, value, this.resolveIndex(key), this)
		})
	}

	get(index: number): Value | undefined {
		return this.unmappedValues.get(this.resolveIndex(index))
	}

	has(index: number): boolean {
		return this.unmappedValues.has(this.resolveIndex(index))
	}

	set(index: number, value: Value): this {
		this.unmappedValues.set(this.resolveIndex(index), value)
		return this
	}

	private resolveIndex(index: number): number {
		return this.indexes.get(index) ?? index
	}

	get size(): number {
		return this.unmappedValues.size
	}

	get [Symbol.toStringTag](): string {
		return this.unmappedValues[Symbol.toStringTag]
	}

	[Symbol.iterator](): IterableIterator<[number, Value]> {
		throw new Error('Method not implemented.')
	}
}
